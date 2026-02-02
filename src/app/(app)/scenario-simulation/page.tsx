'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Zap, ShieldAlert, TrendingDown, ChevronsUp, Waves, CircleDollarSign, BrainCircuit, 
    TrendingUp, Landmark, Shield, BarChart, Hourglass, Activity, Clock, Rocket, 
    ClipboardList, Search, Briefcase, ShieldCheck, Gauge, FileBarChart, Building, 
    Filter, Target, FileWarning, ListTodo, Ban, MousePointerSquare, Sailboat, Scaling,
    Lightbulb, Info, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPortfolioData } from '@/lib/data';
import type { PortfolioData, Fund } from '@/lib/types';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Area, Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
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

type Scenario = {
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

// A simple IRR solver using a bisection method. It's more stable than Newton-Raphson.
const calculateQuarterlyIRR = (cashflows: number[], tvpiForFallback: number): number => {
    const maxIterations = 100;
    const tolerance = 1e-6;

    // The function whose root we want to find (NPV)
    const calculateNPV = (rate: number) => cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);

    let lowRate = -0.9999; // Close to -100%
    let highRate = 5.0; // 500% quarterly, should be high enough

    // Initial check to see if a solution exists in the range
    let npvAtLow = calculateNPV(lowRate);
    let npvAtHigh = calculateNPV(highRate);

    if (npvAtLow * npvAtHigh > 0) {
        // Bisection method requires the function to cross zero within the interval.
        // If it doesn't, this indicates an unusual cash flow stream (e.g., all positive or all negative).
        const durationYears = cashflows.length / 4;
        if (tvpiForFallback <= 0 || durationYears <= 0) return 0;
        const avgDuration = durationYears * 0.6; // Heuristic for average investment period
        if (avgDuration <= 0) return 0;
        const annualisedRoughIrr = Math.pow(tvpiForFallback, 1 / avgDuration) - 1;
        return Math.pow(1 + annualisedRoughIrr, 1/4) - 1; // Convert annual rough IRR to quarterly
    }

    for (let i = 0; i < maxIterations; i++) {
        let midRate = (lowRate + highRate) / 2;
        if (midRate <= -1) midRate = -1 + tolerance; // Avoid -1

        let npvAtMid = calculateNPV(midRate);

        if (Math.abs(npvAtMid) < tolerance) {
            return midRate; // Found the root
        }

        // Adjust the interval
        if (npvAtLow * npvAtMid < 0) {
            highRate = midRate;
            npvAtHigh = npvAtMid;
        } else {
            lowRate = midRate;
            npvAtLow = npvAtMid;
        }
    }

    // If max iterations reached, return the best guess
    return (lowRate + highRate) / 2;
};



