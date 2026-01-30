const MetricRow = ({ label, value, isSub = false }: { label: string, value: string | number, isSub?: boolean }) => (
    <div className={`flex justify-between items-center py-1.5 ${isSub ? 'pl-4' : ''}`}>
        <p className={`text-sm ${isSub ? 'text-muted-foreground' : 'font-medium'}`}>{label}</p>
        <p className="text-sm font-semibold">{value}</p>
    </div>
);

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

type AssumptionsPanelProps = {
    assumptions: any;
    potentialWealth: any;
}

export function AssumptionsPanel({ assumptions, potentialWealth }: AssumptionsPanelProps) {
    return (
        <div className="space-y-6">
            <div className="divide-y divide-border rounded-lg border">
                <MetricRow label="Starting Balance" value={formatCurrency(assumptions.startingBalance)} />
                <MetricRow label="Annual Contribution" value={formatCurrency(assumptions.annualContribution)} />
                <MetricRow label="Annual Increase" value={assumptions.annualIncrease} />
                <MetricRow label="Analysis Time Period" value={assumptions.analysisTimePeriod} />
            </div>

            <div className="divide-y divide-border rounded-lg border">
                <div className="flex justify-between items-center py-1.5 px-4 font-medium">
                     <p className="text-sm">Asset Allocation</p>
                     <p className="text-sm">Current</p>
                </div>
                 <MetricRow label="Equities" value={assumptions.assetAllocation.equities} isSub />
                 <MetricRow label="Fixed Income" value={assumptions.assetAllocation.fixedIncome} isSub />
                 <MetricRow label="Cash" value={assumptions.assetAllocation.cash} isSub />
                 <MetricRow label="Real Assets" value={assumptions.assetAllocation.realAssets} isSub />
                 <MetricRow label="Hedge Fund Strategies" value={assumptions.assetAllocation.hedgeFundStrategies} isSub />
                 <MetricRow label="Private Equity" value={assumptions.assetAllocation.privateEquity} isSub />
            </div>
            
            <div className="divide-y divide-border rounded-lg border">
                <div className="py-1.5 px-4 font-medium"><p className="text-sm">Portfolio</p></div>
                 <MetricRow label="Mean Rate of Return" value={assumptions.portfolio.meanRateOfReturn} isSub/>
                 <MetricRow label="Standard Deviation" value={assumptions.portfolio.standardDeviation} isSub/>
            </div>

             <div className="divide-y divide-border rounded-lg border">
                <div className="py-1.5 px-4 font-medium"><p className="text-sm">Potential Wealth</p></div>
                <MetricRow label="Conservative Outlook" value={formatCurrency(potentialWealth.conservative)} isSub/>
                <MetricRow label="Moderate Outlook" value={formatCurrency(potentialWealth.moderate)} isSub/>
                <MetricRow label="Aggressive Outlook" value={formatCurrency(potentialWealth.aggressive)} isSub/>
            </div>
        </div>
    )
}
