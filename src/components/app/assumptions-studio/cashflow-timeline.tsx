'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";

const timelineData = Array.from({ length: 12 }, (_, i) => ({
  year: `Yr ${i}`,
  calls: Math.random() * -30,
  distributions: Math.random() * 40,
  net: 0
}));
timelineData.forEach(d => d.net = d.distributions + d.calls);

const timelineConfig = {
  calls: { label: "Calls/Contributions", color: "hsl(var(--chart-5))" },
  distributions: { label: "Distributions", color: "hsl(var(--chart-3))" },
  net: { label: "Net Cash Flow", color: "hsl(var(--chart-1))" },
};

export function CashflowTimeline() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                    <span>Cash Flow Timeline</span>
                    <Badge variant="destructive" className="text-xs">Stress Period: Y2-Y4</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[150px]">
                <ChartContainer config={timelineConfig} className="w-full h-full">
                    <BarChart data={timelineData} barCategoryGap="5%" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} width={0} />
                        <Tooltip 
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />} 
                        />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Bar dataKey="distributions" fill="var(--color-distributions)" stackId="a" />
                        <Bar dataKey="calls" fill="var(--color-calls)" stackId="a" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
