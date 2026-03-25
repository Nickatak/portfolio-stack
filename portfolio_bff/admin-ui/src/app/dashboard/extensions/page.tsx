import { ExtensionsConsole } from "@/features/extensions";
import { PageShell, PageCard } from "@/shared/shell";

export default function ExtensionsPage() {
  return (
    <PageShell>
      <PageCard>
        <ExtensionsConsole />
      </PageCard>
    </PageShell>
  );
}
