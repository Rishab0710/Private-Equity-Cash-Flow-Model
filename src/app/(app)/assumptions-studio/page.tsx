'use client';
import { useState, useEffect, useCallback } from 'react';
import { AssumptionSets, initialSets } from "@/components/app/assumptions-studio/assumption-sets";
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
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { funds } from '@/lib/data';
import type { ComparisonSet } from '@/components/app/assumptions-studio/compare-drawer';

const generateAssumptionData = (params: any) => {
    const {
        fundLife,
        commitment,
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
    
    // Dynamic target called percentage logic (83-89% range)
    const pacingAdj = deploymentPacing === 'front-loaded' ? 0.02 : (deploymentPacing === 'back-loaded' ? -0.02 : 0);
    const targetCallPercentage = 0.86 + pacingAdj; 
    const totalToCall = commitment * targetCallPercentage;
    
    const depthFactor = { 'shallow': 0.7, 'moderate': 1, 'deep': 1.4 }[jCurveDepth as keyof typeof jCurveDepth] || 1; 
    const breakevenAdj = { 'early': -1, 'mid': 0, 'late': 1 }[timeToBreakeven as keyof typeof timeToBreakeven] || 0;
    const distStartAdj = { 'early': -1, 'typical': 0, 'late': 1 }[distributionStart as keyof typeof distributionStart] || 0;
    
    const dpiScaling = dpiTarget / 1.5;
    const distSpeedFactor = ({ 'slow': 0.7, 'normal': 1, 'fast': 1.4 }[distributionSpeed as keyof typeof distributionSpeed] || 1) * dpiScaling;
    const returnScaling = tvpiTarget / 2.2;

    let jCurveData = [];
    let unfunded = totalToCall;
    let nav = 0;
    let totalCalls = 0;
    let totalDists = 0;
    let cumulativeNet = 0;
    let maxNavValue = 0;
    let maxNavYear = 0;

    for (let year = 0; year <= fundLife; year++) {
        let call = 0;
        if (year > 0 && year <= investmentPeriod && unfunded > 0) {
            const baseCall = totalToCall / investmentPeriod;
            const progress = (year - 1) / investmentPeriod;
            const pacingAdjustment = deploymentPacing === 'front-loaded' ? (2 * (1 - progress)) : (deploymentPacing === 'back-loaded' ? (2 * progress) : 1);
            call = Math.min(unfunded, baseCall * pacingAdjustment);
        }
        unfunded -= call;
        totalCalls += call;

        const jCurveEffect = year <= 2 ? (-0.05 * depthFactor) : 0;
        const lateStageGrowthAdj = year > 10 ? (rvpiTarget / 0.7) : 1;
        const baseGrowth = (year > 2 && year < fundLife - 3) ? (0.18 * returnScaling) : (0.05 * lateStageGrowthAdj);
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
            remainingUnfunded: commitment - totalCalls
        }
    };
};

