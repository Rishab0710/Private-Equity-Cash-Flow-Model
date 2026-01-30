'use client';

import { Header } from '@/components/layout/header';
import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import { getPortfolioData } from '@/lib/data';
import type { PortfolioData, Scenario } from '@/lib/types';
import { usePathname } from 'next/navigation';

type PortfolioContextType = {
  portfolioData: PortfolioData | null;
  scenario: Scenario;
  setScenario: (scenario: Scenario) => void;
  fundId: string;
  setFundId: (fundId: string) => void;
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
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    // We only need to generate portfolio data for the dashboard page
    if (pathname === '/dashboard') {
      // Data generation is deferred to the client to prevent hydration mismatch
      setPortfolioData(getPortfolioData(scenario, fundId === 'all' ? undefined : fundId));
    }
  }, [fundId, scenario, pathname]);

  return (
    <PortfolioContext.Provider value={{ portfolioData, scenario, setScenario, fundId, setFundId }}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </PortfolioContext.Provider>
  );
}
