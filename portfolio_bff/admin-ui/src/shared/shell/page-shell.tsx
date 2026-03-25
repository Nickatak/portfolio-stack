import type { ReactNode } from "react";
import shell from "./page-shell.module.css";

type PageShellProps = { children: ReactNode; className?: string };
type PageCardProps = { children: ReactNode; className?: string };

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cx(shell.page, className)}>
      {children}
    </main>
  );
}

export function PageCard({ children, className }: PageCardProps) {
  return (
    <section className={cx(shell.card, className)}>
      {children}
    </section>
  );
}
