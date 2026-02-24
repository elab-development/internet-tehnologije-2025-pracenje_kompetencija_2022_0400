"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/app/profile/profile-pages.css";
import { apiFetch } from "@/lib/api";

interface Skill {
  id: string;
  competencyId: string;
  level: number;
  years: string;
  competency?: {
    name: string;
  };
}

interface Competency {
  id: string;
  name: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSkills = async () => {
    const r = await apiFetch<Skill[]>("/api/user/competencies");
    if (r.ok && r.data) setSkills(r.data);
    else console.error("Skills error:", r.status, r.errorText);
  };

  const fetchCompetencies = async () => {
    const r = await apiFetch<Competency[]>("/api/competencies");
    if (r.ok && r.data) setCompetencies(r.data);
    else console.error("Competencies error:", r.status, r.errorText);
  };

  useEffect(() => {
    fetchSkills();
    fetchCompetencies();
  }, []);

async function handleAddSkill(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget; // snimi odmah
  setLoading(true);

  const formData = new FormData(form);
  const payload = {
    competencyId: String(formData.get("competencyId") || ""),
    level: Number(formData.get("level") || 1),
    years: String(formData.get("years") || "0.0"),
  };

  const r = await apiFetch("/api/user/competencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (r.ok) {
    form.reset();          // koristi snimljenu referencu
    await fetchSkills();   // osveži listu
  } else {
    alert(r.errorText || "Greška ili već imate dodatu ovu veštinu.");
  }

  setLoading(false);
}

  return (
    <main className="p-page">
      <div className="p-wrap">
        <div className="p-header" style={{ paddingTop: 18 }}>
          <div className="p-header-left">
            <Link href="/profile" className="p-back">
              ← Nazad na Dashboard
            </Link>
            <h1 className="p-title">Moje Kompetencije</h1>
            <p className="p-subtitle">Dodaj veštine i nivo znanja. Moderator može verifikovati preko sertifikata.</p>
          </div>
        </div>

        <div className="p-split">
          <div className="glass-card">
            <div className="p-card-head">
              <h3>Nova veština</h3>
            </div>

            <form onSubmit={handleAddSkill} className="p-form">
              <div className="p-field">
                <span className="p-label">Kompetencija</span>
                <select
                  name="competencyId"
                  required
                  className="input-field"
                  style={{ appearance: "none" as any, cursor: "pointer" }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Izaberite kompetenciju...
                  </option>
                  {competencies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-field">
                <span className="p-label">Nivo znanja</span>
                <select
                  name="level"
                  className="input-field"
                  style={{ appearance: "none" as any, cursor: "pointer" }}
                  defaultValue="1"
                >
                  <option value="1">1 - Početnik</option>
                  <option value="2">2 - Osnovno</option>
                  <option value="3">3 - Srednje</option>
                  <option value="4">4 - Napredno</option>
                  <option value="5">5 - Ekspert</option>
                </select>
              </div>

              <div className="p-field">
                <span className="p-label">Godine iskustva</span>
                <input name="years" type="number" step="0.5" placeholder="npr. 2.5" className="input-field" />
              </div>

              <button disabled={loading} className="p-btn primary full">
                {loading ? "Čuvanje..." : "Dodaj u profil"}
              </button>
            </form>
          </div>

          <div className="glass-card">
            <div className="p-card-head">
              <h3>Trenutne veštine ({skills.length})</h3>
            </div>

            <div>
              {skills.length === 0 ? (
                <div className="state">Još uvek niste dodali nijednu kompetenciju.</div>
              ) : (
                skills.map((skill) => (
                  <div key={skill.id} className="skill-row">
                    <div style={{ flex: 1 }}>
                      <p className="skill-name">{skill.competency?.name || skill.competencyId}</p>
                      <div className="skill-meta">
                        Iskustvo: <span style={{ color: "#e9eefc" }}>{skill.years} god</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="level-dots">
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <div key={dot} className={`level-dot ${dot <= skill.level ? "on" : ""}`} />
                        ))}
                      </div>
                      <div className="level-text">Lvl {skill.level}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-note">
          Napomena: Kompetencije su podložne verifikaciji od strane moderatora na osnovu vaših podnetih sertifikata.
        </div>
      </div>
    </main>
  );
}