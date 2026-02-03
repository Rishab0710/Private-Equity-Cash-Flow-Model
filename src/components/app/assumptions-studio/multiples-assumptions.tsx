
'use client';
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type MultiplesAssumptionsProps = {
  tvpiTarget: number;
  setTvpiTarget: (value: number) => void;
  moicTarget: number;
  setMoicTarget: (value: number) => void;
  dpiTarget: number;
  setDpiTarget: (value: number) => void;
  rvpiTarget: number;
  setRvpiTarget: (value: number) => void;
  className?: string;
};

export function MultiplesAssumptions({
    tvpiTarget, setTvpiTarget,
    moicTarget, setMoicTarget,
    dpiTarget, setDpiTarget,
    rvpiTarget, setRvpiTarget,
    className
}: MultiplesAssumptionsProps) {
    
    const [displayTvpi, setDisplayTvpi] = useState(tvpiTarget.toFixed(2));
    const [displayMoic, setDisplayMoic] = useState(moicTarget.toFixed(2));
    const [displayDpi, setDisplayDpi] = useState(dpiTarget.toFixed(2));
    const [displayRvpi, setDisplayRvpi] = useState(rvpiTarget.toFixed(2));

    // Sync local display values with parent state when it changes from outside
    useEffect(() => {
        if (parseFloat(displayTvpi) !== tvpiTarget) setDisplayTvpi(tvpiTarget.toFixed(2));
    }, [tvpiTarget]);

    useEffect(() => {
        if (parseFloat(displayMoic) !== moicTarget) setDisplayMoic(moicTarget.toFixed(2));
    }, [moicTarget]);

    useEffect(() => {
        if (parseFloat(displayDpi) !== dpiTarget) setDisplayDpi(dpiTarget.toFixed(2));
    }, [dpiTarget]);

    useEffect(() => {
        if (parseFloat(displayRvpi) !== rvpiTarget) setDisplayRvpi(rvpiTarget.toFixed(2));
    }, [rvpiTarget]);

    const handleNumericChange = (val: string, setter: (n: number) => void, displaySetter: (s: string) => void) => {
        const cleaned = val.replace(/[^0-9.]/g, '');
        displaySetter(cleaned);
        const num = parseFloat(cleaned);
        if (!isNaN(num)) {
            setter(num);
        }
    };

    const InputHeader = () => (
        <div className="grid grid-cols-3 gap-2 mb-1 px-1">
            <span className="text-[9px] font-medium text-black text-center uppercase tracking-wider">Min</span>
            <span className="text-[9px] font-semibold text-highlight text-center uppercase tracking-wider">Target</span>
            <span className="text-[9px] font-medium text-black text-center uppercase tracking-wider">Max</span>
        </div>
    );

    return (
        <Card className={cn("border-black/10 h-full", className)}>
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
                        <Label className="text-[11px] font-semibold text-black">TVPI (Total Value to Paid-In)</Label>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 text-black bg-secondary/50 font-medium">Template</Badge>
                    </div>
                    <InputHeader />
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" value={`${(tvpiTarget * 0.85).toFixed(2)}x`} disabled className="h-7 text-[11px] text-black font-medium bg-muted/50 border-none text-center" />
                        <div className="relative">
                            <Input 
                                value={displayTvpi}
                                onChange={(e) => handleNumericChange(e.target.value, setTvpiTarget, setDisplayTvpi)}
                                className="h-7 text-[11px] font-semibold text-center border-highlight text-black focus:ring-1 focus:ring-highlight pr-4" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-black">x</span>
                        </div>
                        <Input placeholder="Max" value={`${(tvpiTarget * 1.25).toFixed(2)}x`} disabled className="h-7 text-[11px] text-black font-medium bg-muted/50 border-none text-center" />
                    </div>
                </div>

                {/* MOIC Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-semibold text-black">MOIC (Multiple on Invested Capital)</Label>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 text-black bg-secondary/50 font-medium">Custom</Badge>
                    </div>
                    <InputHeader />
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Min" value={`${(moicTarget * 0.85).toFixed(2)}x`} disabled className="h-7 text-[11px] text-black font-medium bg-muted/50 border-none text-center" />
                        <div className="relative">
                            <Input 
                                value={displayMoic}
                                onChange={(e) => handleNumericChange(e.target.value, setMoicTarget, setDisplayMoic)}
                                className="h-7 text-[11px] font-semibold text-center border-highlight text-black focus:ring-1 focus:ring-highlight pr-4" 
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-black">x</span>
                        </div>
                        <Input placeholder="Max" value={`${(moicTarget * 1.25).toFixed(2)}x`} disabled className="h-7 text-[11px] text-black font-medium bg-muted/50 border-none text-center" />
                    </div>
                </div>

                <div className="pt-2 border-t border-dashed border-black/20">
                    <div className="grid grid-cols-2 gap-8 px-2">
                        {/* DPI Section */}
                        <div className="space-y-2">
                            <Label className="text-[11px] font-semibold text-black">DPI (Realized)</Label>
                            <div className="grid grid-cols-1 gap-1">
                                <div className="relative w-full mx-auto">
                                    <Input 
                                        value={displayDpi}
                                        onChange={(e) => handleNumericChange(e.target.value, setDpiTarget, setDisplayDpi)}
                                        className="h-7 text-[11px] text-black font-semibold text-center border-black/20 pr-5"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-black">x</span>
                                </div>
                                <span className="text-[9px] text-center text-black font-medium">Cash Distributed</span>
                            </div>
                        </div>

                        {/* RVPI Section */}
                        <div className="space-y-2">
                            <Label className="text-[11px] font-semibold text-black">RVPI (Remaining)</Label>
                            <div className="grid grid-cols-1 gap-1">
                                <div className="relative w-full mx-auto">
                                    <Input 
                                        value={displayRvpi}
                                        onChange={(e) => handleNumericChange(e.target.value, setRvpiTarget, setDisplayRvpi)}
                                        className="h-7 text-[11px] text-black font-semibold text-center border-black/20 pr-5"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-black">x</span>
                                </div>
                                <span className="text-[9px] text-center text-black font-medium">Unrealized Value</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
