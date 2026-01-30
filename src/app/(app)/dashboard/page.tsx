import { FundList } from '@/components/app/funds/fund-list';
import { StatCard } from '@/components/app/dashboard/stat-card';
import { PortfolioJCurve } from '@/components/app/dashboard/j-curve-chart';
import { NetCashflowForecast } from '@/components/app/dashboard/cashflow-chart';
import { cashflowForecastData, navProjectionData } from '@/lib/data';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Commitment"
          value="$425M"
          change="+2.5% from last month"
          icon="DollarSign"
        />
        <StatCard
          title="Projected NAV"
          value="$255M"
          change="+1.8% from last month"
          icon="LineChart"
        />
        <StatCard
          title="Peak Capital Outflow"
          value="-$12.5M"
          description="in Q3 2025"
          icon="TrendingDown"
        />
        <StatCard
          title="Breakeven"
          value="Q2 2026"
          description="When distributions exceed contributions"
          icon="CalendarCheck2"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PortfolioJCurve data={navProjectionData} />
        <NetCashflowForecast data={cashflowForecastData} />
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">My Funds</h2>
        <FundList showHeader={false} />
      </div>
    </div>
  );
}
