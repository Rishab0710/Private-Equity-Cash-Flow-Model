'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CashflowData } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type Props = {
  data: CashflowData[];
};

const chartConfig = {
  capitalCall: {
    label: 'Capital Calls',
    color: 'hsl(var(--chart-2))',
  },
  distribution: {
    label: 'Distributions',
    color: 'hsl(var(--chart-1))',
  },
};

export function NetCashflowForecast({ data }: Props) {
  const chartData = data.map(item => ({
    ...item,
    // Present capital calls as negative for visualization purposes
    capitalCall: -item.capitalCall,
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Cashflow Forecast</CardTitle>
        <CardDescription>
          Projected capital calls and distributions for the portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: -10,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8}
                tickFormatter={(value, index) => {
                  if (index % 4 === 0) {
                    return value;
                  }
                  return '';
                }}
              />
              <YAxis
                tickFormatter={(value) => `$${Math.abs(value) / 1000000}M`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const val = Math.abs(Number(value)) / 1000000;
                      return (
                        <div className="flex flex-col">
                           <span>{chartConfig[name as keyof typeof chartConfig].label}</span>
                           <span>{`$${val.toFixed(1)}M`}</span>
                        </div>
                      )
                    }}
                    indicator="dot"
                  />
                }
              />
              <Legend />
              <Bar dataKey="distribution" fill="var(--color-distribution)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capitalCall" fill="var(--color-capitalCall)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
