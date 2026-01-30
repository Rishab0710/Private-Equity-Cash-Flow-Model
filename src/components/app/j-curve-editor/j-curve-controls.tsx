'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export function JCurveControls() {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-x-6 gap-y-4 pt-4">
        <div className="space-y-2 flex-1 min-w-[180px]">
          <Label>Strategy Template</Label>
          <Select defaultValue="pe">
            <SelectTrigger>
              <SelectValue placeholder="Select Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pe">Private Equity Buyout</SelectItem>
              <SelectItem value="vc">Venture Capital</SelectItem>
              <SelectItem value="infra">Infrastructure</SelectItem>
              <SelectItem value="secondaries">Secondaries</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 flex-1 min-w-[150px]">
            <Label>Deployment Pacing</Label>
            <Slider defaultValue={[50]} />
        </div>
         <div className="space-y-2 flex-1 min-w-[150px]">
            <Label>Investment Period</Label>
            <Slider defaultValue={[5]} min={3} max={8} step={1} />
        </div>

        <div className="space-y-2 flex-1 min-w-[150px]">
            <Label>Exit Timing</Label>
            <Slider defaultValue={[4]} min={2} max={8} step={1} />
        </div>
        <div className="space-y-2 flex-1 min-w-[150px]">
            <Label>Distribution Velocity</Label>
            <Slider defaultValue={[60]} />
        </div>
         <div className="space-y-2 flex-1 min-w-[150px]">
            <Label>NAV Ramp Speed</Label>
            <Slider defaultValue={[70]} />
        </div>

        <div className="flex gap-2 pt-4">
            <Button size="sm">
                Apply
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
