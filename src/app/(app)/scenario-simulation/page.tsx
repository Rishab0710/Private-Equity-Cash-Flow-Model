'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Zap, ShieldAlert, TrendingDown, ChevronsUp, Waves, CircleDollarSign, BrainCircuit, 
    TrendingUp, Landmark, Shield, BarChart, Hourglass, Activity, Clock, Rocket, 
    ClipboardList, Search, Briefcase, ShieldCheck, Gauge, FileBarChart, Building, 
    Filter, Target, FileWarning, ListTodo, Ban, Sailboat, Sparkles, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPortfolioData } from '@/lib/data';
import type { PortfolioData, Fund } from '@/lib/types';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


type ScenarioId = 'base' | 'recession' | 'risingRates' | 'stagflation' | 'liquidityCrunch';

type AssumptionValue = {
  value: string;
  description: string;
};

type ScenarioDetails = {
  id: ScenarioId;
  name: string;
  description: string;
  badge: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ElementType;
  };
  implications: {
    growth: string;
    risk: string;
    liquidity: string;
    cashflowTiming: string;
    keyOpportunities: string;
  };
  assumptions: {
    growthOutlook: AssumptionValue;
    volatility: AssumptionValue;
    inflation: AssumptionValue;
    liquidity: AssumptionValue;
    cashflowTiming: AssumptionValue;
  };
};

const calculateQuarterlyIRR = (cashflows: number[], tvpiForFallback: number): number => {
    const maxIterations = 50;
    const tolerance = 1e-6;
    const calculateNPV = (rate: number) => cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);

    let lowRate = -0.9999; 
    let highRate = 5.0; 

    let npvAtLow = calculateNPV(lowRate);
    let npvAtHigh = calculateNPV(highRate);

    if (npvAtLow * npvAtHigh > 0) {
        const durationYears = cashflows.length / 4;
        if (tvpiForFallback <= 0 || durationYears <= 0) return 0;
        const annualisedRoughIrr = Math.pow(tvpiForFallback, 1 / (durationYears * 0.6)) - 1;
        return Math.pow(1 + annualisedRoughIrr, 1/4) - 1; 
    }

    for (let i = 0; i < maxIterations; i++) {
        let midRate = (lowRate + highRate) / 2;
        let npvAtMid = calculateNPV(midRate);
        if (Math.abs(npvAtMid) < tolerance) return midRate;
        if (npvAtLow * npvAtMid < 0) {
            highRate = midRate;
            npvAtHigh = npvAtMid;
        } else {
            lowRate = midRate;
            npvAtLow = npvAtMid;
        }
    }
    return (lowRate + highRate) / 2;
};

