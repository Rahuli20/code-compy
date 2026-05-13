import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { NavApiItem } from "../NuchuNavbar/NuchuNavbar";
import * as styleExports from "./NavbarLinkManager.module.css";

const styles = styleExports as unknown as {
  shell: string;
  topbar: string;
  title: string;
  actions: string;
  btn: string;
  btnPrimary: string;
  btnDanger: string;
  table: string;
  th: string;
  td: string;
  input: string;
  mono: string;
  hint: string;
  error: string;
  rowActions: string;
  badge: string;
};

export type NavbarLinkManagerProps = {
  apiBaseUrl: string;
  adminSecret: string;
  pollIntervalMs: number;
};

function normalizeBase(url: string): string {
  return url.trim().replace(/\/$/, "");
}

export const NavbarLinkManager: React.FC<NavbarLinkManagerProps> = ({
  apiBaseUrl,
  adminSecret,
  pollIntervalMs,
}) => {
  const base = useMemo(() => normalizeBase(apiBaseUrl), [apiBaseUrl]);
  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (adminSecret) h["x-admin-secret"] = adminSecret;
    return h;
  }, [adminSecret]);

  const [items, setItems] = useState<NavApiItem[]>([]);
  const [source, setSource] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [draftLabel, setDraftLabel] = useState("new link");
  const [draftHref, setDraftHref] = useState("/");

  const load = useCallback(async () => {
    if (!base) return;
    setMessage(null);
    try {
      const res = await fetch(`${base}/api/nav`, { credentials: "omit" });
      if (!res.ok) throw new Error(`GET failed (${res.status})`);
      const data = (await res.json()) as { items?: NavApiItem[]; source?: string };
      setItems((data.items ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder));
      setSource(data.source ?? "");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to load");
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pollIntervalMs || pollIntervalMs < 5000) return undefined;
    const id = window.setInterval(() => {
      void load();
    }, pollIntervalMs);
    return () => window.clearInterval(id);
  }, [load, pollIntervalMs]);

  const updateLocal = (id: string, patch: Partial<NavApiItem>) => {
    setItems((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const saveRow = async (row: NavApiItem) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${base}/api/nav/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          label: row.label,
          href: row.href,
          sortOrder: row.sortOrder,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error((err as { error?: string } | null)?.error ?? `Save failed (${res.status})`);
      }
      await load();
      setMessage("Saved");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const removeRow = async (id: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${base}/api/nav/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => null);
        throw new Error((err as { error?: string } | null)?.error ?? `Delete failed (${res.status})`);
      }
      await load();
      setMessage("Removed");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const addRow = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`${base}/api/nav`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          label: draftLabel,
          href: draftHref,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error((err as { error?: string } | null)?.error ?? `Create failed (${res.status})`);
      }
      setDraftLabel("new link");
      setDraftHref("/");
      await load();
      setMessage("Added");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.shell} aria-label="Navbar links">
      <div className={styles.topbar}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className={styles.title}>Navbar links</div>
          <span className={styles.badge}>{source ? `source: ${source}` : "source: —"}</span>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={() => void load()} disabled={busy}>
            Refresh
          </button>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Label</th>
            <th className={styles.th}>URL</th>
            <th className={styles.th} style={{ width: 110 }}>
              Order
            </th>
            <th className={styles.th} style={{ width: 190 }} />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td className={styles.td}>
                <input
                  className={styles.input}
                  value={row.label}
                  onChange={(e) => updateLocal(row.id, { label: e.target.value })}
                />
              </td>
              <td className={styles.td}>
                <input
                  className={styles.input}
                  value={row.href}
                  onChange={(e) => updateLocal(row.id, { href: e.target.value })}
                />
              </td>
              <td className={styles.td}>
                <input
                  className={styles.input}
                  type="number"
                  value={row.sortOrder}
                  onChange={(e) => updateLocal(row.id, { sortOrder: Number(e.target.value) })}
                />
              </td>
              <td className={styles.td}>
                <div className={styles.rowActions}>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={() => void saveRow(row)}>
                    Save
                  </button>
                  <button type="button" className={`${styles.btn} ${styles.btnDanger}`} disabled={busy} onClick={() => void removeRow(row.id)}>
                    Remove
                  </button>
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <td className={styles.td}>
              <input className={styles.input} value={draftLabel} onChange={(e) => setDraftLabel(e.target.value)} />
            </td>
            <td className={styles.td}>
              <input className={styles.input} value={draftHref} onChange={(e) => setDraftHref(e.target.value)} />
            </td>
            <td className={styles.td}>
              <span className={styles.mono}>auto</span>
            </td>
            <td className={styles.td}>
              <div className={styles.rowActions}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={busy} onClick={() => void addRow()}>
                  Add link
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className={styles.hint}>
        Matches Webflow Designer patterns: compact table, blue primary actions, neutral chrome.{" "}
        <span className={message && message.toLowerCase().includes("fail") ? styles.error : undefined}>
          {message ? `Status: ${message}.` : "Mutations require the same admin secret as NAV_ADMIN_SECRET on Cloud."}
        </span>
      </div>
    </section>
  );
};
