'use client';

import { StatCard } from '@/components/app/dashboard/stat-card';
import { PortfolioJCurve } from '@/components/app/dashboard/j-curve-chart';
import { NetCashflowForecast } from '@/components/app/dashboard/cashflow-chart';
import { UnfundedCommitmentChart } from '@/components/app/dashboard/unfunded-commitment-chart';
import type { PortfolioData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FundList } from '@/components/app/funds/fund-list';

export default function DashboardPage({
  portfolioData,
}: {
  portfolioData: PortfolioData | null;
}) {
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
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Commitment"
          value={formatCurrency(portfolioData.stats.totalCommitment)}
          change="+2.5% from last month"
          icon="DollarSign"
        />
        <StatCard
          title="Projected NAV"
          value={formatCurrency(portfolioData.stats.projectedNav)}
          change="+1.8% from last month"
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
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PortfolioJCurve data={portfolioData.navProjection} />
        <NetCashflowForecast data={portfolioData.cashflowForecast} />
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">My Funds</h2>
        <FundList showHeader={false} />
      </div>
    </div>
  );
}
