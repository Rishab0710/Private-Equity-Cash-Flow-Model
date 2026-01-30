'use client';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
  ChartConfig,
} from '@/components/ui/chart';
import { navProjectionData } from '@/lib/data';

const chartConfig = {
  nav: {
    label: 'NAV ($M)',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function NavProjectionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consolidated NAV Projection</CardTitle>
        <CardDescription>
          Shows the projected Net Asset Value of the entire portfolio over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart
            data={navProjectionData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-nav)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-nav)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
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
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="nav"
              type="monotone"
              stroke="var(--color-nav)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNav)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
