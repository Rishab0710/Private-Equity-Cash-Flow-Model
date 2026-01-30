'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CashflowData } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { DrillDownDialog } from './drill-down-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function NetCashflowForecast({ data }: Props) {
  const chartData = data.map(item => ({
    ...item,
    // Present capital calls as negative for visualization purposes
    capitalCall: -item.capitalCall,
  }));

  const trigger = (
    <Card className="cursor-pointer hover:border-primary">
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
              stackOffset="sign"
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
                      return (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: chartConfig[name as keyof typeof chartConfig].color}}/>
                          <span>{chartConfig[name as keyof typeof chartConfig].label}: </span>
                          <span className="font-semibold">{formatCurrency(Math.abs(Number(value)))}</span>
                        </div>
                      )
                    }}
                    indicator="dot"
                  />
                }
              />
              <Legend />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
              <Bar dataKey="distribution" fill="var(--color-distribution)" radius={[4, 4, 0, 0]} stackId="stack" />
              <Bar dataKey="capitalCall" fill="var(--color-capitalCall)" radius={[4, 4, 0, 0]} stackId="stack" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DrillDownDialog trigger={trigger} title="Net Cashflow Forecast Data">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Capital Calls</TableHead>
                    <TableHead className="text-right">Distributions</TableHead>
                    <TableHead className="text-right">Net Cashflow</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map(item => (
                    <TableRow key={item.date}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="text-right text-red-400">{formatCurrency(item.capitalCall)}</TableCell>
                        <TableCell className="text-right text-green-400">{formatCurrency(item.distribution)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.netCashflow)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </DrillDownDialog>
  );
}
