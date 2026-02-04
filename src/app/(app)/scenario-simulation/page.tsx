'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Zap, ShieldAlert, TrendingDown, CircleDollarSign, BrainCircuit, 
    TrendingUp, Landmark, Shield, Clock, Sailboat, Sparkles, ClipboardList, Activity,
    Rocket, ListTodo, Waves, Target, CheckCircle2, AlertTriangle, Layers, Info, X
} from 'lucide-react';
import { usePortfolioContext } from '@/components/layout/app-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';
import type { PortfolioData } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ScenarioId = 'base' | 'recession' | 'risingRates' | 'stagflation' | 'liquidityCrunch';

type ScenarioDetails = {
  id: ScenarioId;
  name: string;
  description: string;
  badge: { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; };
  implications: {
    growth: string;
    risk: string;
    liquidity: string;
    timing: string;
    opportunity: string;
  };
  outcomes: {
    endingValue: string;
    irr: string;
    pressure: string;
    breakeven: string;
  }
};

const scenarios: Record<ScenarioId, ScenarioDetails> = {
  base: {
    id: 'base',
    name: 'Base Case',
    description: 'A balanced projection assuming moderate growth and stable market conditions.',
    badge: { text: 'Balanced', variant: 'default' },
    implications: {
      growth: 'Steady, in-line with long-term expectations.',
      risk: 'Market-level risk with standard volatility.',
      liquidity: 'Predictable contributions and withdrawals.',
      timing: 'Evenly-paced cash flows.',
      opportunity: 'Execute long-term plan; compounding works effectively.'
    },
    outcomes: {
      endingValue: '$163.7M',
      irr: '14.2%',
      pressure: 'Low',
      breakeven: 'Year 3'
    }
  },
  recession: {
    id: 'recession',
    name: 'Recession',
    description: 'Models a sharp market downturn followed by a slow, multi-year recovery.',
    badge: { text: 'Stress Test', variant: 'destructive' },
    implications: {
      growth: 'Widespread NAV markdowns across private portfolios.',
      risk: 'Heightened default risk and valuation uncertainty.',
      liquidity: 'Exit markets freeze; distributions slow significantly.',
      timing: 'Realizations are pushed to the end of the fund life.',
      opportunity: 'Attractive secondaries pricing as sellers seek liquidity.'
    },
    outcomes: {
      endingValue: '$128.4M',
      irr: '8.1%',
      pressure: 'Medium',
      breakeven: 'Year 5'
    }
  },
  risingRates: {
    id: 'risingRates',
    name: 'Rising Rates',
    description: 'Persistent interest rate hikes impacting cost of capital and exit multiples.',
    badge: { text: 'Valuation Risk', variant: 'secondary' },
    implications: {
      growth: 'Multiple compression limits portfolio appreciation.',
      risk: 'Refinancing risk for highly levered portfolio companies.',
      liquidity: 'Deal activity slows as debt financing becomes expensive.',
      timing: 'Longer holding periods as managers wait for markets to stabilize.',
      opportunity: 'Private credit funds benefit from higher floating rates.'
    },
    outcomes: {
      endingValue: '$142.1M',
      irr: '11.4%',
      pressure: 'Low',
      breakeven: 'Year 4'
    }
  },
  stagflation: {
    id: 'stagflation',
    name: 'Stagflation',
    description: 'High inflation coupled with low growth, eroding real returns.',
    badge: { text: 'Erosion Risk', variant: 'secondary' },
    implications: {
      growth: 'Nominal growth persists but real value is eroded.',
      risk: 'Margin squeeze due to rising input and labor costs.',
      liquidity: 'Capital markets become selective and risk-averse.',
      timing: 'Timing mismatch between inflation and exit cycles.',
      opportunity: 'Real assets and infrastructure provide natural hedges.'
    },
    outcomes: {
      endingValue: '$135.2M',
      irr: '9.8%',
      pressure: 'Medium',
      breakeven: 'Year 6'
    }
  },
  liquidityCrunch: {
    id: 'liquidityCrunch',
    name: 'Liquidity Crunch',
    description: 'A scenario where capital markets freeze, halting withdrawals and forcing reliance on credit.',
    badge: { text: 'Cashflow Stress', variant: 'destructive' },
    implications: {
      growth: 'Secondary market evaporates and M&A activity stops, freezing NAV.',
      risk: 'Highest risk of contribution defaults and potential for forced asset sales.',
      liquidity: 'Extreme stress. Withdrawals halt completely, contributions may be accelerated.',
      timing: 'Contributions are accelerated and front-loaded to defend assets; withdrawals stop entirely.',
      opportunity: 'For LPs with available capital, secondary markets can offer deep discounts on high-quality assets.'
    },
    outcomes: {
      endingValue: '$112.5M',
      irr: '4.2%',
      pressure: 'High',
      breakeven: 'N/A'
    }
  }
};

