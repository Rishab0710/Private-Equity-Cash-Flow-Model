
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Legend, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  irr: { label: "Private Equity Composite", color: "#144629" },
  irrBenchmark1: { label: "BlackRock Vesey Street III, LP", color: "#e4b060" },
  irrBenchmark2: { label: "BlackRock Vesey Street IV, LP", color: "#6d69a8" },
  irrBenchmark3: { label: "Columbia Partners", color: "#3b82f6" },
  net: { label: "Net Cash Flow", color: "hsl(var(--chart-1))" },
  nav: { label: "NAV Ramp", color: "hsl(var(--chart-2))" },
  distributions: { label: "Distributions", color: "hsl(var(--chart-3))" },
  calls: { label: "Calls", color: "hsl(var(--chart-5))" },
};

const formatCurrency = (value: number) => {
    if (value === 0) return '0';
    if (Math.abs(value) < 1) return `${(value * 100).toFixed(0)}K`
    return `${value.toFixed(0)}M`;
}
const formatTooltipValue = (value: number) => {
    if (value === 0) return '$0';
    if (Math.abs(value) < 1) return `$${(value * 1000).toFixed(0)}K`
    return `$${value.toFixed(1)}M`;
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export function JCurvePreview({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle className="text-base">J-Curve Preview</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-[386px] w-full" /></CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardHeader className="py-3">
                <CardTitle className="text-base font-semibold text-highlight">J-Curve Performance Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="performance-irr">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="performance-irr" className="text-[11px]">Performance (IRR)</TabsTrigger>
                        <TabsTrigger value="net-j-curve" className="text-[11px]">Net J-Curve</TabsTrigger>
                        <TabsTrigger value="nav-ramp" className="text-[11px]">NAV Ramp</TabsTrigger>
                        <TabsTrigger value="distributions" className="text-[11px]">Distributions</TabsTrigger>
                    </TabsList>
                    <div className="h-[300px] mt-4">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <TabsContent value="performance-irr" className="h-full">
                                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                                    <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                                    <YAxis tickFormatter={formatPercent} tickLine={false} axisLine={false} fontSize={10} domain={[-40, 30]} />
                                    <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => `${(value as number).toFixed(2)}%`} />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    <ReferenceLine y={0} stroke="#333" strokeWidth={1} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="irr" 
                                        name="Private Equity Composite" 
                                        stroke="#144629" 
                                        strokeWidth={2} 
                                        dot={{ r: 3, fill: "#144629", strokeWidth: 1 }} 
                                        activeDot={{ r: 5 }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="irrBenchmark1" 
                                        name="BlackRock Vesey Street III, LP" 
                                        stroke="#e4b060" 
                                        strokeWidth={1.5} 
                                        dot={false}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="irrBenchmark2" 
                                        name="BlackRock Vesey Street IV, LP" 
                                        stroke="#6d69a8" 
                                        strokeWidth={1.5} 
                                        dot={false}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="irrBenchmark3" 
                                        name="Columbia Partners" 
                                        stroke="#3b82f6" 
                                        strokeWidth={1.5} 
                                        dot={false}
                                    />
                                </LineChart>
                            </TabsContent>
                            <TabsContent value="net-j-curve" className="h-full">
                                <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => formatTooltipValue(value as number)} />} />
                                    <Legend />
                                    <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                                    <Area type="monotone" dataKey="net" fill="var(--color-net)" stroke="var(--color-net)" />
                                </AreaChart>
                            </TabsContent>
                             <TabsContent value="nav-ramp" className="h-full">
                                <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => formatTooltipValue(value as number)} />} />
                                    <Legend />
                                    <Area type="monotone" dataKey="nav" fill="var(--color-nav)" stroke="var(--color-nav)" />
                                </AreaChart>
                            </TabsContent>
                            <TabsContent value="distributions" className="h-full">
                                <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => formatTooltipValue(value as number)} />} />
                                    <Legend />
                                    <Bar dataKey="distributions" fill="var(--color-distributions)" />
                                </ComposedChart>
                            </TabsContent>
                        </ChartContainer>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
