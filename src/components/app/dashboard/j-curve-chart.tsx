'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { NavData } from '@/lib/types';

type Props = {
  data: NavData[];
};

const chartConfig = {
  nav: {
    label: 'NAV',
    color: 'hsl(var(--chart-1))',
  },
};

export function PortfolioJCurve({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio J-Curve</CardTitle>
        <CardDescription>
          Consolidated NAV Projection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value, index) => {
                  if (index % 4 === 0) {
                    return value;
                  }
                  return '';
                }}
              />
              <YAxis
                tickFormatter={(value) => `$${value / 1000000}M`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Area
                dataKey="nav"
                type="natural"
                fill="var(--color-nav)"
                fillOpacity={0.4}
                stroke="var(--color-nav)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
