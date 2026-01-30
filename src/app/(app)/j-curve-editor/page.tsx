'use client';

import { useState, useEffect } from 'react';
import { JCurveControls } from '@/components/app/j-curve-editor/j-curve-controls';
import { JCurvePreviewChart } from '@/components/app/j-curve-editor/j-curve-preview-chart';
import { PortfolioImpactPreview } from '@/components/app/j-curve-editor/portfolio-impact-preview';
import { Card, CardContent } from '@/components/ui/card';

const generateJCurveData = (params: {
    investmentPeriod: number;
    deploymentPacing: number;
    exitTiming: number;
    distributionVelocity: number;
    navRampSpeed: number;
    fundLife?: number;
}) => {
    const {
        investmentPeriod,
        deploymentPacing,
        exitTiming,
        distributionVelocity,
        navRampSpeed,
        fundLife = 12,
    } = params;

    const data = [];
    const commitment = 100;
    let unfunded = commitment;
    let nav = 0;
    let cumulativeNet = 0;

    const pacingFactor = 1 + (deploymentPacing - 50) / 100; 
    const velocityFactor = 1 + (distributionVelocity - 50) / 100; 
    const navFactor = 1 + (navRampSpeed - 50) / 50; 

    for (let year = 0; year <= fundLife; year++) {
        let deployment = 0;
        if (year > 0 && year <= investmentPeriod && unfunded > 0) {
            const remainingYears = investmentPeriod - year + 1;
            const baseDeployment = unfunded / remainingYears;
            const adjustedDeployment = baseDeployment * (1 + (pacingFactor - 1) * (1 - (year / investmentPeriod)));
            deployment = Math.max(0, Math.min(unfunded, adjustedDeployment));
            unfunded -= deployment;
        }

        let distribution = 0;
        if (year >= exitTiming && nav > 0) {
            const baseDistributionRate = 0.25;
            distribution = nav * baseDistributionRate * velocityFactor;
        }
        
        const growthRate = (year > 0 && year < fundLife - 1) ? (0.20 * navFactor - 0.1) : -0.05;
        const growth = nav * growthRate;

        nav = nav + growth + deployment - distribution;
        
        if (nav < 0) {
            distribution += nav;
            nav = 0;
        }
        distribution = Math.max(0, distribution);
        nav = Math.max(0, nav);
        
        const net = distribution - deployment;
        cumulativeNet += net;

        let irr = 0;
        if (year > 0) {
            const troughYear = 1.5;
            const zeroYear = Math.max(troughYear + 0.5, investmentPeriod - 1);
            const peakYear = Math.max(zeroYear + 1, exitTiming + 3);
            
            const peakIrr = 0.12 + (distributionVelocity / 150) + (navRampSpeed / 200);
            
            if (year <= troughYear) {
                irr = -0.5 * (year / troughYear);
            } else if (year <= zeroYear) {
                const progress = (year - troughYear) / (zeroYear - troughYear);
                irr = -0.5 + 0.5 * progress;
            } else if (year <= peakYear) {
                const progress = (year - zeroYear) / (peakYear - zeroYear);
                irr = peakIrr * progress;
            } else {
                irr = peakIrr * (1 - (year - peakYear) * 0.03);
            }
        }

        data.push({
            year,
            deployment: -deployment,
            distribution,
            net,
            nav,
            cumulativeNet,
            irr: isFinite(irr) ? irr : 0,
        });
    }
    return data;
};

const calculateImpactMetrics = (data: any[]) => {
    if (!data || data.length === 0) {
      return {
        peakFundingRequirement: 0,
        breakevenTiming: 0,
        netMultiple: 0,
        liquidityGapRisk: 'Low',
        tvpi: 0,
        peakNav: { value: 0, year: 0 },
      };
    }
    const peakFundingRequirement = Math.min(0, ...data.map(d => d.cumulativeNet));
    
    const breakeven = data.find(d => d.cumulativeNet > 0);
    const breakevenTiming = breakeven ? breakeven.year : 0;

    const totalDistributions = data.reduce((sum, d) => sum + d.distribution, 0);
    const totalDeployments = data.reduce((sum, d) => sum - d.deployment, 0);
    const netMultiple = totalDeployments > 0 ? totalDistributions / totalDeployments : 0;

    const finalNav = data[data.length - 1]?.nav || 0;
    const tvpi = totalDeployments > 0 ? (finalNav + totalDistributions) / totalDeployments : 0;
    
    const peakNavValue = Math.max(0, ...data.map(d => d.nav));
    const peakNav = {
        value: peakNavValue,
        year: data.find(d => d.nav === peakNavValue)?.year || 0
    };


    let liquidityGapRisk = "Low";
    if (peakFundingRequirement < -40) {
        liquidityGapRisk = "High";
    } else if (peakFundingRequirement < -30) {
        liquidityGapRisk = "Medium";
    }
    
    return {
        peakFundingRequirement,
        breakevenTiming,
        netMultiple,
        liquidityGapRisk,
        tvpi,
        peakNav,
    };
};

