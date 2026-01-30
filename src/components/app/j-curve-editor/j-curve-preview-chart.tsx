'use client';

import { Line, Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, AreaChart, LineChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type Props = {
  title: string;
  data: any[];
  type: 'line' | 'composed'
};

const chartConfig = {
  deployment: { label: 'Deployment', color: 'hsl(var(--chart-2))' },
  distribution: { label: 'Distribution', color: 'hsl(var(--chart-1))' },
  net: { label: 'Net Cashflow', color: 'hsl(var(--foreground))' },
  nav: { label: 'NAV', color: 'hsl(var(--chart-4))' },
};

const formatValue = (value: number) => {
    return `${value.toFixed(0)}`;
};

export function JCurvePreviewChart({ title, data, type }: Props) {
    const renderChart = () => {
        if (type === 'composed') {
            const composedData = data.map(d => ({
                ...d,
                deployment: d.value < 0 ? d.value : 0,
                distribution: d.value > 0 ? d.value : 0,
            }))
            return (
                <ComposedChart data={composedData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `Yr ${v}`}/>
                    <YAxis tickFormatter={formatValue} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Legend />
                    <Bar dataKey="distribution" fill="var(--color-distribution)" stackId="a" />
                    <Bar dataKey="deployment" fill="var(--color-deployment)" stackId="a" />
                </ComposedChart>
            )
        }
        
        const lineKey = title.includes('NAV') ? 'nav' : 'net';
        const lineData = title.includes('NAV') ? data.map(d => ({ year: d.year, nav: d.value })) : data.map(d => ({ year: d.year, net: d.value }));


        return (
            <LineChart data={lineData}>
                 <CartesianGrid vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `Yr ${v}`}/>
                <YAxis tickFormatter={formatValue} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                <Legend />
                <Line type="monotone" dataKey={lineKey} stroke={`var(--color-${lineKey})`} strokeWidth={2} dot={false} />
            </LineChart>
        )
    }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] -ml-2">
        <ChartContainer config={chartConfig} className="h-full w-full">
            {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
