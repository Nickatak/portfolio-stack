"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchSession, logoutAdmin } from "@/lib/api";
import { APP_INITIALS, APP_NAME } from "@/lib/branding";
import styles from "./layout.module.css";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const navGroups = [
  {
    label: "Dashboard",
    links: [
      { href: "/dashboard", label: "Overview" },
      { href: "/dashboard/appointments", label: "Appointments" },
      { href: "/dashboard/extensions", label: "WIP-Extensions" },
    ],
  },
  {
    label: "Site",
    links: [{ href: "/dashboard/content", label: "Content" }],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      const session = await fetchSession();
      if (!session.ok || !session.data?.authenticated) {
        router.replace("/login");
        return;
      }
      setUsername(session.data.user?.username ?? null);
      setChecking(false);
    };
    loadSession();
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace("/login");
  };

  const isLinkActive = (href: string) => pathname === href;

  if (checking) {
    return (
      <main>
        <div className={styles.sessionCard}>Checking session...</div>
      </main>
    );
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.aside}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <div className={styles.logo}>{APP_INITIALS}</div>
            <div>
              <strong>{APP_NAME}</strong>
              <span className={styles.brandSub}>{username ?? "Admin"}</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
        <div className={cx(styles.menu, menuOpen && styles.menuOpen)}>
          <nav className={styles.nav}>
            {navGroups.map((group) => (
              <div key={group.label} className={styles.navGroup}>
                <span className={styles.groupLabel}>{group.label}</span>
                <div className={styles.groupLinks}>
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cx(styles.navLink, isLinkActive(link.href) && styles.navLinkActive)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <button type="button" onClick={handleLogout} className={styles.logout}>
            Log out
          </button>
        </div>
      </aside>
      <section>{children}</section>
    </div>
  );
}
