import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AssumptionsPanelProps = {
    assetAllocation: Record<string, number>;
    onAllocationChange: (key: string, value: number) => void;
    startingBalance: number;
    annualContribution: number;
    setAnnualContribution: (value: number) => void;
    annualWithdrawal: number;
    setAnnualWithdrawal: (value: number) => void;
    annualIncrease: number;
    setAnnualIncrease: (value: number) => void;
    investmentPeriod: number;
    setInvestmentPeriod: (value: number) => void;
}

const AssetAllocationRow = ({ 
    id,
    label, 
    percentage, 
    balance,
    onChange
}: { 
    id: string,
    label: string, 
    percentage: number, 
    balance: number,
    onChange: (val: number) => void
}) => {
    const value = balance * (percentage / 100);
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
    
    const [displayVal, setDisplayVal] = useState(percentage.toString());

    useEffect(() => {
        setDisplayVal(percentage.toString());
    }, [percentage]);

    const handleChange = (val: string) => {
        const cleaned = val.replace(/[^0-9.]/g, '');
        setDisplayVal(cleaned);
        const num = parseFloat(cleaned);
        if (!isNaN(num)) {
            onChange(num);
        } else if (cleaned === '') {
            onChange(0);
        }
    };

    return (
        <div className="grid grid-cols-[1.5fr_1fr_0.8fr] items-center py-1.5 px-3 hover:bg-muted/20 transition-colors">
            <p className="text-[11px] text-black font-medium">{label}</p>
            <p className="text-[11px] font-bold text-right pr-2">{formatCurrency(value)}</p>
            <div className="relative">
                <Input 
                    type="text"
                    value={displayVal}
                    onChange={(e) => handleChange(e.target.value)}
                    className="h-6 text-right pr-4 text-[11px] font-bold border-black/10 focus:ring-1 focus:ring-primary"
                />
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-black/40">%</span>
            </div>
        </div>
    );
};

