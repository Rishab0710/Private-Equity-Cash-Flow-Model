'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, RefreshCw, AlertTriangle, XCircle } from 'lucide-react';

const statuses = [
  {
    label: 'EOD Complete',
    variant: 'success',
    icon: CheckCircle,
  },
  {
    label: 'Rebalance Pending',
    variant: 'warning',
    icon: RefreshCw,
  },
  {
    label: 'NAV Mismatch',
    variant: 'warning',
    icon: AlertTriangle,
  },
  {
    label: 'Settlement At-Risk',
    variant: 'destructive',
    icon: XCircle,
  },
  {
    label: 'Compliance Breach',
    variant: 'destructive',
    icon: AlertTriangle,
  },
];

const variantClasses = {
  success: 'bg-green-900/50 border-green-700 text-green-300',
  warning: 'bg-yellow-900/50 border-yellow-700 text-yellow-300',
  destructive: 'bg-red-900/50 border-red-700 text-red-300',
};

export function StatusRibbon() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((status) => (
        <Badge
          key={status.label}
          variant="outline"
          className={`flex items-center gap-2 ${
            variantClasses[status.variant as keyof typeof variantClasses]
          }`}
        >
          <status.icon className="h-3 w-3" />
          <span>{status.label}</span>
        </Badge>
      ))}
    </div>
  );
}
