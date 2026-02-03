'use client';

import { useState, useEffect } from 'react';
import { AssumptionsPanel } from '@/components/app/portfolio-growth/assumptions-panel';
import { GrowthChart } from '@/components/app/portfolio-growth/growth-chart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { FundSelector } from '@/components/app/dashboard/fund-selector';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const staticAssumptions = {
    assetAllocation: {
        equities: '60.00%',
        fixedIncome: '20.00%',
        cash: '2.50%',
        realAssets: '5.00%',
        hedgeFund: '5.00%',
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

const MetricRow = ({ 
    label, 
    value, 
    valueClassName,
    details
}: { 
    label: string, 
    value: string | number, 
    valueClassName?: string,
    details?: {
        title: string;
        rate: string;
        stdev: string;
        allocation: { label: string; value: string; percentage: string }[];
    }
}) => (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center py-1 px-3 group hover:bg-muted/30 transition-colors rounded-md">
        <p className="text-[10px] font-medium text-black uppercase tracking-tight">{label}</p>
        
        <p className={cn("text-[11px] font-medium text-right pr-4", valueClassName)}>{value}</p>

        <div className="flex justify-center w-8">
            {details && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 rounded-full bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 group-hover:scale-110 shadow-sm"
                        >
                            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-highlight uppercase text-sm font-bold tracking-tight">
                                {details.title} - Model Assumptions
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/50 rounded-lg border">
                                    <p className="text-[10px] font-bold text-black/60 uppercase">Expected Return</p>
                                    <p className="text-lg font-bold text-black">{details.rate}</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg border">
                                    <p className="text-[10px] font-bold text-black/60 uppercase">Vol (StDev)</p>
                                    <p className="text-lg font-bold text-black">{details.stdev}</p>
                                </div>
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                                <div className="bg-muted/30 px-3 py-2 text-[10px] font-bold text-black uppercase border-b tracking-widest">Asset Allocation Details</div>
                                <div className="divide-y divide-border text-[11px] bg-white">
                                    {details.allocation.map((item, i) => (
                                        <div key={i} className="flex justify-between p-2.5">
                                            <span className="font-medium text-black/70">{item.label}</span>
                                            <span className="font-bold text-black">{item.value} <span className="text-black/50 ml-1 font-medium">({item.percentage})</span></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
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
        const timeFactor = (investmentPeriod - 20) / 10; 
        const netFlow = annualContribution - annualWithdrawal;
        const netFlowFactor = startingBalance > 0 ? (netFlow / startingBalance) : 0;
        const increaseFactor = (annualIncrease / 100) * (netFlow > 0 ? 1 : -1);

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
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Skeleton className="h-7 w-80 max-w-full" />
                    <Skeleton className="h-9 w-[200px]" />
                </div>
                <Card className="border-black/10">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-4">
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                                <Skeleton className="h-[350px] w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getAllocationDetails = () => {
        return Object.entries(staticAssumptions.assetAllocation).map(([key, percentage]) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            const val = startingBalance * (parseFloat(percentage) / 100);
            return {
                label,
                percentage: percentage,
                value: formatCurrency(val)
            };
        });
    };

  return (
    <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-sm font-semibold tracking-tight text-highlight uppercase">
                Potential Growth of Portfolio Wealth
            </h1>
            <FundSelector
                selectedFundId={fundId}
                onFundChange={setFundId}
            />
        </div>
       <Card className="border-black/10">
            <CardContent className="pt-6">
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
                            <div className="divide-y divide-border rounded-lg border border-black/10 overflow-hidden">
                                <div className="py-1 px-3 bg-muted/30 font-bold text-[9px] text-highlight uppercase tracking-widest">Portfolio Risk Profile</div>
                                <div className="space-y-0.5 py-1">
                                    <MetricRow label="Mean Rate of Return" value={`${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`} />
                                    <MetricRow label="Standard Deviation" value={`${portfolioMetrics.standardDeviation.toFixed(2)}%`} />
                                </div>
                            </div>
                            <div className="divide-y divide-border rounded-lg border border-black/10 overflow-hidden">
                                <div className="py-1 px-3 bg-muted/30 font-bold text-[9px] text-highlight uppercase tracking-widest">Potential Wealth Outlook</div>
                                <div className="space-y-0.5 py-1">
                                    <MetricRow 
                                        label="Conservative" 
                                        value={formatCurrency(potentialWealth.conservative)} 
                                        valueClassName="text-chart-3" 
                                        details={{
                                            title: "Conservative Outlook",
                                            rate: `${(portfolioMetrics.meanRateOfReturn - 3.5).toFixed(2)}%`,
                                            stdev: `${(portfolioMetrics.standardDeviation * 0.35).toFixed(2)}%`,
                                            allocation: getAllocationDetails()
                                        }}
                                    />
                                    <MetricRow 
                                        label="Moderate" 
                                        value={formatCurrency(potentialWealth.moderate)} 
                                        valueClassName="text-chart-1" 
                                        details={{
                                            title: "Moderate Outlook",
                                            rate: `${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`,
                                            stdev: `${portfolioMetrics.standardDeviation.toFixed(2)}%`,
                                            allocation: getAllocationDetails()
                                        }}
                                    />
                                    <MetricRow 
                                        label="Aggressive" 
                                        value={formatCurrency(potentialWealth.aggressive)} 
                                        valueClassName="text-chart-2" 
                                        details={{
                                            title: "Aggressive Outlook",
                                            rate: `${(portfolioMetrics.meanRateOfReturn + 2.5).toFixed(2)}%`,
                                            stdev: `${(portfolioMetrics.standardDeviation * 1.4).toFixed(2)}%`,
                                            allocation: getAllocationDetails()
                                        }}
                                    />
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
