'use client';
import { useState, useEffect } from 'react';
import { AssumptionSets } from "@/components/app/assumptions-studio/assumption-sets";
import { CashflowTimeline } from "@/components/app/assumptions-studio/cashflow-timeline";
import { JCurvePreview } from "@/components/app/assumptions-studio/j-curve-preview";
import { JCurveShapeControls } from "@/components/app/assumptions-studio/j-curve-shape-controls";
import { MultiplesAssumptions } from "@/components/app/assumptions-studio/multiples-assumptions";
import { NarrativeInsights } from "@/components/app/assumptions-studio/narrative-insights";
import { NextStepsRecommendations } from "@/components/app/assumptions-studio/recommendations";
import { SummaryOutputs } from "@/components/app/assumptions-studio/summary-outputs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FundSelector } from '@/components/app/dashboard/fund-selector';

const generateAssumptionData = (params: any) => {
    const {
        investmentPeriod,
        deploymentPacing,
        jCurveDepth,
        timeToBreakeven,
        distributionStart,
        distributionSpeed,
        tvpiTarget,
        moicTarget,
        dpiTarget,
        rvpiTarget
    } = params;
    
    const fundLife = 15;
    const commitment = 100;
    
    const depthFactor = { 'shallow': 0.7, 'moderate': 1, 'deep': 1.4 }[jCurveDepth as keyof typeof jCurveDepth] || 1; 
    const breakevenAdj = { 'early': -1, 'mid': 0, 'late': 1 }[timeToBreakeven as keyof typeof timeToBreakeven] || 0;
    const distStartAdj = { 'early': -1, 'typical': 0, 'late': 1 }[distributionStart as keyof typeof distributionStart] || 0;
    
    const dpiScaling = dpiTarget / 1.5;
    const distSpeedFactor = ({ 'slow': 0.7, 'normal': 1, 'fast': 1.4 }[distributionSpeed as keyof typeof distributionSpeed] || 1) * dpiScaling;
    const returnScaling = tvpiTarget / 2.2;

    let jCurveData = [];
    let unfunded = commitment;
    let nav = 0;
    let totalCalls = 0;
    let totalDists = 0;
    let cumulativeNet = 0;
    let maxNavValue = 0;
    let maxNavYear = 0;

    for (let year = 0; year <= fundLife; year++) {
        let call = 0;
        if (year > 0 && year <= investmentPeriod && unfunded > 0) {
            const baseCall = commitment / investmentPeriod;
            const progress = (year - 1) / investmentPeriod;
            const pacingAdjustment = deploymentPacing === 'front-loaded' ? (2 * (1 - progress)) : (deploymentPacing === 'back-loaded' ? (2 * progress) : 1);
            call = Math.min(unfunded, baseCall * pacingAdjustment);
        }
        unfunded -= call;
        totalCalls += call;

        const jCurveEffect = year <= 2 ? (-0.05 * depthFactor) : 0;
        const lateStageGrowthAdj = year > 10 ? (rvpiTarget / 0.7) : 1;
        const baseGrowth = (year > 2 && year < 10) ? (0.18 * returnScaling) : (0.05 * lateStageGrowthAdj);
        const growth = nav * baseGrowth + (jCurveEffect * call);
        
        let distribution = 0;
        const distributionStartYear = Math.max(3, 6 + distStartAdj + breakevenAdj);
        if (year >= distributionStartYear && nav > 0) {
            const exitEfficiency = distSpeedFactor;
            const baseDistRate = 0.20 * exitEfficiency;
            distribution = nav * baseDistRate;
        }

        nav = nav + growth + call - distribution;
        if (nav < 0) {
            distribution += nav;
            nav = 0;
        }
        
        distribution = Math.max(0, distribution);
        totalDists += distribution;
        
        const net = distribution - call;
        cumulativeNet += net;
        
        if (nav > maxNavValue) {
            maxNavValue = nav;
            maxNavYear = year;
        }

        let irr = 0;
        if (year > 0) {
            const bottomYear = 2;
            if (year <= bottomYear) {
                irr = -25 * (year / bottomYear) * depthFactor;
            } else {
                const recovery = (year - bottomYear) / (fundLife - bottomYear);
                irr = (-25 * depthFactor) + ( (25 * depthFactor + (18 * returnScaling)) * Math.pow(recovery, 0.6) );
            }
        }
        
        const irrBenchmark1 = year === 0 ? 0 : irr * 0.85 + (Math.sin(year) * 2);
        const irrBenchmark2 = year === 0 ? 0 : irr * 1.15 - (Math.cos(year) * 3);
        const irrBenchmark3 = year === 0 ? 0 : irr * 0.7 - 5;

        jCurveData.push({
            year: `Yr ${year}`,
            calls: -call,
            distributions: distribution,
            net: net,
            nav: nav,
            cumulativeNet: cumulativeNet,
            irr: irr,
            irrBenchmark1: irrBenchmark1,
            irrBenchmark2: irrBenchmark2,
            irrBenchmark3: irrBenchmark3
        });
    }

    const endingNav = nav;
    const finalTvpi = totalCalls > 0 ? (totalDists + endingNav) / totalCalls : 0;
    const finalDpi = totalCalls > 0 ? totalDists / totalCalls : 0;
    const finalRvpi = totalCalls > 0 ? endingNav / totalCalls : 0;

    const itdIrr = Math.max(0, (finalTvpi - 1) / (fundLife / 2)); 

    return { 
        jCurveData, 
        summaryOutputs: {
            totalCapitalCalled: totalCalls,
            totalDistributions: totalDists,
            endingNav: endingNav,
            tvpi: finalTvpi,
            moic: moicTarget,
            dpi: finalDpi,
            rvpi: finalRvpi,
            itdIrr: itdIrr,
            peakNav: { value: maxNavValue, year: maxNavYear },
            remainingUnfunded: unfunded
        }
    };
};

