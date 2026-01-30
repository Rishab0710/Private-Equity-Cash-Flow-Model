'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { UnfundedCommitmentData } from '@/lib/types';
import { DrillDownDialog } from './drill-down-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

type Props = {
  data: UnfundedCommitmentData[];
};

const chartConfig = {
  unfunded: {
    label: 'Unfunded',
    color: 'hsl(var(--chart-3))',
  },
};

export function UnfundedCommitmentChart({ data }: Props) {
  const trigger = (
    <Card className="cursor-pointer hover:border-primary">
      <CardHeader>
        <CardTitle>Unfunded Commitment Evolution</CardTitle>
        <CardDescription>
          Projected unfunded commitment over the portfolio's life.
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
                content={<ChartTooltipContent indicator="dot" formatter={(value) => formatCurrency(value as number)} />}
              />
              <Area
                dataKey="unfunded"
                type="natural"
                fill="var(--color-unfunded)"
                fillOpacity={0.4}
                stroke="var(--color-unfunded)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DrillDownDialog trigger={trigger} title="Unfunded Commitment Data">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Unfunded Commitment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.date}>
              <TableCell>{item.date}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.unfunded)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DrillDownDialog>
  );
}
