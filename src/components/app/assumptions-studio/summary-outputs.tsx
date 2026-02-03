'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0M';
    return `$${Math.round(value)}M`;
};

const formatMultiple = (value: number) => {
     if (typeof value !== 'number' || isNaN(value)) return '0.00x';
    return `${value.toFixed(2)}x`;
}

const formatPercent = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0.0%';
    return `${(value * 100).toFixed(1)}%`;
}

const SummaryMetric = ({ 
    label, 
    value, 
    subValue, 
    colorLogic 
}: { 
    label: string; 
    value: string; 
    subValue?: string;
    colorLogic?: 'positive' | 'neutral' | 'negative' | 'none';
}) => {
    const valueColor = {
        'positive': 'text-green-600',
        'neutral': 'text-orange-500',
        'negative': 'text-red-600',
        'none': 'text-black'
    }[colorLogic || 'none'];

    return (
        <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-lg h-full border border-black/5">
            <p className="text-[10px] font-bold text-black uppercase tracking-wider mb-1">{label}</p>
            <p className={cn("text-base font-bold leading-none", valueColor)}>{value}</p>
            {subValue && <p className="text-[10px] font-medium text-black mt-1 opacity-70">{subValue}</p>}
        </div>
    );
};

const SummarySkeleton = () => (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-lg h-[76px] space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
    </div>
)

export function SummaryOutputs({ data }: { data: any | null }) {
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

    const getTvpiColor = (val: number) => {
        if (val > 2.0) return 'positive';
        if (val >= 1.5) return 'neutral';
        return 'negative';
    };

    const getIrrColor = (val: number) => {
        if (val > 0.15) return 'positive';
        if (val >= 0.08) return 'neutral';
        return 'negative';
    };

    const getDpiColor = (val: number) => {
        if (val > 1.0) return 'positive';
        if (val >= 0.5) return 'neutral';
        return 'negative';
    };

    const totalCommitment = data.totalCapitalCalled + data.remainingUnfunded;
    const unfundedPercentage = totalCommitment > 0 ? ((data.remainingUnfunded / totalCommitment) * 100).toFixed(1) : "0.0";

    return (
        <Card className="bg-white border-black/10">
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
                    <SummaryMetric 
                        label="Total Called" 
                        value={formatCurrency(data.totalCapitalCalled)} 
                        subValue={`${unfundedPercentage}% Unfunded`} 
                    />
                    <SummaryMetric 
                        label="Total Dists" 
                        value={formatCurrency(data.totalDistributions)} 
                        colorLogic="positive"
                    />
                    <SummaryMetric 
                        label="Ending NAV" 
                        value={formatCurrency(data.endingNav)} 
                        colorLogic="none"
                    />
                    <SummaryMetric 
                        label="Peak NAV" 
                        value={`${formatCurrency(data.peakNav.value)} @ Yr ${data.peakNav.year}`} 
                        colorLogic="positive"
                    />
                    <SummaryMetric 
                        label="TVPI" 
                        value={formatMultiple(data.tvpi)} 
                        colorLogic={getTvpiColor(data.tvpi)}
                    />
                    <SummaryMetric 
                        label="MOIC" 
                        value={formatMultiple(data.moic)} 
                        colorLogic={getTvpiColor(data.moic)}
                    />
                    <SummaryMetric 
                        label="ITD IRR" 
                        value={formatPercent(data.itdIrr)} 
                        colorLogic={getIrrColor(data.itdIrr)}
                    />
                    <SummaryMetric 
                        label="DPI" 
                        value={formatMultiple(data.dpi)} 
                        colorLogic={getDpiColor(data.dpi)}
                    />
                    <SummaryMetric 
                        label="RVPI" 
                        value={formatMultiple(data.rvpi)} 
                        colorLogic="neutral"
                    />
                </div>
            </CardContent>
        </Card>
    );
}