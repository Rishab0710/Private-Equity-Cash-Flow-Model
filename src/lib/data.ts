import { addMonths, addQuarters, format, isAfter, isBefore, subMonths } from 'date-fns';
import type {
  Alert,
  CashflowData,
  Composition,
  DataHealth,
  Fund,
  FundDriver,
  LiquidityData,
  NavData,
  PortfolioData,
  Scenario,
} from './types';

export const funds: Fund[] = [
  {
    id: '1',
    name: 'Growth Equity Fund V',
    strategy: 'PE',
    region: 'North America',
    vintageYear: 2021,
    commitment: 100000000,
    unfundedCommitment: 55000000,
    investmentPeriod: 5,
    fundLife: 10,
    latestNav: 45000000,
    forecastIRR: 18.5,
  },
  {
    id: '2',
    name: 'Venture Partners II',
    strategy: 'VC',
    region: 'Global',
    vintageYear: 2022,
    commitment: 50000000,
    unfundedCommitment: 35000000,
    investmentPeriod: 4,
    fundLife: 12,
    latestNav: 15000000,
    forecastIRR: 22.1,
  },
  {
    id: '3',
    name: 'Global Infrastructure Fund',
    strategy: 'Infra',
    region: 'Global',
    vintageYear: 2020,
    commitment: 250000000,
    unfundedCommitment: 70000000,
    investmentPeriod: 6,
    fundLife: 15,
    latestNav: 180000000,
    forecastIRR: 12.3,
  },
  {
    id: '4',
    name: 'Secondary Opportunities I',
    strategy: 'Secondaries',
    region: 'Europe',
    vintageYear: 2023,
    commitment: 75000000,
    unfundedCommitment: 65000000,
    investmentPeriod: 3,
    fundLife: 8,
    latestNav: 10000000,
    forecastIRR: 15.0,
  },
  {
    id: '5',
    name: 'Innovate BioTech Fund',
    strategy: 'VC',
    region: 'North America',
    vintageYear: 2023,
    commitment: 60000000,
    unfundedCommitment: 50000000,
    investmentPeriod: 5,
    fundLife: 10,
    latestNav: 8000000,
    forecastIRR: 25.0,
  },
  {
    id: '6',
    name: 'European Buyout Leaders IV',
    strategy: 'PE',
    region: 'Europe',
    vintageYear: 2019,
    commitment: 150000000,
    unfundedCommitment: 20000000,
    investmentPeriod: 5,
    fundLife: 10,
    latestNav: 160000000,
    forecastIRR: 16.2,
  },
];

const strategyParams = {
  PE: { callPeak: 8, callDecay: 0.8, distStart: 12, distPeak: 20, distDecay: 0.9 },
  VC: { callPeak: 12, callDecay: 0.85, distStart: 20, distPeak: 28, distDecay: 0.9 },
  Infra: { callPeak: 10, callDecay: 0.75, distStart: 16, distPeak: 28, distDecay: 0.85 },
  Secondaries: { callPeak: 4, callDecay: 0.7, distStart: 6, distPeak: 14, distDecay: 0.8 },
  Other: { callPeak: 8, callDecay: 0.8, distStart: 12, distPeak: 20, distDecay: 0.9 },
};

