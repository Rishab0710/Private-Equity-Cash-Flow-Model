'use client';

import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { CashflowCommandChart } from '@/components/app/dashboard/cashflow-chart';
import { NavEvolutionChart } from '@/components/app/cashflow-engine/nav-evolution-chart';
import { FundingDriversPanel } from '@/components/app/dashboard/corporate-actions';
import { ScenarioConsole } from '@/components/app/dashboard/left-sidebar';

export default function CashflowEnginePage() {
  const { portfolioData } = usePortfolioContext();

  if (!portfolioData) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Cashflow Forecast Engine</h1>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <Skeleton className="h-[320px]" />
              </div>
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Skeleton className="h-[430px]" />
                  <Skeleton className="h-[430px]" />
                </div>
                <Skeleton className="h-[256px]" />
              </div>
            </div>
        </div>
    );
  }

  const { cashflowForecast, navProjection, drivers } = portfolioData;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cashflow Forecast Engine</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ScenarioConsole />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CashflowCommandChart data={cashflowForecast} />
            <NavEvolutionChart data={navProjection} />
          </div>
          <FundingDriversPanel drivers={drivers} />
        </div>
      </div>
    </div>
  );
}
