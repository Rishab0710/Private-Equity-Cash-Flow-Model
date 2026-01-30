'use client';

import { JCurveControls } from '@/components/app/j-curve-editor/j-curve-controls';
import { JCurvePreviewChart } from '@/components/app/j-curve-editor/j-curve-preview-chart';
import { PortfolioImpactPreview } from '@/components/app/j-curve-editor/portfolio-impact-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Dummy data for charts
const dummyCurveData = [
    { year: 0, value: 0 },
    { year: 1, value: -10 },
    { year: 2, value: -15 },
    { year: 3, value: -5 },
    { year: 4, value: 5 },
    { year: 5, value: 15 },
    { year: 6, value: 25 },
    { year: 7, value: 20 },
    { year: 8, value: 15 },
    { year: 9, value: 10 },
    { year: 10, value: 5 },
];

const dummyNavData = dummyCurveData.map((d, i) => ({ year: d.year, value: i * 10 + Math.random() * 10 - 5 })).slice(0);
if(dummyNavData.length > 0) {
    dummyNavData[0].value = 0;
}


export default function JCurveEditorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Cash Flow Forecasting</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <JCurveControls />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <JCurvePreviewChart title="Deployment & Distribution" data={dummyCurveData} type="composed" />
            <JCurvePreviewChart title="Net Cashflow (J-Curve)" data={dummyCurveData} type="line" />
            <JCurvePreviewChart title="NAV Evolution" data={dummyNavData} type="line" />
            <Card>
                <CardHeader>
                    <CardTitle>Curve Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
                        <p className="text-muted-foreground">Curve comparison coming soon...</p>
                    </div>
                </CardContent>
            </Card>
          </div>
          <Separator />
          <PortfolioImpactPreview />
        </div>
      </div>
    </div>
  );
}
