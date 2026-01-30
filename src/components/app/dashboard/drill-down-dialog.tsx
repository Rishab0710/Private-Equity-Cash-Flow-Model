'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ReactNode } from 'react';

type DrillDownDialogProps = {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
};

export function DrillDownDialog({ trigger, title, children }: DrillDownDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
