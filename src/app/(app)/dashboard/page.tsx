import { LeftSidebar } from '@/components/app/dashboard/left-sidebar';
import { StatusRibbon } from '@/components/app/dashboard/status-ribbon';
import { RebalanceQueue } from '@/components/app/dashboard/rebalance-queue';
import { CorporateActions } from '@/components/app/dashboard/corporate-actions';
import { AlertsExceptions } from '@/components/app/dashboard/alerts-exceptions';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start">
      <aside className="lg:col-span-1 xl:col-span-1 space-y-6">
        <LeftSidebar />
      </aside>
      <main className="lg:col-span-3 xl:col-span-4 space-y-6">
        <StatusRibbon />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <RebalanceQueue />
          <CorporateActions />
          <AlertsExceptions />
        </div>
      </main>
    </div>
  );
}
