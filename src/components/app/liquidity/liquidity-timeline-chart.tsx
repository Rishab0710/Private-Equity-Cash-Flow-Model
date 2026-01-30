'use client';

import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, ReferenceLine, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CashflowData, LiquidityData } from '@/lib/types';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

type Props = {
  liquidityData: LiquidityData[];
  cashflowData: CashflowData[];
};

const chartConfig = {
  capitalCall: { label: 'Capital Calls', color: 'hsl(var(--chart-2))' },
  distribution: { label: 'Distributions', color: 'hsl(var(--chart-1))' },
  availableLiquidity: { label: 'Liquidity Buffer', color: 'hsl(var(--chart-4))' },
  fundingGap: { label: 'Funding Gap', color: 'hsl(var(--chart-5))' },
};

const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

export function LiquidityTimelineChart({ liquidityData, cashflowData }: Props) {
  const combinedData = cashflowData.map(cf => {
    const liqDataPoint = liquidityData.find(ld => ld.date === cf.date);
    return {
        ...cf,
        capitalCall: -cf.capitalCall,
        availableLiquidity: liqDataPoint?.availableLiquidity,
        fundingGap: liqDataPoint?.fundingGap,
    };
  });

  const forecastStartDate = cashflowData.find(d => !d.isActual)?.date;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidity Timeline Overview</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] -ml-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ComposedChart
            data={combinedData}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => format(new Date(value), 'MMM yy')}
              interval={3}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
              label={{ value: "Net Cashflow", angle: -90, position: 'insideLeft', offset: 10, style: {textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))'} }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
               label={{ value: "Liquidity Balance", angle: 90, position: 'insideRight', offset: -10, style: {textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))'} }}
            />
            <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                       const config = chartConfig[name as keyof typeof chartConfig];
                       if (!config) return null;
                       return (
                          <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{backgroundColor: config.color}}/>
                              <span>{config.label}: </span>
                              <span className="font-semibold">{formatCurrency(Math.abs(Number(value)))}</span>
                          </div>
                       )
                    }}
                    labelFormatter={(label) => format(new Date(label), 'MMM yyyy')}
                    indicator="dot"
                  />
                }
              />
            <Legend />
            {forecastStartDate && (
                <ReferenceLine x={forecastStartDate} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            )}
             <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" />
            <Bar yAxisId="left" dataKey="distribution" fill="var(--color-distribution)" stackId="stack" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="capitalCall" fill="var(--color-capitalCall)" stackId="stack" />
            <Area yAxisId="right" type="monotone" dataKey="availableLiquidity" fill="var(--color-availableLiquidity)" stroke="var(--color-availableLiquidity)" strokeWidth={2} fillOpacity={0.2} dot={false} connectNulls={false} />
            <Area yAxisId="right" type="monotone" dataKey="fundingGap" fill="var(--color-fundingGap)" stroke="var(--color-fundingGap)" strokeWidth={2} fillOpacity={0.3} dot={false} connectNulls={false} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
