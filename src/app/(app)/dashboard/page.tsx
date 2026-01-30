import { StatsCards } from '@/components/app/dashboard/stats-cards';
import { NavProjectionChart } from '@/components/app/dashboard/nav-projection-chart';
import { CashflowForecastChart } from '@/components/app/dashboard/cashflow-forecast-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FundList } from '@/components/app/funds/fund-list';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <StatsCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NavProjectionChart />
        <CashflowForecastChart />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <FundList showHeader={false} />
        </CardContent>
      </Card>
    </div>
  );
}
