'use client';

import AssumptionsStudioPage from './(app)/page';
import { AppLayout } from '@/components/layout/app-layout';

export default function RootIndex() {
  return (
    <AppLayout>
      <AssumptionsStudioPage />
    </AppLayout>
  );
}
