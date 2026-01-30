'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { ArrowUp, DollarSign, LineChart, TrendingDown, CalendarCheck2, AlertCircle } from 'lucide-react';

const iconMap = {
  DollarSign,
  LineChart,
  TrendingDown,
  CalendarCheck2,
  AlertCircle,
};

type StatCardProps = {
  title: string;
  value: string;
  change?: string;
  description?: string;
  icon: keyof typeof iconMap;
};

export function StatCard({ title, value, change, description, icon }: StatCardProps) {
  const Icon = iconMap[icon];
  return (
    <Card className="bg-secondary/50 border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center">
            <ArrowUp className="h-4 w-4 text-primary mr-1" />
            {change}
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
