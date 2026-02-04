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
import type { Fund } from '@/lib/types';
import { funds as staticFunds } from '@/lib/data';

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
            "grid items-center py-1 px-3 group hover:bg-muted/30 transition-colors rounded-md",
            likelihood ? "grid-cols-[1fr_1.2fr_1.2fr_auto]" : "grid-cols-[1fr_1fr_auto]"
        )}>
            <p className="text-xs font-medium text-black uppercase tracking-tight">{label}</p>
            <p className={cn("text-xs font-bold text-right pr-4", valueClassName)}>{value}</p>
            {likelihood && <p className="text-xs text-black font-medium text-center">{likelihood}</p>}
            <div className="flex justify-end">
                {details && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all duration-300">
                                <Sparkles className="h-2.5 w-2.5 text-primary" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader><DialogTitle className="text-highlight uppercase text-xs font-bold tracking-tight">{details.title} - Model Assumptions</DialogTitle></DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted/50 rounded-lg border">
                                        <p className="text-[9px] font-bold text-black/60 uppercase">Expected Return</p>
                                        <p className="text-sm font-bold text-black">{details.rate}</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg border">
                                        <p className="text-[9px] font-bold text-black/60 uppercase">Vol (StDev)</p>
                                        <p className="text-sm font-bold text-black">{details.stdev}</p>
                                    </div>
                                </div>
                                <div className="rounded-lg border overflow-hidden">
                                    <div className="bg-muted/30 px-3 py-2 text-[9px] font-bold text-black uppercase border-b tracking-widest">Asset Allocation Details</div>
                                    <div className="divide-y divide-border text-xs bg-white">
                                        {details.allocation.map((item, i) => (
                                            <div key={i} className="grid grid-cols-[1.5fr_1fr_1fr] p-2">
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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [contribution, setContribution] = useState(0);
  const [withdrawal, setWithdrawal] = useState(0);
  const [returnAssumption, setReturnAssumption] = useState(12.0);
  const [stdevAssumption, setStdevAssumption] = useState(15.0);
  const [allocation, setAllocation] = useState<Record<string, number>>(initialAllocation);

  const handleSave = () => {
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
    if (!isNaN(num)) setAllocation(prev => ({ ...prev, [key]: num }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 border-primary/30 text-primary font-bold uppercase text-[9px] hover:bg-primary/5">
          <Plus className="h-3 w-3" /> Add a New Fund
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle className="text-highlight font-bold uppercase tracking-tight text-xs">Create New Model Fund</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold uppercase text-black/60">Fund Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alpha Frontier V" className="h-7 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-black/60">Ann. Contribution ($)</Label>
                <Input type="number" value={contribution} onChange={e => setContribution(Number(e.target.value))} className="h-7 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-black/60">Ann. Withdrawal ($)</Label>
                <Input type="number" value={withdrawal} onChange={e => setWithdrawal(Number(e.target.value))} className="h-7 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-black/60">Return (%)</Label>
                <Input type="number" value={returnAssumption} onChange={e => setReturnAssumption(Number(e.target.value))} className="h-7 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold uppercase text-black/60">Vol (%)</Label>
                <Input type="number" value={stdevAssumption} onChange={e => setStdevAssumption(Number(e.target.value))} className="h-7 text-xs" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-black/10 overflow-hidden bg-muted/10 p-3">
            <h4 className="text-[9px] font-bold uppercase text-black/60 mb-2 border-b border-black/5 pb-1">Target Allocation Model</h4>
            <div className="space-y-1.5">
              {Object.entries(allocation).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-black/70 flex-1 truncate">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  <div className="relative w-16">
                    <Input type="number" value={val} onChange={e => handleAllocationChange(key, e.target.value)} className="h-6 text-right pr-4 text-[10px]" />
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-black/30">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="pt-2"><Button onClick={handleSave} className="bg-primary text-white font-bold uppercase text-[10px] h-8 px-6"><Check className="h-3 w-3 mr-1.5" /> Save and Apply to Model</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PortfolioGrowthPage() {
    const { fundId, setFundId } = usePortfolioContext();
    const [startingBalance, setStartingBalance] = useState(93391123);
    const [annualContribution, setAnnualContribution] = useState(0);
    const [annualWithdrawal, setAnnualWithdrawal] = useState(0);
    const [annualIncrease, setAnnualIncrease] = useState(0);
    const [investmentPeriod, setInvestmentPeriod] = useState(25);
    const [assetAllocation, setAssetAllocation] = useState<Record<string, number>>(initialAllocation);

    const [chartData, setChartData] = useState<any[] | null>(null);
    const [potentialWealth, setPotentialWealth] = useState<any | null>(null);

    const portfolioMetrics = useMemo(() => {
        let weightedRate = 0;
        let weightedStdev = 0;
        let totalWeight = 0;
        Object.entries(assetAllocation).forEach(([key, weight]) => {
            const m = assetClassBaseMetrics[key];
            if (m) {
                weightedRate += (m.rate * weight) / 100;
                weightedStdev += (m.stdev * weight) / 100;
                totalWeight += weight;
            }
        });
        return { meanRateOfReturn: weightedRate, standardDeviation: weightedStdev, totalWeight };
    }, [assetAllocation]);

    useEffect(() => {
        const selectedFund = staticFunds.find(f => f.id === fundId);
        if (selectedFund) setStartingBalance(selectedFund.latestNav || selectedFund.commitment * 0.6);
        else if (fundId === 'all') setStartingBalance(staticFunds.reduce((s, f) => s + (f.latestNav || f.commitment * 0.6), 0));
    }, [fundId]);

    useEffect(() => {
        const data = generateChartData({ startingBalance, annualContribution, annualWithdrawal, annualIncrease, investmentPeriod, ...portfolioMetrics });
        setChartData(data);
        const last = data[data.length - 1];
        if (last) setPotentialWealth({ conservative: last.conservative * 1000000, moderate: last.moderate * 1000000, aggressive: last.aggressive * 1000000 });
    }, [startingBalance, annualContribution, annualWithdrawal, annualIncrease, investmentPeriod, portfolioMetrics]);

    const handleApplyNewFund = (data: any) => {
      setAnnualContribution(data.contribution);
      setAnnualWithdrawal(data.withdrawal);
      setAssetAllocation(data.allocation);
      setStartingBalance(10000000); // Default seed for new model fund
    };

    if (!chartData || !potentialWealth) return <Skeleton className="h-screen w-full" />;

    const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
    const getAllocationDetails = (current: number, p: Record<string, number>) => Object.entries(p).map(([k, pct]) => ({ label: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()), percentage: `${pct}%`, value: formatCurrency(current * (pct / 100)) }));

  return (
    <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-xs font-semibold tracking-tight text-highlight uppercase">Potential Growth of Portfolio Wealth</h1>
            <div className="flex items-center gap-2">
              <AddFundDialog onApply={handleApplyNewFund} />
              <FundSelector selectedFundId={fundId} onFundChange={setFundId} />
            </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <AssumptionsPanel 
                assetAllocation={assetAllocation} onAllocationChange={(k, v) => setAssetAllocation(p => ({ ...p, [k]: v }))}
                startingBalance={startingBalance} annualContribution={annualContribution} setAnnualContribution={setAnnualContribution}
                annualWithdrawal={annualWithdrawal} setAnnualWithdrawal={setAnnualWithdrawal} annualIncrease={annualIncrease}
                setAnnualIncrease={setAnnualIncrease} investmentPeriod={investmentPeriod} setInvestmentPeriod={setInvestmentPeriod}
            />
            <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-4">
                    <div className="divide-y divide-border rounded-lg border border-black/10 overflow-hidden bg-white shadow-sm">
                        <div className="py-2 px-3 bg-muted/30 font-bold text-[9px] text-highlight uppercase tracking-widest border-b">Portfolio Risk Profile</div>
                        <div className="py-1">
                            <MetricRow label="Mean Rate of Return" value={`${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`} details={{ title: "Mean Rate of Return", rate: `${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`, stdev: `${portfolioMetrics.standardDeviation.toFixed(2)}%`, allocation: getAllocationDetails(startingBalance, assetAllocation)}} />
                            <MetricRow label="Standard Deviation" value={`${portfolioMetrics.standardDeviation.toFixed(2)}%`} details={{ title: "Standard Deviation (Risk)", rate: `${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`, stdev: `${portfolioMetrics.standardDeviation.toFixed(2)}%`, allocation: getAllocationDetails(startingBalance, assetAllocation)}} />
                            <MetricRow label="Total Allocation" value={`${portfolioMetrics.totalWeight.toFixed(1)}%`} valueClassName={Math.abs(portfolioMetrics.totalWeight - 100) > 0.1 ? "text-red-500" : "text-green-600"} />
                        </div>
                    </div>
                    <div className="divide-y divide-border rounded-lg border border-black/10 overflow-hidden bg-white shadow-sm">
                        <div className="py-2 px-3 bg-muted/30 font-bold text-[9px] text-highlight uppercase tracking-widest border-b">Potential Wealth Outlook</div>
                        <div className="py-1">
                            <MetricRow label="Conservative" value={formatCurrency(potentialWealth.conservative)} likelihood="80% Likelihood" valueClassName="text-chart-3" details={{ title: "Conservative Outlook", rate: `${(portfolioMetrics.meanRateOfReturn - 3.5).toFixed(2)}%`, stdev: `${(portfolioMetrics.standardDeviation * 0.35).toFixed(2)}%`, allocation: getAllocationDetails(potentialWealth.conservative, allocationProfiles.conservative)}} />
                            <MetricRow label="Moderate" value={formatCurrency(potentialWealth.moderate)} likelihood="50% Likelihood" valueClassName="text-chart-1" details={{ title: "Moderate Outlook", rate: `${portfolioMetrics.meanRateOfReturn.toFixed(2)}%`, stdev: `${portfolioMetrics.standardDeviation.toFixed(2)}%`, allocation: getAllocationDetails(potentialWealth.moderate, assetAllocation)}} />
                            <MetricRow label="Aggressive" value={formatCurrency(potentialWealth.aggressive)} likelihood="33% Likelihood" valueClassName="text-chart-2" details={{ title: "Aggressive Outlook", rate: `${(portfolioMetrics.meanRateOfReturn + 2.5).toFixed(2)}%`, stdev: `${(portfolioMetrics.standardDeviation * 1.4).toFixed(2)}%`, allocation: getAllocationDetails(potentialWealth.aggressive, allocationProfiles.aggressive)}} />
                        </div>
                    </div>
                </div>
                <GrowthChart data={chartData} likelihoods={{ conservative: '80% Likelihood', moderate: '50% Likelihood', aggressive: '33% Likelihood' }} />
            </div>
        </div>
    </div>
  );
}
