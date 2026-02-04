'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
    Zap, ShieldAlert, TrendingDown, CircleDollarSign, BrainCircuit, 
    TrendingUp, Landmark, Shield, Clock, Sailboat, Sparkles, ClipboardList, Activity,
    Rocket, ListTodo, Waves, Target, CheckCircle2
} from 'lucide-react';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import type { PortfolioData } from '@/lib/types';

type ScenarioId = 'base' | 'recession' | 'risingRates' | 'stagflation' | 'liquidityCrunch';

type ScenarioDetails = {
  id: ScenarioId;
  name: string;
  description: string;
  badge: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; };
  implications: { growth: string; risk: string; liquidity: string; cashflowTiming: string; keyOpportunities: string; };
};

const scenarios: Record<ScenarioId, ScenarioDetails> = {
  base: {
    id: 'base',
    name: 'Base Case',
    description: 'Moderate growth and stable market conditions.',
    badge: { text: 'Balanced', variant: 'default', icon: Zap },
    implications: { growth: 'Steady growth.', risk: 'Standard volatility.', liquidity: 'Predictable flows.', cashflowTiming: 'Evenly-paced.', keyOpportunities: 'Long-term compounding.' },
  },
  recession: {
    id: 'recession',
    name: 'Recession',
    description: 'Models a sharp downturn followed by a gradual recovery.',
    badge: { text: 'Stress Test', variant: 'destructive', icon: TrendingDown },
    implications: { growth: 'Initial markdowns.', risk: 'Elevated volatility.', liquidity: 'Withdrawals slow.', cashflowTiming: 'Back-loaded.', keyOpportunities: 'Attractive entry points.' },
  },
  risingRates: {
    id: 'risingRates',
    name: 'Rising Rates',
    description: 'Persistent interest rate hikes impacting valuations.',
    badge: { text: 'Valuation Risk', variant: 'secondary', icon: CircleDollarSign },
    implications: { growth: 'Multiple compression.', risk: 'Duration sensitivity.', liquidity: 'Deal activity slows.', cashflowTiming: 'Back-loaded.', keyOpportunities: 'Operational value creation.' },
  },
  stagflation: {
    id: 'stagflation',
    name: 'Stagflation',
    description: 'High inflation and low growth.',
    badge: { text: 'Erosion Risk', variant: 'secondary', icon: ShieldAlert },
     implications: { growth: 'Real return compression.', risk: 'Margin squeeze.', liquidity: 'Tightening liquidity.', cashflowTiming: 'Value erosion.', keyOpportunities: 'Real assets.' },
  },
  liquidityCrunch: {
    id: 'liquidityCrunch',
    name: 'Liquidity Crunch',
    description: 'Capital markets freeze, halting realizations.',
    badge: { text: 'Cashflow Stress', variant: 'destructive', icon: Waves },
     implications: { growth: 'M&A stops.', risk: 'Default risk.', liquidity: 'Extreme stress.', cashflowTiming: 'Front-loaded calls.', keyOpportunities: 'Secondaries.' },
  },
};

const formatCurrency = (value: number) => {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) return sign + `$${(absValue / 1_000_000_000).toFixed(1)}B`;
    if (absValue >= 1_000_000) return sign + `$${(absValue / 1_000_000).toFixed(1)}M`;
    return sign + `$${(absValue / 1000).toFixed(0)}K`;
};

const ImplicationCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => (
    <div className="flex items-start gap-2 rounded-lg border p-2 bg-card h-full">
        <Icon className={`h-4 w-4 shrink-0 ${color} mt-0.5`} />
        <div>
            <h4 className="font-bold text-black mb-0.5 text-[10px] uppercase">{title}</h4>
            <p className="text-[10px] text-black leading-tight">{description}</p>
        </div>
    </div>
);

