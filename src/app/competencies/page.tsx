"use client";

import { useEffect, useMemo, useState } from "react";
import "./competencies.css";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiSave,
} from "react-icons/fi";

type Competency = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  createdAt?: string | Date | null;
};

type ListRes = { competencies: Competency[] };
type ApiErr = { error: string };

type FormState = {
  name: string;
  category: string;
  description: string;
};

const emptyForm: FormState = { name: "", category: "", description: "" };

export default function CompetenciesPage() {
  const [items, setItems] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/competencies", { cache: "no-store" });
      const data = (await res.json()) as ListRes | ApiErr;

      if (!res.ok) {
        setMsg({ type: "error", text: "error" in data ? data.error : "Greška pri učitavanju." });
        setItems([]);
        return;
      }

      setItems((data as ListRes).competencies ?? []);
    } catch {
      setMsg({ type: "error", text: "Došlo je do greške. Pokušaj ponovo." });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => {
      const hay = `${c.name} ${c.category ?? ""} ${c.description ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  function openCreate() {
    setMode("create");
    setActiveId(null);
    setForm(emptyForm);
    setMsg(null);
    setOpen(true);
  }

  function openEdit(c: Competency) {
    setMode("edit");
    setActiveId(c.id);
    setForm({
      name: c.name ?? "",
      category: c.category ?? "",
      description: c.description ?? "",
    });
    setMsg(null);
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setMsg(null);

    if (!form.name.trim()) {
      setMsg({ type: "error", text: "Naziv je obavezan." });
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/competencies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            category: form.category.trim() || undefined,
            description: form.description.trim() || undefined,
          }),
        });

        const data = (await res.json()) as { competency?: Competency } | ApiErr;

        if (!res.ok) {
          setMsg({ type: "error", text: "error" in data ? data.error : "Greška pri kreiranju." });
          return;
        }

        setMsg({ type: "success", text: "Kompetencija je uspešno dodata." });
        setOpen(false);
        await load();
        return;
      }

      // edit
      if (!activeId) {
        setMsg({ type: "error", text: "Nedostaje ID za izmenu." });
        return;
      }

      const res = await fetch(`/api/competencies/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim() || null,
          description: form.description.trim() || null,
        }),
      });

      const data = (await res.json()) as { competency?: Competency } | ApiErr;

      if (!res.ok) {
        setMsg({ type: "error", text: "error" in data ? data.error : "Greška pri izmeni." });
        return;
      }

      setMsg({ type: "success", text: "Izmena je sačuvana." });
      setOpen(false);
      await load();
    } catch {
      setMsg({ type: "error", text: "Došlo je do greške. Pokušaj ponovo." });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setMsg(null);
    const ok = window.confirm("Da li si sigurna da želiš da obrišeš ovu kompetenciju?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/competencies/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok?: boolean } | ApiErr;

      if (!res.ok) {
        setMsg({ type: "error", text: "error" in data ? data.error : "Greška pri brisanju." });
        return;
      }

      setMsg({ type: "success", text: "Kompetencija je obrisana." });
      await load();
    } catch {
      setMsg({ type: "error", text: "Došlo je do greške. Pokušaj ponovo." });
    }
  }

  return (
    <main className="cmp-page">
      <header className="cmp-header">
        <div>
          <h1>Kompetencije</h1>
          <p>Dodavanje, izmena i brisanje kompetencija (moderator/admin).</p>
        </div>

        <button className="btn primary" onClick={openCreate}>
          <FiPlus /> Dodaj
        </button>
      </header>

      <section className="cmp-toolbar">
        <div className="search">
          <FiSearch />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraga po nazivu, kategoriji ili opisu..."
          />
        </div>

        <button className="btn" onClick={() => void load()} disabled={loading}>
          Osveži
        </button>
      </section>

      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <section className="cmp-card">
        {loading ? (
          <div className="state">Učitavam...</div>
        ) : filtered.length === 0 ? (
          <div className="state">Nema kompetencija za prikaz.</div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Naziv</th>
                  <th>Kategorija</th>
                  <th>Opis</th>
                  <th className="col-actions">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="td-strong">{c.name}</td>
                    <td>{c.category ?? <span className="muted">—</span>}</td>
                    <td className="td-desc">{c.description ?? <span className="muted">—</span>}</td>
                    <td className="actions">
                      <button className="icon-btn" onClick={() => openEdit(c)} title="Izmeni">
                        <FiEdit2 />
                      </button>
                      <button className="icon-btn danger" onClick={() => void remove(c.id)} title="Obriši">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {open && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{mode === "create" ? "Dodaj kompetenciju" : "Izmeni kompetenciju"}</h2>
              <button className="icon-btn" onClick={closeModal} aria-label="Close">
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <label className="field">
                <span>Naziv *</span>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="npr. Java OOP"
                />
              </label>

              <label className="field">
                <span>Kategorija</span>
                <input
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  placeholder="npr. Backend"
                />
              </label>

              <label className="field">
                <span>Opis</span>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Kratak opis kompetencije..."
                  rows={4}
                />
              </label>
            </div>

            <div className="modal-foot">
              <button className="btn" onClick={closeModal} disabled={saving}>
                Otkaži
              </button>
              <button className="btn primary" onClick={() => void submit()} disabled={saving}>
                <FiSave /> {saving ? "Čuvam..." : "Sačuvaj"}
              </button>
            </div>

            <p className="modal-note">
              * Ako nisi moderator/admin, API će vratiti 401/403 (zavisno od `requireRole`).
            </p>
          </div>
        </div>
      )}
    </main>
  );
}