export const getPortfolioData = (scenario: Scenario = 'Base', fundId?: string, asOfDate: Date = new Date()): PortfolioData => {
    const FORECAST_START_DATE = asOfDate;
    const NUM_QUARTERS_ACTUAL = 8;
    const NUM_QUARTERS_FORECAST = 24;

    const generateDates = () => {
      const dates = [];
      const today = FORECAST_START_DATE;
      for (let i = -NUM_QUARTERS_ACTUAL; i < NUM_QUARTERS_FORECAST; i++) {
        dates.push(addQuarters(today, i));
      }
      return dates;
    };
    const DATES = generateDates();

    const getFundAgeInQuarters = (fund: Fund, date: Date) => {
        return Math.floor((date.getTime() - new Date(fund.vintageYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 30.44 * 3));
    };

    const generateFundCashflows = (fund: Fund, scenario: Scenario): CashflowData[] => {
      const params = strategyParams[fund.strategy];
      let callFactor = 1;
      let distFactor = 1;

      switch (scenario) {
        case 'Slow Exit': distFactor = 0.7; break;
        case 'Fast Exit': distFactor = 1.3; break;
        case 'Stress': callFactor = 1.1; distFactor = 0.6; break;
      }
      
      let unfunded = fund.commitment;

      return DATES.map(date => {
        const age = getFundAgeInQuarters(fund, date);
        let capitalCall = 0;
        
        if (age > 0 && age <= params.callPeak) {
          capitalCall = (fund.commitment / (params.callPeak * 2)) * (1 + Math.random() * 0.5) * callFactor;
        } else if (age > params.callPeak && age <= fund.investmentPeriod * 4) {
          capitalCall = (fund.commitment / (params.callPeak * 2)) * Math.pow(params.callDecay, age - params.callPeak) * (1 + Math.random() * 0.3) * callFactor;
        }
        capitalCall = Math.min(capitalCall, unfunded);
        unfunded -= capitalCall;

        let distribution = 0;
        if (age > params.distStart) {
          const distAge = age - params.distStart;
          if (distAge <= (params.distPeak - params.distStart)) {
            distribution = (fund.commitment * 2.5 / (params.distPeak-params.distStart) / 4) * (1 + Math.random() * 0.6) * distFactor;
          } else {
            distribution = (fund.commitment * 2.5 / (params.distPeak-params.distStart) / 4) * Math.pow(params.distDecay, distAge - (params.distPeak - params.distStart)) * (1 + Math.random() * 0.4) * distFactor;
          }
        }
        
        return {
          date: format(date, 'yyyy-MM-dd'),
          isActual: isBefore(date, FORECAST_START_DATE),
          capitalCall,
          distribution,
          netCashflow: distribution - capitalCall,
        };
      });
    };

    const aggregateCashflows = (allFundCashflows: CashflowData[][]): CashflowData[] => {
      if (allFundCashflows.length === 0) return [];
      return DATES.map((date, i) => {
        return allFundCashflows.reduce((acc, fundCashflows) => {
          const cf = fundCashflows[i];
          acc.capitalCall += cf.capitalCall;
          acc.distribution += cf.distribution;
          acc.netCashflow += cf.netCashflow;
          return acc;
        }, {
          date: format(date, 'yyyy-MM-dd'),
          isActual: isBefore(date, FORECAST_START_DATE),
          capitalCall: 0,
          distribution: 0,
          netCashflow: 0,
        });
      });
    };

    const getDrivers = (allFundCashflows: CashflowData[][], targetFunds: Fund[], nextQuarters: number): { upcomingCalls: FundDriver[], expectedDistributions: FundDriver[] } => {
      const forecastStartIndex = DATES.findIndex(d => isAfter(d, FORECAST_START_DATE));
      if (forecastStartIndex === -1) return { upcomingCalls: [], expectedDistributions: [] };
      
      const upcomingCalls: FundDriver[] = [];
      const expectedDistributions: FundDriver[] = [];

      targetFunds.forEach((fund, fundIndex) => {
        let callValue = 0;
        let distValue = 0;
        let nextCallDate = '';
        let nextDistDate = '';

        for (let i = forecastStartIndex; i < forecastStartIndex + nextQuarters; i++) {
          if (allFundCashflows[fundIndex] && allFundCashflows[fundIndex][i]) {
            const cf = allFundCashflows[fundIndex][i];
            callValue += cf.capitalCall;
            distValue += cf.distribution;
            if (!nextCallDate && cf.capitalCall > 0) nextCallDate = cf.date;
            if (!nextDistDate && cf.distribution > 0) nextDistDate = cf.date;
          }
        }

        if (callValue > 0) upcomingCalls.push({ fundId: fund.id, fundName: fund.name, value: callValue, nextCashflowDate: nextCallDate });
        if (distValue > 0) expectedDistributions.push({ fundId: fund.id, fundName: fund.name, value: distValue, nextCashflowDate: nextDistDate });
      });

      return {
        upcomingCalls: upcomingCalls.sort((a, b) => b.value - a.value).slice(0, 5),
        expectedDistributions: expectedDistributions.sort((a, b) => b.value - a.value).slice(0, 5),
      };
    };

    const targetFunds = fundId ? funds.filter(f => f.id === fundId) : funds;
    
    const allFundCashflows = targetFunds.map(fund => generateFundCashflows(fund, scenario));
    const portfolioCashflows = aggregateCashflows(allFundCashflows);

    // KPIs
    const forecastStartIndex = DATES.findIndex(d => isAfter(d, FORECAST_START_DATE));
    const next90DaysDate = addMonths(FORECAST_START_DATE, 3);
    const netCashRequirementNext90Days = portfolioCashflows
      .filter(cf => isAfter(new Date(cf.date), FORECAST_START_DATE) && isBefore(new Date(cf.date), next90DaysDate))
      .reduce((sum, cf) => sum + cf.netCashflow, 0);

    const peakProjectedOutflow = portfolioCashflows
      .slice(forecastStartIndex)
      .reduce((peak, cf) => (cf.netCashflow < peak.value ? { value: cf.netCashflow, date: cf.date } : peak), { value: 0, date: '' });

    const remainingUnfunded = targetFunds.reduce((sum, f) => sum + f.unfundedCommitment, 0);
    const availableLiquidity = 50_000_000; // Dummy value
    const liquidityBufferRatio = remainingUnfunded > 0 ? availableLiquidity / remainingUnfunded : 0;
    
    const next12MonthsDate = addMonths(FORECAST_START_DATE, 12);
    const expectedDistributionsNext12Months = portfolioCashflows
      .filter(cf => isAfter(new Date(cf.date), FORECAST_START_DATE) && isBefore(new Date(cf.date), next12MonthsDate))
      .reduce((sum, cf) => sum + cf.distribution, 0);
    
    let cumulativeNet = portfolioCashflows.slice(0, forecastStartIndex).reduce((sum, cf) => sum + cf.netCashflow, 0);
    const breakevenCfs = portfolioCashflows.slice(forecastStartIndex).filter(cf => {
        cumulativeNet += cf.netCashflow;
        return cumulativeNet > 0;
    });
    const breakevenTiming = { from: breakevenCfs[0]?.date || 'N/A', to: breakevenCfs[1]?.date || '' };

    // Liquidity Forecast
    let currentLiquidity = availableLiquidity;
    const liquidityForecast: LiquidityData[] = portfolioCashflows.slice(forecastStartIndex).map(cf => {
      currentLiquidity += cf.netCashflow;
      return {
        date: cf.date,
        availableLiquidity: currentLiquidity,
        netOutflow: cf.netCashflow < 0 ? -cf.netCashflow : 0,
        fundingGap: Math.max(0, -currentLiquidity),
      }
    });

    // Drivers
    const { upcomingCalls, expectedDistributions } = getDrivers(allFundCashflows, targetFunds, 4);
    const largestUnfunded = [...targetFunds].sort((a, b) => b.unfundedCommitment - a.unfundedCommitment).slice(0, 5).map(f => ({
      fundId: f.id,
      fundName: f.name,
      value: f.unfundedCommitment,
      nextCashflowDate: '',
    }));
    
    // Composition
    const composition: Composition = {
      strategy: Object.entries(targetFunds.reduce((acc, f) => {
        acc[f.strategy] = (acc[f.strategy] || 0) + f.commitment;
        return acc;
      }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
      vintage: Object.entries(targetFunds.reduce((acc, f) => {
        acc[f.vintageYear] = (acc[f.vintageYear] || 0) + f.commitment;
        return acc;
      }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
      region: Object.entries(targetFunds.reduce((acc, f) => {
        acc[f.region] = (acc[f.region] || 0) + f.commitment;
        return acc;
      }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
    };
    
    // Dummy Data Health
    const dataHealth: DataHealth = {
      fundsUpdated: funds.length - 1,
      totalFunds: funds.length,
      successRate: 0.95,
      lowConfidenceAlerts: 2,
      recentActivity: [
        { fundName: 'Growth Equity Fund V', status: 'Success', timestamp: subMonths(FORECAST_START_DATE, 1).toISOString() },
        { fundName: 'Venture Partners II', status: 'Success', timestamp: subMonths(FORECAST_START_DATE, 1).toISOString() },
      ],
    };

    // Dummy Alerts
    const alerts: Alert[] = [
        { id: '1', title: 'Liquidity Gap Risk', description: 'Projected funding gap of $12M in Q3 2025', severity: 'High' },
        { id: '2', title: 'Delayed Distribution', description: 'European Buyout Leaders IV distribution delayed', severity: 'Medium' },
        { id: '3', title: 'Missing Statement', description: 'Innovate BioTech Fund Q4 2024 statement overdue', severity: 'Low' },
    ];
    
    return {
        kpis: {
          netCashRequirementNext90Days,
          peakProjectedOutflow,
          liquidityBufferRatio,
          remainingUnfunded,
          expectedDistributionsNext12Months,
          breakevenTiming,
          modelConfidence: 0.85,
          lastStatementUpdate: subMonths(FORECAST_START_DATE, 1).toISOString(),
        },
        cashflowForecast: portfolioCashflows,
        navProjection: [], // This can be built similarly to cashflows if needed
        liquidityForecast,
        drivers: { upcomingCalls, expectedDistributions, largestUnfunded },
        composition,
        dataHealth,
        alerts,
    };
}
