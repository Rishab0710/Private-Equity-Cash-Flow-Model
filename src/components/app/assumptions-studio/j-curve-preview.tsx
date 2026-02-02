'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

const chartConfig = {
  net: { label: "Net J-Curve", color: "hsl(var(--chart-1))" },
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

export function JCurvePreview({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <Card><CardHeader><CardTitle className="text-base">J-Curve Preview</CardTitle></CardHeader><CardContent><div className="h-[342px] flex items-center justify-center text-muted-foreground">Generating data...</div></CardContent></Card>
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">J-Curve Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="net-j-curve">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="net-j-curve">Net J-Curve</TabsTrigger>
                        <TabsTrigger value="nav-ramp">NAV Ramp</TabsTrigger>
                        <TabsTrigger value="distributions">Distributions</TabsTrigger>
                        <TabsTrigger value="calls-dists">Calls vs Dists</TabsTrigger>
                    </TabsList>
                    <div className="h-[300px] mt-4">
                        <ChartContainer config={chartConfig} className="w-full h-full">
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
                            <TabsContent value="calls-dists" className="h-full">
                                <ComposedChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickFormatter={(v) => formatCurrency(v)} tickLine={false} axisLine={false} />
                                    <Tooltip content={<ChartTooltipContent indicator="dot" formatter={(value) => formatTooltipValue(Math.abs(value as number))} />} />
                                    <Legend />
                                    <Bar dataKey="calls" name="Calls" fill="var(--color-calls)" barSize={20} />
                                    <Line type="monotone" dataKey="distributions" name="Distributions" stroke="var(--color-distributions)" />
                                </ComposedChart>
                            </TabsContent>
                        </ChartContainer>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
