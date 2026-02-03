'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const baseChartConfig = {
  irr: { label: "Performance Profile", color: "#144629" },
  irrBenchmark1: { label: "BlackRock Vesey Street III, LP", color: "#e4b060" },
  irrBenchmark2: { label: "BlackRock Vesey Street IV, LP", color: "#6d69a8" },
  irrBenchmark3: { label: "Columbia Partners", color: "#3b82f6" },
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export function JCurvePreview({ data, fundName, className }: { data: any[], fundName: string, className?: string }) {
    if (!data || data.length === 0) {
        return (
            <Card className={cn("border-black/10", className)}>
                <CardHeader className="py-3">
                    <CardTitle className="text-base font-semibold text-highlight">J-Curve Performance Profile</CardTitle>
                </CardHeader>
                <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
            </Card>
        )
    }

    const chartConfig = {
        ...baseChartConfig,
        irr: { ...baseChartConfig.irr, label: fundName || "Fund Performance" }
    };

    return (
        <Card className={cn("border-black/10 h-full flex flex-col", className)}>
            <CardHeader className="py-3 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-base font-semibold text-highlight">J-Curve Performance Profile (IRR)</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <div className="h-full w-full">
                    <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                tickFormatter={formatPercent} 
                                tickLine={false} 
                                axisLine={false} 
                                fontSize={10} 
                                domain={[-40, 30]} 
                                tick={{fill: 'black'}} 
                            />
                            <Tooltip 
                                content={<ChartTooltipContent 
                                    indicator="dot" 
                                    labelFormatter={(label) => `Projection: ${label}`}
                                    formatter={(value, name) => {
                                        const config = chartConfig[name as keyof typeof chartConfig];
                                        return (
                                            <div className="flex w-full items-center justify-between gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: config?.color }} />
                                                    <span className="text-[10px] text-black font-semibold">{config?.label || name}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-black">{(value as number).toFixed(2)}%</span>
                                            </div>
                                        )
                                    }} 
                                />} 
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle" 
                                wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                                formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value}
                            />
                            <ReferenceLine y={0} stroke="black" strokeWidth={1} />
                            <Line 
                                type="monotone" 
                                dataKey="irr" 
                                name="irr" 
                                stroke="#144629" 
                                strokeWidth={2.5} 
                                dot={{ r: 4, fill: "#144629", strokeWidth: 1 }} 
                                activeDot={{ r: 6 }}
                            />
                            <Line type="monotone" dataKey="irrBenchmark1" name="irrBenchmark1" stroke="#e4b060" strokeWidth={1.5} dot={false} />
                            <Line type="monotone" dataKey="irrBenchmark2" name="irrBenchmark2" stroke="#6d69a8" strokeWidth={1.5} dot={false} />
                            <Line type="monotone" dataKey="irrBenchmark3" name="irrBenchmark3" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}
