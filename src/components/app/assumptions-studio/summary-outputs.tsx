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
    <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-lg h-full">
        <p className="text-xs font-bold text-black">{label}</p>
        <p className="text-lg font-black text-black">{value}</p>
        {subValue && <p className="text-xs font-bold text-black">{subValue}</p>}
    </div>
);

const SummarySkeleton = () => (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-lg h-[76px] space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
    </div>
)

export function SummaryOutputs({ data, tvpiTarget, moicTarget }: { data: any | null, tvpiTarget: number, moicTarget: number }) {
    if (!data) {
        return (
             <Card>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                       {Array.from({length: 6}).map((_, i) => <SummarySkeleton key={i} />)}
                    </div>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card>
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <SummaryMetric label="Total Called" value={formatCurrency(data.totalCapitalCalled)} subValue={`${Math.round(data.totalCapitalCalled)}% of commitment`} />
                    <SummaryMetric label="Total Dists" value={formatCurrency(data.totalDistributions)} />
                    <SummaryMetric label="Ending NAV" value={formatCurrency(data.endingNav)} />
                    <SummaryMetric label="TVPI" value={formatMultiple(data.tvpi)} subValue={`Target: ${formatMultiple(tvpiTarget)}`} />
                    <SummaryMetric label="MOIC" value={formatMultiple(moicTarget)} subValue="Target Multiple" />
                    <SummaryMetric label="Breakeven" value={data.breakevenTiming} />
                </div>
            </CardContent>
        </Card>
    );
}
