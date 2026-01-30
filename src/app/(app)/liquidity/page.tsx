'use client';

import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { LiquidityKpiPanel } from '@/components/app/liquidity/liquidity-kpi-panel';
import { LiquidityTimelineChart } from '@/components/app/liquidity/liquidity-timeline-chart';
import { FundingSpikeTable } from '@/components/app/liquidity/funding-spike-table';
import { LiquidityActionPlanner } from '@/components/app/liquidity/liquidity-action-planner';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FundSelector } from '@/components/app/dashboard/fund-selector';

export default function LiquidityPage() {
  const { portfolioData, fundId, setFundId, capitalCallPacing, setCapitalCallPacing, distributionVelocity, setDistributionVelocity, funds } = usePortfolioContext();

  if (!portfolioData) {
    return <LiquiditySkeleton />;
  }

  const { liquidityForecast, cashflowForecast, kpis, alerts, allFundCashflows } = portfolioData;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-4 flex-wrap">
                <FundSelector
                  selectedFundId={fundId}
                  onFundChange={setFundId}
                />
                <div className="space-y-1 w-[200px]">
                    <div className="flex justify-between items-center">
                        <Label className="text-sm font-normal">Capital Call Pacing</Label>
                        <span className="text-xs font-medium text-muted-foreground">{(capitalCallPacing / 100).toFixed(1)}x</span>
                    </div>
                    <Slider value={[capitalCallPacing]} onValueChange={([v]) => setCapitalCallPacing(v)} min={50} max={150} step={5} />
                </div>
                <div className="space-y-1 w-[200px]">
                    <div className="flex justify-between items-center">
                        <Label className="text-sm font-normal">Distribution Velocity</Label>
                        <span className="text-xs font-medium text-muted-foreground">{(distributionVelocity / 100).toFixed(1)}x</span>
                    </div>
                    <Slider value={[distributionVelocity]} onValueChange={([v]) => setDistributionVelocity(v)} min={50} max={150} step={5} />
                </div>
            </div>
        </div>
      </div>
      
      <LiquidityKpiPanel kpis={kpis} />

      <LiquidityTimelineChart liquidityData={liquidityForecast} cashflowData={cashflowForecast} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FundingSpikeTable cashflowData={cashflowForecast} allFundCashflows={allFundCashflows} funds={funds} />
          <LiquidityActionPlanner alerts={alerts} />
      </div>
    </div>
  );
}

const LiquiditySkeleton = () => (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                    <Skeleton className="h-10 w-[220px]" />
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-10 w-[200px]" />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        
        <Skeleton className="h-[430px]" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-[250px]" />
            <Skeleton className="h-[250px]" />
        </div>
    </div>
);
