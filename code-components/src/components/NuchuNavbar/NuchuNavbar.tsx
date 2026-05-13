import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as styleExports from "./NuchuNavbar.module.css";

const styles = styleExports as unknown as {
  root: string;
  left: string;
  loading: string;
  pill: string;
  center: string;
  logoWrap: string;
  logo: string;
  right: string;
  shop: string;
  lang: string;
  chevron: string;
  iconBtn: string;
};

export type NavApiItem = { id: string; label: string; href: string; sortOrder: number };

export type NuchuNavbarProps = {
  apiBaseUrl: string;
  pollIntervalMs: number;
  shopUrl: string;
  shopLabel: string;
  languageLabel: string;
  homeUrl: string;
  profileUrl: string;
  cartUrl: string;
};

function normalizeBase(url: string): string {
  return url.trim().replace(/\/$/, "");
}

function NuchuLogo() {
  return (
    <span className={styles.logo} aria-hidden>
      NUCHU
    </span>
  );
}

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h15l-2 9H8L6 7Zm0 0L5 3H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1" fill="currentColor" />
      <circle cx="18" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

export const NuchuNavbar: React.FC<NuchuNavbarProps> = ({
  apiBaseUrl,
  pollIntervalMs,
  shopUrl,
  shopLabel,
  languageLabel,
  homeUrl,
  profileUrl,
  cartUrl,
}) => {
  const base = useMemo(() => normalizeBase(apiBaseUrl), [apiBaseUrl]);
  const [items, setItems] = useState<NavApiItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!base) return;
    setStatus((s) => (s === "idle" ? "loading" : s));
    setError(null);
    try {
      const res = await fetch(`${base}/api/nav`, { credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { items?: NavApiItem[] };
      setItems((data.items ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder));
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs < 2000) return undefined;
    const id = window.setInterval(() => {
      void load();
    }, pollIntervalMs);
    return () => window.clearInterval(id);
  }, [load, pollIntervalMs]);

  return (
    <nav className={styles.root} aria-label="Primary">
      <div className={styles.left}>
        {status === "loading" && items.length === 0 ? (
          <span className={styles.loading}>loading links…</span>
        ) : null}
        {status === "error" ? <span className={styles.loading}>{error}</span> : null}
        {items.map((item) => (
          <a key={item.id} className={styles.pill} href={item.href}>
            {item.label.toLowerCase()}
          </a>
        ))}
      </div>

      <div className={styles.center}>
        <span className={styles.logoWrap}>
          <NuchuLogo />
        </span>
      </div>

      <div className={styles.right}>
        <a className={`${styles.pill} ${styles.shop}`} href={shopUrl}>
          {shopLabel.toLowerCase()}
        </a>
        <button type="button" className={`${styles.pill} ${styles.lang}`} aria-haspopup="listbox">
          {languageLabel.toLowerCase()}
          <span className={styles.chevron} />
        </button>
        <a className={styles.iconBtn} href={homeUrl} aria-label="Home">
          <IconHome />
        </a>
        <a className={styles.iconBtn} href={profileUrl} aria-label="Account">
          <IconUser />
        </a>
        <a className={styles.iconBtn} href={cartUrl} aria-label="Cart">
          <IconCart />
        </a>
      </div>
    </nav>
  );
};
