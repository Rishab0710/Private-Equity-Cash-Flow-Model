'use client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ReferenceLine } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import { cashflowForecastData } from '@/lib/data';

const chartConfig = {
  capitalCall: {
    label: 'Capital Calls',
    color: 'hsl(var(--chart-2))',
  },
  distribution: {
    label: 'Distributions',
    color: 'hsl(var(--chart-1))',
  },
  netCashflow: {
    label: 'Net Cashflow',
    color: 'hsl(var(--foreground))',
  },
} satisfies ChartConfig;

const transformedData = cashflowForecastData.map((item) => ({
  ...item,
  capitalCall: -item.capitalCall,
}));

export function CashflowForecastChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Cashflow Forecast</CardTitle>
        <CardDescription>
          Projected capital calls, distributions, and net cashflow for the portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            data={transformedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value, index) => index % 4 === 0 ? value : ''}
            />
            <YAxis
              tickFormatter={(value) => `$${value}M`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <ReferenceLine y={0} stroke="#ccc" />
            <Bar dataKey="capitalCall" fill="var(--color-capitalCall)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="distribution" fill="var(--color-distribution)" radius={[4, 4, 0, 0]} />
            <Line
                dataKey="netCashflow"
                type="monotone"
                stroke="var(--color-netCashflow)"
                strokeWidth={2}
                dot={false}
                name="Net Cashflow"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
