'use client';

import { useState, useEffect } from 'react';
import { AssumptionsPanel } from '@/components/app/portfolio-growth/assumptions-panel';
import { GrowthChart } from '@/components/app/portfolio-growth/growth-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const staticAssumptions = {
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

const generateChartData = (params: {
    startingBalance: number;
    annualContribution: number;
    annualWithdrawal: number;
    annualIncrease: number;
    analysisTimePeriod: number;
}) => {
    const { startingBalance, annualContribution, annualWithdrawal, annualIncrease, analysisTimePeriod } = params;
    
    const data = [];
    const baseAmount = startingBalance / 1000;
    let cons = baseAmount;
    let mod = baseAmount;
    let agg = baseAmount;

    let currentContribution = annualContribution;
    let currentWithdrawal = annualWithdrawal;

    const rates = { cons: 0.05, mod: 0.0822, agg: 0.11 };
    const volatility = { cons: 0.05, mod: 0.1302, agg: 0.20 };
    const currentYear = new Date().getFullYear();
    const increaseFactor = 1 + annualIncrease / 100;

    data.push({
        year: `${currentYear}`,
        conservative: Math.round(cons),
        moderate: Math.round(mod),
        aggressive: Math.round(agg),
    });

    for (let i = 1; i <= analysisTimePeriod; i++) {
        const netAnnualFlow = (currentContribution - currentWithdrawal) / 1000;
        
        cons += netAnnualFlow;
        mod += netAnnualFlow;
        agg += netAnnualFlow;
        
        cons *= (1 + rates.cons + (Math.random() - 0.5) * volatility.cons);
        mod *= (1 + rates.mod + (Math.random() - 0.5) * volatility.mod);
        agg *= (1 + rates.agg + (Math.random() - 0.5) * volatility.agg);

        data.push({
            year: `${currentYear + i}`,
            conservative: Math.round(cons),
            moderate: Math.round(mod),
            aggressive: Math.round(agg),
        });

        currentContribution *= increaseFactor;
        currentWithdrawal *= increaseFactor;
    }
    return data;
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

const MetricRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-2 px-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
    </div>
);


export default function PortfolioGrowthPage() {
    const [startingBalance, setStartingBalance] = useState(4924555);
    const [annualContribution, setAnnualContribution] = useState(0);
    const [annualWithdrawal, setAnnualWithdrawal] = useState(0);
    const [annualIncrease, setAnnualIncrease] = useState(0);
    const [analysisTimePeriod, setAnalysisTimePeriod] = useState(25);

    const [chartData, setChartData] = useState<any[] | null>(null);
    const [potentialWealth, setPotentialWealth] = useState<any | null>(null);

    useEffect(() => {
        const data = generateChartData({
            startingBalance,
            annualContribution,
            annualWithdrawal,
            annualIncrease,
            analysisTimePeriod
        });
        setChartData(data);
        const lastDataPoint = data[data.length - 1];
        if (lastDataPoint) {
            setPotentialWealth({
                conservative: lastDataPoint.conservative * 1000,
                moderate: lastDataPoint.moderate * 1000,
                aggressive: lastDataPoint.aggressive * 1000,
            });
        }
    }, [startingBalance, annualContribution, annualWithdrawal, annualIncrease, analysisTimePeriod]);


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
                        <AssumptionsPanel 
                            assumptions={staticAssumptions} 
                            startingBalance={startingBalance}
                            setStartingBalance={setStartingBalance}
                            annualContribution={annualContribution}
                            setAnnualContribution={setAnnualContribution}
                            annualWithdrawal={annualWithdrawal}
                            setAnnualWithdrawal={setAnnualWithdrawal}
                            annualIncrease={annualIncrease}
                            setAnnualIncrease={setAnnualIncrease}
                            analysisTimePeriod={analysisTimePeriod}
                            setAnalysisTimePeriod={setAnalysisTimePeriod}
                        />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="divide-y divide-border rounded-lg border">
                                <div className="py-2 px-4 font-semibold text-sm">Portfolio</div>
                                <div className="space-y-1 py-1">
                                    <MetricRow label="Mean Rate of Return" value={staticAssumptions.portfolio.meanRateOfReturn} />
                                    <MetricRow label="Standard Deviation" value={staticAssumptions.portfolio.standardDeviation} />
                                </div>
                            </div>
                            <div className="divide-y divide-border rounded-lg border">
                                <div className="py-2 px-4 font-semibold text-sm">Potential Wealth</div>
                                <div className="space-y-1 py-1">
                                    <MetricRow label="Conservative Outlook" value={formatCurrency(potentialWealth.conservative)} />
                                    <MetricRow label="Moderate Outlook" value={formatCurrency(potentialWealth.moderate)} />
                                    <MetricRow label="Aggressive Outlook" value={formatCurrency(potentialWealth.aggressive)} />
                                </div>
                            </div>
                        </div>
                        <GrowthChart data={chartData} />
                    </div>
                </div>
            </CardContent>
       </Card>
    </div>
  );
}
