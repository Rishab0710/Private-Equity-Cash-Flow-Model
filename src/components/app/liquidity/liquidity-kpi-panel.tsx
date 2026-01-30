'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const KpiCard = ({ title, value, description }: { title: string, value: string, description?: string }) => (
    <Card className="bg-card">
        <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
            <div className="text-lg font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

export function LiquidityKpiPanel({ kpis }: { kpis: any }) {
    const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
    const formatCurrency = (value: number) => {
        if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
        return `$${(value / 1_000).toFixed(0)}K`;
    }
    const peakDate = kpis.peakProjectedOutflow.date ? new Date(kpis.peakProjectedOutflow.date) : null;

    const runwayValue = kpis.liquidityRunwayInMonths >= 24 
        ? `${(kpis.liquidityRunwayInMonths / 12).toFixed(1)} years` 
        : `${kpis.liquidityRunwayInMonths} months`;

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <KpiCard title="Liquidity Coverage" value={formatPercent(kpis.liquidityBufferRatio)} description="Available vs Unfunded" />
            <KpiCard title="Peak Funding Need" value={formatCurrency(kpis.peakProjectedOutflow.value)} description={peakDate ? `in ${peakDate.toLocaleString('default', { month: 'short' })} ${peakDate.getFullYear()}` : ''} />
            <KpiCard title="Liquidity Runway" value={runwayValue} description="Until buffer breach" />
            <KpiCard 
                title="Next Funding Gap" 
                value={kpis.nextFundingGap ? format(new Date(kpis.nextFundingGap.date), 'MMM yyyy') : 'None'} 
                description={kpis.nextFundingGap ? `Est. ${formatCurrency(kpis.nextFundingGap.fundingGap)} deficit` : 'No gaps projected'} />
        </div>
    );
}
