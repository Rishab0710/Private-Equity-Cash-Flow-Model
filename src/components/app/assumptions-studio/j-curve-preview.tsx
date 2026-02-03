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
                <CardHeader><CardTitle className="text-base font-semibold text-highlight">J-Curve Performance Profile</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-[386px] w-full" /></CardContent>
            </Card>
        )
    }
    return (
        <Card className="border-black/10">
            <CardHeader className="py-3">
                <CardTitle className="text-base font-semibold text-highlight">J-Curve Performance Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="performance-irr" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                        <TabsTrigger value="performance-irr" className="text-[11px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Performance (IRR)</TabsTrigger>
                        <TabsTrigger value="net-j-curve" className="text-[11px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Net J-Curve</TabsTrigger>
                        <TabsTrigger value="nav-ramp" className="text-[11px] data-[state=active]:bg-white data-[state=active]:shadow-sm">NAV Ramp</TabsTrigger>
                        <TabsTrigger value="distributions" className="text-[11px] data-[state=active]:bg-white data-[state=active]:shadow-sm">Distributions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance-irr" className="h-[300px] outline-none">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} tick={{fill: 'black'}} />
                                <YAxis tickFormatter={formatPercent} tickLine={false} axisLine={false} fontSize={10} domain={[-40, 30]} tick={{fill: 'black'}} />
                                <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => `${(value as number).toFixed(2)}%`} />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                <ReferenceLine y={0} stroke="black" strokeWidth={1} />
                                <Line 
                                    type="monotone" 
                                    dataKey="irr" 
                                    name="Private Equity Composite" 
                                    stroke="#144629" 
                                    strokeWidth={2.5} 
                                    dot={{ r: 4, fill: "#144629", strokeWidth: 1 }} 
                                    activeDot={{ r: 6 }}
                                />
                                <Line type="monotone" dataKey="irrBenchmark1" name="BlackRock Vesey Street III, LP" stroke="#e4b060" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="irrBenchmark2" name="BlackRock Vesey Street IV, LP" stroke="#6d69a8" strokeWidth={1.5} dot={false} />
                                <Line type="monotone" dataKey="irrBenchmark3" name="Columbia Partners" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </TabsContent>

                    <TabsContent value="net-j-curve" className="h-[300px] outline-none">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} tick={{fill: 'black'}} />
                                <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} fontSize={10} tick={{fill: 'black'}} />
                                <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => formatTooltipValue(value as number)} />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                <ReferenceLine y={0} stroke="black" strokeDasharray="3 3" />
                                <Area type="monotone" dataKey="net" fill="var(--color-net)" stroke="var(--color-net)" fillOpacity={0.4} />
                            </AreaChart>
                        </ChartContainer>
                    </TabsContent>

                    <TabsContent value="nav-ramp" className="h-[300px] outline-none">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} tick={{fill: 'black'}} />
                                <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} fontSize={10} tick={{fill: 'black'}} />
                                <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => formatTooltipValue(value as number)} />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                <Area type="monotone" dataKey="nav" fill="var(--color-nav)" stroke="var(--color-nav)" fillOpacity={0.4} />
                            </AreaChart>
                        </ChartContainer>
                    </TabsContent>

                    <TabsContent value="distributions" className="h-[300px] outline-none">
                        <ChartContainer config={chartConfig} className="w-full h-full">
                            <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} tick={{fill: 'black'}} />
                                <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} fontSize={10} tick={{fill: 'black'}} />
                                <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => formatTooltipValue(value as number)} />} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                <Bar dataKey="distributions" fill="var(--color-distributions)" radius={[2, 2, 0, 0]} />
                            </ComposedChart>
                        </ChartContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
