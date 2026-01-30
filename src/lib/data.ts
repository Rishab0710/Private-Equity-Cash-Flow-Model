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

export const navProjectionData: NavData[] = dates.map((date, index) => ({
  date,
  nav: 100 + index * 20 + Math.random() * 30 - 15,
}));

export const cashflowForecastData: CashflowData[] = dates.map((date, index) => {
  const capitalCall = Math.max(0, 10 - index + Math.random() * 5 - 2.5);
  const distribution = index > 8 ? Math.max(0, (index - 8) * 1.5 + Math.random() * 6 - 3) : 0;
  return {
    date,
    capitalCall,
    distribution,
    netCashflow: distribution - capitalCall,
  };
});
