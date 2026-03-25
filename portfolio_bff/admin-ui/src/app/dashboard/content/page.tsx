import { ContentConsole } from "@/features/content";
import { PageShell, PageCard } from "@/shared/shell";

export default function ContentPage() {
  return (
    <PageShell>
      <PageCard>
        <ContentConsole />
      </PageCard>
    </PageShell>
  );
}
