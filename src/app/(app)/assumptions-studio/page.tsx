'use client';
import { useState, useEffect } from 'react';
import { AssumptionSets } from "@/components/app/assumptions-studio/assumption-sets";
import { CashflowTimeline } from "@/components/app/assumptions-studio/cashflow-timeline";
import { JCurvePreview } from "@/components/app/assumptions-studio/j-curve-preview";
import { JCurveShapeControls } from "@/components/app/assumptions-studio/j-curve-shape-controls";
import { MultiplesAssumptions } from "@/components/app/assumptions-studio/multiples-assumptions";
import { NotesTagging } from "@/components/app/assumptions-studio/notes-tagging";
import { SummaryOutputs } from "@/components/app/assumptions-studio/summary-outputs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FundSelector } from '@/components/app/dashboard/fund-selector';

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
    const commitment = 100; // Normalized to 100 for percentage-based storytelling
    
    // 1. Deployment Logic
    const pacingFactor = { 'front-loaded': 1.4, 'balanced': 1, 'back-loaded': 0.7 }[deploymentPacing as keyof typeof deploymentPacing] || 1;
    
    // 2. Growth/Value Creation Logic
    const depthFactor = { 'shallow': 0.7, 'moderate': 1, 'deep': 1.4 }[jCurveDepth as keyof typeof jCurveDepth] || 1; 
    
    // 3. Distribution Logic
    const breakevenAdj = { 'early': -1, 'mid': 0, 'late': 1 }[timeToBreakeven as keyof typeof timeToBreakeven] || 0;
    const distStartAdj = { 'early': -1, 'typical': 0, 'late': 1 }[distributionStart as keyof typeof distributionStart] || 0;
    const distSpeedFactor = { 'slow': 0.7, 'normal': 1, 'fast': 1.4 }[distributionSpeed as keyof typeof distributionSpeed] || 1;
    const tailFactor = { 'short': 1.4, 'medium': 1, 'long': 0.7 }[tailLength as keyof typeof tailLength] || 1; 
    
    const returnScaling = tvpiTarget / 2.2;

    let jCurveData = [];
    let unfunded = commitment;
    let nav = 0;
    let totalCalls = 0;
    let totalDists = 0;
    let cumulativeNet = 0;

    for (let year = 0; year <= fundLife; year++) {
        // --- Capital Calls ---
        let call = 0;
        if (year > 0 && year <= investmentPeriod && unfunded > 0) {
            const baseCall = commitment / investmentPeriod;
            // Adjustment for pacing: front-loaded peaks early, back-loaded peaks late
            const progress = (year - 1) / investmentPeriod;
            const pacingAdjustment = deploymentPacing === 'front-loaded' 
                ? (2 * (1 - progress)) 
                : (deploymentPacing === 'back-loaded' ? (2 * progress) : 1);
            
            call = Math.min(unfunded, baseCall * pacingAdjustment);
        }
        unfunded -= call;
        totalCalls += call;

        // --- NAV Growth & J-Curve Effect ---
        // J-curve depth affects early management fees and initial markdowns
        const jCurveEffect = year <= 2 ? (-0.05 * depthFactor) : 0;
        const baseGrowth = (year > 2 && year < 10) ? (0.18 * returnScaling) : 0.05;
        const growth = nav * baseGrowth + (jCurveEffect * call);
        
        // --- Distributions ---
        let distribution = 0;
        const distributionStartYear = Math.max(3, 6 + distStartAdj + breakevenAdj);
        if (year >= distributionStartYear && nav > 0) {
            const exitEfficiency = distSpeedFactor * (1 - ( (year - distributionStartYear) / (fundLife - distributionStartYear) ) * (1 - tailFactor));
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
    const breakevenTiming = breakevenPoint ? `Year ${breakevenPoint.year.split(' ')[1]}` : `Year ${fundLife}+`;

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
    const [fundId, setFundId] = useState('all');
    
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
        });
        setJCurveData(data.jCurveData);
        setSummaryOutputs(data.summaryOutputs);
    }, [
        investmentPeriod, deploymentPacing, jCurveDepth, timeToBreakeven, 
        distributionStart, distributionSpeed, tailLength, tvpiTarget
    ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-sm font-semibold tracking-tight text-highlight">
                    J-Curve & Multiples Assumptions
                </h1>
                <p className="text-xs text-black font-medium">
                    Set fund assumptions for J-Curve shape and TVPI/DPI/RVPI targets.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" className="h-8 px-3 text-xs">Save Assumption Set</Button>
                <FundSelector selectedFundId={fundId} onFundChange={setFundId} />
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
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
