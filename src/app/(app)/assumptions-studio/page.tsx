'use client';
import { useState, useEffect } from 'react';
import { AssumptionSets } from "@/components/app/assumptions-studio/assumption-sets";
import { CashflowTimeline } from "@/components/app/assumptions-studio/cashflow-timeline";
import { ContextSelector } from "@/components/app/assumptions-studio/context-selector";
import { JCurvePreview } from "@/components/app/assumptions-studio/j-curve-preview";
import { JCurveShapeControls } from "@/components/app/assumptions-studio/j-curve-shape-controls";
import { MultiplesAssumptions } from "@/components/app/assumptions-studio/multiples-assumptions";
import { NotesTagging } from "@/components/app/assumptions-studio/notes-tagging";
import { SummaryOutputs } from "@/components/app/assumptions-studio/summary-outputs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Mappings from qualitative inputs to quantitative model factors
const generateAssumptionData = (params: any) => {
    const {
        investmentPeriod,
        deploymentPacing,
        jCurveDepth,
        timeToBreakeven,
        distributionStart,
        distributionSpeed,
        tailLength,
        tvpiTarget,
    } = params;
    
    const fundLife = 15;
    const commitment = 100;
    
    const pacingFactor = { 'front-loaded': 1.5, 'balanced': 1, 'back-loaded': 0.7 }[deploymentPacing as keyof typeof deploymentPacing] || 1;
    const depthFactor = { 'shallow': 0.8, 'moderate': 1, 'deep': 1.2 }[jCurveDepth as keyof typeof jCurveDepth] || 1; // Deeper curve = lower NAV growth
    const breakevenAdj = { 'early': -1, 'mid': 0, 'late': 1 }[timeToBreakeven as keyof typeof timeToBreakeven] || 0;
    const distStartAdj = { 'early': -1, 'typical': 0, 'late': 1 }[distributionStart as keyof typeof distributionStart] || 0;
    const distSpeedFactor = { 'slow': 0.8, 'normal': 1, 'fast': 1.2 }[distributionSpeed as keyof typeof distributionSpeed] || 1;
    const tailFactor = { 'short': 1.2, 'medium': 1, 'long': 0.8 }[tailLength as keyof typeof tailLength] || 1; // Affects decay
    
    const returnFactor = (tvpiTarget / 2.2);

    let jCurveData = [];
    let unfunded = commitment;
    let nav = 0;
    let totalCalls = 0;
    let totalDists = 0;
    let cumulativeNet = 0;

    for (let year = 0; year <= fundLife; year++) {
        let call = 0;
        if (year > 0 && year <= investmentPeriod && unfunded > 0) {
            const baseCall = commitment / investmentPeriod;
            const pacingAdjustment = 1 + (pacingFactor - 1) * (1 - (year - 1) / investmentPeriod);
            call = Math.min(unfunded, baseCall * pacingAdjustment);
        }
        unfunded -= call;
        totalCalls += call;

        const growthRate = ( (0.22 * returnFactor) - ( (Math.abs(year - 6)) * 0.02) ) / depthFactor;
        const growth = nav * growthRate;
        
        let distribution = 0;
        const distributionStartYear = investmentPeriod + distStartAdj + breakevenAdj;
        if (year >= distributionStartYear && nav > 0) {
            const baseDistRate = 0.15 * distSpeedFactor;
            const tailDecay = Math.pow(tailFactor, -(year - distributionStartYear));
            distribution = nav * baseDistRate * tailDecay;
        }

        nav += growth + call - distribution;

        if (nav < 0) {
            distribution += nav;
            nav = 0;
        }
        distribution = Math.max(0, distribution);
        totalDists += distribution;
        
        const net = distribution - call;
        cumulativeNet += net;

        jCurveData.push({
            year: `Yr ${year}`,
            calls: -call,
            distributions: distribution,
            net: net,
            nav: nav,
            cumulativeNet: cumulativeNet
        });
    }

    const endingNav = nav;
    const finalTvpi = totalCalls > 0 ? (totalDists + endingNav) / totalCalls : 0;
    
    const breakevenPoint = jCurveData.find(d => d.cumulativeNet > 0);
    const breakevenTiming = breakevenPoint ? `Year ${parseInt(breakevenPoint.year.split(' ')[1])}` : `Year ${fundLife}+`;

    const summaryOutputs = {
        totalCapitalCalled: totalCalls,
        totalDistributions: totalDists,
        endingNav: endingNav,
        tvpi: finalTvpi,
        breakevenTiming,
    };
    
    return { jCurveData, summaryOutputs };
};


