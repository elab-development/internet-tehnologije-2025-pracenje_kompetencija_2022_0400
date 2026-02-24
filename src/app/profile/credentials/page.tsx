"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ModalKredencijali from "@/app/components/ModalKredencijali";
import "@/app/profile/profile-pages.css";
import { apiFetch } from "@/lib/api";

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCredentials = async () => {
    const r = await apiFetch<any[]>("/api/user/credentials");
    if (r.ok && r.data) setCredentials(r.data);
    else console.error("Credentials error:", r.status, r.errorText);
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;

  setLoading(true);

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

        const r = await apiFetch("/api/user/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        });

  if (r.ok) {
    form.reset();
    setIsModalOpen(false);
    fetchCredentials();
  } else {
    alert(r.errorText || "Greška pri slanju.");
  }

  setLoading(false);
}

  function pillClass(status: string) {
    if (status === "active") return "p-pill active";
    if (status === "rejected") return "p-pill rejected";
    return "p-pill pending";
  }

  return (
    <main className="p-page">
      <div className="p-wrap">
        <div className="p-header">
          <div className="p-header-left">
            <Link href="/profile" className="p-back">
              ← Nazad na Dashboard
            </Link>
            <h1 className="p-title">Moji Kredencijali</h1>
            <p className="p-subtitle">Pregled podnetih sertifikata i statusa verifikacije.</p>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="p-btn primary">
            + Dodaj novi
          </button>
        </div>

        <div className="glass-card">
          <div className="p-table-wrap">
            <table className="p-table">
              <thead>
                <tr>
                  <th>Dokument / Izdavač</th>
                  <th>Status</th>
                  <th className="p-right">Datum podnošenja</th>
                </tr>
              </thead>
              <tbody>
                {credentials.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="state">
                      Nema podnetih sertifikata.
                    </td>
                  </tr>
                ) : (
                  credentials.map((c: any) => (
                    <tr key={c.id}>
                      <td>
                        <div className="p-strong">{c.title}</div>
                        <div className="p-muted">{c.issuer}</div>
                      </td>
                      <td>
                        <span className={pillClass(c.status)}>{c.status}</span>
                      </td>
                      <td className="p-right p-muted" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>
                        {new Date(c.createdAt).toLocaleDateString("sr-RS")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ModalKredencijali isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novi Sertifikat">
          <form onSubmit={handleAdd} className="p-form">
            <div className="p-field">
              <span className="p-label">Naziv</span>
              <input name="title" required className="input-field" placeholder="npr. AWS Cloud Practitioner" />
            </div>

            <div className="p-field">
              <span className="p-label">Izdavač</span>
              <input name="issuer" required className="input-field" placeholder="npr. Amazon Web Services" />
            </div>

            <div className="p-field">
              <span className="p-label">Tip</span>
              <select name="type" className="input-field" style={{ appearance: "none" as any, cursor: "pointer" }}>
                <option value="certifikat">Sertifikat</option>
                <option value="diploma">Diploma</option>
                <option value="kurs">Kurs</option>
              </select>
            </div>

            <button disabled={loading} className="p-btn primary full">
              {loading ? "Slanje..." : "Potvrdi"}
            </button>
          </form>
        </ModalKredencijali>
      </div>
    </main>
  );
}