'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

type Props = {
    deploymentPacing: number;
    setDeploymentPacing: (value: number) => void;
    investmentPeriod: number;
    setInvestmentPeriod: (value: number) => void;
    exitTiming: number;
    setExitTiming: (value: number) => void;
    distributionVelocity: number;
    setDistributionVelocity: (value: number) => void;
    navRampSpeed: number;
    setNavRampSpeed: (value: number) => void;
};


export function JCurveControls({
    deploymentPacing,
    setDeploymentPacing,
    investmentPeriod,
    setInvestmentPeriod,
    exitTiming,
    setExitTiming,
    distributionVelocity,
    setDistributionVelocity,
    navRampSpeed,
    setNavRampSpeed,
}: Props) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-x-6 gap-y-4 pt-4">
        <div className="space-y-2 flex-1 min-w-[150px]">
            <div className="flex justify-between items-center">
                <Label>Deployment Pacing</Label>
                <span className="text-xs font-medium text-muted-foreground">{deploymentPacing}</span>
            </div>
            <Slider value={[deploymentPacing]} onValueChange={([v]) => setDeploymentPacing(v)} />
        </div>
         <div className="space-y-2 flex-1 min-w-[150px]">
             <div className="flex justify-between items-center">
                <Label>Investment Period</Label>
                <span className="text-xs font-medium text-muted-foreground">{investmentPeriod} yrs</span>
            </div>
            <Slider value={[investmentPeriod]} onValueChange={([v]) => setInvestmentPeriod(v)} min={3} max={8} step={1} />
        </div>
        <div className="space-y-2 flex-1 min-w-[150px]">
            <div className="flex justify-between items-center">
                <Label>Exit Timing</Label>
                <span className="text-xs font-medium text-muted-foreground">{exitTiming} yrs</span>
            </div>
            <Slider value={[exitTiming]} onValueChange={([v]) => setExitTiming(v)} min={2} max={8} step={1} />
        </div>
        <div className="space-y-2 flex-1 min-w-[150px]">
            <div className="flex justify-between items-center">
                <Label>Distribution Velocity</Label>
                <span className="text-xs font-medium text-muted-foreground">{distributionVelocity}</span>
            </div>
            <Slider value={[distributionVelocity]} onValueChange={([v]) => setDistributionVelocity(v)} />
        </div>
         <div className="space-y-2 flex-1 min-w-[150px]">
            <div className="flex justify-between items-center">
                <Label>NAV Ramp Speed</Label>
                <span className="text-xs font-medium text-muted-foreground">{navRampSpeed}</span>
            </div>
            <Slider value={[navRampSpeed]} onValueChange={([v]) => setNavRampSpeed(v)} />
        </div>

        <div className="flex gap-2 pt-2">
            <Button size="sm">
                Apply
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
