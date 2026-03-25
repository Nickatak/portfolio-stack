import { AppointmentsConsole } from "@/features/appointments";
import { PageShell, PageCard } from "@/shared/shell";

export default function AppointmentsPage() {
  return (
    <PageShell>
      <PageCard>
        <AppointmentsConsole />
      </PageCard>
    </PageShell>
  );
}
