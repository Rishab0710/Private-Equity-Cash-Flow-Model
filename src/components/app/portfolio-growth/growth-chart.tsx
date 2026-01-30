'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type Props = {
  data: any[];
};

const chartConfig = {
  conservative: { label: 'Conservative', color: 'hsl(var(--chart-3))' },
  moderate: { label: 'Moderate', color: 'hsl(var(--chart-1))' },
  aggressive: { label: 'Aggressive', color: 'hsl(var(--chart-2))' },
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  const likelihoods = {
      Aggressive: '33% Likelihood',
      Moderate: '50% Likelihood',
      Conservative: '80% Likelihood'
  }
  // Re-order to match expected order if needed
  const orderedPayload = ['Conservative', 'Moderate', 'Aggressive'].map(name => payload.find((p: any) => p.value === name)).filter(Boolean);

  return (
    <div className="flex flex-row justify-center items-center gap-8 mt-6">
      {orderedPayload.map((entry: any) => {
        const label = entry.value as keyof typeof likelihoods;
        return (
          <div key={entry.value} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{likelihoods[label]}</p>
            </div>
          </div>
        )
      })}
    </div>
  );
};


export function GrowthChart({ data }: Props) {
  return (
      <div className="h-[450px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
                data={data}
                margin={{
                top: 20,
                right: 30,
                left: 30,
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
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value * 1000)}
                    label={{ value: 'Potential Wealth Estimates ($ in Thousands)', angle: -90, position: 'insideLeft', offset: -20, style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }}
                    tickMargin={10}
                    domain={['dataMin', 'dataMax']}
                />
                <Tooltip
                    content={
                    <ChartTooltipContent
                        formatter={(value, name) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value) * 1000), name]}
                        indicator="dot"
                    />
                    }
                />
                <Legend content={<CustomLegend />} verticalAlign="bottom" height={80} />
                <Line type="monotone" dataKey="conservative" name="Conservative" stroke="var(--color-conservative)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="moderate" name="Moderate" stroke="var(--color-moderate)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="aggressive" name="Aggressive" stroke="var(--color-aggressive)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
      </div>
  );
}
