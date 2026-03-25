import { DashboardOverview } from "@/features/dashboard";
import { PageShell, PageCard } from "@/shared/shell";

export default function DashboardPage() {
  return (
    <PageShell>
      <PageCard>
        <DashboardOverview />
      </PageCard>
    </PageShell>
  );
}
