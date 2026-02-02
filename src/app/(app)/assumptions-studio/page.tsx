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
import { Skeleton } from '@/components/ui/skeleton';

// Mappings from qualitative inputs to quantitative model factors
const PACING_MAP = { 'front-loaded': 1.3, 'balanced': 1, 'back-loaded': 0.7 };
const DEPTH_MAP = { 'shallow': 0.8, 'moderate': 1, 'deep': 1.2 };
const BREAKEVEN_MAP = { 'early': -1.5, 'mid': 0, 'late': 1.5 }; // Year adjustment
const DIST_START_MAP = { 'early': -1, 'typical': 0, 'late': 1 }; // Year adjustment
const DIST_SPEED_MAP = { 'slow': 0.8, 'normal': 1, 'fast': 1.2 };
const TAIL_LENGTH_MAP = { 'short': 1.2, 'medium': 1, 'long': 0.8 }; // Affects decay rate of distributions

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
    
    const pacingFactor = PACING_MAP[deploymentPacing as keyof typeof PACING_MAP];
    const depthFactor = DEPTH_MAP[jCurveDepth as keyof typeof DEPTH_MAP];
    const breakevenAdj = BREAKEVEN_MAP[timeToBreakeven as keyof typeof BREAKEVEN_MAP];
    const distStartAdj = DIST_START_MAP[distributionStart as keyof typeof DIST_START_MAP];
    const distSpeedFactor = DIST_SPEED_MAP[distributionSpeed as keyof typeof DIST_SPEED_MAP];
    const tailFactor = TAIL_LENGTH_MAP[tailLength as keyof typeof TAIL_LENGTH_MAP];
    
    const finalDistStartYear = investmentPeriod + 1 + distStartAdj;
    
    const jCurveData = [];
    let unfunded = commitment;
    let nav = 0;
    let totalCalls = 0;
    let totalDists = 0;
    
    for (let year = 0; year <= fundLife; year++) {
        let call = 0;
        if (year > 0 && year <= investmentPeriod && unfunded > 0) {
            const remainingYears = investmentPeriod - year + 1;
            const baseCall = (commitment / investmentPeriod) * (1 + (pacingFactor - 1) * (1 - (year-1)/investmentPeriod));
            call = Math.min(unfunded, baseCall * (0.9 + Math.random() * 0.2));
        }
        unfunded -= call;
        totalCalls += call;

        const growthRate = (year > 1 && year < fundLife - 2)
            ? (0.20 - (year / fundLife * 0.15)) / depthFactor
            : 0.02;
        const growth = nav * growthRate;

        let distribution = 0;
        if (year >= finalDistStartYear && nav > 0) {
            const effectiveBreakevenYear = (investmentPeriod / 2) + breakevenAdj;
            const distRamp = Math.max(0, (year - effectiveBreakevenYear) / (fundLife - effectiveBreakevenYear));
            const baseDistRate = 0.1 * distRamp * distSpeedFactor;
            distribution = nav * baseDistRate;
        }

        nav += growth + call - distribution;
        if (nav < 0) {
            distribution += nav; // Claw back distribution if NAV goes negative
            nav = 0;
        }
        distribution = Math.max(0, distribution);
        totalDists += distribution;

        jCurveData.push({
            year: `Yr ${year}`,
            calls: -call, // Negative for charting
            distributions,
            net: distribution - call,
            nav
        });
    }
    
    // Post-simulation adjustment to meet TVPI target
    const endingNav = jCurveData[jCurveData.length - 1].nav;
    const calculatedTvpi = totalCalls > 0 ? (totalDists + endingNav) / totalCalls : 0;
    const adjustmentFactor = tvpiTarget / calculatedTvpi;

    if (isFinite(adjustmentFactor) && adjustmentFactor > 0) {
        let adjustedTotalDists = 0;
        for(const point of jCurveData) {
            point.distributions *= adjustmentFactor;
            point.net = point.distributions + point.calls; // calls is negative
            adjustedTotalDists += point.distributions;
        }
        // Recalculate NAV with adjusted distributions
        let currentNav = 0;
        for (let i = 0; i < jCurveData.length; i++) {
            const point = jCurveData[i];
            const prevNav = i > 0 ? jCurveData[i-1].nav : 0;
            const call = -point.calls;
            const dist = point.distributions;
            const growth = prevNav * ((i > 1 && i < fundLife - 2) ? (0.20 - (i / fundLife * 0.15)) / depthFactor : 0.02);
            currentNav = prevNav + growth + call - dist;
            point.nav = Math.max(0, currentNav);
        }
        totalDists = adjustedTotalDists;
    }


    const finalEndingNav = jCurveData[jCurveData.length - 1].nav;
    const finalTvpi = totalCalls > 0 ? (totalDists + finalEndingNav) / totalCalls : 0;
    
    let cumulativeNet = 0;
    const breakevenPoint = jCurveData.find(d => {
        cumulativeNet += d.net;
        return cumulativeNet > 0;
    });

    const breakevenTiming = breakevenPoint 
        ? `Year ${parseFloat(breakevenPoint.year.split(' ')[1]).toFixed(1)}`
        : `Year ${fundLife}+`;

    const summaryOutputs = {
        totalCapitalCalled: totalCalls,
        totalDistributions: totalDists,
        endingNav: finalEndingNav,
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
                    J-Curve & Multiples Assumptions
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
          {jCurveData.length > 0 ? (
            <>
              <JCurvePreview data={jCurveData} />
              <CashflowTimeline data={jCurveData} />
              <SummaryOutputs data={summaryOutputs} />
            </>
          ) : (
            <div className="space-y-6">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[100px] w-full" />
            </div>
          )}
        </div>
      </div>
      <AssumptionSets />
    </div>
  );
}
