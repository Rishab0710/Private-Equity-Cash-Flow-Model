'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ListChecks,
  Briefcase,
  UserCheck,
  Building,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Hammer,
} from 'lucide-react';

const queueItems = [
  {
    icon: Briefcase,
    title: 'Quarterly Tax-Loss Harvest',
    subtitle: 'Global Growth Fund',
    status: 'Pending PM Approval',
    statusColor: 'text-yellow-400',
  },
  {
    icon: UserCheck,
    title: 'Model Drift Adjustment',
    subtitle: 'US Equity Fund',
    status: 'Calculating Trades',
    statusColor: 'text-blue-400',
  },
  {
    icon: Building,
    title: 'Client Redemption Basket',
    subtitle: 'Global Tech ETF',
    status: 'Executing Trades',
    statusColor: 'text-green-400',
  },
  {
    icon: TrendingUp,
    title: 'Monthly Cash Deployment',
    subtitle: 'Emerging Markets Bond Fund',
    status: 'Sending to OMS',
    statusColor: 'text-green-400',
  },
    {
    icon: TrendingDown,
    title: 'Sector Weight Rebalance',
    subtitle: 'Global Growth Fund',
    status: 'Pending PM Approval',
    statusColor: 'text-yellow-400',
  },
  {
    icon: Hammer,
    title: 'FX Hedge Adjustment',
    subtitle: 'International Equity Fund',
    status: 'Sending to OMS',
    statusColor: 'text-green-400',
  },
];

export function RebalanceQueue() {
  return (
    <Card className="bg-card h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ListChecks className="h-5 w-5" />
            Rebalance Queue
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
            {queueItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${item.statusColor} border-current/30`}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
