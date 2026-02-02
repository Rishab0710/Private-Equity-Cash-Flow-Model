'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, ShieldAlert, TrendingDown, ChevronsUp, Waves, CircleDollarSign, BrainCircuit, TrendingUp, Landmark, Shield, BarChart, Hourglass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPortfolioData } from '@/lib/data';
import type { PortfolioData } from '@/lib/types';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Area, Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

    const { navProjection, cashflowForecast } = portfolioData;

    const combinedData = cashflowForecast.map(cf => {
        const navDataPoint = navProjection.find(nd => nd.date === cf.date);
        return { ...cf, capitalCall: -cf.capitalCall, nav: navDataPoint?.nav };
    });

    const chartConfig = {
        capitalCall: { label: 'Capital Calls', color: 'hsl(var(--chart-2))' },
        distribution: { label: 'Distributions', color: 'hsl(var(--chart-1))' },
        nav: { label: 'Portfolio Value', color: 'hsl(var(--chart-4))' },
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
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => formatCurrency(value)} tickLine={false} axisLine={false} label={{ value: "Portfolio Value", angle: 90, position: 'insideRight', offset: -10, style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' } }} />
                        <Tooltip content={<ChartTooltipContent formatter={(value, name) => formatCurrency(name === 'capitalCall' ? -value : value)} labelFormatter={(label) => format(new Date(label), 'MMM yyyy')} indicator="dot" />} />
                        <Legend />
                        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" />
                        <Bar yAxisId="left" dataKey="distribution" fill="var(--color-distribution)" stackId="stack" radius={[2, 2, 0, 0]} />
                        <Bar yAxisId="left" dataKey="capitalCall" fill="var(--color-capitalCall)" stackId="stack" />
                        <Line yAxisId="right" type="monotone" dataKey="nav" stroke="var(--color-nav)" strokeWidth={2} dot={false} />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

const ScenarioOutcomes = ({ portfolioData, totalCommitment }: { portfolioData: PortfolioData | null, totalCommitment: number }) => {
    if (!portfolioData) {
        return (
            <>
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </>
        );
    }

    const { kpis, navProjection } = portfolioData;
    const endingValue = navProjection[navProjection.length - 1]?.nav || 0;
    const totalGrowth = totalCommitment > 0 ? endingValue / totalCommitment : 0;
    
    const liquidityPressureValue = Math.abs(kpis.peakProjectedOutflow.value);
    let liquidityPressure, liquidityColor;
    if (liquidityPressureValue > totalCommitment * 0.1) {
        liquidityPressure = 'High';
        liquidityColor = 'text-red-500';
    } else if (liquidityPressureValue > totalCommitment * 0.05) {
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
        <Card>
             <CardHeader><CardTitle>Scenario Outcomes</CardTitle></CardHeader>
             <CardContent className="space-y-3">
                 <OutcomeCard title="Ending Portfolio Value" value={formatCurrency(endingValue)} description="Projected value at end of fund life" icon={Landmark} />
                 <OutcomeCard title="Total Growth" value={`${totalGrowth.toFixed(2)}x`} description="Multiple on committed capital" icon={TrendingUp} />
                 <OutcomeCard title="Peak Liquidity Pressure" value={liquidityPressure} description={`Max quarterly call of ${formatCurrency(liquidityPressureValue)}`} icon={Shield} valueClass={liquidityColor} />
                 <OutcomeCard title="Breakeven Point" value={`Year ${kpis.breakevenTiming.from ? new Date(kpis.breakevenTiming.from).getFullYear() - new Date().getFullYear() + 1 : 'N/A'}`} description="When cumulative cashflow turns positive" icon={Hourglass} />
            </CardContent>
        </Card>
    );
}

const NarrativeInsights = ({ scenarioId }: { scenarioId: ScenarioId }) => {
    const insights: Record<ScenarioId, { title: string, text: string }> = {
        base: { title: "Steady & Predictable", text: "The base case shows a standard J-curve with moderate growth. Cash flows are evenly paced, leading to a healthy return multiple with manageable liquidity needs. This represents a 'business as usual' outlook." },
        recession: { title: "Short-term Pain, Long-term Gain?", text: "A recession causes early NAV markdowns and halts distributions. However, accelerated capital calls into a down market can lead to a powerful recovery and strong back-ended returns if the portfolio is resilient." },
        risingRates: { title: "A Slower Grind", text: "Higher interest rates act as a headwind, compressing valuation multiples. This slows NAV growth and delays exits, resulting in a more back-loaded return profile and a lower overall IRR." },
        stagflation: { title: "The Real Return Squeeze", text: "A toxic mix of high inflation and low growth. While nominal NAV might hold up, real returns are significantly eroded. Liquidity tightens, and only assets with strong pricing power can protect margins." },
        liquidityCrunch: { title: "Cash is King", text: "This scenario models a market freeze. Distributions stop entirely, and capital calls are accelerated to defend portfolio companies, placing maximum stress on LP liquidity and credit facilities." },
        strongGrowth: { title: "Riding the Wave", text: "An optimistic scenario where a booming economy accelerates both NAV growth and exit opportunities. This leads to early distributions and a front-loaded, higher-return profile, but risks frothy valuations." },
    };

    const insight = insights[scenarioId];

    return (
        <Card>
             <CardHeader><CardTitle>Narrative Insights</CardTitle></CardHeader>
             <CardContent>
                 <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.text}</p>
                 </div>
            </CardContent>
        </Card>
    )
}

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
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
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
             <div className="flex items-center gap-2">
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" disabled>Compare Scenarios</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Coming Soon</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
            </div>
        </CardContent>
      </Card>

      {selectedScenario && (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                             <selectedScenario.badge.icon className="h-5 w-5" />
                            {selectedScenario.name}
                        </CardTitle>
                        <CardDescription className="mt-2">{selectedScenario.description}</CardDescription>
                    </div>
                     <Badge variant={selectedScenario.badge.variant}>{selectedScenario.badge.text}</Badge>
                </div>
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
        <div className="lg:col-span-1 space-y-6">
          <ScenarioOutcomes portfolioData={portfolioData} totalCommitment={totalCommitment} />
          <NarrativeInsights scenarioId={selectedScenarioId} />
        </div>
      </div>
    </div>
  );
}
