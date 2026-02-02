'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Zap, ShieldAlert, TrendingDown, ChevronsUp, Waves, CircleDollarSign, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const AssumptionTag = ({ label, value }: { label: string, value: string }) => {
    const colorClasses = {
        'Positive': 'bg-green-100 text-green-800',
        'Neutral': 'bg-blue-100 text-blue-800',
        'Negative': 'bg-red-100 text-red-800',
        'Low': 'bg-green-100 text-green-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'High': 'bg-red-100 text-red-800',
        'Elevated': 'bg-yellow-100 text-yellow-800',
        'Abundant': 'bg-blue-100 text-blue-800',
        'Tight': 'bg-yellow-100 text-yellow-800',
        'Stressed': 'bg-red-100 text-red-800',
        'Front-loaded': 'bg-purple-100 text-purple-800',
        'Evenly-paced': 'bg-blue-100 text-blue-800',
        'Back-loaded': 'bg-orange-100 text-orange-800',
    };
    const colorClass = colorClasses[value as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800';

    return (
        <div className="flex flex-col items-center justify-center p-2 text-center bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                {value}
            </div>
        </div>
    );
};


export default function ScenarioSimulationPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ScenarioId>('base');
  const selectedScenario = scenarios[selectedScenarioId];

  return (
    <div className="space-y-6">
      {/* 1. SCENARIO SELECTOR */}
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
                <Button variant="outline">Compare Scenarios</Button>
            </div>
        </CardContent>
      </Card>

      {/* 2. SCENARIO OVERVIEW */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. VISUALIZATION */}
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Scenario Visualization</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">Portfolio Value & Cashflow Charts Coming Soon</p>
                </div>
            </CardContent>
        </Card>

        {/* 4. OUTCOME & INSIGHTS */}
        <Card>
             <CardHeader>
                <CardTitle>Scenario Outcomes</CardTitle>
            </CardHeader>
             <CardContent>
                <div className="h-48 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">Outcome Cards Coming Soon</p>
                </div>
            </CardContent>
        </Card>
        <Card>
             <CardHeader>
                <CardTitle>Narrative Insights</CardTitle>
            </CardHeader>
             <CardContent>
                <div className="h-48 flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">Auto-generated Insights Coming Soon</p>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
