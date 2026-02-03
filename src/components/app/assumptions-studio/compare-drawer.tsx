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

type Set = {
  id: number;
  name: string;
  strategy: string;
  source: string;
  updated: string;
  status: string;
};

const shapeLabels = {
    depth: "Moderate",
    breakeven: "Mid",
    distStart: "Typical",
};

const multiples = {
    tvpi: "2.20x",
    dpi: "1.5x (Enabled)",
    rvpi: "0.7x (Enabled)",
};

const notes = "This is the base case scenario using the firm's standard buyout model assumptions. Represents a typical fund lifecycle.";

const CompareCard = ({ set }: { set: Set }) => (
    <Card className="flex-1 min-w-[300px]">
        <CardHeader>
            <CardTitle className="text-base text-black font-bold">{set.name}</CardTitle>
            <div className="flex gap-2 text-xs pt-1">
                <Badge variant="secondary" className="text-black">{set.strategy}</Badge>
                <Badge variant={set.source === 'Custom' ? 'default' : 'secondary'} className="text-black">{set.source}</Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            <div>
                <h4 className="font-bold text-black mb-2">J-Curve Shape</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-black font-medium">
                    <span>Depth:</span> <span className="font-bold">{shapeLabels.depth}</span>
                    <span>Breakeven:</span> <span className="font-bold">{shapeLabels.breakeven}</span>
                    <span>Distribution Start:</span> <span className="font-bold">{shapeLabels.distStart}</span>
                </div>
            </div>
             <div>
                <h4 className="font-bold text-black mb-2">Multiples</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-black font-medium">
                    <span>TVPI Target:</span> <span className="font-bold">{multiples.tvpi}</span>
                    <span>DPI:</span> <span className="font-bold">{multiples.dpi}</span>
                    <span>RVPI:</span> <span className="font-bold">{multiples.rvpi}</span>
                </div>
            </div>
             <div>
                <h4 className="font-bold text-black mb-2">Notes</h4>
                <p className="text-black italic text-xs line-clamp-3 font-medium">{notes}</p>
            </div>
        </CardContent>
    </Card>
);

export function CompareDrawer({ isOpen, onOpenChange, sets }: { isOpen: boolean, onOpenChange: (open: boolean) => void, sets: Set[] }) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[80vw] p-0">
        <div className="p-6 border-b">
            <SheetHeader>
            <SheetTitle className="text-black font-bold">Compare Assumption Sets</SheetTitle>
            <SheetDescription className="text-black font-medium">
                Side-by-side comparison of selected assumption sets.
            </SheetDescription>
            </SheetHeader>
        </div>
        <div className="flex gap-6 p-6 bg-muted h-full overflow-x-auto">
            {sets.map(set => (
                <CompareCard key={set.id} set={set} />
            ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
