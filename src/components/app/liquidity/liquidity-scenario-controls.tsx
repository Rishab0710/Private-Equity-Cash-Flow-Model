'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

type Props = {
    capitalCallPacing: number;
    setCapitalCallPacing: (value: number) => void;
    distributionVelocity: number;
    setDistributionVelocity: (value: number) => void;
};


export function LiquidityScenarioControls({
    capitalCallPacing,
    setCapitalCallPacing,
    distributionVelocity,
    setDistributionVelocity,
}: Props) {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="text-base font-semibold">Liquidity Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-x-6 gap-y-4 pt-4">
            <div className="space-y-2 flex-1 min-w-[200px]">
                <div className="flex justify-between items-center">
                    <Label>Capital Call Pacing</Label>
                    <span className="text-xs font-medium text-muted-foreground">{(capitalCallPacing / 100).toFixed(1)}x</span>
                </div>
                <Slider value={[capitalCallPacing]} onValueChange={([v]) => setCapitalCallPacing(v)} min={50} max={150} step={5} />
            </div>
            <div className="space-y-2 flex-1 min-w-[200px]">
                <div className="flex justify-between items-center">
                    <Label>Distribution Velocity</Label>
                    <span className="text-xs font-medium text-muted-foreground">{(distributionVelocity / 100).toFixed(1)}x</span>
                </div>
                <Slider value={[distributionVelocity]} onValueChange={([v]) => setDistributionVelocity(v)} min={50} max={150} step={5} />
            </div>
        </CardContent>
    </Card>
  );
}
