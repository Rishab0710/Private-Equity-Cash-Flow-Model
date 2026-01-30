import { addMonths, addQuarters, format, isAfter, isBefore, subMonths, differenceInQuarters, differenceInMonths } from 'date-fns';
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

// Base fund data
export const funds: Fund[] = [
  {
    id: '1',
    name: 'Growth Equity Fund V',
    strategy: 'PE',
    region: 'North America',
    vintageYear: 2021,
    commitment: 100000000,
    investmentPeriod: 5,
    fundLife: 10,
  },
  {
    id: '2',
    name: 'Venture Partners II',
    strategy: 'VC',
    region: 'Global',
    vintageYear: 2022,
    commitment: 50000000,
    investmentPeriod: 4,
    fundLife: 12,
  },
  {
    id: '3',
    name: 'Global Infrastructure Fund',
    strategy: 'Infra',
    region: 'Global',
    vintageYear: 2020,
    commitment: 250000000,
    investmentPeriod: 6,
    fundLife: 15,
  },
  {
    id: '4',
    name: 'Secondary Opportunities I',
    strategy: 'Secondaries',
    region: 'Europe',
    vintageYear: 2023,
    commitment: 75000000,
    investmentPeriod: 3,
    fundLife: 8,
  },
  {
    id: '5',
    name: 'Innovate BioTech Fund',
    strategy: 'VC',
    region: 'North America',
    vintageYear: 2023,
    commitment: 60000000,
    investmentPeriod: 5,
    fundLife: 10,
  },
  {
    id: '6',
    name: 'European Buyout Leaders IV',
    strategy: 'PE',
    region: 'Europe',
    vintageYear: 2019,
    commitment: 150000000,
    investmentPeriod: 5,
    fundLife: 10,
  },
];

// J-Curve and NAV modeling parameters by strategy
const strategyParams = {
  PE: { callPeak: 8, callDecay: 0.8, distStart: 12, distPeak: 20, distDecay: 0.9, navPeak: 24, targetMultiple: 2.2 },
  VC: { callPeak: 12, callDecay: 0.85, distStart: 20, distPeak: 28, distDecay: 0.9, navPeak: 32, targetMultiple: 3.5 },
  Infra: { callPeak: 10, callDecay: 0.75, distStart: 16, distPeak: 28, distDecay: 0.85, navPeak: 36, targetMultiple: 1.8 },
  Secondaries: { callPeak: 4, callDecay: 0.7, distStart: 6, distPeak: 14, distDecay: 0.8, navPeak: 16, targetMultiple: 1.6 },
  Other: { callPeak: 8, callDecay: 0.8, distStart: 12, distPeak: 20, distDecay: 0.9, navPeak: 24, targetMultiple: 2.0 },
};

