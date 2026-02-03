'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

type Props = {
  data: any[];
  likelihoods: {
    conservative: string;
    moderate: string;
    aggressive: string;
  };
};

const chartConfig = {
  conservative: { label: 'Conservative', color: 'hsl(var(--chart-3))' },
  moderate: { label: 'Moderate', color: 'hsl(var(--chart-1))' },
  aggressive: { label: 'Aggressive', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const CustomLegend = (props: any) => {
  const { payload, likelihoods } = props;
  if (!payload) return null;

  return (
    <div className="flex flex-row flex-wrap justify-center items-center gap-x-8 gap-y-2 mt-6">
      {payload.map((entry: any) => {
        const key = String(entry.dataKey || entry.value).toLowerCase();
        const config = chartConfig[key as keyof typeof chartConfig];
        const likelihoodText = likelihoods ? likelihoods[key as keyof typeof likelihoods] : '';
        
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-black uppercase tracking-tight">{config?.label || entry.value}</span>
              {likelihoodText && <span className="text-[10px] text-black font-medium opacity-60 italic">{likelihoodText}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function GrowthChart({ data, likelihoods }: Props) {
  return (
      <div className="h-[400px] w-full pt-4">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
                data={data}
                margin={{
                top: 20,
                right: 30,
                left: 10,
                bottom: 20,
                }}
            >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                    dataKey="year" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10} 
                    fontSize={11}
                    tick={{ fill: 'black' }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    tickFormatter={(value) => `$${value}M`}
                    tickMargin={10}
                    tick={{ fill: 'black' }}
                />
                <Tooltip
                    content={
                        <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => {
                                const key = String(name).toLowerCase() as keyof typeof chartConfig;
                                const config = chartConfig[key];
                                if (!config) return null;
                                return (
                                    <div className="flex w-full items-center justify-between gap-6 min-w-[160px]">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                                            <span className="font-semibold text-black">{config.label}</span>
                                        </div>
                                        <span className="font-bold text-black ml-auto">${Number(value).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M</span>
                                    </div>
                                );
                            }}
                        />
                    }
                />
                <Legend content={<CustomLegend likelihoods={likelihoods} />} />
                <Line 
                    type="monotone" 
                    dataKey="conservative" 
                    name="conservative" 
                    stroke="var(--color-conservative)" 
                    strokeWidth={2.5} 
                    dot={false} 
                    activeDot={{ r: 4 }}
                />
                <Line 
                    type="monotone" 
                    dataKey="moderate" 
                    name="moderate" 
                    stroke="var(--color-moderate)" 
                    strokeWidth={2.5} 
                    dot={false} 
                    activeDot={{ r: 4 }}
                />
                <Line 
                    type="monotone" 
                    dataKey="aggressive" 
                    name="aggressive" 
                    stroke="var(--color-aggressive)" 
                    strokeWidth={2.5} 
                    dot={false} 
                    activeDot={{ r: 4 }}
                />
            </LineChart>
          </ChartContainer>
      </div>
  );
}
