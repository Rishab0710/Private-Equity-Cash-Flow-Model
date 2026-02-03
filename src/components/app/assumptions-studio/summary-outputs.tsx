'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
    CircleDollarSign, 
    TrendingUp, 
    Landmark, 
    ArrowUpCircle, 
    BarChart3, 
    PieChart, 
    Activity, 
    CheckCircle2, 
    Clock 
} from "lucide-react";

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

type ColorLogic = 'positive' | 'neutral' | 'negative' | 'info' | 'none';

const SummaryMetric = ({ 
    label, 
    value, 
    subValue, 
    colorLogic,
    icon: Icon
}: { 
    label: string; 
    value: string; 
    subValue?: string;
    colorLogic?: ColorLogic;
    icon: React.ElementType;
}) => {
    const theme = {
        'positive': 'bg-green-50/50 border-green-100 text-green-700 icon-green-600',
        'neutral': 'bg-orange-50/50 border-orange-100 text-orange-700 icon-orange-600',
        'negative': 'bg-red-50/50 border-red-100 text-red-700 icon-red-600',
        'info': 'bg-blue-50/50 border-blue-100 text-blue-700 icon-blue-600',
        'none': 'bg-muted/30 border-black/5 text-black icon-black/60'
    }[colorLogic || 'none'];

    return (
        <div className={cn(
            "flex flex-col items-center justify-between p-3 text-center rounded-xl h-full border transition-all hover:shadow-md",
            theme.split(' icon-')[0]
        )}>
            <div className="flex flex-col items-center gap-1.5">
                <Icon className={cn("h-4 w-4", theme.split(' icon-')[1])} />
                <p className="text-[9px] font-bold text-black/60 uppercase tracking-widest leading-none">{label}</p>
            </div>
            <div className="mt-2">
                <p className={cn("text-base font-bold leading-none tabular-nums", theme.split(' icon-')[0].split(' ').pop())}>
                    {value}
                </p>
                {subValue && (
                    <p className="text-[9px] font-semibold text-black/40 mt-1 uppercase tracking-tighter">
                        {subValue}
                    </p>
                )}
            </div>
        </div>
    );
};

const SummarySkeleton = () => (
    <div className="flex flex-col items-center justify-center p-3 text-center bg-muted/50 rounded-xl h-[90px] space-y-2 border border-black/5">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
    </div>
)

export function SummaryOutputs({ data }: { data: any | null }) {
    if (!data) {
        return (
             <Card className="bg-white border-black/10 shadow-sm rounded-xl">
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
                       {Array.from({length: 9}).map((_, i) => <SummarySkeleton key={i} />)}
                    </div>
                </CardContent>
            </Card>
        )
    }

    const getTvpiColor = (val: number): ColorLogic => {
        if (val > 2.0) return 'positive';
        if (val >= 1.5) return 'neutral';
        return 'negative';
    };

    const getIrrColor = (val: number): ColorLogic => {
        if (val > 0.15) return 'positive';
        if (val >= 0.08) return 'neutral';
        return 'negative';
    };

    const getDpiColor = (val: number): ColorLogic => {
        if (val > 1.0) return 'positive';
        if (val >= 0.5) return 'neutral';
        return 'negative';
    };

    const totalCommitment = data.totalCapitalCalled + data.remainingUnfunded;
    const unfundedPercentage = totalCommitment > 0 ? ((data.remainingUnfunded / totalCommitment) * 100).toFixed(1) : "0.0";

    return (
        <Card className="bg-white border-black/10 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3 h-full">
                    <SummaryMetric 
                        label="Total Called" 
                        value={formatCurrency(data.totalCapitalCalled)} 
                        subValue={`${unfundedPercentage}% Unfunded`}
                        icon={CircleDollarSign}
                        colorLogic="info"
                    />
                    <SummaryMetric 
                        label="Total Dists" 
                        value={formatCurrency(data.totalDistributions)} 
                        subValue="Cash Returned"
                        icon={TrendingUp}
                        colorLogic="positive"
                    />
                    <SummaryMetric 
                        label="Ending NAV" 
                        value={formatCurrency(data.endingNav)} 
                        subValue="Terminal Value"
                        icon={Landmark}
                        colorLogic="info"
                    />
                    <SummaryMetric 
                        label="Peak NAV" 
                        value={formatCurrency(data.peakNav.value)} 
                        subValue={`Year ${data.peakNav.year}`}
                        icon={ArrowUpCircle}
                        colorLogic="info"
                    />
                    <SummaryMetric 
                        label="TVPI" 
                        value={formatMultiple(data.tvpi)} 
                        subValue="Total Value"
                        icon={BarChart3}
                        colorLogic={getTvpiColor(data.tvpi)}
                    />
                    <SummaryMetric 
                        label="MOIC" 
                        value={formatMultiple(data.moic)} 
                        subValue="Gross Multiplier"
                        icon={PieChart}
                        colorLogic={getTvpiColor(data.moic)}
                    />
                    <SummaryMetric 
                        label="ITD IRR" 
                        value={formatPercent(data.itdIrr)} 
                        subValue="Annual Return"
                        icon={Activity}
                        colorLogic={getIrrColor(data.itdIrr)}
                    />
                    <SummaryMetric 
                        label="DPI" 
                        value={formatMultiple(data.dpi)} 
                        subValue="Realized"
                        icon={CheckCircle2}
                        colorLogic={getDpiColor(data.dpi)}
                    />
                    <SummaryMetric 
                        label="RVPI" 
                        value={formatMultiple(data.rvpi)} 
                        subValue="Unrealized"
                        icon={Clock}
                        colorLogic="neutral"
                    />
                </div>
            </CardContent>
        </Card>
    );
}