const scenarios: Record<ScenarioId, ScenarioDetails> = {
  base: {
    id: 'base',
    name: 'Base Case',
    description: 'A balanced projection assuming moderate growth and stable market conditions.',
    badge: { text: 'Balanced', variant: 'default', icon: Zap },
    implications: {
      growth: 'Steady, in-line with long-term expectations.',
      risk: 'Market-level risk with standard volatility.',
      liquidity: 'Predictable contributions and withdrawals.',
      cashflowTiming: 'Evenly-paced cash flows.',
      keyOpportunities: 'Execute long-term plan; compounding work effectively.'
    },
    assumptions: {
      growthOutlook: { value: 'Neutral', description: 'Economic growth aligns with long-term historical averages.'},
      volatility: { value: 'Medium', description: 'Standard market fluctuations without prolonged extreme swings.' },
      inflation: { value: 'Low', description: 'Inflation remains around central bank targets of 2-3%.' },
      liquidity: { value: 'Abundant', description: 'Capital markets open normally, allowing easy transaction flow.' },
      cashflowTiming: { value: 'Evenly-paced', description: 'Predictable, steady pattern over the fund\'s life.' },
    },
  },
  recession: {
    id: 'recession',
    name: 'Recession & Recovery',
    description: 'Models a sharp economic downturn followed by a gradual recovery.',
    badge: { text: 'Stress Test', variant: 'destructive', icon: TrendingDown },
    implications: {
      growth: 'Initial NAV markdowns and delayed exits.',
      risk: 'Elevated volatility and potential for capital loss.',
      liquidity: 'Withdrawals slow; GPs may accelerate calls.',
      cashflowTiming: 'Return profile becomes highly back-loaded.',
      keyOpportunities: 'Deploy "dry powder" at attractive valuations.'
    },
    assumptions: {
      growthOutlook: { value: 'Negative', description: 'Economic contraction with reduced corporate earnings.' },
      volatility: { value: 'High', description: 'Sharp market movements and heightened investor fear.' },
      inflation: { value: 'Low', description: 'Recessions are typically disinflationary as demand collapses.' },
      liquidity: { value: 'Stressed', description: 'Credit markets tighten; M&A and IPO markets may freeze.' },
      cashflowTiming: { value: 'Back-loaded', description: 'Withdrawals delayed to the latter half of fund life.' },
    },
  },
  risingRates: {
    id: 'risingRates',
    name: 'Rising Rates',
    description: 'Persistent interest rate hikes impacting valuations.',
    badge: { text: 'Valuation Risk', variant: 'secondary', icon: CircleDollarSign },
    implications: {
      growth: 'Lower exit multiples and compressed NAV growth.',
      risk: 'High sensitivity for long-duration assets.',
      liquidity: 'Deal activity slows, delaying exits.',
      cashflowTiming: 'Back-loaded flows as price discovery stalls.',
      keyOpportunities: 'Favors operational value creation over leverage.'
    },
    assumptions: {
      growthOutlook: { value: 'Negative', description: 'Higher borrowing costs cool economic activity.' },
      volatility: { value: 'Medium', description: 'Markets re-price assets to reflect new interest rates.' },
      inflation: { value: 'Elevated', description: 'Persistent, above-target inflation.' },
      liquidity: { value: 'Tight', description: 'Liquidity becomes less available and more expensive.' },
      cashflowTiming: { value: 'Back-loaded', description: 'Delayed M&A pushes out distributions.' },
    },
  },
  stagflation: {
    id: 'stagflation',
    name: 'Inflation / Stagflation',
    description: 'High inflation and low growth eroding real returns.',
    badge: { text: 'Erosion Risk', variant: 'secondary', icon: ShieldAlert },
     implications: {
      growth: 'Real returns compressed; pricing power critical.',
      risk: 'Margin compression as costs are hard to pass on.',
      liquidity: 'Central banks tighten, restricting liquidity.',
      cashflowTiming: 'Real value diminished by high inflation.',
      keyOpportunities: 'Real assets and pricing power leaders can outperform.'
    },
    assumptions: {
      growthOutlook: { value: 'Negative', description: 'Growth stagnates while prices continue to rise.' },
      volatility: { value: 'High', description: 'Uncertainty about policy responses leads to volatility.' },
      inflation: { value: 'High', description: 'Persistent, eroding purchasing power.' },
      liquidity: { value: 'Stressed', description: 'Tightening drains liquidity from the system.' },
      cashflowTiming: { value: 'Evenly-paced', description: 'Timing remains but real value is eroded.' },
    },
  },
  liquidityCrunch: {
    id: 'liquidityCrunch',
    name: 'Liquidity Crunch',
    description: 'Capital markets freeze, halting withdrawals.',
    badge: { text: 'Cashflow Stress', variant: 'destructive', icon: Waves },
     implications: {
      growth: 'Secondary market evaporates; M&A stops.',
      risk: 'Risk of defaults and forced asset sales.',
      liquidity: 'Extreme stress; withdrawals halt.',
      cashflowTiming: 'Calls accelerated to defend assets.',
      keyOpportunities: 'Deep discounts on high-quality secondaries.'
    },
    assumptions: {
      growthOutlook: { value: 'Negative', description: 'Triggered by a systemic financial shock.' },
      volatility: { value: 'High', description: 'Panic selling and correlation across assets.' },
      inflation: { value: 'Low', description: 'Deflationary as credit evaporates.' },
      liquidity: { value: 'Stressed', description: 'Interbank lending freezes.' },
      cashflowTiming: { value: 'Front-loaded', description: 'Calls accelerated to shore up portfolios.' },
    },
  },
};

