'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0M';
    return `$${Math.round(value)}M`;
};

const formatMultiple = (value: number) => {
     if (typeof value !== 'number' || isNaN(value)) return '0.00x';
    return `${value.toFixed(2)}x`;
}

const SummaryMetric = ({ label, value, subValue }: { label: string; value: string; subValue?: string }) => (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
);

const SummarySkeleton = () => (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-lg h-[76px] space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
    </div>
)

export function SummaryOutputs({ data, tvpiTarget }: { data: any | null, tvpiTarget: number }) {
    if (!data) {
        return (
             <Card>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                       {Array.from({length: 5}).map((_, i) => <SummarySkeleton key={i} />)}
                    </div>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <SummaryMetric label="Total Capital Called" value={formatCurrency(data.totalCapitalCalled)} subValue={`${Math.round(data.totalCapitalCalled)}% of commitment`} />
                    <SummaryMetric label="Total Distributions" value={formatCurrency(data.totalDistributions)} />
                    <SummaryMetric label="Ending NAV" value={formatCurrency(data.endingNav)} />
                    <SummaryMetric label="TVPI" value={formatMultiple(data.tvpi)} subValue={`Target: ${formatMultiple(tvpiTarget)}`} />
                    <SummaryMetric label="Breakeven Timing" value={data.breakevenTiming} />
                </div>
            </CardContent>
        </Card>
    );
}
