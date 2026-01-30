'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp } from 'lucide-react';

const formatPercentReq = (value: number) => `${Math.abs(value).toFixed(0)}%`;
const formatMultiple = (value: number) => `${value.toFixed(2)}x`;
const formatYears = (value: number) => `Yr ${value.toFixed(1)}`;
const formatNav = (value: number) => `${value.toFixed(0)}%`;

const ChangeIndicator = ({ value, formatFn, positiveIsGood }: { value: number, formatFn: (v: number) => string, positiveIsGood: boolean }) => {
    if (value === 0) {
        return <div className="flex items-center text-xs text-muted-foreground justify-center">No Change</div>;
    }
    
    const isPositive = value > 0;
    const symbol = isPositive ? '+' : '-';
    const formattedValue = formatFn(Math.abs(value));
    const text = `${symbol} ${formattedValue}`;

    const success = positiveIsGood ? isPositive : !isPositive;
    const color = success ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`flex items-center text-xs justify-center ${color}`}>
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{text}</span>
        </div>
    );
};

const RiskChangeIndicator = ({ change }: { change: string }) => {
    if (change === 'No Change') {
        return <div className="flex items-center text-xs text-muted-foreground justify-center">No Change</div>;
    }
    const isImprovement = change === 'Improved';
    const color = isImprovement ? 'text-green-500' : 'text-red-500';
    
    return (
        <div className={`flex items-center text-xs justify-center ${color}`}>
            {isImprovement ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
            <span>{change}</span>
        </div>
    );
};


const ImpactMetric = ({ title, value, children }: { title: string, value: string | number, children: React.ReactNode }) => {
    return (
        <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{value}</p>
            {children}
        </div>
    )
}

const LoadingMetric = () => (
    <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-lg space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
    </div>
)

export function PortfolioImpactPreview({ impactData }: { impactData: any | null }) {
  return (
    <Card>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-base font-semibold">Portfolio Impact Preview</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {impactData ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                <ImpactMetric 
                    title="Peak Funding" 
                    value={formatPercentReq(impactData.peakFundingRequirement.value)}
                >
                    <ChangeIndicator value={impactData.peakFundingRequirement.change} formatFn={formatPercentReq} positiveIsGood={true} />
                </ImpactMetric>
                
                <ImpactMetric 
                    title="Breakeven" 
                    value={formatYears(impactData.breakevenTiming.value)}
                >
                     <ChangeIndicator value={impactData.breakevenTiming.change} formatFn={formatYears} positiveIsGood={false} />
                </ImpactMetric>
                
                <ImpactMetric 
                    title="DPI Multiple" 
                    value={formatMultiple(impactData.netMultiple.value)}
                >
                    <ChangeIndicator value={impactData.netMultiple.change} formatFn={formatMultiple} positiveIsGood={true} />
                </ImpactMetric>

                <ImpactMetric 
                    title="TVPI Multiple" 
                    value={formatMultiple(impactData.tvpi.value)}
                >
                    <ChangeIndicator value={impactData.tvpi.change} formatFn={formatMultiple} positiveIsGood={true} />
                </ImpactMetric>

                <ImpactMetric 
                    title="Peak NAV"
                    value={`${formatNav(impactData.peakNav.value)} @ Yr ${impactData.peakNav.year}`}
                >
                     <ChangeIndicator value={impactData.peakNav.change} formatFn={formatNav} positiveIsGood={true} />
                </ImpactMetric>

                <ImpactMetric 
                    title="Liquidity Risk" 
                    value={impactData.liquidityGapRisk.value}
                >
                    <RiskChangeIndicator change={impactData.liquidityGapRisk.change} />
                </ImpactMetric>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[...Array(6)].map((_, i) => <LoadingMetric key={i} />)}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
