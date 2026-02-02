'use client';

import { AssumptionSets } from "@/components/app/assumptions-studio/assumption-sets";
import { CashflowTimeline } from "@/components/app/assumptions-studio/cashflow-timeline";
import { ContextSelector } from "@/components/app/assumptions-studio/context-selector";
import { JCurvePreview } from "@/components/app/assumptions-studio/j-curve-preview";
import { JCurveShapeControls } from "@/components/app/assumptions-studio/j-curve-shape-controls";
import { MultiplesAssumptions } from "@/components/app/assumptions-studio/multiples-assumptions";
import { NotesTagging } from "@/components/app/assumptions-studio/notes-tagging";
import { SummaryOutputs } from "@/components/app/assumptions-studio/summary-outputs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AssumptionsStudioPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-bold tracking-tight text-highlight">
                    J-Curve & Multiples Assumptions
                </h1>
                <p className="text-muted-foreground">
                    Set strategy and fund assumptions for J-Curve shape and TVPI/DPI/RVPI targets.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button>Save Assumption Set</Button>
                <Button variant="outline">Set as Active for Fund</Button>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-6">
          <ContextSelector />
          <JCurveShapeControls />
          <MultiplesAssumptions />
          <NotesTagging />
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          <JCurvePreview />
          <CashflowTimeline />
          <SummaryOutputs />
        </div>
      </div>

      {/* Bottom Section */}
      <AssumptionSets />
    </div>
  );
}
