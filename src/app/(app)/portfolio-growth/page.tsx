'use client';

import { useState, useEffect } from 'react';
import { AssumptionsPanel } from '@/components/app/portfolio-growth/assumptions-panel';
import { GrowthChart } from '@/components/app/portfolio-growth/growth-chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { FundSelector } from '@/components/app/dashboard/fund-selector';

const staticAssumptions = {
    assetAllocation: {
        equities: '60.00%',
        fixedIncome: '20.00%',
        cash: '2.50%',
        realAssets: '5.00%',
        hedgeFundStrategies: '5.00%',
        privateEquity: '7.50%',
    },
};

const generateChartData = (params: {
    startingBalance: number;
    annualContribution: number;
    annualWithdrawal: number;
    annualIncrease: number;
    investmentPeriod: number;
    meanRateOfReturn: number;
    standardDeviation: number;
}) => {
    const { startingBalance, annualContribution, annualWithdrawal, annualIncrease, investmentPeriod, meanRateOfReturn, standardDeviation } = params;
    
    const data = [];
    const baseAmount = startingBalance / 1000000;
    let cons = baseAmount;
    let mod = baseAmount;
    let agg = baseAmount;

    let currentContribution = annualContribution;
    let currentWithdrawal = annualWithdrawal;

    const moderateRate = meanRateOfReturn / 100;
    const moderateStdev = standardDeviation / 100;

    const rates = { cons: moderateRate - 0.035, mod: moderateRate, agg: moderateRate + 0.025 };
    const volatility = { cons: moderateStdev * 0.35, mod: moderateStdev, agg: moderateStdev * 1.4 };

    const currentYear = new Date().getFullYear();
    const increaseFactor = 1 + annualIncrease / 100;

    data.push({
        year: `${currentYear}`,
        conservative: Math.round(cons),
        moderate: Math.round(mod),
        aggressive: Math.round(agg),
    });

    for (let i = 1; i <= investmentPeriod; i++) {
        const netAnnualFlow = (currentContribution - currentWithdrawal) / 1000000;
        
        cons += netAnnualFlow;
        mod += netAnnualFlow;
        agg += netAnnualFlow;
        
        const randomFactor = Math.random() - 0.5;

        cons *= (1 + rates.cons + randomFactor * volatility.cons);
        mod *= (1 + rates.mod + randomFactor * volatility.mod);
        agg *= (1 + rates.agg + randomFactor * volatility.agg);

        cons = Math.max(0, cons);
        mod = Math.max(cons, mod);
        agg = Math.max(mod, agg);

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

const calculateLikelihoods = (params: {
    startingBalance: number;
    annualContribution: number;
    annualWithdrawal: number;
    investmentPeriod: number;
}) => {
    const { startingBalance, annualContribution, annualWithdrawal, investmentPeriod } = params;

    const baseLikelihoods = {
        conservative: 80,
        moderate: 50,
        aggressive: 33
    };

    const growthPressure = startingBalance > 0 ? ((annualContribution - annualWithdrawal) / startingBalance) * 100 : 0;
    const timePressure = (investmentPeriod - 25) / 2.5;
    const adjustment = growthPressure + timePressure;

    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

    const newLikelihoods = {
        conservative: clamp(baseLikelihoods.conservative + adjustment, 60, 95),
        moderate: clamp(baseLikelihoods.moderate + adjustment, 30, 70),
        aggressive: clamp(baseLikelihoods.aggressive + adjustment, 15, 50),
    };

    return {
        conservative: `${Math.round(newLikelihoods.conservative)}% Likelihood`,
        moderate: `${Math.round(newLikelihoods.moderate)}% Likelihood`,
        aggressive: `${Math.round(newLikelihoods.aggressive)}% Likelihood`,
    }
};


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

const MetricRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center py-1 px-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold">{value}</p>
    </div>
);


export default function PortfolioGrowthPage() {
    const { fundId, setFundId, funds, portfolioData } = usePortfolioContext();
    
    const [startingBalance, setStartingBalance] = useState(5000000);
    const [annualContribution, setAnnualContribution] = useState(0);
    const [annualWithdrawal, setAnnualWithdrawal] = useState(0);
    const [annualIncrease, setAnnualIncrease] = useState(0);
    const [investmentPeriod, setInvestmentPeriod] = useState(20);

    const [chartData, setChartData] = useState<any[] | null>(null);
    const [potentialWealth, setPotentialWealth] = useState<any | null>(null);
    const [likelihoods, setLikelihoods] = useState<any | null>(null);
    const [portfolioMetrics, setPortfolioMetrics] = useState({
        meanRateOfReturn: 8.50,
        standardDeviation: 14.50,
    });

    useEffect(() => {
        if (funds && funds.length > 0) {
            let newStartingBalance = 0;
            if (fundId === 'all') {
                newStartingBalance = funds.reduce((sum, fund) => sum + (fund.latestNav ?? 0), 0);
            } else {
                const selectedFund = funds.find(f => f.id === fundId);
                newStartingBalance = selectedFund?.latestNav ?? 0;
            }
            setStartingBalance(newStartingBalance);
        }
    }, [fundId, funds]);

    useEffect(() => {
        const params = {
            startingBalance,
            annualContribution,
            annualWithdrawal,
            annualIncrease,
            investmentPeriod
        };
        
        const strategyRiskProfiles = {
            'PE': { baseReturn: 9.5, baseStdev: 16.0 },
            'VC': { baseReturn: 11.0, baseStdev: 20.0 },
            'Infra': { baseReturn: 7.0, baseStdev: 12.0 },
            'Secondaries': { baseReturn: 8.0, baseStdev: 14.0 },
            'Other': { baseReturn: 8.5, baseStdev: 14.5 },
            'all': { baseReturn: 8.5, baseStdev: 14.5 }
        };

        let riskProfile;
        if (fundId === 'all' || !funds) {
            riskProfile = strategyRiskProfiles.all;
        } else {
            const selectedFund = funds.find(f => f.id === fundId);
            riskProfile = strategyRiskProfiles[selectedFund?.strategy as keyof typeof strategyRiskProfiles] || strategyRiskProfiles.Other;
        }

        const { baseReturn, baseStdev } = riskProfile;

        // 1. Time horizon factor
        const timeFactor = (investmentPeriod - 20) / 10; // Longer horizon = more risk appetite

        // 2. Net cash flow factor (contribution vs withdrawal)
        const netFlow = annualContribution - annualWithdrawal;
        const netFlowFactor = startingBalance > 0 ? (netFlow / startingBalance) : 0;

        // 3. Annual increase factor
        // This amplifies the net cash flow effect over time
        const increaseFactor = (annualIncrease / 100) * (netFlow > 0 ? 1 : -1);

        // Combine factors to create adjustments
        const returnAdjustment = (timeFactor * 0.5) + (netFlowFactor * 2) + (increaseFactor * 1);
        const stdevAdjustment = (timeFactor * 1.0) + (netFlowFactor * 3) + (increaseFactor * 2);
        
        const newReturn = Math.max(5.0, Math.min(12.0, baseReturn + returnAdjustment));
        const newStdev = Math.max(10.0, Math.min(22.0, baseStdev + stdevAdjustment));

        const newPortfolioMetrics = {
            meanRateOfReturn: newReturn,
            standardDeviation: newStdev,
        };
        setPortfolioMetrics(newPortfolioMetrics);

        const data = generateChartData({ ...params, ...newPortfolioMetrics });
        setChartData(data);
        const lastDataPoint = data[data.length - 1];
        if (lastDataPoint) {
            setPotentialWealth({
                conservative: lastDataPoint.conservative * 1000000,
                moderate: lastDataPoint.moderate * 1000000,
                aggressive: lastDataPoint.aggressive * 1000000,
            });
        }
        setLikelihoods(calculateLikelihoods(params));

    }, [startingBalance, annualContribution, annualWithdrawal, annualIncrease, investmentPeriod, fundId, funds]);


    if (!chartData || !potentialWealth || !likelihoods || !portfolioData) {
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
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <CardTitle className="text-lg font-normal">
                    Potential Growth of Your Portfolio Using Forward-Looking Risk and Return Assumptions
                    </CardTitle>
                    <FundSelector
                        selectedFundId={fundId}
                        onFundChange={setFundId}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AssumptionsPanel 
                            assumptions={staticAssumptions} 
                            startingBalance={startingBalance}
                            annualContribution={annualContribution}
                            setAnnualContribution={setAnnualContribution}
                            annualWithdrawal={annualWithdrawal}
                            setAnnualWithdrawal={setAnnualWithdrawal}
                            annualIncrease={annualIncrease}
                            setAnnualIncrease={setAnnualIncrease}
                            investmentPeriod={investmentPeriod}
                            setInvestmentPeriod={setInvestmentPeriod}
                        />
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="divide-y divide-border rounded-lg border">
                                <div className="py-1 px-3 font-semibold text-xs">Portfolio</div>
                                <div className="space-y-1 py-1">
                                    <MetricRow label="Mean Rate of Return" value={`${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`} />
                                    <MetricRow label="Standard Deviation" value={`${portfolioMetrics.standardDeviation.toFixed(2)}%`} />
                                </div>
                            </div>
                            <div className="divide-y divide-border rounded-lg border">
                                <div className="py-1 px-3 font-semibold text-xs">Potential Wealth</div>
                                <div className="space-y-1 py-1">
                                    <MetricRow label="Conservative Outlook" value={formatCurrency(potentialWealth.conservative)} />
                                    <MetricRow label="Moderate Outlook" value={formatCurrency(potentialWealth.moderate)} />
                                    <MetricRow label="Aggressive Outlook" value={formatCurrency(potentialWealth.aggressive)} />
                                </div>
                            </div>
                        </div>
                        <GrowthChart data={chartData} likelihoods={likelihoods} />
                    </div>
                </div>
            </CardContent>
       </Card>
    </div>
  );
}
