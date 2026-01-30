'use client';

import { Header } from '@/components/layout/header';
import { createContext, useContext, type ReactNode, useState, useEffect } from 'react';
import { getPortfolioData } from '@/lib/data';
import type { PortfolioData } from '@/lib/types';
import { usePathname } from 'next/navigation';

type PortfolioContextType = {
  portfolioData: PortfolioData | null;
};

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function usePortfolioContext() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolioContext must be used within a component wrapped by AppLayout');
  }
  return context;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [selectedFundId, setSelectedFundId] = useState<string>('all');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    // We only need to generate portfolio data for the dashboard page
    if (pathname === '/dashboard') {
      // Data generation is deferred to the client to prevent hydration mismatch
      setPortfolioData(getPortfolioData('Base Case', selectedFundId === 'all' ? undefined : selectedFundId));
    }
  }, [selectedFundId, pathname]);

  return (
    <PortfolioContext.Provider value={{ portfolioData }}>
      <div className="flex min-h-screen flex-col bg-background">
        <Header
          selectedFundId={selectedFundId}
          onFundChange={setSelectedFundId}
          portfolioData={portfolioData}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </PortfolioContext.Provider>
  );
}
