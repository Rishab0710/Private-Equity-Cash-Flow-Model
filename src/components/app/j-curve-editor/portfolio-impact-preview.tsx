'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp } from 'lucide-react';

const formatCurrency = (value: number) => `$${Math.abs(value).toFixed(1)}M`;
const formatMultiple = (value: number) => `${value.toFixed(2)}x`;
const formatYears = (value: number) => `Yr ${value.toFixed(1)}`;
const formatChange = (value: number, formatFn: (v: number) => string, positiveIsGood: boolean, invert: boolean = false) => {
    const isPositive = value >= 0;
    const symbol = isPositive ? '+' : '-';
    let formattedValue = formatFn(value);
    // remove the dollar sign from the change value if it's there
    if (formattedValue.startsWith('$')) {
        formattedValue = formattedValue.substring(1);
    }
    const text = `${symbol} ${formattedValue}`;

    let color = 'text-muted-foreground';
    if (value !== 0) {
        const success = positiveIsGood ? isPositive : !isPositive;
        color = success ? 'text-green-500' : 'text-red-500';
    }
    
    if (invert) {
       color = color === 'text-green-500' ? 'text-red-500' : (color === 'text-red-500' ? 'text-green-500' : color);
    }


    return (
        <div className={`flex items-center text-sm ${color}`}>
            {value !== 0 && (isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
            <span>{text}</span>
        </div>
    );
};


const ImpactMetric = ({ title, value, change, formatFn, positiveIsGood, invertChangeColor = false }: { title: string, value: string | number, change: number, formatFn: (v: number) => string, positiveIsGood: boolean, invertChangeColor?: boolean }) => {
    return (
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{typeof value === 'number' ? formatFn(value) : value}</p>
            {formatChange(change, formatFn, positiveIsGood, invertChangeColor)}
        </div>
    )
}

const LoadingMetric = () => (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
    </div>
)

export function PortfolioImpactPreview({ impactData }: { impactData: any | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Impact Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {impactData ? (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ImpactMetric 
                    title="Peak Funding Requirement" 
                    value={impactData.peakFundingRequirement.value / 1000000} 
                    change={impactData.peakFundingRequirement.change / 1000000}
                    formatFn={formatCurrency}
                    positiveIsGood={true} 
                />
                <ImpactMetric 
                    title="Liquidity Gap Risk" 
                    value={impactData.liquidityGapRisk.value} 
                    change={impactData.liquidityGapRisk.change === 'Improved' ? -1 : impactData.liquidityGapRisk.change === 'Worsened' ? 1 : 0}
                    formatFn={(v) => v === -1 ? "Improved" : v === 1 ? "Worsened" : "No Change"}
                    positiveIsGood={false}
                />
                <ImpactMetric 
                    title="Breakeven Timing" 
                    value={impactData.breakevenTiming.value}
                    change={impactData.breakevenTiming.change}
                    formatFn={formatYears}
                    positiveIsGood={false} 
                />
                <ImpactMetric 
                    title="10-Year Net Multiple" 
                    value={impactData.netMultiple.value}
                    change={impactData.netMultiple.change}
                    formatFn={formatMultiple}
                    positiveIsGood={true}
                />
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <LoadingMetric />
                <LoadingMetric />
                <LoadingMetric />
                <LoadingMetric />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