export default function JCurveEditorPage() {
    const [deploymentPacing, setDeploymentPacing] = useState(50);
    const [investmentPeriod, setInvestmentPeriod] = useState(5);
    const [exitTiming, setExitTiming] = useState(4);
    const [distributionVelocity, setDistributionVelocity] = useState(60);
    const [navRampSpeed, setNavRampSpeed] = useState(70);
    
    const [chartData, setChartData] = useState<any[]>([]);
    const [impactData, setImpactData] = useState<any>(null);
    const [baselineMetrics, setBaselineMetrics] = useState<any>(null);

    useEffect(() => {
        // Set baseline on initial render
        const baselineData = generateJCurveData({
            deploymentPacing: 50,
            investmentPeriod: 5,
            exitTiming: 4,
            distributionVelocity: 60,
            navRampSpeed: 70,
        });
        setBaselineMetrics(calculateImpactMetrics(baselineData));

        // Set initial chart data
        const initialData = generateJCurveData({ deploymentPacing, investmentPeriod, exitTiming, distributionVelocity, navRampSpeed });
        setChartData(initialData);

    }, []); // Run only once on mount

    useEffect(() => {
        const data = generateJCurveData({
            deploymentPacing,
            investmentPeriod,
            exitTiming,
            distributionVelocity,
            navRampSpeed,
        });
        setChartData(data);
        
        if (baselineMetrics) {
            const currentMetrics = calculateImpactMetrics(data);
            
            const getRiskChange = (base: string, current: string) => {
                const riskOrder = { "Low": 0, "Medium": 1, "High": 2 };
                if (riskOrder[current as keyof typeof riskOrder] < riskOrder[base as keyof typeof riskOrder]) return "Improved";
                if (riskOrder[current as keyof typeof riskOrder] > riskOrder[base as keyof typeof riskOrder]) return "Worsened";
                return "No Change";
            }

            setImpactData({
                peakFundingRequirement: {
                    value: currentMetrics.peakFundingRequirement,
                    change: currentMetrics.peakFundingRequirement - (baselineMetrics.peakFundingRequirement ?? 0),
                },
                liquidityGapRisk: {
                    value: currentMetrics.liquidityGapRisk,
                    change: getRiskChange(baselineMetrics.liquidityGapRisk ?? 'Low', currentMetrics.liquidityGapRisk),
                },
                breakevenTiming: {
                    value: currentMetrics.breakevenTiming,
                    change: currentMetrics.breakevenTiming - (baselineMetrics.breakevenTiming ?? 0),
                },
                netMultiple: {
                    value: currentMetrics.netMultiple,
                    change: currentMetrics.netMultiple - (baselineMetrics.netMultiple ?? 0),
                },
                tvpi: {
                    value: currentMetrics.tvpi,
                    change: currentMetrics.tvpi - (baselineMetrics.tvpi ?? 0),
                },
                peakNav: {
                    value: currentMetrics.peakNav.value,
                    change: currentMetrics.peakNav.value - (baselineMetrics.peakNav?.value ?? 0),
                    year: currentMetrics.peakNav.year,
                }
            });
        }
    }, [deploymentPacing, investmentPeriod, exitTiming, distributionVelocity, navRampSpeed, baselineMetrics]);

  return (
    <div className="space-y-4">
      <PortfolioImpactPreview impactData={impactData} />
      <JCurveControls
        deploymentPacing={deploymentPacing}
        setDeploymentPacing={setDeploymentPacing}
        investmentPeriod={investmentPeriod}
        setInvestmentPeriod={setInvestmentPeriod}
        exitTiming={exitTiming}
        setExitTiming={setExitTiming}
        distributionVelocity={distributionVelocity}
        setDistributionVelocity={setDistributionVelocity}
        navRampSpeed={navRampSpeed}
        setNavRampSpeed={setNavRampSpeed}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <JCurvePreviewChart title="Deployment & Distribution" data={chartData} type="composed" />
        <JCurvePreviewChart title="IRR (J-Curve)" data={chartData} type="line" />
        <JCurvePreviewChart title="NAV Evolution" data={chartData} type="line" />
        <Card>
            <CardContent className="pt-4">
                <div className="flex h-56 items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">Curve comparison coming soon...</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
