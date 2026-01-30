'use client';

import { Pie, PieChart, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Composition } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Props = {
  data: Composition;
};

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
    return `$${(value / 1_000).toFixed(0)}K`;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-sm bg-background/80 border rounded-md">
          <p className="font-semibold">{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

const CompositionPieChart = ({ data }: { data: {name: string, value: number}[]}) => (
    <ChartContainer config={{}} className="h-full w-full">
        <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Legend wrapperStyle={{fontSize: "0.75rem"}}/>
        </PieChart>
    </ChartContainer>
);

export function PortfolioComposition({ data }: Props) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Portfolio Composition</CardTitle>
      </CardHeader>
      <CardContent>
         <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="strategy" className='text-xs h-6'>Strategy</TabsTrigger>
            <TabsTrigger value="vintage" className='text-xs h-6'>Vintage</TabsTrigger>
            <TabsTrigger value="region" className='text-xs h-6'>Region</TabsTrigger>
          </TabsList>
          <div className='h-[200px]'>
            <TabsContent value="strategy">
                <CompositionPieChart data={data.strategy} />
            </TabsContent>
            <TabsContent value="vintage">
                <CompositionPieChart data={data.vintage} />
            </TabsContent>
            <TabsContent value="region">
                <CompositionPieChart data={data.region} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
