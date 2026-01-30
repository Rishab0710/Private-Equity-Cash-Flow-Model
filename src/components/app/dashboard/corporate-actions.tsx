'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Building2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const upcomingActions = [
  {
    company: 'Microsoft Corp. (MSFT)',
    description: 'Quarterly dividend: $0.75/share',
    status: 'Announced',
    statusVariant: 'outline',
    dates: { ex: '19 Nov', rec: '20 Nov', pay: '11 Dec' },
  },
  {
    company: 'Apple Inc. (AAPL)',
    description: 'Dividend Reinvestment election due',
    status: 'Action Required',
    statusVariant: 'destructive',
    dates: { ex: '7 Nov', rec: '10 Nov', pay: '13 Nov' },
  },
  {
    company: 'NVIDIA Corp. (NVDA)',
    description: 'Announces 4-for-1 stock split',
    status: 'Announced',
    statusVariant: 'outline',
    dates: { ex: '1 Dec', rec: '2 Dec', pay: '2 Dec' },
  },
    {
    company: 'Pfizer Inc. (PFE)',
    description: 'Acquisition by AbbVie, election required',
    status: 'Action Required',
    statusVariant: 'destructive',
    dates: { ex: 'N/A', rec: 'N/A', pay: 'N/A' },
  },
];

const ActionItem = ({ action }: { action: any }) => (
  <div className="p-3 rounded-md bg-secondary/30">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold text-sm">{action.company}</p>
        <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
      </div>
      <Badge variant={action.statusVariant} className="text-xs">{action.status}</Badge>
    </div>
    <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
      <span>Ex-Date: {action.dates.ex}</span>
      <span>Rec. Date: {action.dates.rec}</span>
      <span>Pay Date: {action.dates.pay}</span>
    </div>
  </div>
);

export function CorporateActions() {
  return (
    <Card className="bg-card h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Building2 className="h-5 w-5" />
            Corporate Actions
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="h-8">
            <TabsTrigger value="upcoming" className="text-xs h-6">Upcoming (4)</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs h-6">Completed (2)</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <ScrollArea className="h-[250px] mt-4">
              <div className="space-y-3">
                {upcomingActions.map((action, index) => (
                  <ActionItem key={index} action={action} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="completed">
            <div className="flex items-center justify-center h-[250px]">
                <p className="text-muted-foreground text-sm">No completed actions.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
