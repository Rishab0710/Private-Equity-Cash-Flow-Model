'use client';
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MultiplesAssumptionsProps = {
  tvpiTarget: number;
  setTvpiTarget: (value: number) => void;
  moicTarget: number;
  setMoicTarget: (value: number) => void;
  dpiTarget: number;
  setDpiTarget: (value: number) => void;
  rvpiTarget: number;
  setRvpiTarget: (value: number) => void;
};

export function MultiplesAssumptions({
    tvpiTarget, setTvpiTarget,
    moicTarget, setMoicTarget,
    dpiTarget, setDpiTarget,
    rvpiTarget, setRvpiTarget
}: MultiplesAssumptionsProps) {
    
    const [displayTvpi, setDisplayTvpi] = useState(tvpiTarget.toFixed(2));
    const [displayMoic, setDisplayMoic] = useState(moicTarget.toFixed(2));
    const [displayDpi, setDisplayDpi] = useState(dpiTarget.toFixed(2));
    const [displayRvpi, setDisplayRvpi] = useState(rvpiTarget.toFixed(2));

    useEffect(() => setDisplayTvpi(tvpiTarget.toFixed(2)), [tvpiTarget]);
    useEffect(() => setDisplayMoic(moicTarget.toFixed(2)), [moicTarget]);
    useEffect(() => setDisplayDpi(dpiTarget.toFixed(2)), [dpiTarget]);
    useEffect(() => setDisplayRvpi(rvpiTarget.toFixed(2)), [rvpiTarget]);

    const InputHeader = () => (
        <div className="grid grid-cols-3 gap-2 mb-1 px-1">
            <span className="text-[9px] font-bold text-black text-center uppercase tracking-wider">Min</span>
            <span className="text-[9px] font-black text-primary text-center uppercase tracking-wider">Target</span>
            <span className="text-[9px] font-bold text-black text-center uppercase tracking-wider">Max</span>
        </div>
    );

    return (
        <Card>
            <CardHeader className="py-3">
                <CardTitle className="text-sm font-semibold text-highlight">Fund Multiples Assumptions</CardTitle>
                <CardDescription className="text-[10px] text-black font-medium leading-tight">
                    Multiples represent outcome targets used to shape expected distributions and remaining value.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
                
                {/* TVPI Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-black">TVPI (Total Value to Paid-In)</Label>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 text-black">Template</Badge>
                    </div>
                    <InputHeader />
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" value={`${(tvpiTarget * 0.85).toFixed(2)}x`} disabled className="h-7 text-[11px] text-black font-medium bg-muted/30" title="Conservative Boundary" />
                        <Input 
                            value={`${displayTvpi}x`}
                            onChange={(e) => setDisplayTvpi(e.target.value.replace('x', ''))}
                            onBlur={() => {
                                const num = parseFloat(displayTvpi);
                                setTvpiTarget(isNaN(num) ? tvpiTarget : num);
                            }}
                            className="h-7 text-[11px] font-black text-center border-primary text-black focus:ring-1 focus:ring-primary" 
                         />
                        <Input placeholder="Max" value={`${(tvpiTarget * 1.25).toFixed(2)}x`} disabled className="h-7 text-[11px] text-black font-medium bg-muted/30" title="Upside Potential" />
                    </div>
                </div>

                {/* MOIC Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-black">MOIC (Multiple on Invested Capital)</Label>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 text-black">Custom</Badge>
                    </div>
                    <InputHeader />
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" value={`${(moicTarget * 0.85).toFixed(2)}x`} disabled className="h-7 text-[11px] text-black font-medium bg-muted/30" />
                        <Input 
                            value={`${displayMoic}x`}
                            onChange={(e) => setDisplayMoic(e.target.value.replace('x', ''))}
                            onBlur={() => {
                                const num = parseFloat(displayMoic);
                                setMoicTarget(isNaN(num) ? moicTarget : num);
                            }}
                            className="h-7 text-[11px] font-black text-center border-primary text-black" 
                         />
                        <Input placeholder="Max" value={`${(moicTarget * 1.25).toFixed(2)}x`} disabled className="h-7 text-[11px] text-black font-medium bg-muted/30" />
                    </div>
                </div>

                <div className="pt-2 border-t border-dashed">
                    <p className="text-[10px] font-bold text-black mb-3 uppercase">Component Forecasts</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* DPI Section */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black">DPI (Realized)</Label>
                            <div className="grid grid-cols-1 gap-1">
                                <Input 
                                    value={`${displayDpi}x`}
                                    onChange={(e) => setDisplayDpi(e.target.value.replace('x', ''))}
                                    onBlur={() => {
                                        const num = parseFloat(displayDpi);
                                        setDpiTarget(isNaN(num) ? dpiTarget : num);
                                    }}
                                    className="h-7 text-[11px] text-black font-bold text-center"
                                />
                                <span className="text-[9px] text-center text-black font-medium">Cash Distributed</span>
                            </div>
                        </div>

                        {/* RVPI Section */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-black">RVPI (Remaining)</Label>
                            <div className="grid grid-cols-1 gap-1">
                                <Input 
                                    value={`${displayRvpi}x`}
                                    onChange={(e) => setDisplayRvpi(e.target.value.replace('x', ''))}
                                    onBlur={() => {
                                        const num = parseFloat(displayRvpi);
                                        setRvpiTarget(isNaN(num) ? rvpiTarget : num);
                                    }}
                                    className="h-7 text-[11px] text-black font-bold text-center"
                                />
                                <span className="text-[9px] text-center text-black font-medium">Unrealized Value</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-start space-x-2 rounded-md border p-2 bg-muted/50">
                    <Checkbox id="lock-assumptions" className="h-3 w-3 mt-0.5" />
                    <div className="grid gap-0.5 leading-none">
                        <Label htmlFor="lock-assumptions" className="text-[10px] font-bold text-black">
                            Lock to Manager Published Assumptions
                        </Label>
                        <p className="text-[9px] text-black font-medium">
                            Enforces strategy-level guardrails. Target values will stay within the house-defined Min/Max corridors.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