const scenarios: Record<ScenarioId, Scenario> = {
  base: {
    id: 'base',
    name: 'Base Case',
    description: 'A balanced projection assuming moderate growth and stable market conditions.',
    badge: { text: 'Balanced', variant: 'default', icon: Zap },
    implications: {
      growth: 'Steady, in-line with long-term expectations.',
      risk: 'Market-level risk with standard volatility.',
      liquidity: 'Predictable contributions and withdrawals.',
      cashflowTiming: 'Evenly-paced cash flows with no major surprises.',
      keyOpportunities: 'Execute on the long-term plan and allow compounding to work effectively.'
    },
    assumptions: {
      growthOutlook: { value: 'Neutral', description: 'Assumes economic growth aligns with long-term historical averages, without significant booms or busts.'},
      volatility: { value: 'Medium', description: 'Standard market fluctuations are expected, with no prolonged periods of extreme price swings.' },
      inflation: { value: 'Low', description: 'Inflation remains around central bank targets of 2-3%, preserving real returns.' },
      liquidity: { value: 'Abundant', description: 'Capital markets are open and functioning normally, allowing for easy transaction flow.' },
      cashflowTiming: { value: 'Evenly-paced', description: 'Contributions and withdrawals occur in a predictable, steady pattern over the fund\'s life.' },
    },
  },
  recession: {
    id: 'recession',
    name: 'Recession & Recovery',
    description: 'Models a sharp economic downturn followed by a gradual, U-shaped recovery.',
    badge: { text: 'Stress Test', variant: 'destructive', icon: TrendingDown },
    implications: {
      growth: 'Initial NAV markdowns and delayed exits, but potential for strong returns during recovery.',
      risk: 'Significantly elevated volatility and potential for permanent capital loss in weaker assets.',
      liquidity: 'Withdrawals slow dramatically while GPs may accelerate contributions to fund portfolio companies.',
      cashflowTiming: 'Return profile becomes highly back-loaded as exits are pushed out several years.',
      keyOpportunities: 'Deploy "dry powder" into a down market at attractive valuations, potentially leading to outsized returns.'
    },
    assumptions: {
      growthOutlook: { value: 'Negative', description: 'A period of economic contraction with rising unemployment and reduced corporate earnings.' },
      volatility: { value: 'High', description: 'Characterized by sharp, unpredictable market movements and heightened investor fear.' },
      inflation: { value: 'Low', description: 'Recessions are typically disinflationary as demand collapses.' },
      liquidity: { value: 'Stressed', description: 'Credit markets tighten, making it harder and more expensive to borrow. M&A and IPO markets may freeze.' },
      cashflowTiming: { value: 'Back-loaded', description: 'Early withdrawals are delayed, with the majority of returns expected in the latter half of the fund\'s life.' },
    },
  },
  risingRates: {
    id: 'risingRates',
    name: 'Rising Rates',
    description: 'Simulates an environment of persistent interest rate hikes, impacting valuations.',
    badge: { text: 'Valuation Risk', variant: 'secondary', icon: CircleDollarSign },
    implications: {
      growth: 'Lower exit multiples and compressed NAV growth as discount rates increase.',
      risk: 'High sensitivity for long-duration assets and venture capital.',
      liquidity: 'Deal activity slows, potentially delaying both new investments and exits.',
      cashflowTiming: 'Significantly back-loaded cash flows as M&A/IPO markets cool and price discovery stalls.',
      keyOpportunities: 'Favors managers skilled in operational value creation over financial engineering. Private credit strategies may thrive.'
    },
    assumptions: {
      growthOutlook: { value: 'Negative', description: 'Higher borrowing costs cool economic activity and depress corporate growth expectations.' },
      volatility: { value: 'Medium', description: 'Markets re-price assets to reflect new interest rate realities, causing initial volatility.' },
      inflation: { value: 'Elevated', description: 'Central banks raise rates specifically to combat persistent, above-target inflation.' },
      liquidity: { value: 'Tight', description: 'As the cost of money rises, liquidity becomes less available and more expensive across the system.' },
      cashflowTiming: { value: 'Back-loaded', description: 'Buyers and sellers struggle to agree on price, delaying M&A and IPOs, thus pushing out withdrawals.' },
    },
  },
  stagflation: {
    id: 'stagflation',
    name: 'Inflation / Stagflation',
    description: 'A challenging mix of high inflation and low economic growth, eroding real returns.',
    badge: { text: 'Erosion Risk', variant: 'secondary', icon: ShieldAlert },
     implications: {
      growth: 'Nominal NAV may grow, but real returns are compressed. Pricing power becomes critical.',
      risk: 'Assets struggle to pass on costs, leading to margin compression.',
      liquidity: 'Central banks tighten policy, restricting liquidity across the system.',
      cashflowTiming: 'Cash flows may remain on schedule, but their real value is diminished by high inflation.',
      keyOpportunities: 'Real assets (infrastructure, real estate) and companies with strong pricing power can outperform.'
    },
    assumptions: {
      growthOutlook: { value: 'Negative', description: 'Economic growth stagnates or declines while prices continue to rise.' },
      volatility: { value: 'High', description: 'Uncertainty about policy responses and economic direction leads to high market volatility.' },
      inflation: { value: 'High', description: 'Inflation is persistent and well-above central bank targets, eroding purchasing power.' },
      liquidity: { value: 'Stressed', description: 'Aggressive central bank tightening to fight inflation drains liquidity from the financial system.' },
      cashflowTiming: { value: 'Evenly-paced', description: 'Cashflows may not be delayed but their real value is diminished by inflation.' },
    },
  },
  liquidityCrunch: {
    id: 'liquidityCrunch',
    name: 'Liquidity Crunch',
    description: 'A scenario where capital markets freeze, halting withdrawals and forcing reliance on credit.',
    badge: { text: 'Cashflow Stress', variant: 'destructive', icon: Waves },
     implications: {
      growth: 'Secondary market evaporates and M&A activity stops, freezing NAV.',
      risk: 'Highest risk of contribution defaults and potential for forced asset sales.',
      liquidity: 'Extreme stress. Withdrawals halt completely, contributions may be accelerated.',
      cashflowTiming: 'Contributions are accelerated and front-loaded to defend assets; withdrawals stop entirely.',
      keyOpportunities: 'For LPs with available capital, secondary markets can offer deep discounts on high-quality assets.'
    },
    assumptions: {
      growthOutlook: { value: 'Negative', description: 'Triggered by a systemic financial shock, leading to a sharp halt in economic activity.' },
      volatility: { value: 'High', description: 'Panic selling and a flight to safety cause extreme volatility and correlation across assets.' },
      inflation: { value: 'Low', description: 'The crisis is typically deflationary as credit evaporates and demand disappears.' },
      liquidity: { value: 'Stressed', description: 'System-wide panic. Interbank lending freezes and credit becomes unavailable at any price.' },
      cashflowTiming: { value: 'Front-loaded', description: 'GPs accelerate contributions to shore up portfolio company balance sheets, while withdrawals stop entirely.' },
    },
  },
};

