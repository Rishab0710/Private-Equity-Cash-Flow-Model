'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { NavData } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format } from 'date-fns';

type Props = {
  data: NavData[];
};

const chartConfig = {
  nav: { label: 'NAV', color: 'hsl(var(--chart-1))' },
};

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

export function NavEvolutionChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NAV Evolution Path</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] -ml-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(new Date(value), 'MMM yy')}
              interval={8} // Show fewer ticks
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) => format(new Date(label), 'MMM yyyy')}
                    indicator="dot"
                  />
                }
              />
            <Legend />
            <Line type="monotone" dataKey="nav" name="NAV" strokeWidth={2} stroke="var(--color-nav)" dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
