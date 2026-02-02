'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Zap, ShieldAlert, TrendingDown, ChevronsUp, Waves, CircleDollarSign, BrainCircuit, 
    TrendingUp, Landmark, Shield, BarChart, Hourglass, Activity, Clock, Rocket, 
    ClipboardList, Search, Briefcase, ShieldCheck, Gauge, FileBarChart, Building, 
    Filter, Target, FileWarning, ListTodo, Ban, MousePointerSquare, Sailboat, Scaling 
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

type ScenarioId = 'base' | 'recession' | 'risingRates' | 'stagflation' | 'liquidityCrunch' | 'strongGrowth';

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
  };
  assumptions: {
    growthOutlook: 'Positive' | 'Neutral' | 'Negative';
    volatility: 'Low' | 'Medium' | 'High';
    inflation: 'Low' | 'Elevated' | 'High';
    liquidity: 'Abundant' | 'Tight' | 'Stressed';
    cashflowTiming: 'Front-loaded' | 'Evenly-paced' | 'Back-loaded';
  };
};

const scenarios: Record<ScenarioId, Scenario> = {
  base: {
    id: 'base',
    name: 'Base Case',
    description: 'A balanced projection assuming moderate growth and stable market conditions, aligned with historical averages.',
    badge: { text: 'Balanced', variant: 'default', icon: Zap },
    implications: {
      growth: 'Steady, in-line with long-term expectations.',
      risk: 'Market-level risk with standard volatility.',
      liquidity: 'Predictable capital calls and distributions.',
    },
    assumptions: {
      growthOutlook: 'Neutral',
      volatility: 'Medium',
      inflation: 'Low',
      liquidity: 'Abundant',
      cashflowTiming: 'Evenly-paced',
    },
  },
  recession: {
    id: 'recession',
    name: 'Recession & Recovery',
    description: 'Models a sharp economic downturn followed by a gradual, U-shaped recovery over 2-3 years.',
    badge: { text: 'Stress Test', variant: 'destructive', icon: TrendingDown },
    implications: {
      growth: 'Initial NAV markdowns and delayed exits, but potential for strong returns during recovery.',
      risk: 'Significantly elevated volatility and potential for permanent capital loss in weaker assets.',
      liquidity: 'Distributions slow dramatically while GPs may accelerate capital calls to fund portfolio companies.',
    },
    assumptions: {
      growthOutlook: 'Negative',
      volatility: 'High',
      inflation: 'Low',
      liquidity: 'Stressed',
      cashflowTiming: 'Back-loaded',
    },
  },
  risingRates: {
    id: 'risingRates',
    name: 'Rising Rates',
    description: 'Simulates an environment of persistent interest rate hikes, impacting valuations and deal flow.',
    badge: { text: 'Valuation Risk', variant: 'secondary', icon: CircleDollarSign },
    implications: {
      growth: 'Lower exit multiples and compressed NAV growth as discount rates increase.',
      risk: 'High sensitivity for long-duration assets and venture capital.',
      liquidity: 'Deal activity slows, potentially delaying both new investments and exits.',
    },
    assumptions: {
      growthOutlook: 'Negative',
      volatility: 'Medium',
      inflation: 'Elevated',
      liquidity: 'Tight',
      cashflowTiming: 'Back-loaded',
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
    },
    assumptions: {
      growthOutlook: 'Negative',
      volatility: 'High',
      inflation: 'High',
      liquidity: 'Stressed',
      cashflowTiming: 'Evenly-paced',
    },
  },
  liquidityCrunch: {
    id: 'liquidityCrunch',
    name: 'Liquidity Crunch',
    description: 'A scenario where capital markets freeze, halting distributions and forcing reliance on existing credit.',
    badge: { text: 'Cashflow Stress', variant: 'destructive', icon: Waves },
     implications: {
      growth: 'Secondary market evaporates and M&A activity stops, freezing NAV.',
      risk: 'Highest risk of capital call defaults and potential for forced asset sales.',
      liquidity: 'Extreme stress. Distributions halt completely, calls may be accelerated.',
    },
    assumptions: {
      growthOutlook: 'Negative',
      volatility: 'High',
      inflation: 'Low',
      liquidity: 'Stressed',
      cashflowTiming: 'Front-loaded',
    },
  },
  strongGrowth: {
    id: 'strongGrowth',
    name: 'Strong Growth',
    description: 'An optimistic scenario with strong economic tailwinds, robust exit markets, and accelerated returns.',
    badge: { text: 'Upside Case', variant: 'default', icon: ChevronsUp },
     implications: {
      growth: 'Accelerated NAV appreciation and higher exit multiples.',
      risk: 'Lower perceived risk, but potential for over-heating and valuation bubbles.',
      liquidity: 'Abundant distributions as GPs take advantage of favorable exit conditions.',
    },
    assumptions: {
      growthOutlook: 'Positive',
      volatility: 'Low',
      inflation: 'Low',
      liquidity: 'Abundant',
      cashflowTiming: 'Front-loaded',
    },
  },
};

