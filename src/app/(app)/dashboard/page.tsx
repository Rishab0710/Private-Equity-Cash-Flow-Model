'use client';

import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { KpiCard } from '@/components/app/dashboard/stat-card';
import { CashflowCommandChart } from '@/components/app/dashboard/cashflow-chart';
import { LiquidityRunwayChart } from '@/components/app/dashboard/j-curve-chart';
import { PortfolioComposition } from '@/components/app/dashboard/unfunded-commitment-chart';
import { FundingDriversPanel } from '@/components/app/dashboard/corporate-actions';
import { ScenarioConsole } from '@/components/app/dashboard/left-sidebar';
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

  const { kpis, cashflowForecast, liquidityForecast, drivers, composition, dataHealth, alerts } = portfolioData;

  return (
    <div className="grid grid-cols-12 grid-rows-[auto,auto,auto,1fr] gap-6">
      {/* KPIs */}
      <div className="col-span-12 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <KpiCard title="Net Requirement (90D)" value={formatCurrency(kpis.netCashRequirementNext90Days)} />
        <KpiCard title="Peak Outflow" value={formatCurrency(kpis.peakProjectedOutflow.value)} description={`in ${kpis.peakProjectedOutflow.date ? format(new Date(kpis.peakProjectedOutflow.date), 'MMM yyyy') : 'N/A'}`} />
        <KpiCard title="Liquidity Buffer" value={formatPercent(kpis.liquidityBufferRatio)} />
        <KpiCard title="Unfunded" value={formatCurrency(kpis.remainingUnfunded, 0)} />
        <KpiCard title="Distributions (12M)" value={formatCurrency(kpis.expectedDistributionsNext12Months)} />
        <KpiCard title="Breakeven" value={kpis.breakevenTiming.from !== 'N/A' ? format(new Date(kpis.breakevenTiming.from), 'MMM yy') : 'N/A'} />
        <KpiCard title="Model Confidence" value={formatPercent(kpis.modelConfidence)} />
        <KpiCard title="Last Update" value={format(new Date(kpis.lastStatementUpdate), 'dd MMM yyyy')} />
      </div>

      {/* Main Chart */}
      <div className="col-span-12 lg:col-span-8 row-span-2">
        <CashflowCommandChart data={cashflowForecast} />
      </div>
      
      {/* Side Panels */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <AlertsWatchlist alerts={alerts} />
        <ScenarioConsole />
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        <FundingDriversPanel drivers={drivers} />
      </div>
      
      {/* Bottom Row */}
      <div className="col-span-12 lg:col-span-5">
        <LiquidityRunwayChart data={liquidityForecast}/>
      </div>
      <div className="col-span-12 lg:col-span-4">
        <PortfolioComposition data={composition} />
      </div>
      <div className="col-span-12 lg:col-span-3">
        <DataHealthPanel data={dataHealth} />
      </div>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
      {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20" />)}
    </div>
    <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 "><Skeleton className="h-[500px]" /></div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
            <Skeleton className="h-[242px]" />
            <Skeleton className="h-[242px]" />
        </div>
    </div>
     <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-5"><Skeleton className="h-64" /></div>
        <div className="col-span-12 lg:col-span-4"><Skeleton className="h-64" /></div>
        <div className="col-span-12 lg:col-span-3"><Skeleton className="h-64" /></div>
    </div>
  </div>
);
