
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, ComposedChart, CartesianGrid, Legend, ReferenceLine, Tooltip, XAxis, YAxis, Line, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const timelineConfig = {
  calls: { label: "Capital Calls", color: "hsl(var(--chart-5))" },
  distributions: { label: "Distributions", color: "hsl(var(--chart-3))" },
  cumulativeNet: { label: "Cumulative Net Cash Flow", color: "hsl(var(--primary))" },
};

export function CashflowTimeline({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <Card className="border-black/10">
                <CardHeader className="py-3">
                    <CardTitle className="text-base font-semibold text-highlight">Projected Cash Flow Dynamics</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-black/10">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-highlight">Projected Cash Flow Dynamics</CardTitle>
                <div className="text-[10px] text-black font-medium uppercase tracking-wider">
                    Annual Projections ($ in Millions)
                </div>
            </CardHeader>
            <CardContent className="h-[250px]">
                <ChartContainer config={timelineConfig} className="w-full h-full">
                    <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                            dataKey="year" 
                            tickLine={false} 
                            axisLine={false} 
                            tickMargin={8} 
                            fontSize={10}
                            tick={{fill: 'black'}}
                        />
                        <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            fontSize={10}
                            tickFormatter={(v) => `$${Math.abs(v)}M`}
                            tick={{fill: 'black'}}
                        />
                        <Tooltip 
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                            content={<ChartTooltipContent indicator="dot" formatter={(value) => {
                                const val = typeof value === 'number' ? value : 0;
                                return `$${val.toFixed(1)}M`;
                            }} />} 
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        <ReferenceLine y={0} stroke="black" strokeWidth={1} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="cumulativeNet" 
                            fill="url(#colorNet)" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="Cumulative Net Cash Flow"
                        />
                        
                        <Bar 
                            dataKey="distributions" 
                            fill="var(--color-distributions)" 
                            name="Distributions"
                            stackId="a" 
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar 
                            dataKey="calls" 
                            fill="var(--color-calls)" 
                            name="Capital Calls"
                            stackId="a" 
                        />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