export function AssumptionsPanel({ 
    assetAllocation,
    onAllocationChange,
    startingBalance,
    annualContribution,
    setAnnualContribution,
    annualWithdrawal,
    setAnnualWithdrawal,
    annualIncrease,
    setAnnualIncrease,
    investmentPeriod,
    setInvestmentPeriod
 }: AssumptionsPanelProps) {

    const formatValue = (val: number) => {
        if (val === 0) return "";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
    };

    const [contributionDisplay, setContributionDisplay] = useState(formatValue(annualContribution));
    const [withdrawalDisplay, setWithdrawalDisplay] = useState(formatValue(annualWithdrawal));

    useEffect(() => {
        setContributionDisplay(formatValue(annualContribution));
    }, [annualContribution]);

    useEffect(() => {
        setWithdrawalDisplay(formatValue(annualWithdrawal));
    }, [annualWithdrawal]);

    const handleDisplayChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
    }
    
    const parseAndSet = (displayValue: string, setter: (val: number) => void) => {
         const numericValue = parseFloat(displayValue.replace(/[^0-9.-]+/g,""));
         if (!isNaN(numericValue)) {
            setter(numericValue);
         } else {
            setter(0);
         }
    }

    const totalAllocation = Object.values(assetAllocation).reduce((sum, val) => sum + val, 0);

    return (
        <div className="space-y-6">
            <div className="divide-y divide-border rounded-lg border border-black/10 bg-white shadow-sm p-2">
                 <div className="py-1 px-2 font-bold text-[9px] text-highlight uppercase tracking-widest mb-1">Portfolio Inflows / Outflows</div>
                <div className="flex justify-between items-center py-1.5 px-2">
                    <Label htmlFor="starting-balance" className="text-[11px] font-medium text-black">Starting Balance</Label>
                    <div className="relative">
                        <Input
                            id="starting-balance"
                            type="text"
                            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(startingBalance)}
                            disabled
                            className="h-7 w-32 pl-3 text-[11px] font-bold text-foreground disabled:opacity-100 bg-muted/20 border-none"
                        />
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2">
                    <Label htmlFor="annual-contribution" className="text-[11px] font-medium text-black">Annual Contribution</Label>
                    <div className="relative">
                        <Input 
                            id="annual-contribution" 
                            type="text" 
                            placeholder="$0"
                            value={contributionDisplay}
                            onChange={handleDisplayChange(setContributionDisplay)}
                            onBlur={() => parseAndSet(contributionDisplay, setAnnualContribution)}
                            className="h-7 w-32 pl-3 text-[11px] font-bold text-left border-black/10"
                        />
                    </div>
                </div>
                 <div className="flex justify-between items-center py-1.5 px-2">
                    <Label htmlFor="annual-withdrawal" className="text-[11px] font-medium text-black">Annual Withdrawal</Label>
                    <div className="relative">
                         <Input 
                            id="annual-withdrawal" 
                            type="text" 
                            placeholder="$0"
                            value={withdrawalDisplay}
                            onChange={handleDisplayChange(setWithdrawalDisplay)}
                            onBlur={() => parseAndSet(withdrawalDisplay, setAnnualWithdrawal)}
                            className="h-7 w-32 pl-3 text-[11px] font-bold text-left border-black/10"
                        />
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2">
                    <Label htmlFor="annual-increase" className="text-[11px] font-medium text-black">Annual Increase (%)</Label>
                    <div className="relative">
                        <Input id="annual-increase" type="number" value={annualIncrease} onChange={e => setAnnualIncrease(Number(e.target.value))} className="h-7 w-32 text-[11px] font-bold text-left border-black/10" />
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5 px-2">
                    <Label htmlFor="investment-period" className="text-[11px] font-medium text-black">Investment Period (Yrs)</Label>
                    <div className="relative">
                        <Input id="investment-period" type="number" value={investmentPeriod} onChange={e => setInvestmentPeriod(Number(e.target.value))} className="h-7 w-32 text-[11px] font-bold text-left border-black/10" />
                    </div>
                </div>
            </div>

            <div className="divide-y divide-border rounded-lg border border-black/10 bg-white shadow-sm overflow-hidden">
                <div className="py-2 px-3 bg-muted/30 font-bold text-[9px] text-highlight uppercase tracking-widest border-b">Asset Allocation Model</div>
                <div className="grid grid-cols-[1.5fr_1fr_0.8fr] items-center py-1.5 px-4 font-bold text-[9px] text-black/60 uppercase bg-muted/10">
                     <span>Asset Class</span>
                     <span className="text-right">Value</span>
                     <span className="text-right">Target %</span>
                </div>
                {Object.entries(assetAllocation).map(([key, percentage]) => (
                    <AssetAllocationRow 
                        key={key}
                        id={key}
                        label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())} 
                        percentage={percentage} 
                        balance={startingBalance} 
                        onChange={(val) => onAllocationChange(key, val)}
                    />
                ))}
                <div className="grid grid-cols-[1.5fr_1fr_0.8fr] items-center py-2.5 px-3 font-bold text-black bg-muted/20 border-t">
                    <p className="text-[11px] uppercase tracking-wider">Total Portfolio</p>
                    <p className="text-[11px] text-right pr-2">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(startingBalance)}
                    </p>
                    <p className={cn(
                        "text-[11px] text-right pr-2",
                        Math.abs(totalAllocation - 100) > 0.1 ? "text-red-500" : "text-green-600"
                    )}>
                        {totalAllocation.toFixed(2)}%
                    </p>
                </div>
            </div>
            
            {Math.abs(totalAllocation - 100) > 0.1 && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-[10px] text-red-600 font-bold uppercase leading-tight">
                        Warning: Portfolio allocation totals {totalAllocation.toFixed(2)}%. Metrics are normalized but re-balancing is recommended for accurate projections.
                    </p>
                </div>
            )}
        </div>
    )
}
