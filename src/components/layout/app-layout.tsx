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
  setCapitalCallPacing: (value: number) => void;
  distributionVelocity: number;
  setDistributionVelocity: (value: number) => void;
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  return context;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [fundId, setFundId] = useState<string>('all');
  const [scenario, setScenario] = useState<Scenario>('Base');
  const [asOfDate, setAsOfDate] = useState<Date | undefined>(undefined);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [funds, setFunds] = useState<Fund[]>(staticFunds);
  const [capitalCallPacing, setCapitalCallPacing] = useState(100);
  const [distributionVelocity, setDistributionVelocity] = useState(100);

  useEffect(() => {
    setAsOfDate(new Date());
  }, []);

  useEffect(() => {
    // We only need to generate portfolio data for data-heavy pages
    const dataPages = ['/dashboard', '/cashflow-engine', '/funds', '/liquidity', '/portfolio-growth'];
    if (dataPages.includes(pathname) && asOfDate) {
      let factors;
      if (pathname === '/liquidity') {
        factors = {
          callFactor: capitalCallPacing / 100,
          distFactor: distributionVelocity / 100,
        };
      }

      const { portfolio, funds: newFunds } = getPortfolioData(scenario, fundId === 'all' ? undefined : fundId, asOfDate, factors);
      setPortfolioData(portfolio);
      setFunds(newFunds);
    }
  }, [fundId, scenario, pathname, asOfDate, capitalCallPacing, distributionVelocity]);

  return (
    <PortfolioContext.Provider value={{ portfolioData, funds, scenario, setScenario, fundId, setFundId, asOfDate, setAsOfDate: (date) => setAsOfDate(date), capitalCallPacing, setCapitalCallPacing, distributionVelocity, setDistributionVelocity }}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-5 lg:p-6">{children}</main>
      </div>
    </PortfolioContext.Provider>
  );
}
