'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, AlertTriangle, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const alerts = [
  {
    level: 'error',
    title: 'Tracking Error Breach',
    description: 'GGF tracking error at 3.2% vs 2.0% limit.',
  },
  {
    level: 'warning',
    title: 'Settlement At-Risk',
    description: 'USEF cash balance below T+2 settlement needs.',
  },
  {
    level: 'warning',
    title: 'NAV Mispricing',
    description: 'EMBF NAV differs from custodian by 0.5%.',
  },
  {
    level: 'info',
    title: 'Large Creation Order',
    description: 'GGF received a $50M creation order from an AP.',
  },
  {
    level: 'error',
    title: 'Compliance Breach',
    description: 'USEF holding in AAPL exceeds 10% limit.',
  },
  {
    level: 'warning',
    title: 'Corporate Action Mismatch',
    description: 'USEF dividend for PFE not matching custodian record.',
  },
];

const levelConfig = {
  error: {
    icon: AlertTriangle,
    color: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
  },
};

export function AlertsExceptions() {
  return (
    <Card className="bg-card h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <AlertTriangle className="h-5 w-5" />
            Alerts & Exceptions
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const config = levelConfig[alert.level as keyof typeof levelConfig];
              return (
                <div key={index} className="flex items-start gap-3">
                  <config.icon
                    className={`h-4 w-4 mt-0.5 shrink-0 ${config.color}`}
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${config.color}`}>
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                    <Info className="h-4 w-4 text-muted-foreground" />
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
