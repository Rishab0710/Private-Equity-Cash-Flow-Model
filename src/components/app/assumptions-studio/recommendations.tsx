'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Rocket, TrendingUp, Landmark, ClipboardList, ShieldCheck, Search, Briefcase, 
    Gauge, BrainCircuit, FileBarChart, Building, Filter, Target, FileWarning, ListTodo, Ban
} from 'lucide-react';

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

type Props = {
    jCurveDepth: string;
    distributionSpeed: string;
    tvpiTarget: number;
};

export function NextStepsRecommendations({ jCurveDepth, distributionSpeed, tvpiTarget }: Props) {
    let recommendation: Recommendation = { 
        title: "Stay the Course & Monitor", 
        summary: "Your assumptions align with baseline expectations. Maintain discipline and monitor performance against these long-term goals.",
        points: [
            { icon: TrendingUp, text: "Regularly review portfolio performance against this baseline forecast.", color: 'text-blue-600' },
            { icon: Landmark, text: "Continue with planned contributions to maximize the power of compounding.", color: 'text-green-600' },
            { icon: ClipboardList, text: "Identify future cash needs and align them with the projected withdrawal schedule.", color: 'text-blue-600' },
        ]
    };

    if (jCurveDepth === 'deep') {
        recommendation = { 
            title: "Identify Opportunity, Manage Liquidity", 
            summary: "Deep J-curves test liquidity but also present opportunities. Focus on surviving the stress while preparing to invest.",
            points: [
                { icon: ShieldCheck, text: "Assess liquidity reserves to ensure you can meet potentially accelerated calls.", color: 'text-red-600' },
                { icon: Search, text: "Evaluate opportunities to commit to top-tier funds at lower valuations.", color: 'text-orange-600' },
                { icon: Briefcase, text: "Stress test the portfolio for a longer-than-expected recovery period.", color: 'text-red-600' },
            ]
        };
    } else if (distributionSpeed === 'slow' || tvpiTarget < 1.8) {
        recommendation = { 
            title: "Focus on Value Creation",
            summary: "In a low-multiple environment, returns expansion is scarce. Focus shifts to operational value-add.",
            points: [
                { icon: Gauge, text: "Review exposure to long-duration assets most sensitive to delayed exits.", color: 'text-orange-600' },
                { icon: BrainCircuit, text: "Prioritize managers with proven expertise in driving operational improvements.", color: 'text-blue-600' },
                { icon: FileBarChart, text: "Model the impact of a slower M&A market on your portfolio's timeline.", color: 'text-orange-600' },
            ]
        };
    } else if (tvpiTarget > 2.8) {
        recommendation = { 
            title: "Optimizing High Growth Potential", 
            summary: "High targets require proactive management of winning assets and timely rebalancing.",
            points: [
                { icon: Building, text: "Monitor concentration risk in outperforming sectors or regions.", color: 'text-green-600' },
                { icon: Filter, text: "Scrutinize underlying companies for sustained pricing power and market share gains.", color: 'text-blue-600' },
                { icon: Target, text: "Ensure the exit strategy is aligned with the timing needed to hit these multiples.", color: 'text-green-600' },
            ]
        };
    }

    return (
        <Card className="border-black/10">
             <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-highlight">
                    <Rocket className="h-4 w-4" />
                    Recommendation - Next Steps
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 pt-0">
                 <div className="bg-muted/50 p-3 rounded-lg border border-black/5">
                    <h4 className="font-bold text-xs text-black mb-1">{recommendation.title}</h4>
                    <p className="text-xs text-black font-medium leading-tight">{recommendation.summary}</p>
                 </div>
                 <div className="space-y-3">
                    {recommendation.points.map((point, index) => (
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
