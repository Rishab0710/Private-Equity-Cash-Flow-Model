export type Fund = {
  id: string;
  name: string;
  strategy: 'PE' | 'VC' | 'Infra' | 'Secondaries' | 'Other';
  region: 'North America' | 'Europe' | 'Asia' | 'Global';
  vintageYear: number;
  commitment: number;
  investmentPeriod: number;
  fundLife: number;
  unfundedCommitment?: number;
  latestNav?: number;
  forecastIRR?: number;
};

export type Scenario = 'Base' | 'Slow Exit' | 'Fast Exit' | 'Stress';

export type CashflowData = {
  date: string;
  isActual: boolean;
  capitalCall: number;
  distribution: number;
  netCashflow: number;
};

export type NavData = {
  date: string;
  nav: number;
};

export type UnfundedCommitmentData = {
  date: string;
  unfunded: number;
};

export type LiquidityData = {
  date: string;
  availableLiquidity: number;
  netOutflow: number;
  fundingGap: number;
};

export type FundDriver = {
  fundId: string;
  fundName: string;
  value: number;
  nextCashflowDate: string;
};

export type Composition = {
  strategy: { name: string; value: number }[];
  vintage: { name: string; value: number }[];
  region: { name: string; value: number }[];
};

export type DataHealth = {
  fundsUpdated: number;
  totalFunds: number;
  successRate: number;
  lowConfidenceAlerts: number;
  recentActivity: { fundName: string; status: 'Success' | 'Failed'; timestamp: string }[];
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
};


export type PortfolioData = {
  kpis: {
    netCashRequirementNext90Days: number;
    peakProjectedOutflow: { value: number; date: string };
    liquidityBufferRatio: number;
    remainingUnfunded: number;
    expectedDistributionsNext12Months: number;
    breakevenTiming: { from: string; to: string };
    modelConfidence: number;
    lastStatementUpdate: string;
    liquidityRunwayInMonths?: number;
    nextFundingGap?: LiquidityData;
  };
  cashflowForecast: CashflowData[];
  navProjection: NavData[];
  liquidityForecast: LiquidityData[];
  drivers: {
    upcomingCalls: FundDriver[];
    expectedDistributions: FundDriver[];
    largestUnfunded: FundDriver[];
  };
  composition: Composition;
  dataHealth: DataHealth;
  alerts: Alert[];
};
