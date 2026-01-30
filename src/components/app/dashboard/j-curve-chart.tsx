'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ReferenceLine, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { LiquidityData } from '@/lib/types';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

type Props = {
  data: LiquidityData[];
};

const chartConfig = {
  fundingGap: { label: 'Funding Gap', color: 'hsl(var(--chart-2))' },
  availableLiquidity: { label: 'Available Liquidity', color: 'hsl(var(--chart-1))' },
};

const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
    if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};


export function LiquidityRunwayChart({ data }: Props) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Liquidity Runway & Funding Gap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={4}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" formatter={(value) => formatCurrency(value as number)}/>}
              />
              <Bar dataKey="availableLiquidity" fill="var(--color-availableLiquidity)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fundingGap" fill="var(--color-fundingGap)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
