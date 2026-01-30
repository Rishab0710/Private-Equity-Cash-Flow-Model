'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lightbulb } from 'lucide-react';
import type { Alert } from '@/lib/types';

const actionItems = [
    { id: 1, text: 'Consider upsizing credit facility for Q3 2025.', risk: 'High', icon: AlertTriangle, color: 'text-red-500' },
    { id: 2, text: 'Model impact of delaying new commitments post-2024.', risk: 'Medium', icon: Lightbulb, color: 'text-yellow-500' },
    { id: 3, text: 'Review funds with largest unfunded to assess call timing.', risk: 'Low', icon: Lightbulb, color: 'text-blue-400' }
]

export function LiquidityActionPlanner({ alerts }: { alerts: Alert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb className="h-5 w-5" />
            Liquidity Action Planner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {actionItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                    <item.icon className={`h-4 w-4 mt-0.5 shrink-0 ${item.color}`} />
                    <p className="text-sm text-muted-foreground flex-1">
                      {item.text}
                    </p>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