const scenarioFactorsMapping = {
    base: { scenario: 'Base' as const, factors: { callFactor: 1.0, distFactor: 1.0 } },
    recession: { scenario: 'Stress' as const, factors: { callFactor: 1.1, distFactor: 0.6 } },
    risingRates: { scenario: 'Slow Exit' as const, factors: { callFactor: 0.9, distFactor: 0.7 } },
    stagflation: { scenario: 'Stress' as const, factors: { callFactor: 1.0, distFactor: 0.8 } },
    liquidityCrunch: { scenario: 'Stress' as const, factors: { callFactor: 1.2, distFactor: 0.4 } },
};

const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};

const AssumptionTag = ({ label, assumption }: { label: string, assumption: AssumptionValue }) => {
    const { value, description } = assumption;
    const colorClasses: Record<string, string> = {
        'Positive': 'bg-green-100 text-green-800', 'Neutral': 'bg-blue-100 text-blue-800', 'Negative': 'bg-red-100 text-red-800',
        'Low': 'bg-green-100 text-green-800', 'Medium': 'bg-yellow-100 text-yellow-800', 'High': 'bg-red-100 text-red-800',
        'Elevated': 'bg-orange-100 text-orange-800', 'Abundant': 'bg-blue-100 text-blue-800', 'Tight': 'bg-yellow-100 text-yellow-800',
        'Stressed': 'bg-red-100 text-red-800', 'Front-loaded': 'bg-purple-100 text-purple-800', 'Evenly-paced': 'bg-blue-100 text-blue-800',
        'Back-loaded': 'bg-orange-100 text-orange-800',
    };
    const colorClass = colorClasses[value] || 'bg-gray-100 text-gray-800';

    return (
        <UITooltip>
            <div className="flex flex-col items-center justify-center p-2 text-center bg-card rounded-lg border">
                <div className="text-xs text-black flex items-center gap-1">
                    {label}
                    <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-pointer text-black hover:text-black" />
                    </TooltipTrigger>
                </div>
                <div className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                    {value}
                </div>
            </div>
            <TooltipContent>
                <p className="max-w-[250px] text-sm">{description}</p>
            </TooltipContent>
        </UITooltip>
    );
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
    if (!portfolioData) {
        return <Skeleton className="h-80 w-full" />;
    }

    const { navProjection, cashflowForecast, liquidityForecast } = portfolioData;

    const combinedData = cashflowForecast.map(cf => {
        const navDataPoint = navProjection.find(nd => nd.date === cf.date);
        const liqDataPoint = liquidityForecast.find(ld => ld.date === cf.date);
        return { 
            ...cf, 
            contribution: -cf.capitalCall, 
            withdrawal: cf.distribution, 
            nav: navDataPoint?.nav,
            liquidityBalance: liqDataPoint?.liquidityBalance,
        };
    });

    const chartConfig = {
        contribution: { label: 'Contributions', color: 'hsl(var(--chart-2))' },
        withdrawal: { label: 'Withdrawals', color: 'hsl(var(--chart-1))' },
        nav: { label: 'Portfolio Value', color: 'hsl(var(--chart-4))' },
        liquidityBalance: { label: 'Liquidity Balance', color: 'hsl(var(--chart-3))'},
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base font-semibold text-highlight">Scenario Visualization</CardTitle></CardHeader>
            <CardContent className="h-[350px] -ml-2">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ComposedChart data={combinedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => format(new Date(value), 'MMM yy')} interval={5} />
                        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} tickLine={false} axisLine={false} label={{ value: "Net Cashflow", angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value)} tickLine={false} axisLine={false} label={{ value: "Portfolio & Liquidity", angle: 90, position: 'insideRight', offset: -20, style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))' } }} />
                        <Tooltip 
                            content={<ChartTooltipContent 
                                labelFormatter={(label) => format(new Date(label), 'MMM yyyy')} 
                                indicator="dot" 
                                formatter={(value, name) => {
                                    const config = chartConfig[name as keyof typeof chartConfig];
                                    if (!config || (value === 0 && name !== 'liquidityBalance') || value === null) return null;

                                    const displayValue = name === 'contribution' ? Math.abs(value as number) : value as number;
                                    let label = config.label;
                                    if (name === 'contribution') label = 'Contributions';
                                    if (name === 'withdrawal') label = 'Withdrawals';

                                    return (
                                       <div className="flex w-full items-center justify-between gap-4">
                                          <div className="flex flex-shrink-0 items-center gap-2">
                                             <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: config.color}}/>
                                             <span>{label}</span>
                                          </div>
                                          <span className="font-bold text-black ml-4">{formatCurrency(displayValue)}</span>
                                       </div>
                                    )
                                }}
                            />} 
                        />
                        <Legend />
                        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" />
                        <Bar yAxisId="left" dataKey="withdrawal" name="Withdrawals" fill="var(--color-withdrawal)" stackId="stack" radius={[2, 2, 0, 0]} />
                        <Bar yAxisId="left" dataKey="contribution" name="Contributions" fill="var(--color-contribution)" stackId="stack" />
                        <Line yAxisId="right" type="monotone" dataKey="nav" stroke="var(--color-nav)" strokeWidth={2} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="liquidityBalance" stroke="var(--color-liquidityBalance)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

