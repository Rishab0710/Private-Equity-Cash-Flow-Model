'use client';
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type MultiplesAssumptionsProps = {
  tvpiTarget: number;
  setTvpiTarget: (value: number) => void;
  isDpiEnabled: boolean;
  setIsDpiEnabled: (value: boolean) => void;
  dpiTarget: number;
  setDpiTarget: (value: number) => void;
  isRvpiEnabled: boolean;
  setIsRvpiEnabled: (value: boolean) => void;
  rvpiTarget: number;
  setRvpiTarget: (value: number) => void;
};

const MultiplesInput = ({ value, setValue, targetValue }: { value: string, setValue: (val: string) => void, targetValue: number }) => {
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const numericVal = parseFloat(e.target.value);
        if (!isNaN(numericVal)) {
            setValue(numericVal.toString());
        } else {
            setValue(targetValue.toString());
        }
    };
    
    return (
         <Input 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
        />
    )
}

export function MultiplesAssumptions({
    tvpiTarget, setTvpiTarget,
    isDpiEnabled, setIsDpiEnabled, dpiTarget, setDpiTarget,
    isRvpiEnabled, setIsRvpiEnabled, rvpiTarget, setRvpiTarget
}: MultiplesAssumptionsProps) {
    
    const [displayTvpi, setDisplayTvpi] = useState(tvpiTarget.toFixed(2));
    const [displayDpi, setDisplayDpi] = useState(dpiTarget.toFixed(2));
    const [displayRvpi, setDisplayRvpi] = useState(rvpiTarget.toFixed(2));

    useEffect(() => setDisplayTvpi(tvpiTarget.toFixed(2)), [tvpiTarget]);
    useEffect(() => setDisplayDpi(dpiTarget.toFixed(2)), [dpiTarget]);
    useEffect(() => setDisplayRvpi(rvpiTarget.toFixed(2)), [rvpiTarget]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Fund Multiples Assumptions</CardTitle>
                <CardDescription className="text-xs">
                    Multiples represent outcome targets used to shape expected distributions and remaining value.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="font-semibold">TVPI</Label>
                        <Badge variant="secondary">Template</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" value={`${(tvpiTarget * 0.9).toFixed(2)}x`} disabled />
                        <Input 
                            value={`${displayTvpi}x`}
                            onChange={(e) => setDisplayTvpi(e.target.value.replace('x', ''))}
                            onBlur={() => {
                                const num = parseFloat(displayTvpi);
                                setTvpiTarget(isNaN(num) ? tvpiTarget : num);
                            }}
                            className="font-bold text-center border-primary" 
                         />
                        <Input placeholder="Max" value={`${(tvpiTarget * 1.1).toFixed(2)}x`} disabled />
                    </div>
                </div>

                <div className="space-y-2">
                     <div className="flex items-center space-x-2">
                        <Switch id="dpi-enable" checked={isDpiEnabled} onCheckedChange={setIsDpiEnabled} />
                        <Label htmlFor="dpi-enable" className="font-semibold">DPI</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" disabled />
                         <Input 
                            value={isDpiEnabled ? `${displayDpi}x` : ""}
                            onChange={(e) => setDisplayDpi(e.target.value.replace('x', ''))}
                            onBlur={() => {
                                const num = parseFloat(displayDpi);
                                setDpiTarget(isNaN(num) ? dpiTarget : num);
                            }}
                            disabled={!isDpiEnabled}
                        />
                        <Input placeholder="Max" disabled />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Switch id="rvpi-enable" checked={isRvpiEnabled} onCheckedChange={setIsRvpiEnabled}/>
                        <Label htmlFor="rvpi-enable" className="font-semibold">RVPI</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" disabled />
                        <Input 
                            value={isRvpiEnabled ? `${displayRvpi}x` : ""}
                            onChange={(e) => setDisplayRvpi(e.target.value.replace('x', ''))}
                            onBlur={() => {
                                const num = parseFloat(displayRvpi);
                                setRvpiTarget(isNaN(num) ? rvpiTarget : num);
                            }}
                            disabled={!isRvpiEnabled}
                        />
                        <Input placeholder="Max" disabled />
                    </div>
                </div>

                <div className="flex items-start space-x-2 rounded-md border p-3 bg-muted/50">
                    <Checkbox id="lock-assumptions" />
                    <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="lock-assumptions" className="font-medium">
                            Lock to Manager Published Assumptions
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            When locked, assumptions are read-only and will automatically update if the manager provides new data.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
