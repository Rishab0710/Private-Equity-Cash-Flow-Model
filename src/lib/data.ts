import type { Fund, CashflowData, NavData } from './types';

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

const dates = generateQuarterlyDates(2021, 8);

// J-Curve NAV Projection
export const navProjectionData: NavData[] = dates.map((date, index) => {
  const t = index / dates.length; // Normalize index to be between 0 and 1
  // A simple function to model a J-curve like shape
  const nav = 100 * (1 - Math.exp(-t * 5)) + t * 500 + Math.random() * 50;
  return {
    date,
    nav: Math.max(0, nav),
  };
});

export const cashflowForecastData: CashflowData[] = dates.map((date, index) => {
  const investmentPhase = index < 12; // First 3 years
  const harvestPhase = index >= 16; // After year 4

  let capitalCall = 0;
  if (investmentPhase) {
    capitalCall = Math.random() * (12 - index) * 0.8 + 2;
  }

  let distribution = 0;
  if (harvestPhase) {
    distribution = Math.random() * (index - 15) * 2 + 1;
  } else if (index > 8) {
    distribution = Math.random() * 2;
  }
  
  return {
    date,
    capitalCall: capitalCall * 1000000,
    distribution: distribution * 1000000,
    netCashflow: (distribution - capitalCall) * 1000000,
  };
});