const ScenarioOutcomes = ({ portfolioData, totalCommitment }: { portfolioData: PortfolioData | null, totalCommitment: number }) => {
    if (!portfolioData) {
        return (
            <div className="lg:col-span-1">
                <Skeleton className="h-full min-h-[300px]" />
            </div>
        );
    }

    const { kpis, navProjection, liquidityForecast, cashflowForecast } = portfolioData;
    
    const cumulativeCalls = cashflowForecast.reduce((s, c) => s + c.capitalCall, 0);
    const cumulativeDists = cashflowForecast.reduce((s, c) => s + c.distribution, 0);
    const endingValue = navProjection[navProjection.length-1]?.nav || 0;
    const tvpi = cumulativeCalls > 0 ? (endingValue + cumulativeDists) / cumulativeCalls : 0;
    
    const irrCashflows = cashflowForecast.map(cf => cf.netCashflow);
    if (irrCashflows.length > 0) {
        irrCashflows[irrCashflows.length - 1] += endingValue;
    }
    const firstCfIndex = irrCashflows.findIndex(cf => cf !== 0);
    const finalIrrCashflows = firstCfIndex > -1 ? irrCashflows.slice(firstCfIndex) : [];
    
    const quarterlyIrr = finalIrrCashflows.length > 1 ? calculateQuarterlyIRR(finalIrrCashflows, tvpi) : 0;
    const itdIrr = quarterlyIrr ? (Math.pow(1 + quarterlyIrr, 4) - 1) : 0;

    let irrColor;
    if (itdIrr > 0.15) { // > 15% is good
        irrColor = 'text-green-500';
    } else if (itdIrr >= 0.08) { // 8-15% is neutral
        irrColor = 'text-orange-500';
    } else { // < 8% is bad
        irrColor = 'text-red-500';
    }

    let endingValueColor;
     if (tvpi > 2.0) {
        endingValueColor = 'text-green-500';
    } else if (tvpi >= 1.5) {
        endingValueColor = 'text-orange-500';
    } else {
        endingValueColor = 'text-red-500';
    }
    
    const peakGap = Math.max(0, ...liquidityForecast.map(l => l.fundingGap));
    const simulatedPeakPressure = Math.max(Math.abs(kpis.peakProjectedOutflow.value), peakGap > 0 ? peakGap * 1.2 : 0);

    let liquidityPressure, liquidityColor;
    if (simulatedPeakPressure > totalCommitment * 0.1) {
        liquidityPressure = 'High';
        liquidityColor = 'text-red-500';
    } else if (simulatedPeakPressure > totalCommitment * 0.05) {
        liquidityPressure = 'Medium';
        liquidityColor = 'text-orange-500';
    } else {
        liquidityPressure = 'Low';
        liquidityColor = 'text-green-500';
    }
    
    const breakevenData = kpis.breakevenTiming;
    const breakevenYear = breakevenData.from && breakevenData.from !== 'N/A' && !breakevenData.from.includes('+')
        ? new Date(breakevenData.from).getFullYear() - new Date().getFullYear() + 1
        : Infinity;

    let breakevenDisplay, breakevenColor;
    if (breakevenYear === Infinity) {
        breakevenDisplay = breakevenData.from === 'Year 12+' ? 'Year 12+' : 'N/A';
        breakevenColor = 'text-red-500';
    } else {
        breakevenDisplay = `Year ${breakevenYear}`;
        if (breakevenYear <= 5) {
            breakevenColor = 'text-green-500';
        } else if (breakevenYear <= 8) {
            breakevenColor = 'text-orange-500';
        } else {
            breakevenColor = 'text-red-500';
        }
    }
    
    const OutcomeCard = ({ title, value, description, icon: Icon, valueClass }: { title: string, value: string, description?: string, icon: React.ElementType, valueClass?: string }) => (
        <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
            <Icon className="h-6 w-6 text-primary mt-1" />
            <div>
                <p className="text-sm text-black">{title}</p>
                <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
                {description && <p className="text-xs text-black">{description}</p>}
            </div>
        </div>
    );
    
    return (
        <Card className="lg:col-span-1">
             <CardHeader><CardTitle className="text-base font-semibold text-highlight">Scenario Outcomes</CardTitle></CardHeader>
             <CardContent className="space-y-3">
                 <OutcomeCard title="Ending Portfolio Value" value={formatCurrency(endingValue)} description="Projected value at end of fund life" icon={Landmark} valueClass={endingValueColor} />
                 <OutcomeCard title="ITD IRR" value={`${(itdIrr * 100).toFixed(1)}%`} description="Internal Rate of Return" icon={TrendingUp} valueClass={irrColor} />
                 <OutcomeCard title="Peak Liquidity Pressure" value={liquidityPressure} description={`Max quarterly need of ~${formatCurrency(simulatedPeakPressure)}`} icon={Shield} valueClass={liquidityColor} />
                 <OutcomeCard title="Breakeven Point" value={breakevenDisplay} description="When cumulative cashflow turns positive" icon={Hourglass} valueClass={breakevenColor} />
            </CardContent>
        </Card>
    );
}