const formatCurrency = (value: number) => {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) return sign + `$${(absValue / 1_000_000_000).toFixed(1)}B`;
    if (absValue >= 1_000_000) return sign + `$${(absValue / 1_000_000).toFixed(1)}M`;
    if (absValue >= 1_000) return sign + `$${(absValue / 1_000).toFixed(0)}K`;
    return sign + `$${absValue.toFixed(0)}`;
};

const ImplicationCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => (
    <div className="flex items-start gap-2 rounded-lg border p-2 bg-card h-full">
        <Icon className={`h-4 w-4 shrink-0 ${color} mt-0.5`} />
        <div>
            <h4 className="font-semibold text-black mb-0.5 text-xs">{title}</h4>
            <p className="text-xs text-black leading-tight">{description}</p>
        </div>
    </div>
);


const ScenarioVisualizationChart = ({ portfolioData }: { portfolioData: PortfolioData | null }) => {
    const combinedData = useMemo(() => {
        if (!portfolioData) return [];
        return portfolioData.cashflowForecast.map(cf => {
            const navDataPoint = portfolioData.navProjection.find(nd => nd.date === cf.date);
            const liqDataPoint = portfolioData.liquidityForecast.find(ld => ld.date === cf.date);
            return { 
                date: cf.date,
                contribution: -cf.capitalCall, 
                withdrawal: cf.distribution, 
                nav: navDataPoint?.nav,
                liquidityBalance: liqDataPoint?.liquidityBalance,
            };
        });
    }, [portfolioData]);

    if (!portfolioData) return <Skeleton className="h-80 w-full" />;

    const chartConfig = {
        contribution: { label: 'Contributions', color: 'hsl(var(--chart-1))' },
        withdrawal: { label: 'Withdrawals', color: 'hsl(var(--chart-2))' },
        nav: { label: 'Portfolio Value', color: 'hsl(var(--chart-4))' },
        liquidityBalance: { label: 'Liquidity Balance', color: 'hsl(var(--chart-3))'},
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base font-semibold text-highlight">Scenario Visualization</CardTitle></CardHeader>
            <CardContent className="h-[350px] -ml-2">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ComposedChart data={combinedData} margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => format(new Date(value), 'MMM yy')} interval={5} />
                        <YAxis yAxisId="left" tickFormatter={formatCurrency} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} tickLine={false} axisLine={false} />
                        <Tooltip 
                            content={<ChartTooltipContent 
                                labelFormatter={(label) => format(new Date(label), 'MMM yyyy')} 
                                indicator="dot" 
                                formatter={(value, name) => {
                                    const config = chartConfig[name as keyof typeof chartConfig];
                                    if (!config) return null;
                                    return (
                                       <div className="flex w-full items-center justify-between gap-4">
                                          <div className="flex flex-shrink-0 items-center gap-2">
                                             <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: config.color}}/>
                                             <span>{config.label}</span>
                                          </div>
                                          <span className="font-bold text-black ml-4">{formatCurrency(value as number)}</span>
                                       </div>
                                    )
                                }}
                            />} 
                        />
                        <Legend />
                        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" />
                        <Bar yAxisId="left" dataKey="withdrawal" name="withdrawal" fill="var(--color-withdrawal)" stackId="stack" radius={[2, 2, 0, 0]} />
                        <Bar yAxisId="left" dataKey="contribution" name="contribution" fill="var(--color-contribution)" stackId="stack" radius={[0, 0, 2, 2]} />
                        <Line yAxisId="right" type="monotone" dataKey="nav" stroke="var(--color-nav)" strokeWidth={2} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="liquidityBalance" stroke="var(--color-liquidityBalance)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

