import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LiquidityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Liquidity Planning</h1>
      <Card>
        <CardHeader>
          <CardTitle>Liquidity Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Liquidity chart coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
