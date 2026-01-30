'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { funds } from '@/lib/data';

type FundSelectorProps = {
  selectedFundId: string;
  onFundChange: (fundId: string) => void;
};

export function FundSelector({
  selectedFundId,
  onFundChange,
}: FundSelectorProps) {
  const fundOptions = [{ id: 'all', name: 'All Funds' }, ...funds];
  return (
    <Select value={selectedFundId} onValueChange={onFundChange}>
      <SelectTrigger className="w-[200px] bg-secondary/50 border-border h-9 text-xs">
        <SelectValue placeholder="Select Fund" />
      </SelectTrigger>
      <SelectContent>
        {fundOptions.map((fund) => (
          <SelectItem key={fund.id} value={fund.id}>
            {fund.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