const formatCurrency = (value: number) => {
    const sign = value < 0 ? '-' : '';
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) return sign + `$${(absValue / 1_000_000_000).toFixed(1)}B`;
    if (absValue >= 1_000_000) return sign + `$${(absValue / 1_000_000).toFixed(1)}M`;
    return sign + `$${(absValue / 1000).toFixed(0)}K`;
};

const ImplicationCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex flex-col gap-1.5 rounded-lg border border-black/10 p-3 bg-white h-full shadow-sm">
        <div className="flex items-center gap-2">
            <Icon className="h-3 w-3 text-primary" />
            <h4 className="font-bold text-black text-[10px] uppercase tracking-wider">{title}</h4>
        </div>
        <p className="text-[10px] text-black font-medium leading-tight opacity-70">{description}</p>
    </div>
);

const OutcomeMetric = ({ icon: Icon, label, value, subtext, color = "text-black" }: { icon: React.ElementType, label: string, value: string, subtext: string, color?: string }) => (
    <div className="flex items-start gap-3 p-2 bg-muted/20 rounded-lg border border-black/5">
        <div className="mt-0.5 rounded-md bg-white p-1 shadow-sm border border-black/5">
            <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
            <p className="text-[10px] font-bold text-black uppercase opacity-60 tracking-wider">{label}</p>
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="text-[9px] font-medium text-black opacity-50">{subtext}</p>
        </div>
    </div>
);

