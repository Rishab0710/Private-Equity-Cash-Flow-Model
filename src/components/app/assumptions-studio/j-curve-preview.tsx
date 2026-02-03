
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  irr: { label: "Private Equity Composite", color: "#144629" },
  irrBenchmark1: { label: "BlackRock Vesey Street III, LP", color: "#e4b060" },
  irrBenchmark2: { label: "BlackRock Vesey Street IV, LP", color: "#6d69a8" },
  irrBenchmark3: { label: "Columbia Partners", color: "#3b82f6" },
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export function JCurvePreview({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return (
            <Card className="border-black/10">
                <CardHeader className="py-3">
                    <CardTitle className="text-base font-semibold text-highlight">J-Curve Performance Profile</CardTitle>
                </CardHeader>
                <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
            </Card>
        )
    }
    return (
        <Card className="border-black/10">
            <CardHeader className="py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-highlight">J-Curve Performance Profile (IRR)</CardTitle>
                <div className="text-[10px] text-black font-medium uppercase tracking-wider">
                    Annualized Internal Rate of Return
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
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
                </div>
            </CardContent>
        </Card>
    );
}
