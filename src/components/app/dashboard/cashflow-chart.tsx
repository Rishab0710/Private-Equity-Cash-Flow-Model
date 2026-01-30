'use client';

import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Legend, Line, Tooltip, ReferenceLine, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CashflowData } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { format } from 'date-fns';

type Props = {
  data: CashflowData[];
};

const chartConfig = {
  capitalCall: { label: 'Capital Calls', color: 'hsl(var(--chart-2))' },
  distribution: { label: 'Distributions', color: 'hsl(var(--chart-1))' },
  netCashflow: { label: 'Net Cashflow', color: 'hsl(var(--foreground))' },
};

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

export function CashflowCommandChart({ data }: Props) {
  const [aggregation, setAggregation] = useState<'monthly' | 'quarterly'>('quarterly');

  const chartData = data.map(item => ({
    ...item,
    capitalCall: -item.capitalCall, // Negative for charting
  }));

  const forecastStartDate = data.find(d => !d.isActual)?.date;

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className="flex items-center justify-between">
          <CardTitle>Cashflow Command Chart</CardTitle>
          <Tabs defaultValue="quarterly" className="w-[200px]" onValueChange={(v) => setAggregation(v as any)}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="quarterly" className='h-6 text-xs'>Quarterly</TabsTrigger>
              <TabsTrigger value="monthly" className='h-6 text-xs'>Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="h-[350px] -ml-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(new Date(value), 'MMM yy')}
              // Show fewer ticks for readability
              interval={aggregation === 'quarterly' ? 2 : 6}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: chartConfig[name as keyof typeof chartConfig].color}}/>
                          <span>{chartConfig[name as keyof typeof chartConfig].label}: </span>
                          <span className="font-semibold">{formatCurrency(Math.abs(Number(value)))}</span>
                        </div>
                    )}
                    labelFormatter={(label, payload) => {
                        const point = payload?.[0]?.payload;
                        const dateLabel = format(new Date(label), 'MMM yyyy');
                        if (point) {
                            return `${dateLabel} (${point.isActual ? 'Actual' : 'Forecast'})`;
                        }
                        return dateLabel;
                    }}
                    indicator="dot"
                  />
                }
              />
            <Legend />
            {forecastStartDate && (
                <ReferenceLine x={forecastStartDate} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3">
                    <Label value="Forecast" position="insideTopLeft" fill="hsl(var(--muted-foreground))" fontSize={12} offset={10} />
                </ReferenceLine>
            )}
            <Bar dataKey="distribution" fill="var(--color-distribution)" stackId="stack" radius={[4, 4, 0, 0]} />
            <Bar dataKey="capitalCall" fill="var(--color-capitalCall)" stackId="stack" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="netCashflow" strokeWidth={2} stroke="var(--color-netCashflow)" dot={false} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
