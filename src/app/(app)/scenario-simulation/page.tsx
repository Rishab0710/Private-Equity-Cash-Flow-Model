'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Zap, ShieldAlert, TrendingDown, ChevronsUp, Waves, CircleDollarSign, BrainCircuit, 
    TrendingUp, Landmark, Shield, Clock, Sailboat, Sparkles, ClipboardList, Activity,
    Rocket, ListTodo
} from 'lucide-react';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import type { PortfolioData, Scenario } from '@/lib/types';

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
            <p className="text-[10px] text-black leading-tight">{description}</p>
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
            <CardHeader><CardTitle className="text-sm font-semibold text-highlight uppercase tracking-tight">Scenario Visualization</CardTitle></CardHeader>
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
                                             <div className="h-2 w-2 rounded-full" style={{backgroundColor: config.color}}/>
                                             <span className="text-[10px] font-medium">{config.label}</span>
                                          </div>
                                          <span className="font-bold text-black ml-4 text-[10px]">{formatCurrency(value as number)}</span>
                                       </div>
                                    )
                                }}
                            />} 
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
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

const ScenarioOutcomes = ({ portfolioData }: { portfolioData: PortfolioData | null }) => {
    if (!portfolioData) return <Skeleton className="h-full min-h-[300px] lg:col-span-1" />;

    const outcomes = useMemo(() => {
        const { kpis, navProjection, cashflowForecast } = portfolioData;
        const cumulativeCalls = cashflowForecast.reduce((s, c) => s + c.capitalCall, 0);
        const cumulativeDists = cashflowForecast.reduce((s, c) => s + c.distribution, 0);
        const endingValue = navProjection[navProjection.length-1]?.nav || 0;
        const tvpi = cumulativeCalls > 0 ? (endingValue + cumulativeDists) / cumulativeCalls : 0;
        const itdIrr = (Math.pow(tvpi, 1 / 8) - 1) * 0.4; // Scaled demo IRR

        const pressure = kpis.peakProjectedOutflow.value < -25000000 ? 'High' : (kpis.peakProjectedOutflow.value < -10000000 ? 'Medium' : 'Low');
        const breakevenPoint = kpis.breakevenTiming.from !== 'N/A' ? `Year ${new Date(kpis.breakevenTiming.from).getFullYear() - new Date().getFullYear() + 1}` : 'N/A';
        
        return { endingValue, itdIrr, pressure, breakevenPoint, tvpi };
    }, [portfolioData]);
    
    return (
        <Card className="lg:col-span-1">
             <CardHeader><CardTitle className="text-sm font-semibold text-highlight uppercase tracking-tight">Scenario Outcomes</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                 <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border border-black/5">
                    <Landmark className="h-5 w-5 text-primary mt-1" />
                    <div>
                        <p className="text-[10px] font-bold text-black uppercase opacity-60">Ending Value</p>
                        <p className={`text-lg font-bold ${outcomes.tvpi < 1.5 ? 'text-red-500' : 'text-green-600'}`}>{formatCurrency(outcomes.endingValue)}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border border-black/5">
                    <TrendingUp className="h-5 w-5 text-primary mt-1" />
                    <div>
                        <p className="text-[10px] font-bold text-black uppercase opacity-60">Estimated IRR</p>
                        <p className={`text-lg font-bold ${outcomes.itdIrr < 0.08 ? 'text-red-500' : 'text-green-600'}`}>{`${(outcomes.itdIrr * 100).toFixed(1)}%`}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border border-black/5">
                    <Shield className="h-5 w-5 text-primary mt-1" />
                    <div>
                        <p className="text-[10px] font-bold text-black uppercase opacity-60">Liquidity Pressure</p>
                        <p className={`text-lg font-bold ${outcomes.pressure === 'High' ? 'text-red-500' : 'text-green-600'}`}>{outcomes.pressure}</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border border-black/5">
                    <Sailboat className="h-5 w-5 text-primary mt-1" />
                    <div>
                        <p className="text-[10px] font-bold text-black uppercase opacity-60">Breakeven Point</p>
                        <p className="text-lg font-bold">{outcomes.breakevenPoint}</p>
                    </div>
                 </div>
            </CardContent>
        </Card>
    );
}

