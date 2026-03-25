"use client";

import styles from "./extensions-console.module.css";

const planned = [
  "Custom widgets",
  "Automation hooks",
  "Insights panels",
  "3rd-party adapters",
];

export function ExtensionsConsole() {
  return (
    <>
      <h1 className={styles.title}>WIP-Extensions</h1>
      <p className={styles.subtitle}>Reserved workspace for upcoming dashboard modules.</p>
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Planned Slots</h2>
        <ul className={styles.list}>
          {planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
