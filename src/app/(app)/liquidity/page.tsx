'use client';

import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { LiquidityKpiPanel } from '@/components/app/liquidity/liquidity-kpi-panel';
import { LiquidityTimelineChart } from '@/components/app/liquidity/liquidity-timeline-chart';
import { ScenarioConsole } from '@/components/app/dashboard/left-sidebar';
import { FundingDriversPanel } from '@/components/app/dashboard/corporate-actions';
import { FundingSpikeTable } from '@/components/app/liquidity/funding-spike-table';
import { LiquidityActionPlanner } from '@/components/app/liquidity/liquidity-action-planner';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function LiquidityPage() {
  const { portfolioData } = usePortfolioContext();

  if (!portfolioData) {
    return <LiquiditySkeleton />;
  }

  const { liquidityForecast, cashflowForecast, drivers, kpis, alerts } = portfolioData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Advanced Liquidity Planning</h1>
        <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
        </Button>
      </div>
      
      <LiquidityKpiPanel kpis={kpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <LiquidityTimelineChart liquidityData={liquidityForecast} cashflowData={cashflowForecast} />
            <FundingSpikeTable cashflowData={cashflowForecast} />
        </div>
        <div className="lg:col-span-1 space-y-6">
            <ScenarioConsole />
            <FundingDriversPanel drivers={drivers} />
            <LiquidityActionPlanner alerts={alerts} />
        </div>
      </div>
    </div>
  );
}

const LiquiditySkeleton = () => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[430px]" />
                <Skeleton className="h-[250px]" />
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Skeleton className="h-[280px]" />
                <Skeleton className="h-[250px]" />
                <Skeleton className="h-[200px]" />
            </div>
        </div>
    </div>
);