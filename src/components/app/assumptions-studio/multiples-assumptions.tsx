'use client';
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type MultiplesAssumptionsProps = {
  tvpiTarget: number;
  setTvpiTarget: (value: number) => void;
  dpiTarget: number;
  setDpiTarget: (value: number) => void;
  rvpiTarget: number;
  setRvpiTarget: (value: number) => void;
  overrideYear: number;
  setOverrideYear: (value: number) => void;
  overrideCall: number;
  setOverrideCall: (value: number) => void;
  overrideDist: number;
  setOverrideDist: (value: number) => void;
  className?: string;
};

export function MultiplesAssumptions({
    tvpiTarget, setTvpiTarget,
    dpiTarget, setDpiTarget,
    rvpiTarget, setRvpiTarget,
    overrideYear, setOverrideYear,
    overrideCall, setOverrideCall,
    overrideDist, setOverrideDist,
    className
}: MultiplesAssumptionsProps) {
    
    const [displayTvpi, setDisplayTvpi] = useState(tvpiTarget.toFixed(2));
    const [displayDpi, setDisplayDpi] = useState(dpiTarget.toFixed(2));
    const [displayRvpi, setDisplayRvpi] = useState(rvpiTarget.toFixed(2));

    useEffect(() => {
        setDisplayTvpi(tvpiTarget.toFixed(2));
    }, [tvpiTarget]);

    useEffect(() => {
        setDisplayDpi(dpiTarget.toFixed(2));
    }, [dpiTarget]);

    useEffect(() => {
        setDisplayRvpi(rvpiTarget.toFixed(2));
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
                <CardTitle className="text-sm font-semibold text-highlight">Fund Model Parameters</CardTitle>
                <CardDescription className="text-[10px] text-black font-medium leading-tight">
                    Adjust performance targets and manual cash flow overrides.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
                
                {/* TVPI Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-semibold text-black">TVPI Target</Label>
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

                {/* Cashflow Overrides Section - REPLACED MOIC */}
                <div className="space-y-3 pt-2 border-t border-dashed border-black/10">
                    <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-semibold text-black">Actual Cash Flow Overrides</Label>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 text-black bg-secondary/50 font-medium">Manual</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <Label className="text-[9px] font-bold text-black uppercase">Year</Label>
                            <Select value={overrideYear.toString()} onValueChange={(v) => setOverrideYear(parseInt(v))}>
                                <SelectTrigger className="h-7 text-[10px] font-medium text-black border-black/20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <SelectItem key={i} value={i.toString()} className="text-[10px]">Yr {i}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] font-bold text-black uppercase">Actual Call</Label>
                            <div className="relative">
                                <Input 
                                    value={overrideCall}
                                    onChange={(e) => setOverrideCall(parseFloat(e.target.value) || 0)}
                                    className="h-7 text-[10px] text-center border-black/20 text-black pr-4" 
                                />
                                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-medium text-black">M</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] font-bold text-black uppercase">Actual Dist</Label>
                            <div className="relative">
                                <Input 
                                    value={overrideDist}
                                    onChange={(e) => setOverrideDist(parseFloat(e.target.value) || 0)}
                                    className="h-7 text-[10px] text-center border-black/20 text-black pr-4" 
                                />
                                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-medium text-black">M</span>
                            </div>
                        </div>
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