const ScenarioOutcomes = ({ portfolioData, totalCommitment }: { portfolioData: PortfolioData | null, totalCommitment: number }) => {
    if (!portfolioData) return <Skeleton className="h-full min-h-[300px] lg:col-span-1" />;

    const { kpis, navProjection, liquidityForecast, cashflowForecast } = portfolioData;
    const cumulativeCalls = cashflowForecast.reduce((s, c) => s + c.capitalCall, 0);
    const cumulativeDists = cashflowForecast.reduce((s, c) => s + c.distribution, 0);
    const endingValue = navProjection[navProjection.length-1]?.nav || 0;
    const tvpi = cumulativeCalls > 0 ? (endingValue + cumulativeDists) / cumulativeCalls : 0;
    
    const irrCashflows = cashflowForecast.map(cf => cf.netCashflow);
    if (irrCashflows.length > 0) irrCashflows[irrCashflows.length - 1] += endingValue;
    const firstCfIndex = irrCashflows.findIndex(cf => cf !== 0);
    const finalIrrCashflows = firstCfIndex > -1 ? irrCashflows.slice(firstCfIndex) : [];
    const itdIrr = finalIrrCashflows.length > 1 ? (Math.pow(1 + calculateQuarterlyIRR(finalIrrCashflows, tvpi), 4) - 1) : 0;

    const peakGap = Math.max(0, ...liquidityForecast.map(l => l.fundingGap));
    const simulatedPeakPressure = Math.max(Math.abs(kpis.peakProjectedOutflow.value), peakGap > 0 ? peakGap * 1.2 : 0);
    const pressure = simulatedPeakPressure > totalCommitment * 0.1 ? 'High' : (simulatedPeakPressure > totalCommitment * 0.05 ? 'Medium' : 'Low');
    const breakevenPoint = kpis.breakevenTiming.from !== 'N/A' ? `Year ${new Date(kpis.breakevenTiming.from).getFullYear() - new Date().getFullYear() + 1}` : 'N/A';
    
    return (
        <Card className="lg:col-span-1">
             <CardHeader><CardTitle className="text-base font-semibold text-highlight">Scenario Outcomes</CardTitle></CardHeader>
             <CardContent className="space-y-3">
                 <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <Landmark className="h-6 w-6 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-black">Ending Value</p>
                        <p className={`text-xl font-bold ${tvpi < 1.5 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(endingValue)}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <TrendingUp className="h-6 w-6 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-black">ITD IRR</p>
                        <p className={`text-xl font-bold ${itdIrr < 0.08 ? 'text-red-500' : 'text-green-500'}`}>{`${(itdIrr * 100).toFixed(1)}%`}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <Shield className="h-6 w-6 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-black">Liquidity Pressure</p>
                        <p className={`text-xl font-bold ${pressure === 'High' ? 'text-red-500' : 'text-green-500'}`}>{pressure}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <Sailboat className="h-6 w-6 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-black">Breakeven Point</p>
                        <p className="text-xl font-bold">{breakevenPoint}</p>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
}

const NarrativeInsights = ({ scenarioId }: { scenarioId: ScenarioId }) => {
    const insight = useMemo(() => ({
        base: { title: "Stay the Course", summary: "Balanced J-curve with moderate growth and predictable flows.", points: [{ icon: Activity, text: "Growth tracks long-term market averages.", color: 'text-blue-500' }, { icon: Landmark, text: "Cash flows are evenly paced.", color: 'text-blue-500' }] },
        recession: { title: "Short-term Pain, Long-term Gain?", summary: "Initial markdowns creating early pressure but fueling powerful back-ended recovery.", points: [{ icon: TrendingDown, text: "Initial markdowns pause withdrawals.", color: 'text-red-500' }, { icon: ChevronsUp, text: "Strong returns from down-market deployment.", color: 'text-green-500' }] },
        risingRates: { title: "A Slower Grind", summary: "Valuation multiple compression slowing NAV growth and exit pace.", points: [{ icon: CircleDollarSign, text: "Multiples compress as rates rise.", color: 'text-yellow-600' }, { icon: Hourglass, text: "Exit markets cool, delaying realizations.", color: 'text-yellow-600' }] },
        stagflation: { title: "The Real Return Squeeze", summary: "Nominal growth mask eroding real returns. Pricing power is critical.", points: [{ icon: ShieldAlert, text: "Inflation erodes real return value.", color: 'text-red-500' }, { icon: Waves, text: "System-wide liquidity restrictions.", color: 'text-red-500' }] },
        liquidityCrunch: { title: "Cash is King", summary: "Systemic halt in exit markets requiring defensive cash preservation.", points: [{ icon: Waves, text: "Withdrawals halt entirely in exit freeze.", color: 'text-red-500' }, { icon: Shield, text: "Survival focus over short-term growth.", color: 'text-yellow-600' }] },
    }[scenarioId]), [scenarioId]);

    return (
        <Card>
             <CardHeader><CardTitle className="text-base font-semibold text-highlight">Narrative Insights</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-black">{insight.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {insight.points.map((p, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <p.icon className={`h-5 w-5 mt-0.5 shrink-0 ${p.color}`} />
                            <p className="text-sm text-black flex-1">{p.text}</p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
}

const NextStepsRecommendations = ({ scenarioId }: { scenarioId: ScenarioId }) => {
    const rec = useMemo(() => ({
        base: { title: "Stay the Course & Monitor", summary: "Maintain discipline and track progress against goals.", points: [{ icon: TrendingUp, text: "Review against baseline regularly.", color: 'text-blue-500' }, { icon: ClipboardList, text: "Align cash needs with withdrawal schedule.", color: 'text-blue-500' }] },
        recession: { title: "Manage Liquidity", summary: "Survive stress while preparing for down-market opportunities.", points: [{ icon: ShieldCheck, text: "Ensure liquidity for accelerated calls.", color: 'text-red-500' }, { icon: Search, text: "Evaluate top-tier commitments at lower valuations.", color: 'text-yellow-600' }] },
        risingRates: { title: "Focus on Value Creation", summary: "Returns scarcity requires skilled operational value-add.", points: [{ icon: Gauge, text: "Review long-duration asset exposure.", color: 'text-yellow-600' }, { icon: BrainCircuit, text: "Prioritize operational experts.", color: 'text-blue-500' }] },
        stagflation: { title: "Prioritize Real Returns", summary: "Assets with pricing power and inflation hedges are critical.", points: [{ icon: Building, text: "Increase real asset/infra allocation.", color: 'text-green-500' }, { icon: Target, text: "Set goals in real (inflation-adjusted) terms.", color: 'text-yellow-600' }] },
        liquidityCrunch: { title: "Cash Preservation", summary: "Defensive positioning to weather a market freeze.", points: [{ icon: FileWarning, text: "Confirm available credit lines immediately.", color: 'text-red-500' }, { icon: Ban, text: "Halt new non-essential commitments.", color: 'text-yellow-600' }] },
    }[scenarioId]), [scenarioId]);

    return (
        <Card>
             <CardHeader><CardTitle className="text-base font-semibold text-highlight">Recommendations</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{rec.title}</h4>
                    <p className="text-sm text-black">{rec.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {rec.points.map((p, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <p.icon className={`h-5 w-5 mt-0.5 shrink-0 ${p.color}`} />
                            <p className="text-sm text-black flex-1">{p.text}</p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
};

const ScenarioComparisonDialog = ({ funds }: { funds: Fund[] }) => {
    const [selectedIds, setSelectedIds] = useState<ScenarioId[]>(['base', 'recession']);
    const totalCommitment = useMemo(() => funds.reduce((s, f) => s + f.commitment, 0), [funds]);

    const comparisonData = useMemo(() => {
        return selectedIds.map(id => {
            const { portfolio } = getPortfolioData(id, undefined, new Date());
            const calls = portfolio.cashflowForecast.reduce((s, c) => s + c.capitalCall, 0);
            const dists = portfolio.cashflowForecast.reduce((s, c) => s + c.distribution, 0);
            const endVal = portfolio.navProjection[portfolio.navProjection.length-1]?.nav || 0;
            const tvpi = calls > 0 ? (endVal + dists) / calls : 0;
            const cfs = portfolio.cashflowForecast.map(cf => cf.netCashflow);
            if (cfs.length > 0) cfs[cfs.length - 1] += endVal;
            const firstIdx = cfs.findIndex(v => v !== 0);
            const fCfs = firstIdx > -1 ? cfs.slice(firstIdx) : [];
            const irr = fCfs.length > 1 ? (Math.pow(1 + calculateQuarterlyIRR(fCfs, tvpi), 4) - 1) : 0;
            return { id, name: scenarios[id].name, endVal, irr, tvpi };
        });
    }, [selectedIds]);

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>Compare Scenarios</DialogTitle></DialogHeader>
            <div className="grid grid-cols-5 gap-6 mt-4">
                <div className="col-span-1 border-r pr-4 space-y-2">
                    <h4 className="font-semibold text-sm">Select Scenarios</h4>
                    {Object.values(scenarios).map(s => (
                        <div key={s.id} className="flex items-center gap-2">
                            <Checkbox id={`comp-${s.id}`} checked={selectedIds.includes(s.id)} onCheckedChange={(checked) => setSelectedIds(prev => checked ? (prev.length < 4 ? [...prev, s.id] : prev) : (prev.length > 2 ? prev.filter(id => id !== s.id) : prev))} />
                            <label htmlFor={`comp-${s.id}`} className="text-sm font-medium">{s.name}</label>
                        </div>
                    ))}
                </div>
                <div className="col-span-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Metric</TableHead>
                                {comparisonData.map(d => <TableHead key={d.id} className="text-center">{d.name}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Ending Value</TableCell>
                                {comparisonData.map(d => <TableCell key={d.id} className="text-center">{formatCurrency(d.endVal)}</TableCell>)}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">ITD IRR</TableCell>
                                {comparisonData.map(d => <TableCell key={d.id} className="text-center">{`${(d.irr * 100).toFixed(1)}%`}</TableCell>)}
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">TVPI</TableCell>
                                {comparisonData.map(d => <TableCell key={d.id} className="text-center">{`${d.tvpi.toFixed(2)}x`}</TableCell>)}
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DialogContent>
    );
};


export default function ScenarioSimulationPage() {
    const { scenario: selectedScenarioId, setScenario: setSelectedScenarioId, portfolioData, funds } = usePortfolioContext();
    const totalCommitment = useMemo(() => funds.reduce((sum, fund) => sum + fund.commitment, 0), [funds]);
    const selectedScenario = scenarios[selectedScenarioId];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <h1 className="text-sm font-semibold tracking-tight text-highlight flex items-center gap-2 uppercase">
                            <BrainCircuit className="h-6 w-6" />
                            Scenario Simulation
                        </h1>
                        <Select value={selectedScenarioId} onValueChange={(value) => setSelectedScenarioId(value as ScenarioId)}>
                            <SelectTrigger className="w-[180px] bg-secondary/50 h-9 text-xs">
                                <SelectValue placeholder="Select Scenario" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(scenarios).map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        <div className="flex items-center gap-2">
                                            <s.badge.icon className="h-4 w-4" />
                                            <span>{s.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedScenario && (
                        <div className="flex items-center gap-3 text-xs text-black flex-grow min-w-0">
                            <Badge variant={selectedScenario.badge.variant}>{selectedScenario.badge.text}</Badge>
                            <p className="truncate text-black">{selectedScenario.description}</p>
                        </div>
                    )}
                    <Dialog>
                        <DialogTrigger asChild><Button variant="outline">Compare Scenarios</Button></DialogTrigger>
                        <ScenarioComparisonDialog funds={funds} />
                    </Dialog>
                </CardContent>
            </Card>

            {selectedScenario && (
                <Card>
                    <CardContent className="pt-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                            <ImplicationCard icon={TrendingUp} title="Growth" description={selectedScenario.implications.growth} color="text-chart-1" />
                            <ImplicationCard icon={ShieldAlert} title="Risk" description={selectedScenario.implications.risk} color="text-chart-5" />
                            <ImplicationCard icon={Waves} title="Liquidity" description={selectedScenario.implications.liquidity} color="text-chart-4" />
                            <ImplicationCard icon={Clock} title="Cashflow Timing" description={selectedScenario.implications.cashflowTiming} color="text-chart-3" />
                            <ImplicationCard icon={Sparkles} title="Key Opportunities" description={selectedScenario.implications.keyOpportunities} color="text-chart-2" />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ScenarioVisualizationChart portfolioData={portfolioData} />
                <ScenarioOutcomes portfolioData={portfolioData} totalCommitment={totalCommitment} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NarrativeInsights scenarioId={selectedScenarioId} />
                <NextStepsRecommendations scenarioId={selectedScenarioId} />
            </div>
        </div>
    );
}
