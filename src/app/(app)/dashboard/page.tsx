'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/app/dashboard/stat-card';
import { PortfolioJCurve } from '@/components/app/dashboard/j-curve-chart';
import { NetCashflowForecast } from '@/components/app/dashboard/cashflow-chart';
import { UnfundedCommitmentChart } from '@/components/app/dashboard/unfunded-commitment-chart';
import { ScenarioSelector } from '@/components/app/dashboard/scenario-selector';
import { getPortfolioData } from '@/lib/data';
import type { Scenario, PortfolioData } from '@/lib/types';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [scenario, setScenario] = useState<Scenario>('Base Case');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  useEffect(() => {
    // Data generation is deferred to the client to prevent hydration mismatch
    setPortfolioData(getPortfolioData(scenario));
  }, [scenario]);

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };
  
  if (!portfolioData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-5 w-[250px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[380px]" />
          <Skeleton className="h-[380px]" />
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-[380px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <ScenarioSelector selectedScenario={scenario} onScenarioChange={setScenario} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {format(new Date(portfolioData.stats.lastUpdated), "MMM d, yyyy, h:mm a")}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Commitment"
          value={formatCurrency(portfolioData.stats.totalCommitment)}
          icon="DollarSign"
        />
        <StatCard
          title="Projected NAV (EOP)"
          value={formatCurrency(portfolioData.stats.projectedNav)}
          icon="LineChart"
        />
        <StatCard
          title="Peak Capital Outflow"
          value={formatCurrency(portfolioData.stats.peakCapitalOutflow)}
          description={`in ${portfolioData.stats.peakCapitalOutflowDate}`}
          icon="TrendingDown"
        />
        <StatCard
          title="Breakeven"
          value={portfolioData.stats.breakeven}
          description="When distributions exceed contributions"
          icon="CalendarCheck2"
        />
        <StatCard
          title="Liquidity Risk"
          value="Moderate"
          description="Potential shortfall in Q2 2025"
          icon="AlertCircle"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PortfolioJCurve data={portfolioData.navProjection} />
        <NetCashflowForecast data={portfolioData.cashflowForecast} />
        <UnfundedCommitmentChart data={portfolioData.unfundedCommitment} />
      </div>
    </div>
  );
}
