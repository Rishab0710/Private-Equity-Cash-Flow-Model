'use client';

import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/app/dashboard/stat-card';
import { CashflowCommandChart } from '@/components/app/dashboard/cashflow-chart';
import { LiquidityRunwayChart } from '@/components/app/dashboard/j-curve-chart';
import { FundingDriversPanel } from '@/components/app/dashboard/corporate-actions';
import { AlertsWatchlist } from '@/components/app/dashboard/alerts-exceptions';
import { DataHealthPanel } from '@/components/app/dashboard/rebalance-queue';
import { format } from 'date-fns';

const formatCurrency = (value: number, decimals = 1) => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

const formatDateRange = (from: string, to: string) => {
    if (from === 'N/A') return 'N/A';
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return `${format(fromDate, 'MMM yyyy')} - ${format(toDate, 'MMM yyyy')}`;
}

export default function DashboardPage() {
  const { portfolioData, fundId } = usePortfolioContext();

  if (!portfolioData) {
    return <DashboardSkeleton />;
  }

  const { kpis, cashflowForecast, liquidityForecast, drivers, dataHealth, alerts } = portfolioData;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <KpiCard title="Net Requirement (90D)" value={formatCurrency(kpis.netCashRequirementNext90Days)} />
        <KpiCard title="Peak Outflow" value={formatCurrency(kpis.peakProjectedOutflow.value)} description={`in ${kpis.peakProjectedOutflow.date ? format(new Date(kpis.peakProjectedOutflow.date), 'MMM yyyy') : 'N/A'}`} />
        <KpiCard title="Liquidity Buffer" value={formatPercent(kpis.liquidityBufferRatio)} />
        <KpiCard title="Unfunded" value={formatCurrency(kpis.remainingUnfunded, 0)} />
        <KpiCard title="Distributions (12M)" value={formatCurrency(kpis.expectedDistributionsNext12Months)} />
        <KpiCard title="Breakeven" value={kpis.breakevenTiming.from !== 'N/A' ? format(new Date(kpis.breakevenTiming.from), 'MMM yy') : 'N/A'} />
        <KpiCard title="Model Confidence" value={formatPercent(kpis.modelConfidence)} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <CashflowCommandChart data={cashflowForecast} />
        </div>
        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
          <AlertsWatchlist alerts={alerts} />
          <FundingDriversPanel drivers={drivers} />
        </div>
      </div>
      
      {/* Row 3 */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <LiquidityRunwayChart data={liquidityForecast}/>
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
            <DataHealthPanel data={dataHealth} />
        </div>
      </div>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
      {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-20" />)}
    </div>
    <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 "><Skeleton className="h-[400px]" /></div>
        <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4">
            <Skeleton className="h-full" />
            <Skeleton className="h-full" />
        </div>
    </div>
     <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12"><Skeleton className="h-64" /></div>
    </div>
  </div>
);
