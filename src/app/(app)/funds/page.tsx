import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { FundList } from '@/components/app/funds/fund-list';

export default function FundsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Fund Management</h1>
        <Button asChild>
          <Link href="/funds/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Fund
          </Link>
        </Button>
      </div>
      <FundList />
    </div>
  );
}
