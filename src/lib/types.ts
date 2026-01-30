export type Fund = {
  id: string;
  name: string;
  strategy: 'PE' | 'VC' | 'Infra' | 'Secondaries' | 'Other';
  commitment: number;
  vintageYear: number;
  investmentPeriod: number;
  fundLife: number;
  latestNav: number;
  unfundedCommitment: number;
  forecastIRR: number;
};

export type CashflowData = {
  date: string;
  capitalCall: number;
  distribution: number;
  netCashflow: number;
};

export type NavData = {
  date: string;
  nav: number;
};

export type Scenario = 'Base Case' | 'Slow Deployment' | 'Fast Deployment' | 'Downside Vintage';
