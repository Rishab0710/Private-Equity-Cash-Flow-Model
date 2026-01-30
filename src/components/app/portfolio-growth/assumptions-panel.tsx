import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AssumptionsPanelProps = {
    assumptions: any;
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

const AssetAllocationRow = ({ label, percentage, balance }: { label: string, percentage: string, balance: number }) => {
    const value = balance * (parseFloat(percentage) / 100);
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
    
    return (
        <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-1.5 px-3">
            <p className={`text-xs text-foreground text-black`}>{label}</p>
            <p className="text-xs font-semibold text-right">{formatCurrency(value)}</p>
            <p className="text-xs font-semibold text-right">{percentage}</p>
        </div>
    );
};

export function AssumptionsPanel({ 
    assumptions, 
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

    const sortedAllocations = Object.entries(assumptions.assetAllocation)
        .map(([key, percentage]) => {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
            return {
                label,
                percentage: percentage as string,
                value: startingBalance * (parseFloat(percentage as string) / 100)
            }
        })
        .sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-6">
            <div className="divide-y divide-border rounded-lg border p-2">
                <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="starting-balance" className="text-xs font-normal">Starting Balance</Label>
                    <div className="relative">
                        <Input
                            id="starting-balance"
                            type="text"
                            value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(startingBalance)}
                            disabled
                            className="h-7 w-36 pl-3 text-xs text-left"
                        />
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="annual-contribution" className="text-xs font-normal">Annual Contribution</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-xs">$</span>
                        <Input id="annual-contribution" type="number" value={annualContribution} onChange={e => setAnnualContribution(Number(e.target.value))} className="h-7 w-36 pl-7 text-xs text-left" />
                    </div>
                </div>
                 <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="annual-withdrawal" className="text-xs font-normal">Annual Withdrawal</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-xs">$</span>
                        <Input id="annual-withdrawal" type="number" value={annualWithdrawal} onChange={e => setAnnualWithdrawal(Number(e.target.value))} className="h-7 w-36 pl-7 text-xs text-left" />
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="annual-increase" className="text-xs font-normal">Annual Increase</Label>
                    <div className="relative">
                        <Input id="annual-increase" type="number" value={annualIncrease} onChange={e => setAnnualIncrease(Number(e.target.value))} className="h-7 w-36 pr-7 text-xs text-left" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground text-xs">%</span>
                    </div>
                </div>
                <div className="flex justify-between items-center py-1.5">
                    <Label htmlFor="investment-period" className="text-xs font-normal">Investment Period</Label>
                    <div className="relative">
                        <Input id="investment-period" type="number" value={investmentPeriod} onChange={e => setInvestmentPeriod(Number(e.target.value))} className="h-7 w-36 pr-16 text-xs text-left" />
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
                {sortedAllocations.map(alloc => (
                    <AssetAllocationRow 
                        key={alloc.label}
                        label={alloc.label} 
                        percentage={alloc.percentage} 
                        balance={startingBalance} 
                    />
                ))}
                <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-2 px-3 font-bold text-foreground">
                    <p className="text-sm">Total</p>
                    <p className="text-sm text-right">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(startingBalance)}
                    </p>
                    <p className="text-sm text-right">
                        {sortedAllocations.reduce((sum, p) => sum + parseFloat(p.percentage), 0).toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    )
}
