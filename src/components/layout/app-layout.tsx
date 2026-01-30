'use client';

import { Header } from '@/components/layout/header';
import type { ReactNode } from 'react';
import { useState, useEffect, Children, cloneElement } from 'react';
import { getPortfolioData } from '@/lib/data';
import type { PortfolioData } from '@/lib/types';
import { usePathname } from 'next/navigation';

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
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        selectedFundId={selectedFundId}
        onFundChange={setSelectedFundId}
        portfolioData={portfolioData}
      />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {Children.map(children, (child) => {
          if (child && typeof child === 'object' && 'props' in child && pathname === '/dashboard') {
            return cloneElement(child as React.ReactElement, { portfolioData });
          }
          return child;
        })}
      </main>
    </div>
  );
}
