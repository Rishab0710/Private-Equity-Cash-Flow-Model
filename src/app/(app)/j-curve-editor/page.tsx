'use client';

import { useState, useEffect } from 'react';
import { JCurveControls } from '@/components/app/j-curve-editor/j-curve-controls';
import { JCurvePreviewChart } from '@/components/app/j-curve-editor/j-curve-preview-chart';
import { PortfolioImpactPreview } from '@/components/app/j-curve-editor/portfolio-impact-preview';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const generateJCurveData = (params: {
    investmentPeriod: number;
    deploymentPacing: number;
    exitTiming: number;
    distributionVelocity: number;
    navRampSpeed: number;
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
        
        data.push({
            year,
            deployment: -deployment,
            distribution,
            net: distribution - deployment,
            nav,
        });
    }
    return data;
};


export default function JCurveEditorPage() {
    const [deploymentPacing, setDeploymentPacing] = useState(50);
    const [investmentPeriod, setInvestmentPeriod] = useState(5);
    const [exitTiming, setExitTiming] = useState(4);
    const [distributionVelocity, setDistributionVelocity] = useState(60);
    const [navRampSpeed, setNavRampSpeed] = useState(70);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const data = generateJCurveData({
            deploymentPacing,
            investmentPeriod,
            exitTiming,
            distributionVelocity,
            navRampSpeed,
        });
        setChartData(data);
    }, [deploymentPacing, investmentPeriod, exitTiming, distributionVelocity, navRampSpeed]);

  return (
    <div className="space-y-4">
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
        <JCurvePreviewChart title="Net Cashflow (J-Curve)" data={chartData} type="line" />
        <JCurvePreviewChart title="NAV Evolution" data={chartData} type="line" />
        <Card>
            <CardContent className="pt-4">
                <div className="flex h-56 items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">Curve comparison coming soon...</p>
                </div>
            </CardContent>
        </Card>
      </div>
      <Separator />
      <PortfolioImpactPreview />
    </div>
  );
}
