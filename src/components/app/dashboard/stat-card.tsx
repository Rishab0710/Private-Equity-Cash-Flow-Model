'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type KpiCardProps = {
  title: string;
  value: string;
  description?: string;
};

export function KpiCard({ title, value, description }: KpiCardProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <div className="text-lg font-semibold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