const ScenarioVisualizationChart = ({ portfolioData }: { portfolioData: PortfolioData | null }) => {
    const combinedData = useMemo(() => {
        if (!portfolioData) return [];
        return portfolioData.cashflowForecast.map(cf => {
            const navPoint = portfolioData.navProjection.find(nd => nd.date === cf.date);
            const liqPoint = portfolioData.liquidityForecast.find(ld => ld.date === cf.date);
            return { 
                date: cf.date, 
                contribution: -cf.capitalCall, 
                withdrawal: cf.distribution, 
                nav: navPoint?.nav, 
                liquidityBalance: liqPoint?.liquidityBalance 
            };
        });
    }, [portfolioData]);

    if (!portfolioData) return <Skeleton className="h-[320px] w-full" />;

    const chartConfig = { 
        contribution: { label: 'Contributions', color: 'hsl(var(--chart-1))' }, 
        withdrawal: { label: 'Withdrawals', color: 'hsl(var(--chart-2))' }, 
        nav: { label: 'Portfolio Value', color: 'hsl(var(--chart-4))' }, 
        liquidityBalance: { label: 'Liquidity Balance', color: 'hsl(var(--chart-3))'} 
    };

    return (
        <Card className="lg:col-span-3 border-black/10 shadow-sm">
            <CardHeader className="py-3"><CardTitle className="text-xs font-semibold text-highlight uppercase tracking-tight">Scenario Visualization</CardTitle></CardHeader>
            <CardContent className="h-[340px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ComposedChart data={combinedData} margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => format(new Date(v), 'MMM yy')} interval={6} tick={{fontSize: 9, fill: 'black'}} />
                        <YAxis yAxisId="left" tickFormatter={formatCurrency} tickLine={false} axisLine={false} tick={{fontSize: 9, fill: 'black'}} label={{ value: 'Net Cashflow', angle: -90, position: 'insideLeft', style: {fontSize: '9px', fontWeight: 'bold'} }} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={formatCurrency} tickLine={false} axisLine={false} tick={{fontSize: 9, fill: 'black'}} label={{ value: 'Portfolio & Liquidity', angle: 90, position: 'insideRight', style: {fontSize: '9px', fontWeight: 'bold'} }} />
                        <Tooltip content={<ChartTooltipContent indicator="dot" labelFormatter={(label) => format(new Date(label), 'MMM yyyy')} />} />
                        <Legend wrapperStyle={{ fontSize: '9px' }} />
                        <ReferenceLine yAxisId="left" y={0} stroke="hsl(var(--border))" />
                        <Bar yAxisId="left" dataKey="withdrawal" name="Withdrawals" fill="var(--color-withdrawal)" stackId="stack" radius={[2, 2, 0, 0]} />
                        <Bar yAxisId="left" dataKey="contribution" name="Contributions" fill="var(--color-contribution)" stackId="stack" radius={[0, 0, 2, 2]} />
                        <Line yAxisId="right" type="monotone" dataKey="nav" name="Portfolio Value" stroke="var(--color-nav)" strokeWidth={2.5} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="liquidityBalance" name="Liquidity Balance" stroke="var(--color-liquidityBalance)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                    </ComposedChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

export function ScenarioComparisonDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-sm font-bold text-highlight uppercase tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4" /> Scenario Comparison Model
          </DialogTitle>
          <DialogDescription className="text-xs text-black font-medium">
            Side-by-side performance and risk attribution across all simulated market scenarios.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="rounded-lg border border-black/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-[10px] font-bold text-black uppercase w-[150px]">Metric / Factor</TableHead>
                  {Object.values(scenarios).map(s => (
                    <TableHead key={s.id} className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-black uppercase">{s.name}</span>
                        <Badge variant={s.badge.variant} className="text-[8px] font-bold uppercase h-4 px-1">{s.badge.text}</Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-muted/10 font-bold">
                  <TableCell className="text-[10px] uppercase text-highlight border-r">Implications</TableCell>
                  <TableCell colSpan={5} className="bg-transparent"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-[10px] font-bold text-black uppercase border-r flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-primary" /> Growth</TableCell>
                  {Object.values(scenarios).map(s => <TableCell key={s.id} className="text-[10px] text-black/70 font-medium text-center">{s.implications.growth}</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableCell className="text-[10px] font-bold text-black uppercase border-r flex items-center gap-1.5"><ShieldAlert className="h-3 w-3 text-primary" /> Risk</TableCell>
                  {Object.values(scenarios).map(s => <TableCell key={s.id} className="text-[10px] text-black/70 font-medium text-center">{s.implications.risk}</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableCell className="text-[10px] font-bold text-black uppercase border-r flex items-center gap-1.5"><Waves className="h-3 w-3 text-primary" /> Liquidity</TableCell>
                  {Object.values(scenarios).map(s => <TableCell key={s.id} className="text-[10px] text-black/70 font-medium text-center">{s.implications.liquidity}</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableCell className="text-[10px] font-bold text-black uppercase border-r flex items-center gap-1.5"><Clock className="h-3 w-3 text-primary" /> Cash Timing</TableCell>
                  {Object.values(scenarios).map(s => <TableCell key={s.id} className="text-[10px] text-black/70 font-medium text-center">{s.implications.timing}</TableCell>)}
                </TableRow>
                <TableRow className="bg-muted/10 font-bold">
                  <TableCell className="text-[10px] uppercase text-highlight border-r">Outcomes</TableCell>
                  <TableCell colSpan={5} className="bg-transparent"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-[10px] font-bold text-black uppercase border-r flex items-center gap-1.5"><Landmark className="h-3 w-3 text-primary" /> Ending Value</TableCell>
                  {Object.values(scenarios).map(s => <TableCell key={s.id} className="text-[11px] font-bold text-black text-center">{s.outcomes.endingValue}</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableCell className="text-[10px] font-bold text-black uppercase border-r flex items-center gap-1.5"><Activity className="h-3 w-3 text-primary" /> ITD IRR</TableCell>
                  {Object.values(scenarios).map(s => <TableCell key={s.id} className="text-[11px] font-bold text-orange-600 text-center">{s.outcomes.irr}</TableCell>)}
                </TableRow>
                <TableRow>
                  <TableCell className="text-[10px] font-bold text-black uppercase border-r flex items-center gap-1.5"><Shield className="h-3 w-3 text-primary" /> Liq. Pressure</TableCell>
                  {Object.values(scenarios).map(s => (
                    <TableCell key={s.id} className="text-center">
                      <span className={`text-[10px] font-bold ${s.outcomes.pressure === 'High' ? 'text-red-600' : s.outcomes.pressure === 'Medium' ? 'text-orange-600' : 'text-green-600'}`}>
                        {s.outcomes.pressure}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ScenarioSimulationPage() {
    const { scenario: selectedScenarioId, setScenario, portfolioData } = usePortfolioContext();
    const [mounted, setMounted] = useState(false);
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const s = scenarios[selectedScenarioId];

    const narrative = useMemo(() => ({
        base: { 
            title: "Steady State", 
            summary: "Balanced J-curve with moderate growth and predictable flows.", 
            points: [
                { icon: Activity, text: "Portfolio growth tracks long-term market averages.", color: 'text-blue-500' }, 
                { icon: Landmark, text: "Cash flows are evenly paced with manageable liquidity needs.", color: 'text-green-500' }
            ] 
        },
        recession: { 
            title: "Resilient Growth", 
            summary: "Models a market downturn followed by a slow, multi-year recovery.", 
            points: [
                { icon: TrendingDown, text: "Initial markdowns expected across all private asset classes.", color: 'text-red-500' }, 
                { icon: Sparkles, text: "Opportunistic entry points in the secondary market.", color: 'text-green-600' }
            ] 
        },
        risingRates: { 
            title: "Multiple Squeeze", 
            summary: "Valuation compression from higher rates and refinancing risk.", 
            points: [
                { icon: CircleDollarSign, text: "Compression on exit multiples for long-duration assets.", color: 'text-orange-500' }, 
                { icon: BrainCircuit, text: "Focus shifts to operational value creation over leverage.", color: 'text-blue-600' }
            ] 
        },
        stagflation: { 
            title: "Real Value Erosion", 
            summary: "High inflation eroding margins and real portfolio returns.", 
            points: [
                { icon: ShieldAlert, text: "Input costs and margin pressure in industrial exposures.", color: 'text-red-500' }, 
                { icon: Target, text: "Infrastructure and real assets provide defensive hedges.", color: 'text-green-600' }
            ] 
        },
        liquidityCrunch: { 
            title: "Cash is King", 
            summary: "A market freeze where exit markets evaporate and contributions are accelerated to defend assets.", 
            points: [
                { icon: Waves, text: "Withdrawals halt entirely as exit markets (M&A, IPOs) effectively freeze.", color: 'text-red-600' }, 
                { icon: Shield, text: "Contributions are accelerated to defend portfolio companies, creating maximum LP liquidity stress.", color: 'text-orange-600' },
                { icon: Info, text: "Survival and access to credit become the primary focus over short term growth.", color: 'text-blue-600' }
            ] 
        },
    }[selectedScenarioId]), [selectedScenarioId]);

    const recommendations = useMemo(() => ({
        base: {
            title: "Strategic Monitoring",
            summary: "Maintain current allocation strategy while monitoring performance vs benchmarks.",
            points: [
                { icon: ListTodo, text: "Continue with planned commitment schedule.", color: 'text-blue-500' }, 
                { icon: Landmark, text: "Rebalance if strategy drift exceeds 5% threshold.", color: 'text-green-500' }
            ]
        },
        recession: {
            title: "Defensive Positioning",
            summary: "Secure liquidity and identify high-quality distressed opportunities.",
            points: [
                { icon: Shield, text: "Ensure liquidity buffers cover 24 months of projected calls.", color: 'text-red-500' }, 
                { icon: Sparkles, text: "Review secondary market for 'forced seller' discounts.", color: 'text-green-600' }
            ]
        },
        risingRates: {
            title: "Portfolio De-Risking",
            summary: "Audit leverage levels and prioritize cash-generative assets.",
            points: [
                { icon: Activity, text: "Audit floating-rate exposure across GP portfolios.", color: 'text-orange-500' }, 
                { icon: Target, text: "Prioritize funds focused on operational growth vs multiple expansion.", color: 'text-blue-600' }
            ]
        },
        stagflation: {
            title: "Real Return Hedging",
            summary: "Shift focus to assets with pricing power and inflation-linked cash flows.",
            points: [
                { icon: ShieldAlert, text: "Increase allocation to Infrastructure and Power.", color: 'text-red-500' }, 
                { icon: ClipboardList, text: "Verify GP pricing power models in existing portfolios.", color: 'text-orange-600' }
            ]
        },
        liquidityCrunch: {
            title: "Defensive Positioning & Cash Preservation",
            summary: "In a market freeze, 'cash is king.' The immediate priority is ensuring you can weather the storm without becoming a forced seller.",
            points: [
                { icon: Landmark, text: "Immediately confirm available credit lines and other sources of emergency liquidity.", color: 'text-red-600' }, 
                { icon: Target, text: "Rank all unfunded commitments by priority and explore possibilities for deferring non-essential contributions.", color: 'text-orange-600' },
                { icon: AlertTriangle, text: "Halt any new, non-essential commitments until market stability and visibility returns.", color: 'text-orange-500' }
            ]
        },
    }[selectedScenarioId]), [selectedScenarioId]);

    if (!mounted || !portfolioData) return <Skeleton className="h-screen w-full" />;

    return (
        <div className="space-y-4">
            <Card className="bg-white border-black/10 shadow-sm">
                <CardContent className="py-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-4 w-4 text-highlight" />
                            <h1 className="text-xs font-bold text-highlight uppercase tracking-tight">Scenario Simulation</h1>
                        </div>
                        <Select value={selectedScenarioId} onValueChange={(v) => setScenario(v as ScenarioId)}>
                            <SelectTrigger className="w-[180px] bg-secondary/30 h-7 text-xs font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.values(scenarios).map(sc => <SelectItem key={sc.id} value={sc.id} className="text-xs">{sc.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Badge variant={s.badge.variant} className="text-[9px] font-bold uppercase h-5">{s.badge.text}</Badge>
                        <p className="text-[10px] text-black/60 font-medium truncate max-w-[400px]">{s.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-[10px] font-bold uppercase border-black/20"
                      onClick={() => setIsCompareOpen(true)}
                    >
                        <Layers className="h-3 w-3 mr-1.5" /> Compare Scenarios
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <ImplicationCard icon={TrendingUp} title="Growth" description={s.implications.growth} />
                <ImplicationCard icon={ShieldAlert} title="Risk" description={s.implications.risk} />
                <ImplicationCard icon={Waves} title="Liquidity" description={s.implications.liquidity} />
                <ImplicationCard icon={Clock} title="Cashflow Timing" description={s.implications.timing} />
                <ImplicationCard icon={Sparkles} title="Key Opportunities" description={s.implications.opportunity} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
                <ScenarioVisualizationChart portfolioData={portfolioData} />
                <Card className="lg:col-span-1 border-black/10 shadow-sm">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-semibold text-highlight uppercase">Scenario Outcomes</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <OutcomeMetric 
                            icon={Landmark} 
                            label="Ending Portfolio Value" 
                            value={s.outcomes.endingValue} 
                            subtext="Projected value at end of fund life"
                        />
                        <OutcomeMetric 
                            icon={Activity} 
                            label="ITD IRR" 
                            value={s.outcomes.irr} 
                            subtext="Internal Rate of Return"
                            color="text-orange-600"
                        />
                        <OutcomeMetric 
                            icon={Shield} 
                            label="Peak Liquidity Pressure" 
                            value={s.outcomes.pressure} 
                            subtext={`Max quarterly need in stress period`}
                            color={s.outcomes.pressure === 'Low' ? 'text-green-600' : s.outcomes.pressure === 'Medium' ? 'text-orange-600' : 'text-red-600'}
                        />
                        <OutcomeMetric 
                            icon={Clock} 
                            label="Breakeven Point" 
                            value={s.outcomes.breakeven} 
                            subtext="When cumulative cashflow turns positive"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="border-black/10 shadow-sm">
                    <CardHeader className="py-3 border-b border-black/5 bg-muted/10">
                        <CardTitle className="text-xs font-bold text-highlight uppercase flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5" /> Narrative Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="bg-muted/30 p-3 rounded-lg border border-black/5">
                            <h4 className="font-bold text-[11px] text-black mb-1">{narrative.title}</h4>
                            <p className="text-[10px] text-black font-medium leading-tight opacity-70">{narrative.summary}</p>
                        </div>
                        <div className="space-y-2.5">
                            {narrative.points.map((p, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <p.icon className={`h-3.5 w-3.5 shrink-0 ${p.color} mt-0.5`} />
                                    <p className="text-[10px] font-medium text-black leading-normal">{p.text}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-black/10 shadow-sm">
                    <CardHeader className="py-3 border-b border-black/5 bg-muted/10">
                        <CardTitle className="text-xs font-bold text-highlight uppercase flex items-center gap-2">
                            <Rocket className="h-3.5 w-3.5" /> Recommendation - Next Steps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="bg-muted/30 p-3 rounded-lg border border-black/5">
                            <h4 className="font-bold text-[11px] text-black mb-1">{recommendations.title}</h4>
                            <p className="text-[10px] text-black font-medium leading-tight opacity-70">{recommendations.summary}</p>
                        </div>
                        <div className="space-y-2.5">
                            {recommendations.points.map((p, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <p.icon className={`h-3.5 w-3.5 shrink-0 ${p.color} mt-0.5`} />
                                    <p className="text-[10px] font-medium text-black leading-normal">{p.text}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex gap-3 items-start">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[10px] text-blue-700 font-medium leading-normal">
                    <span className="font-bold">Stress Test Summary:</span> This simulation models the resilience of your portfolio against external shocks. Use these insights to rebalance exposures or secure additional liquidity buffers if the risk score is high. Calculations are based on stochastic modeling and historical stress periods.
                </p>
            </div>

            <ScenarioComparisonDialog isOpen={isCompareOpen} onOpenChange={setIsCompareOpen} />
        </div>
    );
}