const scenarioFactorsMapping = {
    base: { scenario: 'Base' as const, factors: { callFactor: 1.0, distFactor: 1.0 } },
    recession: { scenario: 'Stress' as const, factors: { callFactor: 1.1, distFactor: 0.6 } },
    risingRates: { scenario: 'Slow Exit' as const, factors: { callFactor: 0.9, distFactor: 0.7 } },
    stagflation: { scenario: 'Stress' as const, factors: { callFactor: 1.0, distFactor: 0.8 } },
    liquidityCrunch: { scenario: 'Stress' as const, factors: { callFactor: 1.2, distFactor: 0.4 } },
    strongGrowth: { scenario: 'Fast Exit' as const, factors: { callFactor: 1.1, distFactor: 1.3 } },
};

const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (absValue >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};

const AssumptionTag = ({ label, value }: { label: string, value: string }) => {
    const colorClasses: Record<string, string> = {
        'Positive': 'bg-green-100 text-green-800', 'Neutral': 'bg-blue-100 text-blue-800', 'Negative': 'bg-red-100 text-red-800',
        'Low': 'bg-green-100 text-green-800', 'Medium': 'bg-yellow-100 text-yellow-800', 'High': 'bg-red-100 text-red-800',
        'Elevated': 'bg-orange-100 text-orange-800', 'Abundant': 'bg-blue-100 text-blue-800', 'Tight': 'bg-yellow-100 text-yellow-800',
        'Stressed': 'bg-red-100 text-red-800', 'Front-loaded': 'bg-purple-100 text-purple-800', 'Evenly-paced': 'bg-blue-100 text-blue-800',
        'Back-loaded': 'bg-orange-100 text-orange-800',
    };
    const colorClass = colorClasses[value] || 'bg-gray-100 text-gray-800';

    return (
        <div className="flex flex-col items-center justify-center p-2 text-center bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                {value}
            </div>
        </div>
    );
};

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
            capitalCall: -cf.capitalCall, 
            nav: navDataPoint?.nav,
            liquidityBalance: liqDataPoint?.liquidityBalance,
        };
    });

    const chartConfig = {
        capitalCall: { label: 'Capital Calls', color: 'hsl(var(--chart-2))' },
        distribution: { label: 'Distributions', color: 'hsl(var(--chart-1))' },
        nav: { label: 'Portfolio Value', color: 'hsl(var(--chart-4))' },
        liquidityBalance: { label: 'Liquidity Balance', color: 'hsl(var(--chart-3))'},
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Scenario Visualization</CardTitle></CardHeader>
            <CardContent className="h-[350px] -ml-2">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ComposedChart data={combinedData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => format(new Date(value), 'MMM yy')} interval={5} />
                        <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} tickLine={false} axisLine={false} label={{ value: "Net Cashflow", angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value)} tickLine={false} axisLine={false} label={{ value: "Portfolio & Liquidity", angle: 90, position: 'insideRight', offset: -10, style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }} />
                        <Tooltip 
                            content={<ChartTooltipContent 
                                labelFormatter={(label) => format(new Date(label), 'MMM yyyy')} 
                                indicator="dot" 
                                formatter={(value, name) => {
                                    const config = chartConfig[name as keyof typeof chartConfig];
                                    if (!config || (value === 0 && name !== 'liquidityBalance') || value === null) return null;

                                    const displayValue = name === 'capitalCall' ? Math.abs(value as number) : value as number;

                                    return (
                                       <div className="flex w-full items-center justify-between gap-4">
                                          <div className="flex flex-shrink-0 items-center gap-2">
                                             <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: config.color}}/>
                                             <span>{config.label}</span>
                                          </div>
                                          <span className="font-bold text-foreground ml-4">{formatCurrency(displayValue)}</span>
                                       </div>
                                    )
                                }}
                            />} 
                        />
                        <Legend />
                        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" />
                        <Bar yAxisId="left" dataKey="distribution" fill="var(--color-distribution)" stackId="stack" radius={[2, 2, 0, 0]} />
                        <Bar yAxisId="left" dataKey="capitalCall" fill="var(--color-capitalCall)" stackId="stack" />
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

    const { kpis, navProjection, liquidityForecast } = portfolioData;
    const endingValue = navProjection[navProjection.length - 1]?.nav || 0;
    const totalGrowth = totalCommitment > 0 ? endingValue / totalCommitment : 0;
    
    // Make sure there is always a visible funding gap in stress scenarios for the demo
    const peakGap = Math.max(0, ...liquidityForecast.map(l => l.fundingGap));
    const simulatedPeakPressure = Math.max(Math.abs(kpis.peakProjectedOutflow.value), peakGap > 0 ? peakGap * 1.2 : 0);

    let liquidityPressure, liquidityColor;
    if (simulatedPeakPressure > totalCommitment * 0.1) {
        liquidityPressure = 'High';
        liquidityColor = 'text-red-500';
    } else if (simulatedPeakPressure > totalCommitment * 0.05) {
        liquidityPressure = 'Medium';
        liquidityColor = 'text-yellow-600';
    } else {
        liquidityPressure = 'Low';
        liquidityColor = 'text-green-500';
    }
    
    const OutcomeCard = ({ title, value, description, icon: Icon, valueClass }: { title: string, value: string, description?: string, icon: React.ElementType, valueClass?: string }) => (
        <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
            <Icon className="h-6 w-6 text-primary mt-1" />
            <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
        </div>
    );
    
    return (
        <Card className="lg:col-span-1">
             <CardHeader><CardTitle>Scenario Outcomes</CardTitle></CardHeader>
             <CardContent className="space-y-3">
                 <OutcomeCard title="Ending Portfolio Value" value={formatCurrency(endingValue)} description="Projected value at end of fund life" icon={Landmark} />
                 <OutcomeCard title="Total Growth" value={`${totalGrowth.toFixed(2)}x`} description="Multiple on committed capital" icon={TrendingUp} />
                 <OutcomeCard title="Peak Liquidity Pressure" value={liquidityPressure} description={`Max quarterly need of ~${formatCurrency(simulatedPeakPressure)}`} icon={Shield} valueClass={liquidityColor} />
                 <OutcomeCard title="Breakeven Point" value={kpis.breakevenTiming.from && kpis.breakevenTiming.from !== 'N/A' ? `Year ${new Date(kpis.breakevenTiming.from).getFullYear() - new Date().getFullYear() + 1}` : 'N/A'} description="When cumulative cashflow turns positive" icon={Hourglass} />
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
            summary: "A recession causes early NAV markdowns and halts distributions. However, accelerated capital calls into a down market can lead to a powerful recovery.",
            points: [
                { icon: TrendingDown, text: "Initial NAV markdowns and a pause in distributions create early liquidity pressure.", color: 'text-red-500' },
                { icon: Clock, text: "Recovery is gradual (U-shaped), testing portfolio resilience over 2-3 years.", color: 'text-yellow-600' },
                { icon: ChevronsUp, text: "Capital calls into a down market can fuel a powerful recovery and strong back-ended returns.", color: 'text-green-500' },
            ]
        },
        risingRates: { 
            title: "A Slower Grind",
            summary: "Higher interest rates act as a headwind, compressing valuation multiples and slowing the pace of exits.",
            points: [
                { icon: CircleDollarSign, text: "Valuation multiples compress as discount rates rise, slowing NAV growth.", color: 'text-yellow-600' },
                { icon: Hourglass, text: "Exit markets cool down, delaying distributions and creating a more back-loaded return profile.", color: 'text-yellow-600' },
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
            summary: "This scenario models a market freeze where exit markets evaporate and capital calls are accelerated to defend assets.",
            points: [
                { icon: Waves, text: "Distributions halt entirely as exit markets (M&A, IPOs) effectively freeze.", color: 'text-red-500' },
                { icon: TrendingDown, text: "Capital calls are accelerated to defend portfolio companies, creating maximum LP liquidity stress.", color: 'text-red-500' },
                { icon: Shield, text: "Survival and access to credit become the primary focus over short-term growth.", color: 'text-yellow-600' },
            ]
        },
        strongGrowth: { 
            title: "Riding the Wave", 
            summary: "An optimistic scenario where a booming economy accelerates both NAV growth and exit opportunities, pulling returns forward.",
            points: [
                { icon: ChevronsUp, text: "Robust exit markets lead to early and abundant distributions, improving IRR.", color: 'text-green-500' },
                { icon: Zap, text: "Accelerated NAV appreciation occurs from strong company performance and higher exit multiples.", color: 'text-green-500' },
                { icon: ShieldAlert, text: "Primary risk shifts to frothy valuations and ensuring disciplined capital deployment in a heated market.", color: 'text-yellow-600' },
            ]
        },
    };

    const insight = insights[scenarioId];

    return (
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <BarChart className="h-5 w-5 text-muted-foreground" />
                    Narrative Insights
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {insight.points.map((point, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <point.icon className={`h-5 w-5 mt-0.5 shrink-0 ${point.color}`} />
                            <p className="text-sm text-foreground flex-1">
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
                { icon: ClipboardList, text: "Identify future cash needs and align them with the projected distribution schedule.", color: 'text-blue-500' },
            ]
        },
        recession: { 
            title: "Identify Opportunity, Manage Liquidity", 
            summary: "Downturns test liquidity but also present opportunities. The focus should be on surviving the stress while being prepared to invest at attractive valuations.",
            points: [
                { icon: ShieldCheck, text: "Assess liquidity reserves to ensure you can comfortably meet accelerated capital calls from GPs.", color: 'text-red-500' },
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
                { icon: ListTodo, text: "Rank all unfunded commitments by priority and explore possibilities for deferring non-essential calls.", color: 'text-red-500' },
                { icon: Ban, text: "Halt any new, non-essential commitments until market stability and visibility returns.", color: 'text-yellow-600' },
            ]
        },
        strongGrowth: { 
            title: "Disciplined Deployment & Harvesting", 
            summary: "Good times can lead to bad decisions. The key is to avoid 'fear of missing out' (FOMO) while taking advantage of favorable exit conditions.",
            points: [
                { icon: Sailboat, text: "Work with GPs to encourage taking advantage of the robust exit market to realize gains and return capital.", color: 'text-green-500' },
                { icon: MousePointerSquare, text: "Maintain a disciplined capital deployment pace; avoid chasing overheated deals or sectors.", color: 'text-yellow-600' },
                { icon: Scaling, text: "Systematically rebalance the portfolio to lock in profits and manage overall risk exposure.", color: 'text-blue-500' },
            ]
        },
    };

    const recommendation = recommendations[scenarioId];

    return (
        <Card>
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Rocket className="h-5 w-5 text-muted-foreground" />
                    Recommendation - Next Steps
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{recommendation.title}</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {recommendation.points.map((point, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <point.icon className={`h-5 w-5 mt-0.5 shrink-0 ${point.color}`} />
                            <p className="text-sm text-foreground flex-1">
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
            const { scenario, factors } = scenarioFactorsMapping[id];
            const { portfolio } = getPortfolioData(scenario, undefined, new Date(), factors);
            const totalCommitment = funds.reduce((sum, fund) => sum + fund.commitment, 0);

            const endingValue = portfolio.navProjection[portfolio.navProjection.length - 1]?.nav || 0;
            const totalGrowth = totalCommitment > 0 ? endingValue / totalCommitment : 0;
            
            const peakGap = Math.max(0, ...portfolio.liquidityForecast.map(l => l.fundingGap));
            const simulatedPeakPressure = Math.max(Math.abs(portfolio.kpis.peakProjectedOutflow.value), peakGap > 0 ? peakGap * 1.2 : 0);

            let liquidityPressure;
            if (simulatedPeakPressure > totalCommitment * 0.1) {
                liquidityPressure = 'High';
            } else if (simulatedPeakPressure > totalCommitment * 0.05) {
                liquidityPressure = 'Medium';
            } else {
                liquidityPressure = 'Low';
            }
            
            const breakevenYear = portfolio.kpis.breakevenTiming.from && portfolio.kpis.breakevenTiming.from !== 'N/A'
                ? new Date(portfolio.kpis.breakevenTiming.from).getFullYear() - new Date().getFullYear() + 1
                : 'N/A';

            const peakFundingNeed = Math.abs(portfolio.kpis.peakProjectedOutflow.value);
            const liquidityRunway = portfolio.kpis.liquidityRunwayInMonths || 0;

            return {
                id,
                name: scenarios[id].name,
                endingValue,
                totalGrowth,
                liquidityPressure,
                breakevenYear,
                peakFundingNeed,
                liquidityRunway,
            };
        });
        setComparisonData(data);
    }, [selectedIds, funds]);

    const metrics = [
        { key: 'endingValue', label: 'Ending Portfolio Value', format: formatCurrency },
        { key: 'totalGrowth', label: 'Total Growth Multiple', format: (v: number) => `${v.toFixed(2)}x` },
        { key: 'peakFundingNeed', label: 'Peak Funding Need', format: formatCurrency },
        { key: 'liquidityRunway', label: 'Liquidity Runway', format: (v: number) => v >= 24 ? `${(v/12).toFixed(1)} years` : `${v} months` },
        { key: 'liquidityPressure', label: 'Peak Liquidity Pressure' },
        { key: 'breakevenYear', label: 'Breakeven Point', format: (v: number | string) => (typeof v === 'number' ? `Year ${v}` : v) },
    ];
    
    const getBestWorst = (key: string) => {
        if (!comparisonData || comparisonData.length === 0) return {};
        
        const values = comparisonData.map(d => d[key as keyof typeof d]).filter(v => typeof v === 'number' && !isNaN(v as number)) as number[];
        if (values.length < 1) return {};

        const higherIsBetterMetrics = ['endingValue', 'totalGrowth', 'liquidityRunway'];
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
                    <p className="text-xs text-muted-foreground">Choose 2 to 4 scenarios to compare.</p>
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
                                <TableHead>Metric</TableHead>
                                {comparisonData.map(data => <TableHead key={data.id} className="text-center">{data.name}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metrics.map(metric => {
                                const { best, worst } = getBestWorst(metric.key);
                                return (
                                <TableRow key={metric.key}>
                                    <TableCell className="font-medium text-muted-foreground">{metric.label}</TableCell>
                                    {comparisonData.map(data => {
                                        const value = data[metric.key];
                                        const isBest = value === best;
                                        const isWorst = value === worst;
                                        let cellClass = 'text-center';
                                        if (isBest) cellClass += ' bg-green-50 text-green-800 font-bold';
                                        if (isWorst) cellClass += ' bg-red-50 text-red-800 font-bold';
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
        // Use a timeout to simulate network latency for a better loading state experience
        const timer = setTimeout(() => {
            const { scenario, factors } = scenarioFactorsMapping[selectedScenarioId];
            const { portfolio } = getPortfolioData(scenario, undefined, new Date(), factors);
            setPortfolioData(portfolio);
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [selectedScenarioId]);
    
    const totalCommitment = useMemo(() => funds.reduce((sum, fund) => sum + fund.commitment, 0), [funds]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold tracking-tight text-highlight flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6" />
                    Scenario Simulation
                </h1>
                <Select value={selectedScenarioId} onValueChange={(value) => setSelectedScenarioId(value as ScenarioId)}>
                    <SelectTrigger className="w-[250px] bg-secondary/50 border-border h-9 text-xs">
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
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-grow min-w-[300px]">
                    <Badge variant={selectedScenario.badge.variant}>{selectedScenario.badge.text}</Badge>
                    <p>{selectedScenario.description}</p>
                </div>
            )}

             <div className="flex items-center gap-2">
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
            <CardHeader>
                <CardTitle className="text-base font-semibold">Implications & Assumptions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <Card className="p-3 bg-muted/30">
                        <h4 className="text-sm font-semibold mb-1">Growth Implication</h4>
                        <p className="text-xs text-muted-foreground">{selectedScenario.implications.growth}</p>
                    </Card>
                     <Card className="p-3 bg-muted/30">
                        <h4 className="text-sm font-semibold mb-1">Risk Implication</h4>
                        <p className="text-xs text-muted-foreground">{selectedScenario.implications.risk}</p>
                    </Card>
                     <Card className="p-3 bg-muted/30">
                        <h4 className="text-sm font-semibold mb-1">Liquidity Implication</h4>
                        <p className="text-xs text-muted-foreground">{selectedScenario.implications.liquidity}</p>
                    </Card>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    <AssumptionTag label="Growth Outlook" value={selectedScenario.assumptions.growthOutlook} />
                    <AssumptionTag label="Volatility" value={selectedScenario.assumptions.volatility} />
                    <AssumptionTag label="Inflation" value={selectedScenario.assumptions.inflation} />
                    <AssumptionTag label="Liquidity" value={selectedScenario.assumptions.liquidity} />
                    <AssumptionTag label="Cashflow Timing" value={selectedScenario.assumptions.cashflowTiming} />
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
