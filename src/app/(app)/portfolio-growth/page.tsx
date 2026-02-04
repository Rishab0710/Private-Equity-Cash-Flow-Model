'use client';

import { useState, useEffect, useMemo } from 'react';
import { AssumptionsPanel } from '@/components/app/portfolio-growth/assumptions-panel';
import { GrowthChart } from '@/components/app/portfolio-growth/growth-chart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { FundSelector } from '@/components/app/dashboard/fund-selector';
import { cn } from '@/lib/utils';
import { Sparkles, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Fund } from '@/lib/types';

const assetClassBaseMetrics: Record<string, { rate: number, stdev: number }> = {
    equities: { rate: 9.0, stdev: 16.0 },
    fixedIncome: { rate: 4.5, stdev: 6.0 },
    cash: { rate: 3.0, stdev: 1.0 },
    realAssets: { rate: 7.0, stdev: 12.0 },
    hedgeFund: { rate: 8.0, stdev: 14.0 },
    privateEquity: { rate: 12.5, stdev: 22.0 },
};

const initialAllocation = {
    equities: 50.0,
    fixedIncome: 25.0,
    cash: 5.0,
    realAssets: 7.5,
    hedgeFund: 5.0,
    privateEquity: 7.5,
};

const allocationProfiles = {
    conservative: { equities: 30, fixedIncome: 50, cash: 10, realAssets: 5, hedgeFund: 2.5, privateEquity: 2.5 },
    moderate: { equities: 50, fixedIncome: 25, cash: 5, realAssets: 7.5, hedgeFund: 5, privateEquity: 7.5 },
    aggressive: { equities: 60, fixedIncome: 10, cash: 2.5, realAssets: 7.5, hedgeFund: 5, privateEquity: 15 },
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
    likelihood,
    valueClassName,
    details
}: { 
    label: string, 
    value: string | number, 
    likelihood?: string,
    valueClassName?: string,
    details?: {
        title: string;
        rate: string;
        stdev: string;
        allocation: { label: string; value: string; percentage: string }[];
    }
}) => {
    return (
        <div className={cn(
            "grid items-center py-1.5 px-3 group hover:bg-muted/30 transition-colors rounded-md",
            likelihood ? "grid-cols-[1fr_1.2fr_1.2fr_auto]" : "grid-cols-[1fr_1fr_auto]"
        )}>
            <p className="text-xs font-medium text-black uppercase tracking-tight">{label}</p>
            
            <p className={cn("text-xs font-bold text-right pr-4", valueClassName)}>{value}</p>

            {likelihood && (
                <p className="text-xs text-black font-medium text-center">{likelihood}</p>
            )}

            <div className="flex justify-end">
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
                                    <div className="divide-y divide-border text-xs bg-white">
                                        {details.allocation.map((item, i) => (
                                            <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] p-2.5">
                                                <span className="font-medium text-black/70">{item.label}</span>
                                                <span className="font-bold text-black text-right">{item.value}</span>
                                                <span className="font-medium text-black/50 text-right">{item.percentage}</span>
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
};

interface AddFundDialogProps {
  onApply: (data: {
    name: string;
    contribution: number;
    withdrawal: number;
    allocation: Record<string, number>;
    returnVal: number;
    stdev: number;
  }) => void;
}

function AddFundDialog({ onApply }: AddFundDialogProps) {
  const { addFund, setFundId } = usePortfolioContext();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [contribution, setContribution] = useState(0);
  const [withdrawal, setWithdrawal] = useState(0);
  const [returnAssumption, setReturnAssumption] = useState(12.0);
  const [stdevAssumption, setStdevAssumption] = useState(15.0);
  const [allocation, setAllocation] = useState<Record<string, number>>(initialAllocation);

  const handleSave = () => {
    const id = `custom-${Date.now()}`;
    const newFund: Fund = {
      id,
      name,
      commitment: 0, // Not explicitly used for the growth model logic requested
      strategy: 'Other',
      region: 'North America',
      vintageYear: new Date().getFullYear(),
      investmentPeriod: 5,
      fundLife: 10,
      latestNav: 0,
      forecastIRR: returnAssumption / 100,
    };
    addFund(newFund);
    setFundId(id);
    
    // Apply new data to the screen model
    onApply({
      name,
      contribution,
      withdrawal,
      allocation,
      returnVal: returnAssumption,
      stdev: stdevAssumption,
    });
    
    setOpen(false);
  };

  const handleAllocationChange = (key: string, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setAllocation(prev => ({ ...prev, [key]: num }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 border-primary/30 text-primary font-bold uppercase text-[10px] hover:bg-primary/5">
          <Plus className="h-3.5 w-3.5" />
          Add a New Fund
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-highlight font-bold uppercase tracking-tight text-sm">Create New Model Fund</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-black/60">Fund Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Frontier Growth III" className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-black/60">Annual Contribution ($)</Label>
                <Input type="number" value={contribution} onChange={e => setContribution(Number(e.target.value))} className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-black/60">Annual Withdrawal ($)</Label>
                <Input type="number" value={withdrawal} onChange={e => setWithdrawal(Number(e.target.value))} className="h-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-black/60">Mean Return (%)</Label>
                <Input type="number" value={returnAssumption} onChange={e => setReturnAssumption(Number(e.target.value))} className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-black/60">Vol (StDev %)</Label>
                <Input type="number" value={stdevAssumption} onChange={e => setStdevAssumption(Number(e.target.value))} className="h-8 text-xs" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-black/10 overflow-hidden bg-muted/10 p-4">
            <h4 className="text-[10px] font-bold uppercase text-black/60 mb-3 border-b border-black/5 pb-1">Target Allocation Profile</h4>
            <div className="space-y-2">
              {Object.entries(allocation).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-black/70 flex-1 truncate">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <div className="relative w-20">
                    <Input 
                      type="number" 
                      value={val} 
                      onChange={e => handleAllocationChange(key, e.target.value)} 
                      className="h-7 text-right pr-5 text-xs font-bold"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-black/30">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4">
          <Button onClick={handleSave} className="bg-primary text-white font-bold uppercase text-[11px] h-9 px-8">
            <Check className="h-4 w-4 mr-2" />
            Save and Apply to Model
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PortfolioGrowthPage() {
    const { fundId, setFundId, funds, portfolioData } = usePortfolioContext();
    
    const [startingBalance, setStartingBalance] = useState(5000000);
    const [annualContribution, setAnnualContribution] = useState(0);
    const [annualWithdrawal, setAnnualWithdrawal] = useState(0);
    const [annualIncrease, setAnnualIncrease] = useState(0);
    const [investmentPeriod, setInvestmentPeriod] = useState(25);
    const [assetAllocation, setAssetAllocation] = useState<Record<string, number>>(initialAllocation);

    const [chartData, setChartData] = useState<any[] | null>(null);
    const [potentialWealth, setPotentialWealth] = useState<any | null>(null);
    const [likelihoods, setLikelihoods] = useState<any | null>(null);

    const portfolioMetrics = useMemo(() => {
        let totalWeight = 0;
        let weightedRate = 0;
        let weightedStdev = 0;

        Object.entries(assetAllocation).forEach(([key, weight]) => {
            const metrics = assetClassBaseMetrics[key];
            if (metrics) {
                weightedRate += (metrics.rate * weight) / 100;
                weightedStdev += (metrics.stdev * weight) / 100;
                totalWeight += weight;
            }
        });

        if (totalWeight > 0 && Math.abs(totalWeight - 100) > 0.1) {
             weightedRate = (weightedRate / totalWeight) * 100;
             weightedStdev = (weightedStdev / totalWeight) * 100;
        }

        return {
            meanRateOfReturn: weightedRate,
            standardDeviation: weightedStdev,
            totalWeight
        };
    }, [assetAllocation]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (funds && funds.length > 0) {
            let newStartingBalance = 0;
            if (fundId === 'all') {
                newStartingBalance = funds.reduce((sum, fund) => sum + (fund.latestNav ?? 0), 0);
            } else {
                const selectedFund = funds.find(f => f.id === fundId);
                newStartingBalance = selectedFund?.latestNav ?? 0;
            }
            // Ensure demo starts with realistic numbers if context calculation is still pending
            setStartingBalance(newStartingBalance > 0 ? newStartingBalance : 310839559);
        }
    }, [fundId, funds]);

    useEffect(() => {
        const params = {
            startingBalance,
            annualContribution,
            annualWithdrawal,
            annualIncrease,
            investmentPeriod,
            ...portfolioMetrics
        };
        
        const data = generateChartData(params);
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

    }, [startingBalance, annualContribution, annualWithdrawal, annualIncrease, investmentPeriod, portfolioMetrics]);

    const handleAllocationChange = (key: string, value: number) => {
        setAssetAllocation(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyNewFund = (data: {
      contribution: number;
      withdrawal: number;
      allocation: Record<string, number>;
    }) => {
      setAnnualContribution(data.contribution);
      setAnnualWithdrawal(data.withdrawal);
      setAssetAllocation(data.allocation);
    };

    if (!mounted || !chartData || !potentialWealth || !likelihoods || !portfolioData) {
        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Skeleton className="h-7 w-80 max-w-full" />
                    <Skeleton className="h-9 w-[200px]" />
                </div>
                <div className="pt-2">
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
                </div>
            </div>
        );
    }

    const getAllocationDetails = (currentWealth: number, profile: Record<string, number>) => {
        return Object.entries(profile).map(([key, percentage]) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            const val = currentWealth * (percentage / 100);
            return {
                label,
                percentage: `${percentage.toFixed(2)}%`,
                value: formatCurrency(val)
            };
        });
    };

    const currentAllocationDetails = Object.entries(assetAllocation).map(([key, percentage]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        const val = startingBalance * (percentage / 100);
        return {
            label,
            percentage: `${percentage.toFixed(2)}%`,
            value: formatCurrency(val)
        };
    });

  return (
    <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-sm font-semibold tracking-tight text-highlight uppercase">
                Potential Growth of Portfolio Wealth
            </h1>
            <div className="flex items-center gap-2">
              <AddFundDialog onApply={handleApplyNewFund} />
              <FundSelector
                  selectedFundId={fundId}
                  onFundChange={setFundId}
              />
            </div>
        </div>
       <div className="pt-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <AssumptionsPanel 
                        assetAllocation={assetAllocation}
                        onAllocationChange={handleAllocationChange}
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
                    <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1.3fr] gap-6">
                        <div className="divide-y divide-border rounded-lg border border-black/10 overflow-hidden bg-white shadow-sm">
                            <div className="py-2 px-3 bg-muted/30 font-bold text-[9px] text-highlight uppercase tracking-widest border-b">Portfolio Risk Profile</div>
                            <div className="space-y-0.5 py-1">
                                <MetricRow 
                                    label="Mean Rate of Return" 
                                    value={`${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`} 
                                    details={{
                                        title: "Mean Rate of Return",
                                        rate: `${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`,
                                        stdev: `${portfolioMetrics.standardDeviation.toFixed(2)}%`,
                                        allocation: currentAllocationDetails
                                    }}
                                />
                                <MetricRow 
                                    label="Standard Deviation" 
                                    value={`${portfolioMetrics.standardDeviation.toFixed(2)}%`} 
                                    details={{
                                        title: "Standard Deviation (Risk)",
                                        rate: `${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`,
                                        stdev: `${portfolioMetrics.standardDeviation.toFixed(2)}%`,
                                        allocation: currentAllocationDetails
                                    }}
                                />
                                <MetricRow 
                                    label="Total Allocation" 
                                    value={`${portfolioMetrics.totalWeight.toFixed(2)}%`} 
                                    valueClassName={Math.abs(portfolioMetrics.totalWeight - 100) > 0.1 ? "text-red-500" : "text-green-600"}
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-border rounded-lg border border-black/10 overflow-hidden bg-white shadow-sm">
                            <div className="py-2 px-3 bg-muted/30 font-bold text-[9px] text-highlight uppercase tracking-widest border-b">Potential Wealth Outlook</div>
                            <div className="space-y-0.5 py-1">
                                <MetricRow 
                                    label="Conservative" 
                                    value={formatCurrency(potentialWealth.conservative)} 
                                    likelihood={likelihoods.conservative}
                                    valueClassName="text-chart-3" 
                                    details={{
                                        title: "Conservative Outlook",
                                        rate: `${(portfolioMetrics.meanRateOfReturn - 3.5).toFixed(2)}%`,
                                        stdev: `${(portfolioMetrics.standardDeviation * 0.35).toFixed(2)}%`,
                                        allocation: getAllocationDetails(potentialWealth.conservative, allocationProfiles.conservative)
                                    }}
                                />
                                <MetricRow 
                                    label="Moderate" 
                                    value={formatCurrency(potentialWealth.moderate)} 
                                    likelihood={likelihoods.moderate}
                                    valueClassName="text-chart-1" 
                                    details={{
                                        title: "Moderate Outlook",
                                        rate: `${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`,
                                        stdev: `${portfolioMetrics.standardDeviation.toFixed(2)}%`,
                                        allocation: currentAllocationDetails
                                    }}
                                />
                                <MetricRow 
                                    label="Aggressive" 
                                    value={formatCurrency(potentialWealth.aggressive)} 
                                    likelihood={likelihoods.aggressive}
                                    valueClassName="text-chart-2" 
                                    details={{
                                        title: "Aggressive Outlook",
                                        rate: `${(portfolioMetrics.meanRateOfReturn + 2.5).toFixed(2)}%`,
                                        stdev: `${(portfolioMetrics.standardDeviation * 1.4).toFixed(2)}%`,
                                        allocation: getAllocationDetails(potentialWealth.aggressive, allocationProfiles.aggressive)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <GrowthChart data={chartData} likelihoods={likelihoods} />
                </div>
            </div>
       </div>
    </div>
  );
}