const NarrativeInsights = ({ scenarioId }: { scenarioId: ScenarioId }) => {
    const insight = useMemo(() => ({
        base: { 
            title: "Stay the Course", 
            summary: "The base case shows a standard J-curve with moderate growth. Cash flows are evenly paced, leading to a healthy return multiple with manageable liquidity needs.",
            points: [
                { icon: Activity, text: "Portfolio growth is consistent, tracking long-term market averages.", color: 'text-blue-500' },
                { icon: Landmark, text: "Cash flows are evenly paced, with no major liquidity surprises.", color: 'text-blue-500' },
                { icon: TrendingUp, text: "A healthy return multiple is achieved with manageable risk, representing a 'business as usual' outlook.", color: 'text-blue-500' }
            ] 
        },
        recession: { 
            title: "Short-term Pain, Long-term Recovery", 
            summary: "Initial markdowns and delayed exits create temporary pressure but fuel a powerful back-ended recovery phase.",
            points: [
                { icon: TrendingDown, text: "Initial markdowns and delayed exits pause early distributions.", color: 'text-red-500' },
                { icon: Clock, text: "Distribution timeline is extended, requiring patient capital management.", color: 'text-orange-500' },
                { icon: Sparkles, text: "Powerful back-ended recovery as assets re-price and markets normalize.", color: 'text-green-600' }
            ]
        },
        risingRates: { 
            title: "Valuation Multiple Compression", 
            summary: "Higher discount rates slow NAV growth and exit pace as price discovery between buyers and sellers stalls.",
            points: [
                { icon: CircleDollarSign, text: "Exit multiples compress as borrowing costs rise for acquirers.", color: 'text-yellow-600' },
                { icon: Clock, text: "Holding periods extend while waiting for valuation normalization.", color: 'text-yellow-600' },
                { icon: ShieldAlert, text: "Cash yield becomes a larger component of total return attribution.", color: 'text-blue-500' }
            ]
        },
        stagflation: { 
            title: "The Real Return Squeeze", 
            summary: "Persistent inflation erodes real value despite nominal growth. Focus shifts to operational margin preservation.",
            points: [
                { icon: ShieldAlert, text: "High input costs erode portfolio company profit margins.", color: 'text-red-500' },
                { icon: Waves, text: "Systemic liquidity restricted by aggressive central bank tightening.", color: 'text-red-500' },
                { icon: Landmark, text: "Real assets and infrastructure provide critical inflation hedging.", color: 'text-green-600' }
            ]
        },
        liquidityCrunch: { 
            title: "Defensive Cash Preservation", 
            summary: "Systemic market freeze halts realizations entirely. Survival requires deep cash reserves and defensive asset management.",
            points: [
                { icon: Waves, text: "Capital markets freeze, making traditional exits impossible.", color: 'text-red-500' },
                { icon: Shield, text: "Strategic focus shifts to asset survival over short-term IRR.", color: 'text-yellow-600' },
                { icon: CircleDollarSign, text: "Secondary market sales may be required at significant discounts.", color: 'text-red-500' }
            ]
        },
    }[scenarioId]), [scenarioId]);

    return (
        <Card className="h-full">
             <CardHeader><CardTitle className="text-sm font-semibold text-highlight uppercase tracking-tight flex items-center gap-2"><Activity className="h-4 w-4" /> Narrative Insights</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted/50 p-4 rounded-lg border border-black/5">
                    <h4 className="font-bold text-xs text-black mb-1">{insight.title}</h4>
                    <p className="text-xs text-black leading-tight opacity-80">{insight.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {insight.points.map((p, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <p.icon className={`h-4 w-4 mt-0.5 shrink-0 ${p.color}`} />
                            <p className="text-[11px] text-black font-medium flex-1 leading-tight">{p.text}</p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
}

const RecommendationInsights = ({ scenarioId }: { scenarioId: ScenarioId }) => {
    const recommendation = useMemo(() => ({
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
            title: "Manage Liquidity & Identify Opportunities", 
            summary: "Recessions test liquidity but also present unique entry points. Focus on preservation while preparing for the recovery phase.",
            points: [
                { icon: ShieldAlert, text: "Review credit facilities and ensure sufficient liquidity buffers are in place.", color: 'text-red-500' },
                { icon: Sparkles, text: "Look for secondary market opportunities to acquire high-quality assets at a discount.", color: 'text-orange-500' },
                { icon: Clock, text: "Stress test your portfolio for an extended downturn beyond the initial 24 months.", color: 'text-red-500' },
            ]
        },
        risingRates: { 
            title: "Optimize for Value Creation", 
            summary: "In a low-multiple environment, operational performance is the primary driver of value. Review leverage levels across the portfolio.",
            points: [
                { icon: BrainCircuit, text: "Engage with GPs on operational value-add initiatives and efficiency programs.", color: 'text-blue-600' },
                { icon: Landmark, text: "Audit portfolio company debt levels for sensitivity to floating interest rates.", color: 'text-yellow-600' },
                { icon: ListTodo, text: "Prioritize realizations from mature assets to lock in existing valuation gains.", color: 'text-green-600' },
            ]
        },
        stagflation: { 
            title: "Defend Real Returns", 
            summary: "Pricing power and cost pass-through capability are essential for portfolio companies. Seek exposure to inflation-resilient sectors.",
            points: [
                { icon: ShieldCheck, text: "Evaluate companies for pricing power and ability to sustain margins amid rising costs.", color: 'text-green-600' },
                { icon: Landmark, text: "Increase allocation to real assets with direct inflation-linked revenue streams.", color: 'text-blue-600' },
                { icon: FileWarning, text: "Identify and reduce exposure to consumer-discretionary sectors with high cost sensitivity.", color: 'text-red-500' },
            ]
        },
        liquidityCrunch: { 
            title: "Ensure Survival & Capital Access", 
            summary: "Systemic market freezes require immediate defensive action. Secure all available credit and halt non-essential commitments.",
            points: [
                { icon: Shield, text: "Establish a defensive liquidity reserve equal to 24 months of expected capital calls.", color: 'text-red-500' },
                { icon: Landmark, text: "Draw down existing revolving credit lines before lenders tighten availability.", color: 'text-red-500' },
                { icon: Sailboat, text: "Communicate proactively with GPs to understand their contingency funding plans.", color: 'text-blue-500' },
            ]
        },
    }[scenarioId] || { 
        title: "Maintain Vigilance", 
        summary: "Market conditions are shifting. Ensure your risk management frameworks are active and up-to-date.",
        points: [{ icon: Shield, text: "Monitor key risk indicators frequently.", color: 'text-yellow-600' }] 
    }), [scenarioId]);

    return (
        <Card className="h-full">
             <CardHeader><CardTitle className="text-sm font-semibold text-highlight uppercase tracking-tight flex items-center gap-2"><Rocket className="h-4 w-4" /> Recommendation - Next Steps</CardTitle></CardHeader>
             <CardContent className="space-y-4">
                 <div className="bg-muted/50 p-4 rounded-lg border border-black/5">
                    <h4 className="font-bold text-xs text-black mb-1">{recommendation.title}</h4>
                    <p className="text-xs text-black leading-tight opacity-80">{recommendation.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {recommendation.points.map((p, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <p.icon className={`h-4 w-4 mt-0.5 shrink-0 ${p.color}`} />
                            <p className="text-[11px] text-black font-medium flex-1 leading-tight">{p.text}</p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
}

export default function ScenarioSimulationPage() {
    const { scenario: selectedScenarioId, setScenario: setSelectedScenarioId, portfolioData } = usePortfolioContext();
    const selectedScenario = scenarios[selectedScenarioId];

    return (
        <div className="space-y-6">
            <Card className="bg-white border-black/10">
                <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <h1 className="text-sm font-semibold tracking-tight text-highlight flex items-center gap-2 uppercase">
                            <BrainCircuit className="h-5 w-5" />
                            Scenario Simulation
                        </h1>
                        <Select value={selectedScenarioId} onValueChange={(value) => setSelectedScenarioId(value as ScenarioId)}>
                            <SelectTrigger className="w-[180px] bg-secondary/50 h-8 text-xs font-bold">
                                <SelectValue placeholder="Select Scenario" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(scenarios).map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        <div className="flex items-center gap-2 text-[11px] font-bold">
                                            <s.badge.icon className="h-3.5 w-3.5" />
                                            <span>{s.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedScenario && (
                        <div className="flex items-center gap-3 text-xs text-black flex-grow min-w-0">
                            <Badge variant={selectedScenario.badge.variant} className="text-[10px] font-bold uppercase">{selectedScenario.badge.text}</Badge>
                            <p className="truncate text-black font-medium opacity-80">{selectedScenario.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedScenario && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <ImplicationCard icon={TrendingUp} title="Growth" description={selectedScenario.implications.growth} color="text-chart-1" />
                    <ImplicationCard icon={ShieldAlert} title="Risk" description={selectedScenario.implications.risk} color="text-chart-5" />
                    <ImplicationCard icon={Waves} title="Liquidity" description={selectedScenario.implications.liquidity} color="text-chart-4" />
                    <ImplicationCard icon={Clock} title="Cashflow Timing" description={selectedScenario.implications.cashflowTiming} color="text-chart-3" />
                    <ImplicationCard icon={Sparkles} title="Key Opportunities" description={selectedScenario.implications.keyOpportunities} color="text-chart-2" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ScenarioVisualizationChart portfolioData={portfolioData} />
                <ScenarioOutcomes portfolioData={portfolioData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NarrativeInsights scenarioId={selectedScenarioId} />
                <RecommendationInsights scenarioId={selectedScenarioId} />
            </div>
        </div>
    );
}

// Inline missing icon
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function FileWarning(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M12 11v4" />
      <path d="M12 19h.01" />
    </svg>
  )
}
