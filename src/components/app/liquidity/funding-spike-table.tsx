'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { CashflowData } from '@/lib/types';
import { format } from 'date-fns';

type Props = {
    cashflowData: CashflowData[];
};

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${(value / 1_000).toFixed(0)}K`;
};

export function FundingSpikeTable({ cashflowData }: Props) {
    const spikes = cashflowData
        .filter(cf => !cf.isActual && cf.capitalCall > 0)
        .sort((a, b) => b.capitalCall - a.capitalCall)
        .slice(0, 5)
        .map(cf => ({
            date: cf.date,
            amount: cf.capitalCall,
            type: 'Capital Call Spike'
        }));

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
                            <TableHead>Event Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {spikes.map((spike, index) => (
                            <TableRow key={index}>
                                <TableCell>{format(new Date(spike.date), 'MMM yyyy')}</TableCell>
                                <TableCell>
                                    <Badge variant="destructive">{spike.type}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(spike.amount)}</TableCell>
                                <TableCell className="text-right text-primary hover:underline cursor-pointer">Drilldown</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
