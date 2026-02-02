'use client';

import { Card, CardContent } from "@/components/ui/card";

const SummaryMetric = ({ label, value, subValue }: { label: string; value: string; subValue?: string }) => (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
);

export function SummaryOutputs() {
    return (
        <Card>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <SummaryMetric label="Total Capital Called" value="$85M" subValue="85% of commitment" />
                    <SummaryMetric label="Total Distributions" value="$187M" />
                    <SummaryMetric label="Ending NAV" value="$33M" />
                    <SummaryMetric label="TVPI" value="2.20x" subValue="Target: 2.20x" />
                    <SummaryMetric label="Breakeven Timing" value="Year 5.5" />
                </div>
            </CardContent>
        </Card>
    );
}
