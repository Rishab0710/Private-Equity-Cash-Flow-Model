'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { DataHealth } from '@/lib/types';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

type Props = {
    data: DataHealth;
}

const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

export function DataHealthPanel({ data }: Props) {
  return (
    <Card className="h-full">
      <CardHeader className='pb-2'>
        <CardTitle className="text-base font-semibold">Statement Extraction & Data Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
            <div>
                <div className='flex justify-between items-baseline'>
                    <p className='text-sm text-muted-foreground'>Extraction Success</p>
                    <p className='font-semibold'>{formatPercent(data.successRate)}</p>
                </div>
                <Progress value={data.successRate * 100} className='h-1 mt-1'/>
            </div>
            <div className='flex justify-between items-center text-sm'>
                <p className='text-muted-foreground'>Funds Updated</p>
                <p className='font-semibold'>{data.fundsUpdated} / {data.totalFunds}</p>
            </div>
             <div className='flex justify-between items-center text-sm'>
                <p className='text-muted-foreground'>Low Confidence Alerts</p>
                <p className='font-semibold text-yellow-400'>{data.lowConfidenceAlerts}</p>
            </div>
        </div>

        <CardDescription className='mt-4 mb-2 text-xs'>Recent Activity</CardDescription>
        <ScrollArea className='h-[80px]'>
            <div className='space-y-3 text-sm'>
                {data.recentActivity.map(item => (
                    <div key={item.fundName} className='flex items-center gap-2'>
                        {item.status === 'Success' ? <CheckCircle className='h-4 w-4 text-green-500' /> : <AlertCircle className='h-4 w-4 text-red-500' />}
                        <p className='flex-1 text-xs truncate'>{item.fundName}</p>
                        <p className='text-xs text-muted-foreground'>{format(new Date(item.timestamp), 'dd MMM')}</p>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
