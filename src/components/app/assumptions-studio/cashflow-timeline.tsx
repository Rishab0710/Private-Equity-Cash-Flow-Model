
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, ComposedChart, CartesianGrid, Legend, ReferenceLine, Tooltip, XAxis, YAxis, Line, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const timelineConfig = {
  calls: { label: "Capital Calls", color: "hsl(var(--chart-5))" },
  distributions: { label: "Distributions", color: "hsl(var(--chart-3))" },
  nav: { label: "NAV Evolution", color: "hsl(var(--chart-4))" },
  cumulativeNet: { label: "Cumulative Net Cash Flow", color: "hsl(var(--primary))" },
};

export function CashflowTimeline({ data, className }: { data: any[], className?: string }) {
    if (!data || data.length === 0) {
        return (
            <Card className={cn("border-black/10 h-full", className)}>
                <CardHeader className="py-3">
                    <CardTitle className="text-base font-semibold text-highlight">Projected Cash Flow & NAV Dynamics</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[320px] w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("border-black/10 h-full flex flex-col", className)}>
            <CardHeader className="py-3 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-base font-semibold text-highlight">Projected Cash Flow & NAV Dynamics</CardTitle>
                <div className="text-[10px] text-black font-medium uppercase tracking-wider">
                    Annual Projections ($ in Millions)
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ChartContainer config={timelineConfig} className="aspect-auto h-full w-full">
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
                            content={<ChartTooltipContent 
                                indicator="dot" 
                                labelFormatter={(label) => `Timeline: ${label}`}
                                formatter={(value, name) => {
                                    const val = typeof value === 'number' ? value : 0;
                                    const config = timelineConfig[name as keyof typeof timelineConfig];
                                    return (
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config?.color }} />
                                                <span className="text-[10px] text-black font-semibold">{config?.label || name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-black">${Math.abs(val).toFixed(1)}M</span>
                                        </div>
                                    );
                                }} 
                            />} 
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle" 
                            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                            formatter={(value) => timelineConfig[value as keyof typeof timelineConfig]?.label || value}
                        />
                        <ReferenceLine y={0} stroke="black" strokeWidth={1} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="cumulativeNet" 
                            fill="url(#colorNet)" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="cumulativeNet"
                        />
                        
                        <Bar 
                            dataKey="distributions" 
                            fill="var(--color-distributions)" 
                            name="distributions"
                            stackId="a" 
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar 
                            dataKey="calls" 
                            fill="var(--color-calls)" 
                            name="calls"
                            stackId="a" 
                        />

                        <Line 
                            type="monotone" 
                            dataKey="nav" 
                            stroke="var(--color-nav)" 
                            strokeWidth={3} 
                            dot={false}
                            name="nav"
                        />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
