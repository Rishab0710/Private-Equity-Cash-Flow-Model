'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type ComparisonSet = {
  id: number;
  name: string;
  strategy: string;
  source: string;
  updated: string;
  status: string;
  vintage: number;
  commitment: number;
  data: {
    shape: {
      depth: string;
      breakeven: string;
      distStart: string;
    };
    multiples: {
      tvpi: string;
      dpi: string;
      rvpi: string;
    };
    risk: {
      volatility: string;
      gapRisk: string;
    };
    rationale: string;
    notes: string;
  }
};

const CompareCard = ({ set }: { set: ComparisonSet }) => (
    <Card className="flex-1 min-w-[320px] max-w-[400px] border-black/10 shadow-sm">
        <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
                <CardTitle className="text-sm text-highlight font-bold uppercase tracking-tight">{set.name}</CardTitle>
                <Badge variant="outline" className="text-[9px] font-bold border-black/20 text-black px-1.5 h-4">
                    {set.vintage}
                </Badge>
            </div>
            <div className="flex gap-2 text-xs pt-1">
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none font-bold">
                    {set.strategy}
                </Badge>
                <Badge variant="secondary" className="text-[10px] bg-muted text-black font-medium border-none">
                    {set.source}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-5 text-[11px]">
            <div>
                <h4 className="font-bold text-black uppercase tracking-wider mb-2 text-[10px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-highlight"></span>
                    J-Curve Dynamics
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-black font-medium bg-muted/30 p-2 rounded-md">
                    <span className="opacity-70">Depth:</span> <span className="font-bold text-right">{set.data.shape.depth}</span>
                    <span className="opacity-70">Breakeven:</span> <span className="font-bold text-right">{set.data.shape.breakeven}</span>
                    <span className="opacity-70">Dist. Start:</span> <span className="font-bold text-right">{set.data.shape.distStart}</span>
                </div>
            </div>

             <div>
                <h4 className="font-bold text-black uppercase tracking-wider mb-2 text-[10px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    Multiple Targets
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-black font-medium bg-green-50/50 p-2 rounded-md border border-green-100">
                    <span className="opacity-70 font-semibold text-green-800">TVPI Target:</span> <span className="font-bold text-right text-green-700">{set.data.multiples.tvpi}</span>
                    <span className="opacity-70">DPI:</span> <span className="font-bold text-right">{set.data.multiples.dpi}</span>
                    <span className="opacity-70">RVPI:</span> <span className="font-bold text-right">{set.data.multiples.rvpi}</span>
                </div>
            </div>

            <Separator className="bg-black/5" />

            <div>
                <h4 className="font-bold text-black uppercase tracking-wider mb-2 text-[10px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Risk Parameters
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-black font-medium">
                    <span className="opacity-70">Vol Score:</span> <span className="font-bold text-right">{set.data.risk.volatility}</span>
                    <span className="opacity-70">Gap Risk:</span> <span className={`font-bold text-right ${set.data.risk.gapRisk === 'High' ? 'text-red-600' : 'text-green-600'}`}>{set.data.risk.gapRisk}</span>
                </div>
            </div>

             <div>
                <h4 className="font-bold text-black uppercase tracking-wider mb-1 text-[10px]">Strategic Rationale</h4>
                <p className="text-black/80 font-medium leading-relaxed italic border-l-2 border-primary/20 pl-2 py-1">
                    {set.data.rationale}
                </p>
            </div>

             <div className="pt-2 border-t border-dashed border-black/10">
                <h4 className="font-bold text-black uppercase tracking-wider mb-1 text-[10px]">Simulation Notes</h4>
                <p className="text-black font-medium leading-tight line-clamp-4">
                    {set.data.notes}
                </p>
            </div>
        </CardContent>
    </Card>
);

export function CompareDrawer({ isOpen, onOpenChange, sets }: { isOpen: boolean, onOpenChange: (open: boolean) => void, sets: ComparisonSet[] }) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[85vw] p-0 flex flex-col">
        <div className="p-6 border-b bg-white">
            <SheetHeader>
                <SheetTitle className="text-highlight font-bold uppercase tracking-tight">Analytical Comparison Grid</SheetTitle>
                <SheetDescription className="text-black font-medium text-xs">
                    Side-by-side performance and risk attribution of selected assumption models.
                </SheetDescription>
            </SheetHeader>
        </div>
        <div className="flex-1 bg-muted/50 overflow-x-auto">
            <div className="flex gap-6 p-6 min-w-max items-start">
                {sets.map(set => (
                    <CompareCard key={set.id} set={set} />
                ))}
            </div>
        </div>
        <div className="p-4 border-t bg-white flex justify-end">
            <p className="text-[10px] text-black/50 font-bold uppercase tracking-widest">
                KAPNATIVE Institutional Reporting • Proprietary Model Comparisons
            </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
