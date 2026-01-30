'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { usePortfolioContext } from '@/components/layout/app-layout';
import type { Scenario } from '@/lib/types';

export function ScenarioConsole() {
  const { scenario, setScenario } = usePortfolioContext();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Scenario & Sensitivity Console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label>Scenario</Label>
            <Select value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
                <SelectTrigger>
                    <SelectValue placeholder="Select Scenario" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Base">Base</SelectItem>
                    <SelectItem value="Slow Exit">Slow Exit</SelectItem>
                    <SelectItem value="Fast Exit">Fast Exit</SelectItem>
                    <SelectItem value="Stress">Stress</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label>Deployment Pacing</Label>
            <Slider defaultValue={[50]} />
        </div>
        <div className="space-y-2">
            <Label>Distribution Timing</Label>
            <Slider defaultValue={[50]} />
        </div>
      </CardContent>
    </Card>
  );
}