export const getPortfolioData = (
  scenario: Scenario = 'Base',
  fundId?: string,
  asOfDate: Date = new Date(),
  customFactors?: { callFactor: number; distFactor: number }
): { portfolio: PortfolioData; funds: Fund[] } => {
    const FORECAST_START_DATE = asOfDate;
    const NUM_QUARTERS_ACTUAL = 12; // More historical data
    const NUM_QUARTERS_FORECAST = 32; // Longer forecast horizon

    const generateDates = () => {
      const dates = [];
      const firstDate = addQuarters(FORECAST_START_DATE, -NUM_QUARTERS_ACTUAL);
      for (let i = 0; i < NUM_QUARTERS_ACTUAL + NUM_QUARTERS_FORECAST; i++) {
        dates.push(addQuarters(firstDate, i));
      }
      return dates;
    };
    const DATES = generateDates();

    const getFundAgeInQuarters = (fund: Fund, date: Date) => {
        const fundStartDate = new Date(fund.vintageYear, 0, 1);
        return differenceInQuarters(date, fundStartDate);
    };

    // This function generates the full lifecycle projections for a single fund
    const generateFundProjections = (fund: Fund, scenario: Scenario, customFactors?: { callFactor: number, distFactor: number }): { cashflows: CashflowData[], nav: NavData[] } => {
      const params = strategyParams[fund.strategy] || strategyParams.Other;
      let callFactor = 1;
      let distFactor = 1;
      let navFactor = 1;

      switch (scenario) {
        case 'Slow Exit': distFactor = 0.7; navFactor = 0.9; break;
        case 'Fast Exit': distFactor = 1.3; navFactor = 1.1; break;
        case 'Stress': callFactor = 1.1; distFactor = 0.6; navFactor = 0.8; break;
      }
      
      if(customFactors) {
        callFactor = customFactors.callFactor;
        distFactor = customFactors.distFactor;
      }
      
      let unfunded = fund.commitment;
      let nav = 0;
      const cashflows: CashflowData[] = [];
      const navs: NavData[] = [];

      for (const date of DATES) {
          const age = getFundAgeInQuarters(fund, date);
          let capitalCall = 0;
          
          if (age >= 0 && unfunded > 0) {
              const callPacing = (age / (fund.investmentPeriod * 4)) ** 1.5;
              const randomFactor = 1 + (Math.random() - 0.5) * 0.4;
              let potentialCall = (fund.commitment / (fund.investmentPeriod * 4)) * callPacing * randomFactor * callFactor;
              
              if (age > params.callPeak) {
                  potentialCall *= Math.pow(params.callDecay, age - params.callPeak);
              }

              capitalCall = Math.max(0, Math.min(potentialCall, unfunded));
              unfunded -= capitalCall;
          }

          let distribution = 0;
          if (age > params.distStart && nav > 0) {
            const distAge = age - params.distStart;
            const randomFactor = 1 + (Math.random() - 0.5) * 0.5;
            let potentialDist = (nav / (fund.fundLife * 4 - age)) * randomFactor * distFactor;

            if (distAge > (params.distPeak - params.distStart)) {
                potentialDist *= Math.pow(params.distDecay, distAge - (params.distPeak - params.distStart));
            }
            distribution = Math.min(nav + capitalCall, potentialDist); // Cannot distribute more than NAV
          }

          // NAV calculation
          const growthRate = (age > 0 && age < params.navPeak) ? (0.04 + (Math.random() - 0.5) * 0.02) * navFactor : -0.01;
          nav = nav * (1 + growthRate) + capitalCall - distribution;
          nav = Math.max(0, nav);

          cashflows.push({
            date: format(date, 'yyyy-MM-dd'),
            isActual: isBefore(date, FORECAST_START_DATE),
            capitalCall,
            distribution,
            netCashflow: distribution - capitalCall,
          });

          navs.push({
              date: format(date, 'yyyy-MM-dd'),
              nav,
          });
      }
      return { cashflows, nav: navs };
    };

    const aggregateProjections = <T extends { date: string }>(
        allProjections: T[][], 
        reducer: (acc: Omit<T, 'date' | 'isActual'>, current: T) => Omit<T, 'date' | 'isActual'>,
        initial: Omit<T, 'date' | 'isActual'>
      ): T[] => {
      if (allProjections.length === 0) return [];
      return DATES.map((date, i) => {
        const aggregated = allProjections.reduce((acc, fundProjections) => {
          return reducer(acc, fundProjections[i]);
        }, { ...initial });
        return {
          date: format(date, 'yyyy-MM-dd'),
          isActual: isBefore(date, FORECAST_START_DATE),
          ...aggregated
        } as T;
      });
    };
    
    const fundsForProcessing = fundId ? funds.filter(f => f.id === fundId) : funds;
    
    const allFundProjections = fundsForProcessing.map(fund => generateFundProjections(fund, scenario, customFactors));
    const allFundCashflows = allFundProjections.map(p => p.cashflows);
    const allFundNavs = allFundProjections.map(p => p.nav);

    const portfolioCashflows = aggregateProjections(allFundCashflows, (acc, cf) => {
        (acc as any).capitalCall += cf.capitalCall;
        (acc as any).distribution += cf.distribution;
        (acc as any).netCashflow += cf.netCashflow;
        return acc;
    }, { capitalCall: 0, distribution: 0, netCashflow: 0 });

    const portfolioNav = aggregateProjections(allFundNavs, (acc, nav) => {
        (acc as any).nav += nav.nav;
        return acc;
    }, { nav: 0 });

    // Calculate dynamic unfunded and NAV for all funds based on asOfDate, for the fund list page
    const allFundsWithCurrentData = funds.map((fund) => {
        const asOfIndex = DATES.findIndex(d => !isBefore(d, FORECAST_START_DATE));
        const { cashflows, nav } = generateFundProjections(fund, 'Base'); // use base scenario for list
        const historicalCashflows = cashflows.slice(0, asOfIndex);
        const calledToDate = historicalCashflows.reduce((sum, cf) => sum + cf.capitalCall, 0);
        const latestNav = nav[asOfIndex -1]?.nav || 0;
        
        return {
            ...fund,
            unfundedCommitment: Math.max(0, fund.commitment - calledToDate),
            latestNav: latestNav,
            forecastIRR: 15 + Math.random() * 10 // IRR calculation is complex, using random for now
        };
    });

    const getDrivers = (nextQuarters: number): { upcomingCalls: FundDriver[], expectedDistributions: FundDriver[] } => {
        const forecastStartIndex = DATES.findIndex(d => !isBefore(d, FORECAST_START_DATE));
        if (forecastStartIndex === -1) return { upcomingCalls: [], expectedDistributions: [] };
      
        const upcomingCalls: FundDriver[] = [];
        const expectedDistributions: FundDriver[] = [];

        fundsForProcessing.forEach((fund, fundIndex) => {
          let callValue = 0;
          let distValue = 0;
          let nextCallDate = '';
          let nextDistDate = '';

          for (let i = forecastStartIndex; i < forecastStartIndex + nextQuarters; i++) {
              const cf = allFundCashflows[fundIndex]?.[i];
              if(cf) {
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
    }
    
    // KPIs
    const forecastStartIndex = DATES.findIndex(d => !isBefore(d, FORECAST_START_DATE));
    const next90DaysDate = addMonths(FORECAST_START_DATE, 3);
    const netCashRequirementNext90Days = portfolioCashflows
      .filter(cf => isAfter(new Date(cf.date), FORECAST_START_DATE) && isBefore(new Date(cf.date), next90DaysDate))
      .reduce((sum, cf) => sum + cf.netCashflow, 0);

    const peakProjectedOutflow = portfolioCashflows
      .slice(forecastStartIndex)
      .reduce((peak, cf) => (cf.netCashflow < peak.value ? { value: cf.netCashflow, date: cf.date } : peak), { value: 0, date: '' });

    const remainingUnfunded = fundsForProcessing.map((fund, i) => {
      const asOfIndex = DATES.findIndex(d => !isBefore(d, FORECAST_START_DATE));
      const historicalCashflows = allFundCashflows[i].slice(0, asOfIndex);
      const calledToDate = historicalCashflows.reduce((sum, cf) => sum + cf.capitalCall, 0);
      return fund.commitment - calledToDate;
    }).reduce((sum, unfunded) => sum + unfunded, 0);

    const availableLiquidity = 50_000_000; // Dummy value
    const liquidityBufferRatio = remainingUnfunded > 0 ? Math.max(0, availableLiquidity / remainingUnfunded) : 1;
    
    const next12MonthsDate = addMonths(FORECAST_START_DATE, 12);
    const expectedDistributionsNext12Months = portfolioCashflows
      .filter(cf => isAfter(new Date(cf.date), FORECAST_START_DATE) && isBefore(new Date(cf.date), next12MonthsDate))
      .reduce((sum, cf) => sum + cf.distribution, 0);
    
    let cumulativeNet = portfolioCashflows.slice(0, forecastStartIndex).reduce((sum, cf) => sum + cf.netCashflow, 0);
    const breakevenCf = portfolioCashflows.slice(forecastStartIndex).find(cf => {
        cumulativeNet += cf.netCashflow;
        return cumulativeNet > 0;
    });
    const breakevenTiming = { from: breakevenCf?.date || 'N/A', to: '' };

    // Liquidity Forecast
    let currentLiquidity = availableLiquidity;
    const liquidityForecast: LiquidityData[] = portfolioCashflows.slice(forecastStartIndex).map(cf => {
      currentLiquidity += cf.netCashflow;
      return {
        date: cf.date,
        availableLiquidity: currentLiquidity > 0 ? currentLiquidity : 0,
        netOutflow: cf.netCashflow < 0 ? -cf.netCashflow : 0,
        fundingGap: currentLiquidity < 0 ? -currentLiquidity : 0,
      }
    });

    const runwayBreach = liquidityForecast.find(l => l.availableLiquidity <= 0);
    let liquidityRunwayInMonths = (NUM_QUARTERS_FORECAST * 3);
    if (runwayBreach) {
        liquidityRunwayInMonths = differenceInMonths(new Date(runwayBreach.date), FORECAST_START_DATE);
    }
    const nextFundingGap = liquidityForecast.find(l => l.fundingGap > 0);

    // Drivers
    const { upcomingCalls, expectedDistributions } = getDrivers(4); // 4 quarters = 1 year
    const largestUnfunded = [...allFundsWithCurrentData].filter(f => fundsForProcessing.some(fp => fp.id === f.id)).sort((a, b) => (b.unfundedCommitment ?? 0) - (a.unfundedCommitment ?? 0)).slice(0, 5).map(f => ({
      fundId: f.id,
      fundName: f.name,
      value: f.unfundedCommitment ?? 0,
      nextCashflowDate: '',
    }));
    
    // Composition
    const composition: Composition = {
      strategy: Object.entries(fundsForProcessing.reduce((acc, f) => {
        acc[f.strategy] = (acc[f.strategy] || 0) + f.commitment;
        return acc;
      }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
      vintage: Object.entries(fundsForProcessing.reduce((acc, f) => {
        acc[String(f.vintageYear)] = (acc[String(f.vintageYear)] || 0) + f.commitment;
        return acc;
      }, {} as Record<string, number>)).map(([name, value]) => ({ name, value: value })),
      region: Object.entries(fundsForProcessing.reduce((acc, f) => {
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
        { fundName: 'Global Infrastructure Fund', status: 'Failed', timestamp: subMonths(FORECAST_START_DATE, 1).toISOString() },
      ],
    };

    const formatCurrency = (value: number) => {
        if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
        if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
        return `$${value.toFixed(0)}`;
    };

    // Dummy Alerts
    const alerts: Alert[] = [
        { id: '1', title: 'Liquidity Gap Risk', description: `Projected funding gap of ${formatCurrency(liquidityForecast.find(l => l.fundingGap > 0)?.fundingGap || 12000000)} in Q3 2025`, severity: 'High' },
        { id: '2', title: 'Delayed Distribution', description: 'European Buyout Leaders IV distribution delayed', severity: 'Medium' },
        { id: '3', title: 'Missing Statement', description: 'Innovate BioTech Fund Q1 2025 statement overdue', severity: 'Low' },
    ];
    
    const portfolio = {
        kpis: {
          netCashRequirementNext90Days,
          peakProjectedOutflow,
          liquidityBufferRatio,
          remainingUnfunded,
          expectedDistributionsNext12Months,
          breakevenTiming,
          modelConfidence: 0.85,
          lastStatementUpdate: subMonths(FORECAST_START_DATE, 1).toISOString(),
          liquidityRunwayInMonths,
          nextFundingGap,
        },
        cashflowForecast: portfolioCashflows,
        navProjection: portfolioNav,
        liquidityForecast,
        drivers: { upcomingCalls, expectedDistributions, largestUnfunded },
        composition,
        dataHealth,
        alerts,
    };

    return { portfolio, funds: allFundsWithCurrentData };
}