export default function AssumptionsStudioPage() {
    const { toast } = useToast();
    const [fundId, setFundId] = useState('1');
    const [fundLife, setFundLife] = useState(10);
    const [commitment, setCommitment] = useState(100);
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
    const [savedSets, setSavedSets] = useState<ComparisonSet[]>(initialSets);

    const selectedFundName = funds.find(f => f.id === fundId)?.name || "Selected Fund";

    // Effect to sync TVPI with DPI + RVPI
    useEffect(() => {
        const calculatedTvpi = parseFloat((dpiTarget + rvpiTarget).toFixed(2));
        if (Math.abs(calculatedTvpi - tvpiTarget) > 0.01) setTvpiTarget(calculatedTvpi);
    }, [dpiTarget, rvpiTarget, tvpiTarget]);

    // Effect: Load Fund Defaults
    useEffect(() => {
        const fund = funds.find(f => f.id === fundId);
        if (fund) {
            setCommitment(fund.commitment / 1000000);
            setFundLife(fund.fundLife || 10);
            const period = fund.investmentPeriod || 5;
            setInvestmentPeriod(period);

            if (fund.strategy === 'VC') {
                setDeploymentPacing('front-loaded');
                setJCurveDepth('deep');
                setDpiTarget(0.8);
                setRvpiTarget(2.7);
                setMoicTarget(3.5);
            } else if (fund.strategy === 'Infra') {
                setDeploymentPacing('balanced');
                setJCurveDepth('shallow');
                setDpiTarget(1.1);
                setRvpiTarget(0.7);
                setMoicTarget(1.8);
            } else {
                setDeploymentPacing('balanced');
                setJCurveDepth('moderate');
                setDpiTarget(1.6);
                setRvpiTarget(0.6);
                setMoicTarget(2.2);
            }
        }
    }, [fundId]);

    // Bidirectional Logic: Update Multiples based on J-Curve Controls
    useEffect(() => {
        // If user changes J-Curve controls, suggest realistic targets
        if (jCurveDepth === 'deep') {
            setRvpiTarget(prev => Math.max(prev, 2.0));
        } else if (jCurveDepth === 'shallow') {
            setRvpiTarget(prev => Math.min(prev, 0.8));
        }

        if (distributionSpeed === 'fast') {
            setDpiTarget(prev => Math.max(prev, 1.8));
        } else if (distributionSpeed === 'slow') {
            setDpiTarget(prev => Math.min(prev, 0.9));
        }
    }, [jCurveDepth, distributionSpeed]);

    // Core Data Generation Effect
    useEffect(() => {
        const data = generateAssumptionData({
            fundLife, commitment, investmentPeriod, deploymentPacing, jCurveDepth, timeToBreakeven, 
            distributionStart, distributionSpeed, tvpiTarget, moicTarget, dpiTarget, rvpiTarget
        });
        setJCurveData(data.jCurveData);
        setSummaryOutputs(data.summaryOutputs);
    }, [
        fundLife, commitment, investmentPeriod, deploymentPacing, jCurveDepth, timeToBreakeven, 
        distributionStart, distributionSpeed, tvpiTarget, moicTarget, dpiTarget, rvpiTarget
    ]);

    const handleSaveSet = () => {
        const newSet: ComparisonSet = {
            id: savedSets.length + 1,
            name: `${selectedFundName} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            strategy: funds.find(f => f.id === fundId)?.strategy || 'Custom',
            vintage: 2024,
            commitment: Math.round(commitment),
            updatedBy: 'QA1 Guest',
            updated: 'Just now',
            status: 'Draft',
            source: 'Custom',
            data: {
                shape: { depth: jCurveDepth.charAt(0).toUpperCase() + jCurveDepth.slice(1), breakeven: 'Simulated', distStart: distributionStart.charAt(0).toUpperCase() + distributionStart.slice(1) },
                multiples: { tvpi: `${tvpiTarget.toFixed(2)}x`, dpi: `${dpiTarget.toFixed(2)}x`, rvpi: `${rvpiTarget.toFixed(2)}x` },
                risk: { volatility: 'Simulated', gapRisk: 'Medium' },
                rationale: 'Custom user-defined simulation parameters for fund lifecycle modeling.',
                notes: 'Generated via Assumptions Studio real-time editor.'
            }
        };
        setSavedSets([newSet, ...savedSets]);
        toast({
            title: "Assumptions Saved",
            description: "The current model has been added to your Assumption Sets.",
        });
    };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-black/10">
        <CardContent className="py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <h1 className="text-sm font-semibold tracking-tight text-highlight uppercase whitespace-nowrap">
                    J-Curve & Multiples Assumptions
                </h1>
                <p className="text-[10px] text-black font-medium italic hidden sm:block">
                    Set fund assumptions for J-Curve shape and TVPI/DPI/RVPI targets.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    onClick={handleSaveSet}
                    variant="default" 
                    className="h-7 px-3 text-[10px] bg-primary hover:bg-primary/90 text-white font-bold uppercase"
                >
                    <Save className="h-3 w-3 mr-1.5" />
                    Save Assumption Set
                </Button>
                <AssumptionSets sets={savedSets} />
                <FundSelector selectedFundId={fundId} onFundChange={setFundId} showAll={false} />
            </div>
        </CardContent>
      </Card>
      
      <SummaryOutputs data={summaryOutputs} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          <JCurveShapeControls
            className="lg:col-span-1 h-full"
            fundLife={fundLife} setFundLife={setFundLife}
            deploymentPacing={deploymentPacing} setDeploymentPacing={setDeploymentPacing}
            jCurveDepth={jCurveDepth} setJCurveDepth={setJCurveDepth}
            timeToBreakeven={timeToBreakeven} setTimeToBreakeven={setTimeToBreakeven}
            distributionStart={distributionStart} setDistributionStart={setDistributionStart}
            distributionSpeed={distributionSpeed} setDistributionSpeed={setDistributionSpeed}
          />
          <JCurvePreview 
            className="lg:col-span-3 h-full"
            data={jCurveData} 
            fundName={selectedFundName} 
          />

          <MultiplesAssumptions 
            className="lg:col-span-1 h-full"
            tvpiTarget={tvpiTarget} setTvpiTarget={setTvpiTarget}
            moicTarget={moicTarget} setMoicTarget={setMoicTarget}
            dpiTarget={dpiTarget} setDpiTarget={setDpiTarget}
            rvpiTarget={rvpiTarget} setRvpiTarget={setRvpiTarget}
          />
          <CashflowTimeline 
            className="lg:col-span-3 h-full"
            data={jCurveData} 
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
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
