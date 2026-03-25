"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSession, getCsrfToken, loginAdmin } from "@/lib/api";
import { APP_NAME } from "@/lib/branding";
import styles from "./login-form.module.css";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await fetchSession();
      if (session.ok && session.data?.authenticated) {
        router.replace("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    getCsrfToken();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    const response = await loginAdmin(username, password);
    setIsLoading(false);
    if (!response.ok) {
      setError(response.errors?.[0] ?? "Login failed.");
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>{APP_NAME}</h1>
        <p className={styles.subtitle}>Sign in to manage site content and appointments.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Username
            <input
              className={styles.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="test@ex.com"
              required
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.submit} type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
