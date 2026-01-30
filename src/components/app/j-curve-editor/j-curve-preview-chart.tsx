'use client';

import { Line, Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, ReferenceLine } from 'recharts';
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
  irr: { label: 'IRR', color: 'hsl(var(--chart-3))' },
};

const formatValue = (value: number) => {
    return `${value.toFixed(0)}`;
};
const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

export function JCurvePreviewChart({ title, data, type }: Props) {
    const renderChart = () => {
        if (type === 'composed') {
            return (
                <ComposedChart data={data}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `Yr ${v}`}/>
                    <YAxis tickFormatter={formatValue} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => formatValue(Math.abs(value as number))} />} />
                    <Legend />
                    <Bar dataKey="distribution" fill="var(--color-distribution)" stackId="a" />
                    <Bar dataKey="deployment" fill="var(--color-deployment)" stackId="a" />
                </ComposedChart>
            )
        }
        
        let lineKey: 'nav' | 'net' | 'irr' = 'net';
        if (title.includes('NAV')) {
            lineKey = 'nav';
        } else if (title.includes('IRR')) {
            lineKey = 'irr';
        }

        const yAxisFormatter = lineKey === 'irr' ? formatPercent : formatValue;
        
        let lineName = 'Net Cashflow';
        if (lineKey === 'nav') lineName = 'NAV';
        if (lineKey === 'irr') lineName = 'IRR';

        return (
            <LineChart data={data}>
                 <CartesianGrid vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `Yr ${v}`}/>
                <YAxis 
                    tickFormatter={yAxisFormatter} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={lineKey === 'irr' ? [-0.4, 0.4] : ['auto', 'auto']}
                />
                <Tooltip 
                    formatter={(value: number) => yAxisFormatter(value)}
                    content={<ChartTooltipContent indicator="dot" />} 
                />
                <Legend />
                <Line type="monotone" dataKey={lineKey} name={lineName} stroke={`var(--color-${lineKey})`} strokeWidth={2} dot={false} />
                {lineKey === 'irr' && <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="2 4" />}
            </LineChart>
        )
    }


  return (
    <Card>
      <CardHeader className="p-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] p-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
            {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
