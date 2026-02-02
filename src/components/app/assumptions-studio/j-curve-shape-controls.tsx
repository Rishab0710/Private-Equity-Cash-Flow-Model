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

export function JCurveShapeControls() {
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
                        <Slider defaultValue={[5]} min={2} max={10} step={1} />
                        <span className="text-sm font-medium w-12 text-center">5 yrs</span>
                    </div>
                </ControlRow>
                <ControlRow label="Deployment Pacing">
                    <Select defaultValue="balanced">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="front-loaded">Front-loaded</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="back-loaded">Back-loaded</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="J-Curve Depth">
                    <Select defaultValue="moderate">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="shallow">Shallow</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="deep">Deep</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                 <ControlRow label="Time to Breakeven">
                    <Select defaultValue="mid">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="early">Early</SelectItem>
                            <SelectItem value="mid">Mid</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="Distribution Start">
                    <Select defaultValue="typical">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="early">Early</SelectItem>
                            <SelectItem value="typical">Typical</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="Distribution Speed">
                    <Select defaultValue="normal">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="slow">Slow</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                        </SelectContent>
                    </Select>
                </ControlRow>
                <ControlRow label="Tail Length">
                    <Select defaultValue="medium">
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
