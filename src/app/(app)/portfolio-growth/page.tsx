'use client';

import { useState, useEffect } from 'react';
import { AssumptionsPanel } from '@/components/app/portfolio-growth/assumptions-panel';
import { GrowthChart } from '@/components/app/portfolio-growth/growth-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const generateChartData = () => {
    const data = [];
    const years = 25;
    let cons = 4924;
    let mod = 4924;
    let agg = 4924;

    const rates = {
        cons: 0.05,
        mod: 0.0822,
        agg: 0.11
    };

    const volatility = {
        cons: 0.05,
        mod: 0.1302,
        agg: 0.20
    };

    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= years; i++) {
        data.push({
            year: `${currentYear + i}`,
            conservative: Math.round(cons),
            moderate: Math.round(mod),
            aggressive: Math.round(agg),
        });
        
        cons = cons * (1 + rates.cons + (Math.random() - 0.5) * volatility.cons);
        mod = mod * (1 + rates.mod + (Math.random() - 0.5) * volatility.mod);
        agg = agg * (1 + rates.agg + (Math.random() - 0.5) * volatility.agg);
    }
    return data;
};

const assumptions = {
    startingBalance: 4924555,
    annualContribution: 0,
    annualIncrease: '0.00%',
    analysisTimePeriod: '25 Years',
    assetAllocation: {
        equities: '67.40%',
        fixedIncome: '22.41%',
        cash: '2.53%',
        realAssets: '0.00%',
        hedgeFundStrategies: '7.67%',
        privateEquity: '0.00%',
    },
    portfolio: {
        meanRateOfReturn: '8.22%',
        standardDeviation: '13.02%',
    },
};

export default function PortfolioGrowthPage() {
    const [chartData, setChartData] = useState<any[] | null>(null);
    const [potentialWealth, setPotentialWealth] = useState<any | null>(null);

    useEffect(() => {
        const data = generateChartData();
        setChartData(data);
        setPotentialWealth({
            conservative: data[data.length - 1].conservative * 1000,
            moderate: data[data.length - 1].moderate * 1000,
            aggressive: data[data.length - 1].aggressive * 1000,
        });
    }, []);


    if (!chartData || !potentialWealth) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                        <div className="md:col-span-2">
                            <Skeleton className="h-[400px] w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

  return (
    <div className="space-y-6">
       <Card>
            <CardHeader>
                <CardTitle className="text-lg font-normal">
                Potential Growth of Your Portfolio Using Forward-Looking Risk and Return Assumptions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AssumptionsPanel assumptions={assumptions} potentialWealth={potentialWealth} />
                    </div>
                    <div className="lg:col-span-2">
                        <GrowthChart data={chartData} />
                    </div>
                </div>
            </CardContent>
       </Card>
    </div>
  );
}
