import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MetricRow = ({ label, value, isSub = false }: { label: string, value: string | number, isSub?: boolean }) => (
    <div className={`flex justify-between items-center py-1.5 ${isSub ? 'pl-4' : ''}`}>
        <p className={`text-xs ${isSub ? 'text-muted-foreground' : 'font-medium'}`}>{label}</p>
        <p className="text-xs font-semibold">{value}</p>
    </div>
);

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
                <div className="flex justify-between items-center py-1.5 px-4 font-medium">
                     <p className="text-xs">Asset Allocation</p>
                     <p className="text-xs">Current</p>
                </div>
                 <MetricRow label="Equities" value={assumptions.assetAllocation.equities} isSub />
                 <MetricRow label="Fixed Income" value={assumptions.assetAllocation.fixedIncome} isSub />
                 <MetricRow label="Cash" value={assumptions.assetAllocation.cash} isSub />
                 <MetricRow label="Real Assets" value={assumptions.assetAllocation.realAssets} isSub />
                 <MetricRow label="Hedge Fund Strategies" value={assumptions.assetAllocation.hedgeFundStrategies} isSub />
                 <MetricRow label="Private Equity" value={assumptions.assetAllocation.privateEquity} isSub />
            </div>
        </div>
    )
}
