'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Pin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert } from '@/lib/types';

const severityConfig = {
  High: { icon: AlertTriangle, color: 'text-red-500' },
  Medium: { icon: AlertTriangle, color: 'text-yellow-500' },
  Low: { icon: AlertTriangle, color: 'text-blue-500' },
};

type Props = {
    alerts: Alert[];
}

export function AlertsWatchlist({ alerts }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-5 w-5" />
            Alerts & Watchlist
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[150px]">
          <div className="space-y-4">
            {alerts.map((alert) => {
              const config = severityConfig[alert.severity];
              return (
                <div key={alert.id} className="flex items-start gap-3">
                  <config.icon className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${config.color}`}>
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                    <Pin className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
