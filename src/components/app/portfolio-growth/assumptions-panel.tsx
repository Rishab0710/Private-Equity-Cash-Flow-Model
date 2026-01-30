import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AssumptionsPanelProps = {
    assumptions: any;
    startingBalance: number;
    setStartingBalance: (value: number) => void;
    annualContribution: number;
    setAnnualContribution: (value: number) => void;
    annualWithdrawal: number;
    setAnnualWithdrawal: (value: number) => void;
    annualIncrease: number;
    setAnnualIncrease: (value: number) => void;
    analysisTimePeriod: number;
    setAnalysisTimePeriod: (value: number) => void;
}

const AssetAllocationRow = ({ label, percentage, balance }: { label: string, percentage: string, balance: number }) => {
    const value = balance * (parseFloat(percentage) / 100);
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(val);
    
    return (
        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-1.5 px-3">
            <p className={`text-xs text-muted-foreground`}>{label}</p>
            <p className="text-xs font-semibold text-right">{formatCurrency(value)}</p>
            <p className="text-xs font-semibold text-right">{percentage}</p>
        </div>
    );
};

export function AssumptionsPanel({ 
    assumptions, 
    startingBalance,
    setStartingBalance,
    annualContribution,
    setAnnualContribution,
    annualWithdrawal,
    setAnnualWithdrawal,
    annualIncrease,
    setAnnualIncrease,
    analysisTimePeriod,
    setAnalysisTimePeriod
 }: AssumptionsPanelProps) {
    return (
        <div className="space-y-6">
            <div className="divide-y divide-border rounded-lg border p-2">
                <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="starting-balance" className="text-xs font-medium">Starting Balance</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-xs">$</span>
                        <Input id="starting-balance" type="number" value={startingBalance} onChange={e => setStartingBalance(Number(e.target.value))} className="h-8 w-36 pl-7 text-right text-xs" />
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="annual-contribution" className="text-xs font-medium">Annual Contribution</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-xs">$</span>
                        <Input id="annual-contribution" type="number" value={annualContribution} onChange={e => setAnnualContribution(Number(e.target.value))} className="h-8 w-36 pl-7 text-right text-xs" />
                    </div>
                </div>
                 <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="annual-withdrawal" className="text-xs font-medium">Annual Withdrawal</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-xs">$</span>
                        <Input id="annual-withdrawal" type="number" value={annualWithdrawal} onChange={e => setAnnualWithdrawal(Number(e.target.value))} className="h-8 w-36 pl-7 text-right text-xs" />
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="annual-increase" className="text-xs font-medium">Annual Increase</Label>
                    <div className="relative">
                        <Input id="annual-increase" type="number" value={annualIncrease} onChange={e => setAnnualIncrease(Number(e.target.value))} className="h-8 w-36 pr-7 text-right text-xs" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">%</span>
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="analysis-time-period" className="text-xs font-medium">Analysis Time Period</Label>
                    <div className="relative">
                        <Input id="analysis-time-period" type="number" value={analysisTimePeriod} onChange={e => setAnalysisTimePeriod(Number(e.target.value))} className="h-8 w-36 pr-16 text-right text-xs" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">Years</span>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-border rounded-lg border">
                <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-1.5 px-4 font-medium">
                     <p className="text-xs">Asset Allocation</p>
                     <p className="text-xs text-right">Value</p>
                     <p className="text-xs text-right">Current</p>
                </div>
                <AssetAllocationRow label="Equities" percentage={assumptions.assetAllocation.equities} balance={startingBalance} />
                <AssetAllocationRow label="Fixed Income" percentage={assumptions.assetAllocation.fixedIncome} balance={startingBalance} />
                <AssetAllocationRow label="Cash" percentage={assumptions.assetAllocation.cash} balance={startingBalance} />
                <AssetAllocationRow label="Real Assets" percentage={assumptions.assetAllocation.realAssets} balance={startingBalance} />
                <AssetAllocationRow label="Hedge Fund Strategies" percentage={assumptions.assetAllocation.hedgeFundStrategies} balance={startingBalance} />
                <AssetAllocationRow label="Private Equity" percentage={assumptions.assetAllocation.privateEquity} balance={startingBalance} />
            </div>
        </div>
    )
}
