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

const formatPercent = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0%';
    return `${value.toFixed(1)}%`;
}

const SummaryMetric = ({ label, value, subValue }: { label: string; value: string; subValue?: string }) => (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-lg h-full border border-black/5">
        <p className="text-[10px] font-bold text-black uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base font-black text-black leading-none">{value}</p>
        {subValue && <p className="text-[10px] font-medium text-black mt-1 opacity-70">{subValue}</p>}
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
             <Card className="bg-white border-black/10">
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
                       {Array.from({length: 9}).map((_, i) => <SummarySkeleton key={i} />)}
                    </div>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card className="bg-white border-black/10">
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
                    <SummaryMetric label="Total Called" value={formatCurrency(data.totalCapitalCalled)} subValue={`${Math.round(data.totalCapitalCalled)}% of commitment`} />
                    <SummaryMetric label="Total Dists" value={formatCurrency(data.totalDistributions)} />
                    <SummaryMetric label="Ending NAV" value={formatCurrency(data.endingNav)} />
                    <SummaryMetric label="Peak NAV" value={formatCurrency(data.peakNav)} />
                    <SummaryMetric label="TVPI" value={formatMultiple(data.tvpi)} subValue={`Target: ${formatMultiple(tvpiTarget)}`} />
                    <SummaryMetric label="MOIC" value={formatMultiple(moicTarget)} subValue="Target Multiple" />
                    <SummaryMetric label="Breakeven" value={data.breakevenTiming} />
                    <SummaryMetric label="Coverage" value={formatPercent(data.liquidityCoverage)} subValue="Dist / Call Ratio" />
                    <SummaryMetric label="Unfunded" value={formatCurrency(data.remainingUnfunded)} />
                </div>
            </CardContent>
        </Card>
    );
}