type InsightPoint = {
  icon: React.ElementType;
  text: string;
  color: string;
};

type Narrative = {
  title: string;
  summary: string;
  points: InsightPoint[];
};


const NarrativeInsights = ({ scenarioId }: { scenarioId: ScenarioId }) => {
    const insights: Record<ScenarioId, Narrative> = {
        base: { 
            title: "Steady & Predictable", 
            summary: "The base case shows a standard J-curve with moderate growth. Cash flows are evenly paced, leading to a healthy return multiple with manageable liquidity needs.",
            points: [
                { icon: Activity, text: "Portfolio growth is consistent, tracking long-term market averages.", color: 'text-blue-500' },
                { icon: Landmark, text: "Cash flows are evenly paced, with no major liquidity surprises.", color: 'text-blue-500' },
                { icon: BarChart, text: "A healthy return multiple is achieved with manageable risk, representing a 'business as usual' outlook.", color: 'text-blue-500' },
            ]
        },
        recession: { 
            title: "Short-term Pain, Long-term Gain?", 
            summary: "A recession causes early NAV markdowns and halts withdrawals. However, accelerated contributions into a down market can lead to a powerful recovery.",
            points: [
                { icon: TrendingDown, text: "Initial NAV markdowns and a pause in withdrawals create early liquidity pressure.", color: 'text-red-500' },
                { icon: Clock, text: "Recovery is gradual (U-shaped), testing portfolio resilience over 2-3 years.", color: 'text-yellow-600' },
                { icon: ChevronsUp, text: "Contributions into a down market can fuel a powerful recovery and strong back-ended returns.", color: 'text-green-500' },
            ]
        },
        risingRates: { 
            title: "A Slower Grind",
            summary: "Higher interest rates act as a headwind, compressing valuation multiples and slowing the pace of exits.",
            points: [
                { icon: CircleDollarSign, text: "Valuation multiples compress as discount rates rise, slowing NAV growth.", color: 'text-yellow-600' },
                { icon: Hourglass, text: "Exit markets cool down, delaying withdrawals and creating a more back-loaded return profile.", color: 'text-yellow-600' },
                { icon: BrainCircuit, text: "Manager skill in deal sourcing and value creation becomes paramount to navigate the environment.", color: 'text-blue-500' },
            ]
        },
        stagflation: { 
            title: "The Real Return Squeeze", 
            summary: "A toxic mix of high inflation and low growth. While nominal NAV might hold up, real returns are significantly eroded.",
            points: [
                { icon: ShieldAlert, text: "High inflation erodes the real value of returns, even if nominal NAV appears to grow.", color: 'text-red-500' },
                { icon: Waves, text: "Central bank tightening restricts system-wide liquidity, stressing cash flow for all market participants.", color: 'text-red-500' },
                { icon: TrendingUp, text: "Portfolio companies with strong pricing power are best positioned to protect margins and drive real value.", color: 'text-green-500' },
            ]
        },
        liquidityCrunch: { 
            title: "Cash is King", 
            summary: "This scenario models a market freeze where exit markets evaporate and contributions are accelerated to defend assets.",
            points: [
                { icon: Waves, text: "Withdrawals halt entirely as exit markets (M&A, IPOs) effectively freeze.", color: 'text-red-500' },
                { icon: TrendingDown, text: "Contributions are accelerated to defend portfolio companies, creating maximum LP liquidity stress.", color: 'text-red-500' },
                { icon: Shield, text: "Survival and access to credit become the primary focus over short-term growth.", color: 'text-yellow-600' },
            ]
        },
    };

    const insight = insights[scenarioId];

    return (
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-highlight">
                    <BarChart className="h-5 w-5" />
                    Narrative Insights
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-black">{insight.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {insight.points.map((point, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <point.icon className={`h-5 w-5 mt-0.5 shrink-0 ${point.color}`} />
                            <p className="text-sm text-black flex-1">
                                {point.text}
                            </p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
}

type RecommendationPoint = {
  icon: React.ElementType;
  text: string;
  color: string;
};

type Recommendation = {
  title: string;
  summary: string;
  points: RecommendationPoint[];
};

const NextStepsRecommendations = ({ scenarioId }: { scenarioId: ScenarioId }) => {
    const recommendations: Record<ScenarioId, Recommendation> = {
        base: { 
            title: "Stay the Course & Monitor", 
            summary: "Your portfolio is aligned with baseline expectations. The key is to maintain discipline and monitor performance against your long-term goals.",
            points: [
                { icon: TrendingUp, text: "Regularly review portfolio performance against this baseline forecast to track progress.", color: 'text-blue-500' },
                { icon: Landmark, text: "Continue with planned contributions to maximize the power of compounding.", color: 'text-green-500' },
                { icon: ClipboardList, text: "Identify future cash needs and align them with the projected withdrawal schedule.", color: 'text-blue-500' },
            ]
        },
        recession: { 
            title: "Identify Opportunity, Manage Liquidity", 
            summary: "Downturns test liquidity but also present opportunities. The focus should be on surviving the stress while being prepared to invest at attractive valuations.",
            points: [
                { icon: ShieldCheck, text: "Assess liquidity reserves to ensure you can comfortably meet accelerated contributions from GPs.", color: 'text-red-500' },
                { icon: Search, text: "Evaluate opportunities to commit to top-tier funds at potentially lower entry valuations.", color: 'text-yellow-600' },
                { icon: Briefcase, text: "Stress test the portfolio for a longer-than-expected (i.e., 'U' or 'L' shaped) recovery period.", color: 'text-red-500' },
            ]
        },
        risingRates: { 
            title: "Focus on Value Creation",
            summary: "In a rising rate environment, returns from simple multiple expansion are scarce. The focus shifts to managers who can create real operational value.",
            points: [
                { icon: Gauge, text: "Review exposure to long-duration assets (e.g., venture capital) that are most sensitive to rising discount rates.", color: 'text-yellow-600' },
                { icon: BrainCircuit, text: "Prioritize managers with proven expertise in driving operational improvements in their portfolio companies.", color: 'text-blue-500' },
                { icon: FileBarChart, text: "Model the impact of a slower M&A and IPO market on your portfolio's liquidity timeline.", color: 'text-yellow-600' },
            ]
        },
        stagflation: { 
            title: "Prioritize Real Returns & Pricing Power", 
            summary: "The goal is to protect purchasing power. Assets that can pass on costs and strategies with inflation protection become critical.",
            points: [
                { icon: Building, text: "Consider increasing allocation to strategies that offer a natural inflation hedge, like real assets and infrastructure.", color: 'text-green-500' },
                { icon: Filter, text: "Scrutinize underlying companies for strong pricing power—the ability to raise prices without losing business.", color: 'text-blue-500' },
                { icon: Target, text: "Re-evaluate long-term return goals in 'real' (inflation-adjusted) terms, not just nominal.", color: 'text-yellow-600' },
            ]
        },
        liquidityCrunch: { 
            title: "Defensive Positioning & Cash Preservation", 
            summary: "In a market freeze, 'cash is king.' The immediate priority is ensuring you can weather the storm without becoming a forced seller of assets.",
            points: [
                { icon: FileWarning, text: "Immediately confirm available credit lines and other sources of emergency liquidity.", color: 'text-red-500' },
                { icon: ListTodo, text: "Rank all unfunded commitments by priority and explore possibilities for deferring non-essential contributions.", color: 'text-red-500' },
                { icon: Ban, text: "Halt any new, non-essential commitments until market stability and visibility returns.", color: 'text-yellow-600' },
            ]
        },
    };

    const recommendation = recommendations[scenarioId];

    return (
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-highlight">
                    <Rocket className="h-5 w-5" />
                    Recommendation - Next Steps
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{recommendation.title}</h4>
                    <p className="text-sm text-black">{recommendation.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {recommendation.points.map((point, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <point.icon className={`h-5 w-5 mt-0.5 shrink-0 ${point.color}`} />
                            <p className="text-sm text-black flex-1">
                                {point.text}
                            </p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
};

const ScenarioComparisonDialog = ({ funds }: { funds: Fund[] }) => {
    const [selectedIds, setSelectedIds] = useState<ScenarioId[]>(['base', 'recession']);
    const [comparisonData, setComparisonData] = useState<any[]>([]);

    const handleCheckboxChange = (scenarioId: ScenarioId, checked: boolean) => {
        setSelectedIds(prev => {
            if (checked) {
                if (prev.length < 4) {
                    return [...prev, scenarioId];
                }
            } else {
                if (prev.length > 2) {
                    return prev.filter(id => id !== scenarioId);
                }
            }
            return prev;
        });
    };

    useEffect(() => {
        const data = selectedIds.map(id => {
            const { portfolio } = getPortfolioData(id, undefined, new Date());
            
            const cumulativeCalls = portfolio.cashflowForecast.reduce((s, c) => s + c.capitalCall, 0);
            const cumulativeDists = portfolio.cashflowForecast.reduce((s, c) => s + c.distribution, 0);
            const endingValue = portfolio.navProjection[portfolio.navProjection.length-1]?.nav || 0;
            const tvpi = cumulativeCalls > 0 ? (endingValue + cumulativeDists) / cumulativeCalls : 0;
            
            const irrCashflows = portfolio.cashflowForecast.map(cf => cf.netCashflow);
            if (irrCashflows.length > 0) {
              irrCashflows[irrCashflows.length - 1] += endingValue;
            }
            const firstCfIndex = irrCashflows.findIndex(cf => cf !== 0);
            const finalIrrCashflows = firstCfIndex > -1 ? irrCashflows.slice(firstCfIndex) : [];

            const quarterlyIrr = finalIrrCashflows.length > 1 ? calculateQuarterlyIRR(finalIrrCashflows, tvpi) : 0;
            const itdIrr = quarterlyIrr ? (Math.pow(1 + quarterlyIrr, 4) - 1) : 0;

            const peakGap = Math.max(0, ...portfolio.liquidityForecast.map(l => l.fundingGap));
            const simulatedPeakPressure = Math.max(Math.abs(portfolio.kpis.peakProjectedOutflow.value), peakGap > 0 ? peakGap * 1.2 : 0);

            let liquidityPressure;
            if (simulatedPeakPressure > funds.reduce((sum, fund) => sum + fund.commitment, 0) * 0.1) {
                liquidityPressure = 'High';
            } else if (simulatedPeakPressure > funds.reduce((sum, fund) => sum + fund.commitment, 0) * 0.05) {
                liquidityPressure = 'Medium';
            } else {
                liquidityPressure = 'Low';
            }
            
            const breakevenData = portfolio.kpis.breakevenTiming;
            const breakevenYear = breakevenData.from && breakevenData.from !== 'N/A' && !breakevenData.from.includes('+')
                ? new Date(breakevenData.from).getFullYear() - new Date().getFullYear() + 1
                : 12.1; // Represents "Year 12+" for sorting


            const peakFundingNeed = Math.abs(portfolio.kpis.peakProjectedOutflow.value);
            const liquidityRunway = portfolio.kpis.liquidityRunwayInMonths || 0;

            return {
                id,
                name: scenarios[id].name,
                endingValue,
                itdIrr,
                liquidityPressure,
                breakevenYear: breakevenYear > 12 ? '12+' : breakevenYear,
                peakFundingNeed,
                liquidityRunway,
            };
        });
        setComparisonData(data);
    }, [selectedIds, funds]);

    const metrics = [
        { key: 'endingValue', label: 'Ending Portfolio Value', format: formatCurrency },
        { key: 'itdIrr', label: 'ITD IRR', format: (v: number) => `${(v * 100).toFixed(1)}%` },
        { key: 'peakFundingNeed', label: 'Peak Funding Need', format: formatCurrency },
        { key: 'liquidityRunway', label: 'Liquidity Runway', format: (v: number) => v >= 24 ? `${(v/12).toFixed(1)} years` : `${v} months` },
        { key: 'liquidityPressure', label: 'Peak Liquidity Pressure' },
        { key: 'breakevenYear', label: 'Breakeven Point', format: (v: number | string) => (typeof v === 'number' ? `Year ${v}` : `Year ${v}`) },
    ];
    
    const getBestWorst = (key: string) => {
        if (!comparisonData || comparisonData.length === 0) return {};
        
        const values = comparisonData.map(d => d[key as keyof typeof d]).filter(v => typeof v === 'number' && !isNaN(v as number)) as number[];
        if (values.length < 1) return {};

        const higherIsBetterMetrics = ['endingValue', 'itdIrr', 'liquidityRunway'];
        const lowerIsBetterMetrics = ['breakevenYear', 'peakFundingNeed'];

        let isHigherBetter;
        if (higherIsBetterMetrics.includes(key)) {
            isHigherBetter = true;
        } else if (lowerIsBetterMetrics.includes(key)) {
            isHigherBetter = false;
        } else {
            return {};
        }

        const best = isHigherBetter ? Math.max(...values) : Math.min(...values);
        const worst = isHigherBetter ? Math.min(...values) : Math.max(...values);
        
        return { best, worst };
    };

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Compare Scenarios</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-5 gap-6 mt-4">
                <div className="col-span-1 space-y-2 border-r pr-4">
                    <h4 className="font-semibold text-sm">Select Scenarios</h4>
                    <p className="text-xs text-black">Choose 2 to 4 scenarios to compare.</p>
                    <div className="space-y-2 pt-2">
                        {Object.values(scenarios).map(scenario => (
                            <div key={scenario.id} className="flex items-center gap-2">
                                <Checkbox
                                    id={`compare-${scenario.id}`}
                                    checked={selectedIds.includes(scenario.id)}
                                    onCheckedChange={(checked) => handleCheckboxChange(scenario.id, !!checked)}
                                    disabled={(selectedIds.length >= 4 && !selectedIds.includes(scenario.id)) || (selectedIds.length <= 2 && selectedIds.includes(scenario.id))}
                                />
                                <label htmlFor={`compare-${scenario.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {scenario.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-black">Metric</TableHead>
                                {comparisonData.map(data => <TableHead key={data.id} className="text-center text-black">{data.name}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.map(metric => {
                                const { best, worst } = getBestWorst(metric.key);
                                return (
                                <TableRow key={metric.key}>
                                    <TableCell className="font-medium text-black">{metric.label}</TableCell>
                                    {comparisonData.map(data => {
                                        const value = data[metric.key];
                                        const isBest = value === best;
                                        const isWorst = value === worst;
                                        let cellClass = 'text-center';
                                        if (isBest && best !== worst) cellClass += ' bg-green-50 text-green-800 font-bold';
                                        if (isWorst && best !== worst) cellClass += ' bg-red-50 text-red-800 font-bold';
                                        return (
                                            <TableCell key={data.id} className={cellClass}>
                                                {metric.format ? metric.format(value) : value}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DialogContent>
    );
};


export default function ScenarioSimulationPage() {
    const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('base');
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { funds } = usePortfolioContext();
    const selectedScenario = scenarios[selectedScenarioId];

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            if (selectedScenarioId) {
                const { portfolio } = getPortfolioData(selectedScenarioId, undefined, new Date());
                setPortfolioData(portfolio);
            }
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedScenarioId]);
    
    const totalCommitment = useMemo(() => funds.reduce((sum, fund) => sum + fund.commitment, 0), [funds]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex flex-nowrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-4 flex-shrink-0">
                <h1 className="text-sm font-semibold tracking-tight text-highlight flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6" />
                    Scenario Simulation
                </h1>
                <Select value={selectedScenarioId} onValueChange={(value) => setSelectedScenarioId(value as ScenarioId)}>
                    <SelectTrigger className="w-[180px] bg-secondary/50 border-border h-9 text-xs">
                        <SelectValue placeholder="Select a Scenario" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(scenarios).map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                            <div className="flex items-center gap-2">
                                <scenario.badge.icon className="h-4 w-4" />
                                <span>{scenario.name}</span>
                            </div>
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             
            {selectedScenario && (
                <div className="flex items-center gap-3 text-xs text-black flex-grow min-w-0">
                    <Badge variant={selectedScenario.badge.variant}>{selectedScenario.badge.text}</Badge>
                    <p className="truncate flex-shrink min-w-0 text-black">{selectedScenario.description}</p>
                </div>
            )}

             <div className="flex items-center gap-2 flex-shrink-0">
                <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Compare Scenarios</Button>
                    </DialogTrigger>
                    <ScenarioComparisonDialog funds={funds} />
                </Dialog>
            </div>
        </CardContent>
      </Card>

      {selectedScenario && (
        <Card>
            <CardContent className="pt-6 space-y-6">
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
