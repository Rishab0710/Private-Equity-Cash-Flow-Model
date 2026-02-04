'use client';
import { useState, useEffect, useRef } from 'react';
import { AssumptionSets, initialSets } from "@/components/app/assumptions-studio/assumption-sets";
import { CashflowTimeline } from "@/components/app/assumptions-studio/cashflow-timeline";
import { JCurvePreview } from "@/components/app/assumptions-studio/j-curve-preview";
import { JCurveShapeControls } from "@/components/app/assumptions-studio/j-curve-shape-controls";
import { MultiplesAssumptions } from "@/components/app/assumptions-studio/multiples-assumptions";
import { NarrativeInsights } from "@/components/app/assumptions-studio/narrative-insights";
import { NextStepsRecommendations } from "@/components/app/assumptions-studio/recommendations";
import { SummaryOutputs } from "@/components/app/assumptions-studio/summary-outputs";
import { Button } from "@/components/ui/button";
import { FundSelector } from '@/components/app/dashboard/fund-selector';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { funds } from '@/lib/data';
import type { ComparisonSet } from '@/components/app/assumptions-studio/compare-drawer';

const generateAssumptionData = (params: any) => {
    const {
        fundLife,
        commitment,
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
    
    const pacingAdj = deploymentPacing === 'front-loaded' ? 0.02 : (deploymentPacing === 'back-loaded' ? -0.02 : 0);
    const targetCallPercentage = 0.86 + pacingAdj; 
    const totalToCall = commitment * targetCallPercentage;
    
    const depthFactor = { 'shallow': 0.7, 'moderate': 1, 'deep': 1.4 }[jCurveDepth as keyof typeof jCurveDepth] || 1; 
    const breakevenAdj = { 'early': -1, 'mid': 0, 'late': 1 }[timeToBreakeven as keyof typeof timeToBreakeven] || 0;
    const distStartAdj = { 'early': -1, 'typical': 0, 'late': 1 }[distributionStart as keyof typeof distributionStart] || 0;
    
    const totalDistTarget = totalToCall * dpiTarget;
    const endingNavTarget = totalToCall * rvpiTarget;

    let jCurveData = [];
    let unfunded = totalToCall;
    let nav = 0;
    let totalCalls = 0;
    let totalDists = 0;
    let cumulativeNet = 0;
    let maxNavValue = 0;
    let maxNavYear = 0;

    const investmentPeriod = Math.ceil(fundLife * 0.5);
    const distStartYear = Math.max(3, 6 + distStartAdj + breakevenAdj);

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

        let distribution = 0;
        if (year >= distStartYear && year < fundLife) {
            const distProgress = (year - distStartYear + 1) / (fundLife - distStartYear);
            const distAmount = totalDistTarget * (Math.pow(distProgress, 1.2) - Math.pow((year - distStartYear) / (fundLife - distStartYear), 1.2));
            distribution = Math.max(0, distAmount);
        }

        totalDists += distribution;

        const navProgress = year / fundLife;
        const targetNavAtYear = year < fundLife 
            ? Math.min(totalToCall * 1.5, totalToCall * 2 * Math.sin((Math.PI/2) * navProgress)) * depthFactor
            : endingNavTarget;
        
        nav = targetNavAtYear;
        
        if (nav > maxNavValue) {
            maxNavValue = nav;
            maxNavYear = year;
        }

        const net = distribution - call;
        cumulativeNet += net;

        let irr = 0;
        if (year > 0) {
            const pacingFactor = deploymentPacing === 'front-loaded' ? 1.2 : (deploymentPacing === 'back-loaded' ? 0.8 : 1);
            const bottomYear = 2 + (deploymentPacing === 'back-loaded' ? 1 : 0);
            const breakevenYear = Math.max(bottomYear + 1, 5 + breakevenAdj + distStartAdj);
            
            const returnScaling = tvpiTarget / 2.2;

            if (year <= bottomYear) {
                irr = -25 * (year / bottomYear) * depthFactor * pacingFactor;
            } else if (year <= breakevenYear) {
                const progress = (year - bottomYear) / (breakevenYear - bottomYear);
                irr = (-25 * depthFactor * pacingFactor) * (1 - progress);
            } else {
                const recovery = (year - breakevenYear) / (fundLife - breakevenYear);
                const peakIrr = 18 * returnScaling + (distributionSpeed === 'fast' ? 5 : (distributionSpeed === 'slow' ? -3 : 0));
                irr = peakIrr * Math.pow(recovery, 0.6);
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

    const itdIrr = Math.max(0, (tvpiTarget - 1) / (fundLife / 2)); 

    return { 
        jCurveData, 
        summaryOutputs: {
            totalCapitalCalled: totalCalls,
            totalDistributions: totalCalls * dpiTarget,
            endingNav: totalCalls * rvpiTarget,
            tvpi: tvpiTarget,
            moic: moicTarget,
            dpi: dpiTarget,
            rvpi: rvpiTarget,
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
    const [deploymentPacing, setDeploymentPacing] = useState('balanced');
    const [jCurveDepth, setJCurveDepth] = useState('moderate');
    const [timeToBreakeven, setTimeToBreakeven] = useState('mid');
    const [distributionStart, setDistributionStart] = useState('typical');
    const [distributionSpeed, setDistributionSpeed] = useState('normal');
    
    const [tvpiTarget, setTvpiTarget] = useState(2.2);
    const [moicTarget, setMoicTarget] = useState(2.31); 
    const [dpiTarget, setDpiTarget] = useState(1.5);
    const [rvpiTarget, setRvpiTarget] = useState(0.7);

    const [jCurveData, setJCurveData] = useState<any[]>([]);
    const [summaryOutputs, setSummaryOutputs] = useState<any | null>(null);
    const [savedSets, setSavedSets] = useState<ComparisonSet[]>(initialSets);
    const [mounted, setMounted] = useState(false);

    const isUpdatingRef = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const selectedFundName = funds.find(f => f.id === fundId)?.name || "Selected Fund";

    useEffect(() => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;
        const calculatedTvpi = parseFloat((dpiTarget + rvpiTarget).toFixed(2));
        if (Math.abs(calculatedTvpi - tvpiTarget) > 0.001) {
            setTvpiTarget(calculatedTvpi);
            setMoicTarget(parseFloat((calculatedTvpi * 1.05).toFixed(2)));
        }
        isUpdatingRef.current = false;
    }, [dpiTarget, rvpiTarget]);

    useEffect(() => {
        if (isUpdatingRef.current) return;
        isUpdatingRef.current = true;
        const currentSum = dpiTarget + rvpiTarget;
        if (Math.abs(currentSum - tvpiTarget) > 0.001) {
            const ratio = currentSum > 0 ? dpiTarget / currentSum : 0.68;
            const newDpi = parseFloat((tvpiTarget * ratio).toFixed(2));
            const newRvpi = parseFloat((tvpiTarget - newDpi).toFixed(2));
            setDpiTarget(newDpi);
            setRvpiTarget(newRvpi);
            setMoicTarget(parseFloat((tvpiTarget * 1.05).toFixed(2)));
        }
        isUpdatingRef.current = false;
    }, [tvpiTarget]);

    useEffect(() => {
        const fund = funds.find(f => f.id === fundId);
        if (fund) {
            setCommitment(fund.commitment / 1000000);
            setFundLife(fund.fundLife || 10);
            if (fund.strategy === 'VC') {
                setDeploymentPacing('front-loaded');
                setJCurveDepth('deep');
                setDpiTarget(0.8);
                setRvpiTarget(2.7);
            } else if (fund.strategy === 'Infra') {
                setDeploymentPacing('balanced');
                setJCurveDepth('shallow');
                setDpiTarget(1.1);
                setRvpiTarget(0.7);
            } else {
                setDeploymentPacing('balanced');
                setJCurveDepth('moderate');
                setDpiTarget(1.6);
                setRvpiTarget(0.6);
            }
        }
    }, [fundId]);

    useEffect(() => {
        const data = generateAssumptionData({
            fundLife, commitment, deploymentPacing, jCurveDepth, timeToBreakeven, 
            distributionStart, distributionSpeed, tvpiTarget, moicTarget, dpiTarget, rvpiTarget
        });
        setJCurveData(data.jCurveData);
        setSummaryOutputs(data.summaryOutputs);
    }, [
        fundLife, commitment, deploymentPacing, jCurveDepth, timeToBreakeven, 
        distributionStart, distributionSpeed, tvpiTarget, moicTarget, dpiTarget, rvpiTarget
    ]);

    const handleSaveSet = () => {
        const newSet: ComparisonSet = {
            id: Date.now(),
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

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border-b border-black/5 mb-2 -mx-6 px-6 py-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-sm font-semibold tracking-tight text-highlight uppercase whitespace-nowrap">
                        J-Curve & Multiples Assumptions
                    </h1>
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
            </div>
            
            <SummaryOutputs data={summaryOutputs} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                <JCurveShapeControls
                    className="lg:col-span-1"
                    fundLife={fundLife} setFundLife={setFundLife}
                    deploymentPacing={deploymentPacing} setDeploymentPacing={setDeploymentPacing}
                    jCurveDepth={jCurveDepth} setJCurveDepth={setJCurveDepth}
                    timeToBreakeven={timeToBreakeven} setTimeToBreakeven={setTimeToBreakeven}
                    distributionStart={distributionStart} setDistributionStart={setDistributionStart}
                    distributionSpeed={distributionSpeed} setDistributionSpeed={setDistributionSpeed}
                />
                <JCurvePreview 
                    className="lg:col-span-3"
                    data={jCurveData} 
                    fundName={selectedFundName} 
                />

                <MultiplesAssumptions 
                    className="lg:col-span-1"
                    tvpiTarget={tvpiTarget} setTvpiTarget={setTvpiTarget}
                    moicTarget={moicTarget} setMoicTarget={setMoicTarget}
                    dpiTarget={dpiTarget} setDpiTarget={setDpiTarget}
                    rvpiTarget={rvpiTarget} setRvpiTarget={setRvpiTarget}
                />
                <CashflowTimeline 
                    className="lg:col-span-3"
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
