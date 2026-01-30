'use client';

import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { CashflowCommandChart } from '@/components/app/dashboard/cashflow-chart';
import { NavEvolutionChart } from '@/components/app/cashflow-engine/nav-evolution-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CashflowEnginePage() {
  const { portfolioData } = usePortfolioContext();

  if (!portfolioData) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Cashflow Forecast Engine</h1>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Skeleton className="h-[430px]" />
                <Skeleton className="h-[430px]" />
            </div>
        </div>
    );
  }

  const { cashflowForecast, navProjection } = portfolioData;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cashflow Forecast Engine</h1>
        {/* Controls can go here */}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CashflowCommandChart data={cashflowForecast} />
        <NavEvolutionChart data={navProjection} />
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Forecast Drivers</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">Forecast driver decomposition coming soon...</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
