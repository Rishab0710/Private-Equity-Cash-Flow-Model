
'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { ExtractStatementDataOutput } from '@/ai/flows/statement-data-extraction';
import { Check, X } from 'lucide-react';

type Props = {
  result: ExtractStatementDataOutput;
  onApprove: () => void;
  onCancel: () => void;
  fileName: string;
};

const ConfidenceBadge = ({ score }: { score: number }) => {
    let variant: "default" | "secondary" | "destructive" = "default";
    if (score < 0.7) {
        variant = "destructive";
    } else if (score < 0.9) {
        variant = "secondary";
    }

    return <Badge variant={variant}>{(score * 100).toFixed(0)}%</Badge>;
}

export function ExtractionReview({ result, onApprove, onCancel, fileName }: Props) {
  const [editedResult, setEditedResult] = useState(result);
  
  const renderTable = (title: string, data: any[]) => {
    if (!data || data.length === 0) return null;

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Value</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-center">Confidence</TableHead>
                        <TableHead className="text-center">Source Page</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <Input
                                    type="text"
                                    defaultValue={item.value}
                                    className="h-8"
                                />
                            </TableCell>
                            <TableCell>{item.period}</TableCell>
                            <TableCell className="text-center"><ConfidenceBadge score={item.confidence} /></TableCell>
                            <TableCell className="text-center">
                                <Button variant="outline" size="sm" className="h-8">{item.sourcePage}</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
  }
  
  const renderSingleValue = (title: string, data: any) => {
      if(!data) return null;
      return (
        <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Value</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead  className="text-center">Confidence</TableHead>
                        <TableHead  className="text-center">Source Page</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     <TableRow>
                        <TableCell>
                            <Input
                                type="text"
                                defaultValue={data.value}
                                className="h-8"
                            />
                        </TableCell>
                        <TableCell>{data.period}</TableCell>
                        <TableCell className="text-center"><ConfidenceBadge score={data.confidence} /></TableCell>
                        <TableCell className="text-center">
                            <Button variant="outline" size="sm" className="h-8">{data.sourcePage}</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Extracted Data</CardTitle>
        <CardDescription>
          Review and approve the data extracted from <span className="font-semibold">{fileName}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderTable('Capital Calls', editedResult.capitalCalls)}
        {renderTable('Distributions', editedResult.distributions)}
        {renderTable('NAV Values', editedResult.navValues)}
        {renderTable('Fees & Expenses', editedResult.feesAndExpenses)}
        {renderSingleValue('Remaining Unfunded Commitment', editedResult.remainingUnfundedCommitment)}
        {renderSingleValue('DPI', editedResult.dpi)}
        {renderSingleValue('TVPI', editedResult.tvpi)}
        {renderSingleValue('IRR', editedResult.irr)}
      </CardContent>
       <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
            </Button>
            <Button onClick={onApprove}>
                <Check className="mr-2 h-4 w-4" />
                Approve and Apply
            </Button>
        </CardFooter>
    </Card>
  );
}
