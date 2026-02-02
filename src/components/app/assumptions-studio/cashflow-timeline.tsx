'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const timelineConfig = {
  calls: { label: "Calls/Contributions", color: "hsl(var(--chart-5))" },
  distributions: { label: "Distributions", color: "hsl(var(--chart-3))" },
};

export function CashflowTimeline({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                        <span>Cash Flow Timeline</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[150px] w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                    <span>Cash Flow Timeline</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[150px]">
                <ChartContainer config={timelineConfig} className="w-full h-full">
                    <BarChart data={data} barCategoryGap="5%" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} width={0} />
                        <Tooltip 
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" formatter={(value, name) => `$${Math.abs(value as number).toFixed(1)}M`} />} 
                        />
                        <Legend />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Bar dataKey="distributions" fill="var(--color-distributions)" stackId="a" />
                        <Bar dataKey="calls" fill="var(--color-calls)" stackId="a" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
