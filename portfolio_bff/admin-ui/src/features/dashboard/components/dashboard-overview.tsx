"use client";

import Link from "next/link";
import styles from "./dashboard-overview.module.css";

const quickNav = [
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    description: "View and manage appointment bookings from the contact form.",
  },
  {
    href: "/dashboard/extensions",
    label: "Extensions",
    description: "Browser extension settings and configuration.",
  },
];

export function DashboardOverview() {
  return (
    <>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Welcome back.</p>
      <div className={styles.grid}>
        {quickNav.map((item) => (
          <Link key={item.href} href={item.href} className={styles.card}>
            <span className={styles.cardLabel}>{item.label}</span>
            <span className={styles.cardDescription}>{item.description}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
