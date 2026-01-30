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
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Strategy Curve Template</Label>
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
        
        <div className="space-y-4">
            <h4 className="font-semibold text-sm">Deployment</h4>
            <div className="space-y-2">
                <Label>Pacing Speed (Years 1-3)</Label>
                <Slider defaultValue={[50]} />
            </div>
             <div className="space-y-2">
                <Label>Investment Period (Years)</Label>
                <Slider defaultValue={[5]} min={3} max={8} step={1} />
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="font-semibold text-sm">Distribution & NAV</h4>
            <div className="space-y-2">
                <Label>Exit Timing (Start Year)</Label>
                <Slider defaultValue={[4]} min={2} max={8} step={1} />
            </div>
            <div className="space-y-2">
                <Label>Distribution Velocity</Label>
                <Slider defaultValue={[60]} />
            </div>
             <div className="space-y-2">
                <Label>NAV Ramp Speed</Label>
                <Slider defaultValue={[70]} />
            </div>
        </div>

        <div className="flex gap-2 pt-4">
            <Button>
                <Save className="mr-2 h-4 w-4" /> Save Template
            </Button>
            <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
        </div>

      </CardContent>
    </Card>
  );
}
