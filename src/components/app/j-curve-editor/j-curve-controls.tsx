'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Save, Share2 } from 'lucide-react';

export function JCurveControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Curve Modeling Controls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-end gap-x-6 gap-y-4">
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

        <div className="flex gap-2 self-end">
            <Button size="sm">
                <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
