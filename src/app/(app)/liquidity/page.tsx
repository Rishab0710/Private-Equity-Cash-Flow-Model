'use client';

import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { LiquidityKpiPanel } from '@/components/app/liquidity/liquidity-kpi-panel';
import { LiquidityTimelineChart } from '@/components/app/liquidity/liquidity-timeline-chart';
import { FundingSpikeTable } from '@/components/app/liquidity/funding-spike-table';
import { LiquidityActionPlanner } from '@/components/app/liquidity/liquidity-action-planner';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { LiquidityScenarioControls } from '@/components/app/liquidity/liquidity-scenario-controls';

export default function LiquidityPage() {
  const { portfolioData, capitalCallPacing, setCapitalCallPacing, distributionVelocity, setDistributionVelocity } = usePortfolioContext();

  if (!portfolioData) {
    return <LiquiditySkeleton />;
  }

  const { liquidityForecast, cashflowForecast, kpis, alerts } = portfolioData;

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

      <LiquidityScenarioControls
        capitalCallPacing={capitalCallPacing}
        setCapitalCallPacing={setCapitalCallPacing}
        distributionVelocity={distributionVelocity}
        setDistributionVelocity={setDistributionVelocity}
      />

      <LiquidityTimelineChart liquidityData={liquidityForecast} cashflowData={cashflowForecast} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FundingSpikeTable cashflowData={cashflowForecast} />
          <LiquidityActionPlanner alerts={alerts} />
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
        
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[430px]" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[250px]" />
            <Skeleton className="h-[250px]" />
        </div>
    </div>
);
