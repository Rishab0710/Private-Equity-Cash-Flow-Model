import type { Fund, CashflowData, NavData, UnfundedCommitmentData, Scenario } from './types';

export const funds: Fund[] = [
  {
    id: '1',
    name: 'Growth Equity Fund V',
    strategy: 'PE',
    commitment: 100000000,
    vintageYear: 2021,
    investmentPeriod: 5,
    fundLife: 10,
    latestNav: 45000000,
    unfundedCommitment: 55000000,
    forecastIRR: 18.5,
  },
  {
    id: '2',
    name: 'Venture Partners II',
    strategy: 'VC',
    commitment: 50000000,
    vintageYear: 2022,
    investmentPeriod: 4,
    fundLife: 12,
    latestNav: 15000000,
    unfundedCommitment: 35000000,
    forecastIRR: 22.1,
  },
  {
    id: '3',
    name: 'Global Infrastructure Fund',
    strategy: 'Infra',
    commitment: 250000000,
    vintageYear: 2020,
    investmentPeriod: 6,
    fundLife: 15,
    latestNav: 180000000,
    unfundedCommitment: 70000000,
    forecastIRR: 12.3,
  },
  {
    id: '4',
    name: 'Secondary Opportunities Fund I',
    strategy: 'Secondaries',
    commitment: 75000000,
    vintageYear: 2023,
    investmentPeriod: 3,
    fundLife: 8,
    latestNav: 10000000,
    unfundedCommitment: 65000000,
    forecastIRR: 15.0,
  },
];

const generateQuarterlyDates = (startYear: number, numYears: number) => {
  const dates = [];
  for (let year = startYear; year < startYear + numYears; year++) {
    for (let q = 1; q <= 4; q++) {
      dates.push(`Q${q} ${year}`);
    }
  }
  return dates;
};

const DATES = generateQuarterlyDates(2021, 8);
const TOTAL_PORTFOLIO_COMMITMENT = funds.reduce((acc, fund) => acc + fund.commitment, 0);


const generateCashflowForecast = (scenario: Scenario, scale: number): CashflowData[] => {
    let callFactor = 1;
    let distFactor = 1;
    if (scenario === 'Slow Deployment') callFactor = 0.8;
    if (scenario === 'Fast Deployment') callFactor = 1.2;
    if (scenario === 'Downside Vintage') distFactor = 0.6;
    
    return DATES.map((date, index) => {
        const investmentPhase = index < 16; // First 4 years
        const harvestPhase = index >= 12; // After year 3

        let capitalCall = 0;
        if (investmentPhase) {
            capitalCall = (Math.random() * (16 - index) * 0.7 + 1.5) * callFactor;
        }

        let distribution = 0;
        if (harvestPhase) {
            distribution = (Math.random() * (index - 11) * 1.8 + 1) * distFactor;
        } else if (index > 8) {
            distribution = Math.random() * 1.5 * distFactor;
        }
        
        return {
            date,
            capitalCall: capitalCall * 1000000 * scale,
            distribution: distribution * 1000000 * scale,
            netCashflow: (distribution - capitalCall) * 1000000 * scale,
        };
    });
};

const generateNavProjection = (scenario: Scenario, cashflows: CashflowData[], initialNav: number): NavData[] => {
  let downturn = 1;
  if (scenario === 'Downside Vintage') downturn = 0.7;

  let currentNav = initialNav;
  
  return DATES.map((date, index) => {
      const { capitalCall, distribution } = cashflows[index];
      // A simple NAV roll-forward
      const growth = currentNav * (0.02 + (Math.random() - 0.5) * 0.01) * downturn; // Quarterly growth
      currentNav += capitalCall - distribution + growth;
      return {
        date,
        nav: Math.max(0, currentNav),
      };
  });
};

const generateUnfundedCommitment = (cashflows: CashflowData[], totalCommitment: number): UnfundedCommitmentData[] => {
  let remainingUnfunded = totalCommitment;
  
  return cashflows.map(cf => {
    remainingUnfunded -= cf.capitalCall;
    return {
      date: cf.date,
      unfunded: Math.max(0, remainingUnfunded),
    };
  });
};

export const getPortfolioData = (scenario: Scenario = 'Base Case', fundId?: string) => {
    const targetFunds = fundId && fundId !== 'all' ? funds.filter(f => f.id === fundId) : funds;
    
    const totalCommitment = targetFunds.reduce((acc, fund) => acc + fund.commitment, 0);
    const initialNav = targetFunds.reduce((acc, fund) => acc + fund.latestNav, 0);

    const scale = totalCommitment / TOTAL_PORTFOLIO_COMMITMENT;

    const cashflowForecast = generateCashflowForecast(scenario, scale);
    const navProjection = generateNavProjection(scenario, cashflowForecast, initialNav);
    const unfundedCommitment = generateUnfundedCommitment(cashflowForecast, totalCommitment);
    
    const projectedNav = navProjection[navProjection.length - 1]?.nav || 0;

    const netCashflows = cashflowForecast.map(c => c.netCashflow);
    
    const peakOutflowData = netCashflows.length > 0 
      ? cashflowForecast.reduce((peak, current) => {
            return current.netCashflow < peak.netCashflow ? current : peak;
        }, {date: '', netCashflow: 0})
      : {date: 'N/A', netCashflow: 0};
    
    let cumulativeCashflow = 0;
    const breakeven = cashflowForecast.find(c => {
        cumulativeCashflow += c.netCashflow;
        return cumulativeCashflow > 0;
    })?.date;

    return {
        navProjection,
        cashflowForecast,
        unfundedCommitment,
        stats: {
            totalCommitment,
            projectedNav,
            peakCapitalOutflow: peakOutflowData.netCashflow,
            peakCapitalOutflowDate: peakOutflowData.date,
            breakeven: breakeven || "N/A",
            lastUpdated: new Date().toISOString(),
        }
    };
}
