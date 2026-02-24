"use client";

import { useEffect, useMemo, useState } from "react";
import "./credentials.css";
import { FiSearch, FiCheck, FiX, FiEye } from "react-icons/fi";

type Credential = {
  id: string;
  userId: string;
  type: string;
  title: string;
  issuer: string | null;
  issuedAt: string | Date | null;
  expiresAt: string | Date | null;
  verificationUrl: string | null;
  credentialCode: string | null;
  description: string | null;
  note: string | null;
  status: string;
  createdAt?: string | Date | null;
};

type ListRes = { credentials: Credential[] };
type ApiErr = { error: string };

export default function ModeratorCredentialsPage() {
  const [items, setItems] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"pending" | "active" | "rejected" | "all">("pending");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // modal preview
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Credential | null>(null);

  // reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  function fmtDate(v: string | Date | null | undefined) {
    if (!v) return "—";
    const d = typeof v === "string" ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  }

  async function load() {
    setLoading(true);
    setMsg(null);

    try {
      const qs = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
      const res = await fetch(`/api/moderator/credentials${qs}`, { cache: "no-store" });
      const data = (await res.json()) as ListRes | ApiErr;

      if (!res.ok) {
        setMsg({ type: "error", text: "error" in data ? data.error : "Greška pri učitavanju." });
        setItems([]);
        return;
      }

      setItems((data as ListRes).credentials ?? []);
    } catch {
      setMsg({ type: "error", text: "Došlo je do greške. Pokušaj ponovo." });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [status]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((c) => {
      const hay = `${c.title} ${c.type} ${c.issuer ?? ""} ${c.credentialCode ?? ""} ${c.description ?? ""} ${
        c.userId ?? ""
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  function openPreview(c: Credential) {
    setActive(c);
    setOpen(true);
  }

  function closePreview() {
    setOpen(false);
    setActive(null);
  }

  function openReject(id: string) {
    setRejectId(id);
    setRejectReason("");
    setRejectOpen(true);
  }

  function closeReject() {
    if (acting) return;
    setRejectOpen(false);
    setRejectId(null);
    setRejectReason("");
  }

  async function approve(id: string) {
    setMsg(null);
    setActing(true);
    try {
      const res = await fetch(`/api/moderator/credentials/${id}/approve`, { method: "POST" });
      const data = (await res.json()) as { credential?: Credential } | ApiErr;

      if (!res.ok) {
        setMsg({ type: "error", text: "error" in data ? data.error : "Greška pri odobravanju." });
        return;
      }

      setMsg({ type: "success", text: "Credential je odobren." });
      await load();
    } catch {
      setMsg({ type: "error", text: "Došlo je do greške. Pokušaj ponovo." });
    } finally {
      setActing(false);
    }
  }

  async function reject() {
    if (!rejectId) return;

    const reason = rejectReason.trim();
    if (!reason) {
      setMsg({ type: "error", text: "Unesi razlog odbijanja." });
      return;
    }

    setMsg(null);
    setActing(true);
    try {
      const res = await fetch(`/api/moderator/credentials/${rejectId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = (await res.json()) as { credential?: Credential } | ApiErr;

      if (!res.ok) {
        setMsg({ type: "error", text: "error" in data ? data.error : "Greška pri odbijanju." });
        return;
      }

      setMsg({ type: "success", text: "Credential je odbijen." });
      setRejectOpen(false);
      setRejectId(null);
      setRejectReason("");
      await load();
    } catch {
      setMsg({ type: "error", text: "Došlo je do greške. Pokušaj ponovo." });
    } finally {
      setActing(false);
    }
  }

  return (
    <main className="cred-page">
      <header className="cred-header">
        <div>
          <h1>Kredencijali</h1>
          <p>Pregled i odobravanje/odbijanje kredencijala korisnika (moderator/admin).</p>
        </div>

        <div className="header-actions">
          <span className={`pill ${status}`}>{status === "all" ? "all" : status}</span>
        </div>
      </header>

      <section className="cred-toolbar">
        <div className="search">
          <FiSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraga po naslovu, tipu, izdavaču, kodu, userId..."
          />
        </div>

        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          disabled={loading}
        >
          <option value="pending">pending</option>
          <option value="active">active</option>
          <option value="rejected">rejected</option>
          <option value="all">all</option>
        </select>

        <button className="btn" onClick={() => void load()} disabled={loading}>
          Osveži
        </button>
      </section>

      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <section className="cred-card">
        {loading ? (
          <div className="state">Učitavam...</div>
        ) : filtered.length === 0 ? (
          <div className="state">Nema kredencijala za prikaz.</div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Naslov</th>
                  <th>Tip</th>
                  <th>Izdavač</th>
                  <th>Status</th>
                  <th>Datum</th>
                  <th className="col-actions">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="td-strong">{c.title}</td>
                    <td>{c.type}</td>
                    <td>{c.issuer ?? <span className="muted">—</span>}</td>
                    <td>
                      <span className={`tag ${c.status}`}>{c.status}</span>
                    </td>
                    <td>{fmtDate(c.issuedAt)}</td>
                    <td className="actions">
                      <button className="icon-btn" onClick={() => openPreview(c)} title="Pregled">
                        <FiEye />
                      </button>

                      <button
                        className="icon-btn ok"
                        onClick={() => void approve(c.id)}
                        title="Odobri"
                        disabled={acting}
                      >
                        <FiCheck />
                      </button>

                      <button
                        className="icon-btn danger"
                        onClick={() => openReject(c.id)}
                        title="Odbij"
                        disabled={acting}
                      >
                        <FiX />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Preview modal */}
      {open && active && (
        <div className="modal-backdrop" onMouseDown={closePreview}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Pregled kredencijala</h2>
              <button className="icon-btn" onClick={closePreview} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="kv">
                <span>Naslov</span>
                <div>{active.title}</div>
              </div>

              <div className="kv">
                <span>Tip</span>
                <div>{active.type}</div>
              </div>

              <div className="kv">
                <span>Izdavač</span>
                <div>{active.issuer ?? "—"}</div>
              </div>

              <div className="kv">
                <span>Status</span>
                <div>
                  <span className={`tag ${active.status}`}>{active.status}</span>
                </div>
              </div>

              <div className="kv">
                <span>Issued</span>
                <div>{fmtDate(active.issuedAt)}</div>
              </div>

              <div className="kv">
                <span>Expires</span>
                <div>{fmtDate(active.expiresAt)}</div>
              </div>

              <div className="kv">
                <span>Kod</span>
                <div>{active.credentialCode ?? "—"}</div>
              </div>

              <div className="kv">
                <span>Verifikacija</span>
                <div>
                  {active.verificationUrl ? (
                    <a className="link" href={active.verificationUrl} target="_blank" rel="noreferrer">
                      Otvori link
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>

              <div className="kv">
                <span>Opis</span>
                <div className="pre">{active.description ?? "—"}</div>
              </div>

              <div className="kv">
                <span>Napomena</span>
                <div className="pre">{active.note ?? "—"}</div>
              </div>

              <div className="kv">
                <span>User ID</span>
                <div className="mono">{active.userId}</div>
              </div>

              <div className="kv">
                <span>ID</span>
                <div className="mono">{active.id}</div>
              </div>
            </div>

            <div className="modal-foot">
              <button className="btn" onClick={closePreview}>
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectOpen && (
        <div className="modal-backdrop" onMouseDown={closeReject}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Odbij kredencijal</h2>
              <button className="icon-btn" onClick={closeReject} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <label className="field">
                <span>Razlog odbijanja *</span>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="npr. Nedostaje dokaz / link nije validan / pogrešan tip..."
                  rows={4}
                />
              </label>
            </div>

            <div className="modal-foot">
              <button className="btn" onClick={closeReject} disabled={acting}>
                Otkaži
              </button>
              <button className="btn danger" onClick={() => void reject()} disabled={acting}>
                {acting ? "Obrađujem..." : "Odbij"}
              </button>
            </div>

            <p className="modal-note">* Razlog se upisuje u polje `note` i status ide na `rejected`.</p>
          </div>
        </div>
      )}
    </main>
  );
}