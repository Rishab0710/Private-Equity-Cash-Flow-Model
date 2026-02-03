'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
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
};

const CustomLegend = (props: any) => {
  const { payload, likelihoods } = props;
  const orderedPayloadNames = ['Conservative', 'Moderate', 'Aggressive'];
  const orderedPayload = orderedPayloadNames
    .map(name => payload.find((p: any) => p.value === name))
    .filter(Boolean);

  return (
    <div className="flex flex-row justify-center items-center gap-8 mt-2">
      {orderedPayload.map((entry: any) => {
        const label = entry.value as string;
        const likelihoodText = likelihoods ? likelihoods[label.toLowerCase() as keyof typeof likelihoods] : '';
        return (
          <div key={entry.value} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <div>
              <p className="text-xs font-medium">{label}</p>
              {likelihoodText && <p className="text-xs text-black">{likelihoodText}</p>}
            </div>
          </div>
        )
      })}
    </div>
  );
};


export function GrowthChart({ data, likelihoods }: Props) {
  return (
      <div className="h-[350px] w-full rounded-lg border p-1">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
                data={data}
                margin={{
                top: 20,
                right: 30,
                left: 50,
                bottom: 5,
                }}
            >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                    dataKey="year" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10} 
                    interval={5}
                    tick={{ fill: 'black' }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}M`}
                    label={{ value: 'Potential Wealth Estimates ($ in Millions)', angle: -90, position: 'insideLeft', offset: -40, style: { textAnchor: 'middle', fill: 'black' } }}
                    tickMargin={5}
                    domain={['dataMin', 'dataMax']}
                    tick={{ fill: 'black' }}
                />
                <Tooltip
                    content={
                        <ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => {
                                const config = chartConfig[name as keyof typeof chartConfig];
                                if (!config) return null;
                                return (
                                    <div className="flex w-full items-center justify-between gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }} />
                                            <span className="text-[10px] text-black font-semibold">{config.label}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-black">${Number(value).toFixed(1)}M</span>
                                    </div>
                                );
                            }}
                        />
                    }
                />
                <Legend content={<CustomLegend likelihoods={likelihoods} />} verticalAlign="bottom" height={60} />
                <Line type="monotone" dataKey="conservative" name="Conservative" stroke="var(--color-conservative)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="moderate" name="Moderate" stroke="var(--color-moderate)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="aggressive" name="Aggressive" stroke="var(--color-aggressive)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
      </div>
  );
}
