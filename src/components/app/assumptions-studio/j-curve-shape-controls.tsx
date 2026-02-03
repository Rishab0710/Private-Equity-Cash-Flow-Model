'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const ControlRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-3 items-center gap-4">
        <Label className="text-[11px] font-semibold text-black">{label}</Label>
        <div className="col-span-2">{children}</div>
    </div>
);

type JCurveShapeControlsProps = {
  fundLife: number;
  setFundLife: (value: number) => void;
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
  className?: string;
};

export function JCurveShapeControls({
  fundLife,
  setFundLife,
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
  className,
}: JCurveShapeControlsProps) {
    return (
        <Card className={cn("border-black/10", className)}>
            <CardHeader className="py-3">
                <CardTitle className="text-sm font-semibold text-highlight">J-Curve Shape Controls</CardTitle>
                <CardDescription className="text-[10px] text-black font-medium leading-tight">
                    These settings control the shape of calls, NAV ramp, and distributions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <ControlRow label="Fund Life">
                    <div className="flex items-center gap-2">
                        <Slider value={[fundLife]} onValueChange={([v]) => {
                            setFundLife(v);
                        }} min={5} max={15} step={1} />
                        <span className="text-[10px] font-bold w-12 text-center text-black">{fundLife} yrs</span>
                    </div>
                </ControlRow>
                <ControlRow label="Deployment Pacing">
                    <Select value={deploymentPacing} onValueChange={setDeploymentPacing}>
                        <SelectTrigger className="text-[11px] h-7 text-black font-medium"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="front-loaded" className="text-xs">Front-loaded</SelectItem>
                            <SelectItem value="balanced" className="text-xs">Balanced</SelectItem>
                            <SelectItem value="back-loaded" className="text-xs">Back-loaded</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="J-Curve Depth">
                    <Select value={jCurveDepth} onValueChange={setJCurveDepth}>
                        <SelectTrigger className="text-[11px] h-7 text-black font-medium"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="shallow" className="text-xs">Shallow</SelectItem>
                            <SelectItem value="moderate" className="text-xs">Moderate</SelectItem>
                            <SelectItem value="deep" className="text-xs">Deep</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                 <ControlRow label="Time to Breakeven">
                    <Select value={timeToBreakeven} onValueChange={setTimeToBreakeven}>
                        <SelectTrigger className="text-[11px] h-7 text-black font-medium"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="early" className="text-xs">Early</SelectItem>
                            <SelectItem value="mid" className="text-xs">Mid</SelectItem>
                            <SelectItem value="late" className="text-xs">Late</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="Distribution Start">
                     <Select value={distributionStart} onValueChange={setDistributionStart}>
                        <SelectTrigger className="text-[11px] h-7 text-black font-medium"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="early" className="text-xs">Early</SelectItem>
                            <SelectItem value="typical" className="text-xs">Typical</SelectItem>
                            <SelectItem value="late" className="text-xs">Late</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="Distribution Speed">
                    <Select value={distributionSpeed} onValueChange={setDistributionSpeed}>
                        <SelectTrigger className="text-[11px] h-7 text-black font-medium"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="slow" className="text-xs">Slow</SelectItem>
                            <SelectItem value="normal" className="text-xs">Normal</SelectItem>
                            <SelectItem value="fast" className="text-xs">Fast</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
            </CardContent>
        </Card>
    );
}
