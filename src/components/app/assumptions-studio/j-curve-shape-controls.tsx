'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const ControlRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-sm font-normal">{label}</Label>
        <div className="col-span-2">{children}</div>
    </div>
);

type JCurveShapeControlsProps = {
  investmentPeriod: number;
  setInvestmentPeriod: (value: number) => void;
  deploymentPacing: string;
  setDeploymentPacing: (value: string) => void;
  jCurveDepth: string;
  setJCurveDepth: (value: string) => void;
  timeToBreakeven: string;
  setTimeToBreakeven: (value: string) => void;
  distributionStart: string;
  setDistributionStart: (value: string) => void;
  distributionSpeed: string;
  setDistributionSpeed: (value:string) => void;
  tailLength: string;
  setTailLength: (value: string) => void;
};

export function JCurveShapeControls({
  investmentPeriod,
  setInvestmentPeriod,
  deploymentPacing,
  setDeploymentPacing,
  jCurveDepth,
  setJCurveDepth,
  timeToBreakeven,
  setTimeToBreakeven,
  distributionStart,
  setDistributionStart,
  distributionSpeed,
  setDistributionSpeed,
  tailLength,
  setTailLength,
}: JCurveShapeControlsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">J-Curve Shape Controls</CardTitle>
                <CardDescription className="text-xs">
                    These settings control the shape of calls, NAV ramp, and distributions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <ControlRow label="Investment Period">
                    <div className="flex items-center gap-2">
                        <Slider value={[investmentPeriod]} onValueChange={([v]) => setInvestmentPeriod(v)} min={2} max={10} step={1} />
                        <span className="text-sm font-medium w-12 text-center">{investmentPeriod} yrs</span>
                    </div>
                </ControlRow>
                <ControlRow label="Deployment Pacing">
                    <Select value={deploymentPacing} onValueChange={setDeploymentPacing}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="front-loaded">Front-loaded</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="back-loaded">Back-loaded</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="J-Curve Depth">
                    <Select value={jCurveDepth} onValueChange={setJCurveDepth}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="shallow">Shallow</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="deep">Deep</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                 <ControlRow label="Time to Breakeven">
                    <Select value={timeToBreakeven} onValueChange={setTimeToBreakeven}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="early">Early</SelectItem>
                            <SelectItem value="mid">Mid</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="Distribution Start">
                     <Select value={distributionStart} onValueChange={setDistributionStart}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="early">Early</SelectItem>
                            <SelectItem value="typical">Typical</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="Distribution Speed">
                    <Select value={distributionSpeed} onValueChange={setDistributionSpeed}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="slow">Slow</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="Tail Length">
                    <Select value={tailLength} onValueChange={setTailLength}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
            </CardContent>
        </Card>
    );
}
