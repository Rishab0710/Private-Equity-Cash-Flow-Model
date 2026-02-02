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
            <CardTitle className="text-base">{set.name}</CardTitle>
            <div className="flex gap-2 text-xs pt-1">
                <Badge variant="secondary">{set.strategy}</Badge>
                <Badge variant={set.source === 'Custom' ? 'default' : 'secondary'}>{set.source}</Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
            <div>
                <h4 className="font-semibold mb-2">J-Curve Shape</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                    <span>Depth:</span> <span className="font-medium text-foreground">{shapeLabels.depth}</span>
                    <span>Breakeven:</span> <span className="font-medium text-foreground">{shapeLabels.breakeven}</span>
                    <span>Distribution Start:</span> <span className="font-medium text-foreground">{shapeLabels.distStart}</span>
                </div>
            </div>
             <div>
                <h4 className="font-semibold mb-2">Multiples</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                    <span>TVPI Target:</span> <span className="font-medium text-foreground">{multiples.tvpi}</span>
                    <span>DPI:</span> <span className="font-medium text-foreground">{multiples.dpi}</span>
                    <span>RVPI:</span> <span className="font-medium text-foreground">{multiples.rvpi}</span>
                </div>
            </div>
             <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-muted-foreground italic text-xs line-clamp-3">{notes}</p>
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
            <SheetTitle>Compare Assumption Sets</SheetTitle>
            <SheetDescription>
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
