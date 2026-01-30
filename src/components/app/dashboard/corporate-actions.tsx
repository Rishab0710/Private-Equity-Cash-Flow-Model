'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FundDriver } from '@/lib/types';
import { TrendingUp, TrendingDown, GanttChartSquare } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
    drivers: {
        upcomingCalls: FundDriver[];
        expectedDistributions: FundDriver[];
        largestUnfunded: FundDriver[];
    }
}

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${(value / 1_000).toFixed(1)}K`;
};

const DriverItem = ({ driver, type }: { driver: FundDriver, type: 'call' | 'dist' | 'unfunded' }) => (
  <div className="flex items-center gap-4 py-2">
    {type === 'call' && <TrendingDown className="h-5 w-5 text-red-500" />}
    {type === 'dist' && <TrendingUp className="h-5 w-5 text-green-500" />}
    {type === 'unfunded' && <GanttChartSquare className="h-5 w-5 text-blue-500" />}
    <div className="flex-1">
      <p className="text-sm font-medium">{driver.fundName}</p>
      {type !== 'unfunded' && <p className="text-xs text-muted-foreground">Next: {format(new Date(driver.nextCashflowDate), "MMM dd, yyyy")}</p>}
    </div>
    <p className="text-sm font-semibold">{formatCurrency(driver.value)}</p>
  </div>
);

export function FundingDriversPanel({ drivers }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Funding & Distribution Drivers</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calls">
          <TabsList className="h-8 w-full grid grid-cols-3">
            <TabsTrigger value="calls" className="text-xs h-6">Calls</TabsTrigger>
            <TabsTrigger value="dists" className="text-xs h-6">Dists</TabsTrigger>
            <TabsTrigger value="unfunded" className="text-xs h-6">Unfunded</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[150px] mt-4">
            <TabsContent value="calls">
                {drivers.upcomingCalls.map(d => <DriverItem key={d.fundId} driver={d} type="call"/>)}
            </TabsContent>
            <TabsContent value="dists">
                {drivers.expectedDistributions.map(d => <DriverItem key={d.fundId} driver={d} type="dist"/>)}
            </TabsContent>
             <TabsContent value="unfunded">
                {drivers.largestUnfunded.map(d => <DriverItem key={d.fundId} driver={d} type="unfunded"/>)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