export default function AssumptionsStudioPage() {
    // J-Curve Shape Controls State
    const [investmentPeriod, setInvestmentPeriod] = useState(5);
    const [deploymentPacing, setDeploymentPacing] = useState('balanced');
    const [jCurveDepth, setJCurveDepth] = useState('moderate');
    const [timeToBreakeven, setTimeToBreakeven] = useState('mid');
    const [distributionStart, setDistributionStart] = useState('typical');
    const [distributionSpeed, setDistributionSpeed] = useState('normal');
    const [tailLength, setTailLength] = useState('medium');
    
    // Multiples Assumptions State
    const [tvpiTarget, setTvpiTarget] = useState(2.2);
    const [isDpiEnabled, setIsDpiEnabled] = useState(true);
    const [dpiTarget, setDpiTarget] = useState(1.5);
    const [isRvpiEnabled, setIsRvpiEnabled] = useState(true);
    const [rvpiTarget, setRvpiTarget] = useState(0.7);

    // Generated Data State
    const [jCurveData, setJCurveData] = useState<any[]>([]);
    const [summaryOutputs, setSummaryOutputs] = useState<any | null>(null);

    useEffect(() => {
        const data = generateAssumptionData({
            investmentPeriod,
            deploymentPacing,
            jCurveDepth,
            timeToBreakeven,
            distributionStart,
            distributionSpeed,
            tailLength,
            tvpiTarget,
            dpiTarget,
            rvpiTarget,
            isDpiEnabled,
            isRvpiEnabled,
        });
        setJCurveData(data.jCurveData);
        setSummaryOutputs(data.summaryOutputs);

    }, [
        investmentPeriod, deploymentPacing, jCurveDepth, timeToBreakeven, 
        distributionStart, distributionSpeed, tailLength, tvpiTarget, 
        isDpiEnabled, dpiTarget, isRvpiEnabled, rvpiTarget
    ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-highlight">
                    J-Curve &amp; Multiples Assumptions
                </h1>
                <p className="text-muted-foreground">
                    Set strategy and fund assumptions for J-Curve shape and TVPI/DPI/RVPI targets.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button>Save Assumption Set</Button>
                <Button variant="outline">Set as Active for Fund</Button>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <ContextSelector />
          <JCurveShapeControls
            investmentPeriod={investmentPeriod} setInvestmentPeriod={setInvestmentPeriod}
            deploymentPacing={deploymentPacing} setDeploymentPacing={setDeploymentPacing}
            jCurveDepth={jCurveDepth} setJCurveDepth={setJCurveDepth}
            timeToBreakeven={timeToBreakeven} setTimeToBreakeven={setTimeToBreakeven}
            distributionStart={distributionStart} setDistributionStart={setDistributionStart}
            distributionSpeed={distributionSpeed} setDistributionSpeed={setDistributionSpeed}
            tailLength={tailLength} setTailLength={setTailLength}
          />
          <MultiplesAssumptions 
            tvpiTarget={tvpiTarget} setTvpiTarget={setTvpiTarget}
            isDpiEnabled={isDpiEnabled} setIsDpiEnabled={setIsDpiEnabled}
            dpiTarget={dpiTarget} setDpiTarget={setDpiTarget}
            isRvpiEnabled={isRvpiEnabled} setIsRvpiEnabled={setIsRvpiEnabled}
            rvpiTarget={rvpiTarget} setRvpiTarget={setRvpiTarget}
          />
          <NotesTagging />
        </div>

        <div className="lg:col-span-2 space-y-6">
            <JCurvePreview data={jCurveData} />
            <CashflowTimeline data={jCurveData} />
            <SummaryOutputs data={summaryOutputs} tvpiTarget={tvpiTarget} />
        </div>
      </div>
      <AssumptionSets />
    </div>
  );
}