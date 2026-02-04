import { addQuarters, format, isBefore, subMonths, differenceInQuarters } from 'date-fns';
import type {
  CashflowData,
  Fund,
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
  scenario: Scenario = 'base',
  fundId?: string,
  asOfDate: Date = new Date(),
  customFactors?: { callFactor: number; distFactor: number }
): { portfolio: PortfolioData; funds: Fund[] } => {
    const FORECAST_START_DATE = asOfDate;
    const NUM_QUARTERS_ACTUAL = 8;
    const NUM_QUARTERS_FORECAST = 24;

    const DATES = [];
    const firstDate = addQuarters(FORECAST_START_DATE, -NUM_QUARTERS_ACTUAL);
    for (let i = 0; i < NUM_QUARTERS_ACTUAL + NUM_QUARTERS_FORECAST; i++) {
        DATES.push(addQuarters(firstDate, i));
    }

    const getFundAgeInQuarters = (fund: Fund, date: Date) => {
        const fundStartDate = new Date(fund.vintageYear, 0, 1);
        return differenceInQuarters(date, fundStartDate);
    };

    const generateFundProjections = (fund: Fund, scenario: Scenario, factors?: { callFactor: number, distFactor: number }) => {
      const params = strategyParams[fund.strategy] || strategyParams.Other;
      
      let callFactor = factors?.callFactor ?? 1.0;
      let distFactor = factors?.distFactor ?? 1.0;
      let navGrowthFactor = 1.0;

      if (scenario === 'recession') {
          callFactor *= 1.15;
          distFactor *= 0.5;
          navGrowthFactor = 0.8;
      } else if (scenario === 'liquidityCrunch') {
          callFactor *= 1.3;
          distFactor *= 0.3;
          navGrowthFactor = 0.6;
      }
      
      let unfunded = fund.commitment;
      let nav = 0;
      const cashflows: CashflowData[] = [];
      const navs: NavData[] = [];

      DATES.forEach((date) => {
          const age = getFundAgeInQuarters(fund, date);
          const isForecast = !isBefore(date, FORECAST_START_DATE);
          
          let capitalCall = 0;
          if (age >= 0 && unfunded > 0) {
              const baseCall = fund.commitment / (fund.investmentPeriod * 4);
              capitalCall = Math.min(unfunded, baseCall * (isForecast ? callFactor : 1.0));
              unfunded -= capitalCall;
          }

          let distribution = 0;
          if (age > params.distStart && nav > 0) {
              distribution = Math.min(nav, nav * 0.05 * (isForecast ? distFactor : 1.0));
          }

          const growthRate = (age > 0 && age < params.navPeak) ? (0.04 * navGrowthFactor) : 0.005;
          nav = nav * (1 + growthRate) + capitalCall - distribution;
          nav = Math.max(0, nav);

          const dateStr = format(date, 'yyyy-MM-dd');
          cashflows.push({
            date: dateStr,
            isActual: !isForecast,
            capitalCall,
            distribution,
            netCashflow: distribution - capitalCall,
          });

          navs.push({ date: dateStr, nav });
      });
      return { cashflows, nav: navs };
    };

    const fundsForProcessing = fundId ? funds.filter(f => f.id === fundId) : funds;
    const allFundProjections = fundsForProcessing.map(fund => generateFundProjections(fund, scenario, customFactors));

    const portfolioCashflows = DATES.map((date, i) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return {
            date: dateStr,
            isActual: isBefore(date, FORECAST_START_DATE),
            capitalCall: allFundProjections.reduce((sum, p) => sum + p.cashflows[i].capitalCall, 0),
            distribution: allFundProjections.reduce((sum, p) => sum + p.cashflows[i].distribution, 0),
            netCashflow: allFundProjections.reduce((sum, p) => sum + p.cashflows[i].netCashflow, 0),
        };
    });

    const portfolioNav = DATES.map((date, i) => ({
        date: format(date, 'yyyy-MM-dd'),
        nav: allFundProjections.reduce((sum, p) => sum + p.nav[i].nav, 0),
    }));

    const forecastStartIndex = DATES.findIndex(d => !isBefore(d, FORECAST_START_DATE));
    const remainingUnfunded = fundsForProcessing.reduce((sum, fund, i) => {
        const called = allFundProjections[i].cashflows.slice(0, forecastStartIndex).reduce((s, cf) => s + cf.capitalCall, 0);
        return sum + (fund.commitment - called);
    }, 0);

    const availableLiquidity = 20_000_000;
    let currentLiquidity = availableLiquidity;
    const liquidityForecast: LiquidityData[] = portfolioCashflows.slice(forecastStartIndex).map(cf => {
        currentLiquidity += cf.netCashflow;
        return {
            date: cf.date,
            availableLiquidity: Math.max(0, currentLiquidity),
            netOutflow: cf.netCashflow < 0 ? -cf.netCashflow : 0,
            fundingGap: currentLiquidity < 0 ? -currentLiquidity : 0,
            liquidityBalance: currentLiquidity,
        };
    });

    return {
        portfolio: {
            kpis: {
                netCashRequirementNext90Days: portfolioCashflows.slice(forecastStartIndex, forecastStartIndex + 3).reduce((sum, cf) => sum + cf.netCashflow, 0),
                peakProjectedOutflow: portfolioCashflows.slice(forecastStartIndex).reduce((p, cf) => cf.netCashflow < p.value ? { value: cf.netCashflow, date: cf.date } : p, { value: 0, date: '' }),
                liquidityBufferRatio: remainingUnfunded > 0 ? availableLiquidity / remainingUnfunded : 1,
                remainingUnfunded,
                expectedDistributionsNext12Months: portfolioCashflows.slice(forecastStartIndex, forecastStartIndex + 12).reduce((sum, cf) => sum + cf.distribution, 0),
                breakevenTiming: { from: portfolioCashflows.slice(forecastStartIndex).find(cf => cf.netCashflow > 0)?.date || 'N/A', to: '' },
                modelConfidence: 0.9,
                lastStatementUpdate: subMonths(FORECAST_START_DATE, 1).toISOString(),
            },
            cashflowForecast: portfolioCashflows,
            allFundCashflows: allFundProjections.map(p => p.cashflows),
            navProjection: portfolioNav,
            liquidityForecast,
            drivers: { upcomingCalls: [], expectedDistributions: [], largestUnfunded: [] },
            composition: { strategy: [], vintage: [], region: [] },
            dataHealth: { fundsUpdated: 6, totalFunds: 6, successRate: 1, lowConfidenceAlerts: 0, recentActivity: [] },
            alerts: [],
        },
        funds: funds.map(f => ({ ...f, unfundedCommitment: 0, latestNav: 0, forecastIRR: 0 })),
    };
};
