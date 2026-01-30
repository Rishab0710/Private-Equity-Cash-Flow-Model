'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Milestone } from 'lucide-react';

const ImpactMetric = ({ title, value, change, positiveIsGood }: { title: string, value: string, change: string, positiveIsGood: boolean }) => {
    const isPositive = change.startsWith('+');
    const color = (isPositive && positiveIsGood) || (!isPositive && !positiveIsGood)
        ? 'text-green-500'
        : 'text-red-500';

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
            <div className={`flex items-center text-sm ${color}`}>
                {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                <span>{change}</span>
            </div>
        </div>
    )
}

export function PortfolioImpactPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Impact Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ImpactMetric title="Peak Funding Requirement" value="$45M" change="- $2.5M" positiveIsGood={false} />
            <ImpactMetric title="Liquidity Gap Risk" value="Low" change="Improved" positiveIsGood={true} />
            <ImpactMetric title="Breakeven Timing" value="Q2 2028" change="+ 2 Qtrs" positiveIsGood={false} />
            <ImpactMetric title="10-Year Net Multiple" value="2.1x" change="+ 0.1x" positiveIsGood={true} />
        </div>
      </CardContent>
    </Card>
  );
}