export default function AssumptionsStudioPage() {
    const [fundId, setFundId] = useState('all');
    const [investmentPeriod, setInvestmentPeriod] = useState(5);
    const [deploymentPacing, setDeploymentPacing] = useState('balanced');
    const [jCurveDepth, setJCurveDepth] = useState('moderate');
    const [timeToBreakeven, setTimeToBreakeven] = useState('mid');
    const [distributionStart, setDistributionStart] = useState('typical');
    const [distributionSpeed, setDistributionSpeed] = useState('normal');
    
    const [tvpiTarget, setTvpiTarget] = useState(2.2);
    const [moicTarget, setMoicTarget] = useState(2.1);
    const [dpiTarget, setDpiTarget] = useState(1.5);
    const [rvpiTarget, setRvpiTarget] = useState(0.7);

    const [jCurveData, setJCurveData] = useState<any[]>([]);
    const [summaryOutputs, setSummaryOutputs] = useState<any | null>(null);

    useEffect(() => {
        const calculatedTvpi = parseFloat((dpiTarget + rvpiTarget).toFixed(2));
        if (calculatedTvpi !== tvpiTarget) setTvpiTarget(calculatedTvpi);
    }, [dpiTarget, rvpiTarget]);

    useEffect(() => {
        const data = generateAssumptionData({
            investmentPeriod, deploymentPacing, jCurveDepth, timeToBreakeven, 
            distributionStart, distributionSpeed, tvpiTarget, moicTarget, dpiTarget, rvpiTarget
        });
        setJCurveData(data.jCurveData);
        setSummaryOutputs(data.summaryOutputs);
    }, [
        investmentPeriod, deploymentPacing, jCurveDepth, timeToBreakeven, 
        distributionStart, distributionSpeed, tvpiTarget, moicTarget, dpiTarget, rvpiTarget
    ]);

  return (
    <div className="space-y-6">
      <Card className="bg-white border-black/10">
        <CardContent className="py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <h1 className="text-sm font-semibold tracking-tight text-highlight uppercase whitespace-nowrap">
                    J-Curve & Multiples Assumptions
                </h1>
                <p className="text-[10px] text-black font-medium hidden sm:block">
                    Set fund assumptions for J-Curve shape and TVPI/DPI/RVPI targets.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="default" className="h-7 px-3 text-[10px] bg-primary hover:bg-primary/90 text-white font-medium">Save Assumption Set</Button>
                <AssumptionSets />
                <FundSelector selectedFundId={fundId} onFundChange={setFundId} />
            </div>
        </CardContent>
      </Card>
      
      <SummaryOutputs data={summaryOutputs} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <JCurveShapeControls
            investmentPeriod={investmentPeriod} setInvestmentPeriod={setInvestmentPeriod}
            deploymentPacing={deploymentPacing} setDeploymentPacing={setDeploymentPacing}
            jCurveDepth={jCurveDepth} setJCurveDepth={setJCurveDepth}
            timeToBreakeven={timeToBreakeven} setTimeToBreakeven={setTimeToBreakeven}
            distributionStart={distributionStart} setDistributionStart={setDistributionStart}
            distributionSpeed={distributionSpeed} setDistributionSpeed={setDistributionSpeed}
          />
          <MultiplesAssumptions 
            tvpiTarget={tvpiTarget} setTvpiTarget={setTvpiTarget}
            moicTarget={moicTarget} setMoicTarget={setMoicTarget}
            dpiTarget={dpiTarget} setDpiTarget={setDpiTarget}
            rvpiTarget={rvpiTarget} setRvpiTarget={setRvpiTarget}
          />
        </div>

        <div className="lg:col-span-3 space-y-6">
            <JCurvePreview data={jCurveData} />
            <CashflowTimeline data={jCurveData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NarrativeInsights 
            jCurveDepth={jCurveDepth} 
            distributionSpeed={distributionSpeed} 
            tvpiTarget={tvpiTarget} 
        />
        <NextStepsRecommendations 
            jCurveDepth={jCurveDepth} 
            distributionSpeed={distributionSpeed} 
            tvpiTarget={tvpiTarget} 
        />
      </div>
    </div>
  );
}