const ScenarioVisualizationChart = ({ portfolioData }: { portfolioData: PortfolioData | null }) => {
    const combinedData = useMemo(() => {
        if (!portfolioData) return [];
        return portfolioData.cashflowForecast.map(cf => {
            const navPoint = portfolioData.navProjection.find(nd => nd.date === cf.date);
            const liqPoint = portfolioData.liquidityForecast.find(ld => ld.date === cf.date);
            return { date: cf.date, contribution: -cf.capitalCall, withdrawal: cf.distribution, nav: navPoint?.nav, liquidityBalance: liqPoint?.liquidityBalance };
        });
    }, [portfolioData]);

    if (!portfolioData) return <Skeleton className="h-80 w-full" />;

    const chartConfig = { contribution: { label: 'Contributions', color: 'hsl(var(--chart-1))' }, withdrawal: { label: 'Withdrawals', color: 'hsl(var(--chart-2))' }, nav: { label: 'Portfolio Value', color: 'hsl(var(--chart-4))' }, liquidityBalance: { label: 'Liquidity Balance', color: 'hsl(var(--chart-3))'} };

    return (
        <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-xs font-semibold text-highlight uppercase tracking-tight">Scenario Visualization</CardTitle></CardHeader>
            <CardContent className="h-[320px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ComposedChart data={combinedData} margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => format(new Date(v), 'MMM yy')} interval={5} tick={{fontSize: 10, fill: 'black'}} />
                        <YAxis yAxisId="left" tickFormatter={formatCurrency} tickLine={false} axisLine={false} tick={{fontSize: 10, fill: 'black'}} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} tickLine={false} axisLine={false} tick={{fontSize: 10, fill: 'black'}} />
                        <Tooltip content={<ChartTooltipContent indicator="dot" labelFormatter={(label) => format(new Date(label), 'MMM yyyy')} />} />
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

export default function ScenarioSimulationPage() {
    const { scenario: selectedScenarioId, setScenario, portfolioData } = usePortfolioContext();
    const s = scenarios[selectedScenarioId];

    const narrative = useMemo(() => ({
        base: { title: "Steady State", summary: "Portfolio performs within expected bands.", points: [{ icon: Activity, text: "Consistent growth tracking averages.", color: 'text-blue-500' }, { icon: Landmark, text: "Predictable cash flows.", color: 'text-green-500' }] },
        recession: { title: "Resilient Growth", summary: "Short term pain with back-ended recovery.", points: [{ icon: TrendingDown, text: "Initial markdowns expected.", color: 'text-red-500' }, { icon: Sparkles, text: "Opportunistic entry points.", color: 'text-green-600' }] },
        risingRates: { title: "Multiple Squeeze", summary: "Valuation compression from higher rates.", points: [{ icon: CircleDollarSign, text: "Compression on exit multiples.", color: 'text-orange-500' }, { icon: BrainCircuit, text: "Focus on operational value.", color: 'text-blue-600' }] },
        stagflation: { title: "Real Value Erosion", summary: "Inflation outpaces nominal growth.", points: [{ icon: ShieldAlert, text: "Input costs erode margins.", color: 'text-red-500' }, { icon: Target, text: "Real assets provide hedge.", color: 'text-green-600' }] },
        liquidityCrunch: { title: "Cash Preservation", summary: "Systemic market freeze.", points: [{ icon: Waves, text: "Credit markets tighten significantly.", color: 'text-red-500' }, { icon: Shield, text: "Defensive liquidity prioritised.", color: 'text-orange-600' }] },
    }[selectedScenarioId]), [selectedScenarioId]);

    const recommendations = useMemo(() => ({
        base: [{ icon: ListTodo, text: "Monitor performance against baseline.", color: 'text-blue-500' }, { icon: Landmark, text: "Continue planned commitments.", color: 'text-green-500' }],
        recession: [{ icon: Shield, text: "Ensure liquidity buffers are active.", color: 'text-red-500' }, { icon: Sparkles, text: "Prepare for secondary opportunities.", color: 'text-green-600' }],
        risingRates: [{ icon: Activity, text: "Review leverage across GP portfolio.", color: 'text-orange-500' }, { icon: Target, text: "Audit operational improvement plans.", color: 'text-blue-600' }],
        stagflation: [{ icon: ShieldAlert, text: "Increase real asset exposures.", color: 'text-red-500' }, { icon: ClipboardList, text: "Audit GP pricing power models.", color: 'text-orange-600' }],
        liquidityCrunch: [{ icon: Waves, text: "Establish 24-month cash reserve.", color: 'text-red-600' }, { icon: Sailboat, text: "Halt non-essential new commitments.", color: 'text-orange-600' }],
    }[selectedScenarioId]), [selectedScenarioId]);

    return (
        <div className="space-y-6">
            <Card className="bg-white border-black/10">
                <CardContent className="pt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xs font-semibold text-highlight flex items-center gap-2 uppercase"><BrainCircuit className="h-4 w-4" /> Scenario Simulation</h1>
                        <Select value={selectedScenarioId} onValueChange={(v) => setScenario(v as ScenarioId)}>
                            <SelectTrigger className="w-[180px] bg-secondary/50 h-7 text-xs font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.values(scenarios).map(sc => <SelectItem key={sc.id} value={sc.id} className="text-xs">{sc.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <Badge variant={s.badge.variant} className="text-[9px] font-bold uppercase">{s.badge.text}</Badge>
                </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <ImplicationCard icon={TrendingUp} title="Growth" description={s.implications.growth} color="text-chart-1" />
                <ImplicationCard icon={ShieldAlert} title="Risk" description={s.implications.risk} color="text-chart-5" />
                <ImplicationCard icon={Waves} title="Liquidity" description={s.implications.liquidity} color="text-chart-4" />
                <ImplicationCard icon={Clock} title="Timing" description={s.implications.cashflowTiming} color="text-chart-3" />
                <ImplicationCard icon={Sparkles} title="Opportunity" description={s.implications.keyOpportunities} color="text-chart-2" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ScenarioVisualizationChart portfolioData={portfolioData} />
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle className="text-xs font-semibold text-highlight uppercase">Scenario Outcomes</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-muted/30 rounded-lg border border-black/5">
                            <p className="text-[9px] font-bold text-black uppercase opacity-60">Ending Value</p>
                            <p className="text-lg font-bold">{formatCurrency(portfolioData?.navProjection[portfolioData.navProjection.length-1]?.nav || 0)}</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-black/5">
                            <p className="text-[9px] font-bold text-black uppercase opacity-60">Estimated IRR</p>
                            <p className="text-lg font-bold">{((portfolioData?.kpis.modelConfidence || 0.1) * 12).toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-black/5">
                            <p className="text-[9px] font-bold text-black uppercase opacity-60">Liquidity Pressure</p>
                            <p className="text-lg font-bold text-green-600">Low</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-xs font-semibold text-highlight uppercase flex items-center gap-2"><Activity className="h-4 w-4" /> Narrative Insights</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-3 rounded-lg"><h4 className="font-bold text-xs text-black mb-1">{narrative.title}</h4><p className="text-xs text-black leading-tight opacity-80">{narrative.summary}</p></div>
                        <div className="space-y-2">{narrative.points.map((p, i) => <div key={i} className="flex items-start gap-2"><p.icon className={`h-4 w-4 shrink-0 ${p.color}`} /><p className="text-[11px] font-medium text-black leading-tight">{p.text}</p></div>)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-xs font-semibold text-highlight uppercase flex items-center gap-2"><Rocket className="h-4 w-4" /> Recommendation - Next Steps</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted/50 p-3 rounded-lg"><h4 className="font-bold text-xs text-black mb-1">Strategic Advisory</h4><p className="text-xs text-black leading-tight opacity-80">Action items to optimize portfolio resilience in this scenario.</p></div>
                        <div className="space-y-2">{recommendations.map((p, i) => <div key={i} className="flex items-start gap-2"><p.icon className={`h-4 w-4 shrink-0 ${p.color}`} /><p className="text-[11px] font-medium text-black leading-tight">{p.text}</p></div>)}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
