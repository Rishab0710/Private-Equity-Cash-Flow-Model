'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { CashflowData, Fund } from '@/lib/types';
import { format } from 'date-fns';

type SpikeDrilldownProps = {
    spike: { date: string; amount: number; index: number };
    allFundCashflows: CashflowData[][];
    funds: Fund[];
};

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${(value / 1_000).toFixed(0)}K`;
};

const formatPercent = (value: number) => `${(value * 100).toFixed(0)}%`;

const SpikeDrilldownContent = ({ spike, allFundCashflows, funds }: SpikeDrilldownProps) => {
    const contributions = allFundCashflows.map((fundCashflows, index) => ({
        fund: funds[index],
        call: fundCashflows[spike.index]?.capitalCall || 0,
    }))
    .filter(item => item.call > 0)
    .sort((a, b) => b.call - a.call);

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Funding Spike Details: {format(new Date(spike.date), 'MMM yyyy')}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <div className='flex justify-between items-center bg-muted/50 p-3 rounded-lg'>
                    <span className='text-sm font-medium'>Total Capital Call</span>
                    <span className='text-lg font-bold'>{formatCurrency(spike.amount)}</span>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Contributing Funds Breakdown</h4>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fund Name</TableHead>
                                <TableHead className="text-right">Call Amount</TableHead>
                                <TableHead className="text-right">% of Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contributions.map(c => (
                                <TableRow key={c.fund.id}>
                                    <TableCell className="font-medium">{c.fund.name}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(c.call)}</TableCell>
                                    <TableCell className="text-right">{formatPercent(c.call / spike.amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DialogContent>
    );
};

type Props = {
    cashflowData: CashflowData[];
    allFundCashflows: CashflowData[][];
    funds: Fund[];
};

export function FundingSpikeTable({ cashflowData, allFundCashflows, funds }: Props) {
    if (!allFundCashflows || !funds) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Funding Spike Identification</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                        Loading spike data...
                    </div>
                </CardContent>
            </Card>
        );
    }

    const spikes = cashflowData
        .map((cf, index) => ({ ...cf, index }))
        .filter(cf => !cf.isActual && cf.capitalCall > 0)
        .sort((a, b) => b.capitalCall - a.capitalCall)
        .slice(0, 5)
        .map(cf => {
            const contributions = allFundCashflows
                .map((fundCashflows, fundIndex) => ({
                    fundName: funds[fundIndex]?.name,
                    call: fundCashflows[cf.index]?.capitalCall || 0,
                }))
                .filter(c => c.call > 0 && c.fundName)
                .sort((a, b) => b.call - a.call);

            const drivingFunds = contributions.slice(0, 2).map(c => c.fundName).join(', ');
            const topContribution = contributions[0]?.call || 0;
            const concentration = cf.capitalCall > 0 ? topContribution / cf.capitalCall : 0;
            
            return {
                date: cf.date,
                amount: cf.capitalCall,
                type: 'Capital Call Spike',
                drivingFunds,
                concentration,
                index: cf.index,
            };
        });

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Funding Spike Identification</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Driving Funds</TableHead>
                            <TableHead className="text-right">Concentration</TableHead>
                            <TableHead className="text-center">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {spikes.map((spike) => (
                            <TableRow key={spike.date}>
                                <TableCell>{format(new Date(spike.date), 'MMM yyyy')}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(spike.amount)}</TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={spike.drivingFunds}>
                                    {spike.drivingFunds}
                                </TableCell>
                                <TableCell className="text-right">{formatPercent(spike.concentration)}</TableCell>
                                <TableCell className="text-center">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="link" className="h-auto p-0 text-primary">Drilldown</Button>
                                        </DialogTrigger>
                                        <SpikeDrilldownContent spike={spike} allFundCashflows={allFundCashflows} funds={funds} />
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
