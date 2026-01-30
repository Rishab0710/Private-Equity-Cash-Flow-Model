import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const kpiData = [
  {
    title: 'Total Commitment',
    value: '$425M',
    icon: DollarSign,
    change: '+2.5% from last month',
  },
  {
    title: 'Projected NAV',
    value: '$255M',
    icon: TrendingUp,
    change: '+1.8% from last month',
  },
  {
    title: 'Peak Capital Outflow',
    value: '-$12.5M',
    icon: TrendingDown,
    change: 'in Q3 2025',
    changeType: 'warning',
  },
  {
    title: 'Breakeven',
    value: 'Q2 2026',
    icon: Calendar,
    change: 'Portfolio J-Curve',
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
