'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Activity, Landmark, BarChart, TrendingUp, TrendingDown, Clock, ChevronsUp, 
    CircleDollarSign, Hourglass, BrainCircuit, ShieldAlert, Waves, Shield
} from 'lucide-react';

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

type Props = {
    jCurveDepth: string;
    distributionSpeed: string;
    tvpiTarget: number;
};

export function NarrativeInsights({ jCurveDepth, distributionSpeed, tvpiTarget }: Props) {
    // Dynamic logic to pick the narrative based on assumptions
    let insight: Narrative = { 
        title: "Stay the Course", 
        summary: "The base case shows a standard J-curve with moderate growth. Cash flows are evenly paced, leading to a healthy return multiple with manageable liquidity needs.",
        points: [
            { icon: Activity, text: "Portfolio growth is consistent, tracking long-term market averages.", color: 'text-blue-600' },
            { icon: Landmark, text: "Cash flows are evenly paced, with no major liquidity surprises.", color: 'text-blue-600' },
            { icon: BarChart, text: "A healthy return multiple is achieved with manageable risk.", color: 'text-blue-600' },
        ]
    };

    if (jCurveDepth === 'deep') {
        insight = { 
            title: "Short-term Pain, Long-term Gain?", 
            summary: "A deep J-curve assumes significant early markdowns. This profile tests early liquidity but often sets the stage for high growth as portfolio companies mature.",
            points: [
                { icon: TrendingDown, text: "Initial NAV markdowns create higher early liquidity pressure.", color: 'text-red-600' },
                { icon: Clock, text: "Recovery timeline is extended, requiring patient capital management.", color: 'text-orange-600' },
                { icon: ChevronsUp, text: "Deep value creation strategies often lead to more explosive back-ended returns.", color: 'text-green-600' },
            ]
        };
    } else if (distributionSpeed === 'slow' || tvpiTarget < 1.8) {
        insight = { 
            title: "A Slower Grind",
            summary: "Conservative distribution assumptions suggest a longer holding period or compressed valuation multiples in the current environment.",
            points: [
                { icon: CircleDollarSign, text: "Valuation multiples are compressed, leading to slower overall NAV growth.", color: 'text-orange-600' },
                { icon: Hourglass, text: "Exit markets are assumed to be cool, delaying realizations and extending the fund life.", color: 'text-orange-600' },
                { icon: BrainCircuit, text: "Emphasis on operational improvements is critical to drive value when multiples are flat.", color: 'text-blue-600' },
            ]
        };
    } else if (tvpiTarget > 2.8) {
         insight = { 
            title: "High Alpha Profile", 
            summary: "Targeting top-quartile returns requires aggressive growth assumptions and efficient capital recycling.",
            points: [
                { icon: TrendingUp, text: "Assumes significant multiple expansion and robust portfolio company growth.", color: 'text-green-600' },
                { icon: ChevronsUp, text: "Distributions are expected to be substantial, allowing for rapid DPI realization.", color: 'text-green-600' },
                { icon: BarChart, text: "Portfolio concentration risk may be higher to achieve these outsized targets.", color: 'text-blue-600' },
            ]
        };
    }

    return (
        <Card className="border-black/10">
             <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-highlight">
                    <BarChart className="h-4 w-4" />
                    Narrative Insights
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 pt-0">
                 <div className="bg-muted/50 p-3 rounded-lg border border-black/5">
                    <h4 className="font-bold text-xs text-black mb-1">{insight.title}</h4>
                    <p className="text-xs text-black font-medium leading-tight">{insight.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {insight.points.map((point, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <point.icon className={`h-4 w-4 mt-0.5 shrink-0 ${point.color}`} />
                            <p className="text-[11px] text-black font-medium flex-1 leading-tight">
                                {point.text}
                            </p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
}
