'use client';

import { Header } from '@/components/layout/header';
import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import { getPortfolioData, funds as staticFunds } from '@/lib/data';
import type { PortfolioData, Scenario, Fund } from '@/lib/types';
import { usePathname } from 'next/navigation';

type PortfolioContextType = {
  portfolioData: PortfolioData | null;
  funds: Fund[];
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  fundId: string;
  setFundId: (fundId: string) => void;
  asOfDate: Date | undefined;
  setAsOfDate: (date: Date) => void;
  capitalCallPacing: number;
  setCapitalCallPacing: (pacing: number) => void;
  distributionVelocity: number;
  setDistributionVelocity: (velocity: number) => void;
  addFund: (fund: Fund) => void;
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  return context;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [fundId, setFundId] = useState<string>('all');
  const [scenario, setScenario] = useState<Scenario>('base');
  const [asOfDate, setAsOfDate] = useState<Date | undefined>(undefined);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [funds, setFunds] = useState<Fund[]>(staticFunds);
  const [capitalCallPacing, setCapitalCallPacing] = useState(100);
  const [distributionVelocity, setDistributionVelocity] = useState(100);

  const addFund = (newFund: Fund) => setFunds(prev => [...prev, newFund]);

  useEffect(() => {
    setAsOfDate(new Date());
  }, []);

  useEffect(() => {
    if (asOfDate) {
      const { portfolio, funds: newFunds } = getPortfolioData(scenario, fundId === 'all' ? undefined : fundId, asOfDate, { callFactor: capitalCallPacing / 100, distFactor: distributionVelocity / 100 });
      setPortfolioData(portfolio);
      setFunds(newFunds);
    }
  }, [fundId, scenario, asOfDate, capitalCallPacing, distributionVelocity]);

  return (
    <PortfolioContext.Provider value={{ portfolioData, funds, scenario, setScenario, fundId, setFundId, asOfDate, setAsOfDate, capitalCallPacing, setCapitalCallPacing, distributionVelocity, setDistributionVelocity, addFund }}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-5 lg:p-6">{children}</main>
      </div>
    </PortfolioContext.Provider>
  );
}
