import { funds } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FilePen, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type FundListProps = {
  showHeader?: boolean;
}

export function FundList({ showHeader = true }: FundListProps) {
  const formatCurrency = (amount: number) => {
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>All Funds</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fund Name</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead className="text-right">Commitment</TableHead>
              <TableHead className="text-right">Latest NAV</TableHead>
              <TableHead className="text-right">Unfunded</TableHead>
              <TableHead className="text-right">IRR (%)</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funds.map((fund) => (
              <TableRow key={fund.id}>
                <TableCell className="font-medium">{fund.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{fund.strategy}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(fund.commitment)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(fund.latestNav)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(fund.unfundedCommitment)}
                </TableCell>
                <TableCell className="text-right">{fund.forecastIRR.toFixed(1)}%</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FilePen className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
