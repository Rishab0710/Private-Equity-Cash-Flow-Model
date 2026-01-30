import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScenariosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Scenario Manager</h1>
      <Card>
        <CardHeader>
          <CardTitle>Compare Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Scenario comparison tool coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
