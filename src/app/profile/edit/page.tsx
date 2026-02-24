"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/app/profile/profile-pages.css";
import { apiFetch } from "@/lib/api";
import { FaGithub, FaLinkedin } from "react-icons/fa";

type ProfileDto = {
  headline: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl?: string | null;
  isPublic?: boolean | null;
};

function asStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    headline: "",
    bio: "",
    linkedinUrl: "",
    githubUrl: "",
  });

  async function loadProfile() {
    setInitialLoading(true);
    const r = await apiFetch<ProfileDto>("/api/user/profile");
    if (r.ok && r.data) {
      setForm({
        headline: asStr(r.data.headline),
        bio: asStr(r.data.bio),
        linkedinUrl: asStr(r.data.linkedinUrl),
        githubUrl: asStr(r.data.githubUrl),
      });
    }
    setInitialLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      headline: form.headline,
      bio: form.bio,
      linkedinUrl: form.linkedinUrl,
      githubUrl: form.githubUrl,
    };

    const r = await apiFetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (r.ok) {
      router.push("/profile");
      router.refresh();
      return;
    }

    alert(r.errorText || "Greška pri čuvanju.");
    setLoading(false);
  }

  return (
    <main className="p-page">
      <div className="p-wrap" style={{ maxWidth: 720 }}>
        <div className="p-header" style={{ paddingTop: 18, marginBottom: 18 }}>
          <div className="p-header-left">
            <Link href="/profile" className="p-back">
              ← Nazad na Dashboard
            </Link>
            <h1 className="p-title">Uredi profil</h1>
            <p className="p-subtitle">Ažuriraj headline, bio i linkove.</p>
          </div>
        </div>

        <div className="glass-card">
          {initialLoading ? (
            <div className="state">Učitavanje profila...</div>
          ) : (
            <form onSubmit={handleUpdate} className="p-form">
              <div className="p-field">
                <span className="p-label">Headline</span>
                <input
                  name="headline"
                  className="input-field"
                  placeholder="npr. Fullstack Developer"
                  value={form.headline}
                  onChange={(e) => setField("headline", e.target.value)}
                />
              </div>

              <div className="p-field">
                <span className="p-label">Biografija</span>
                <textarea
                  name="bio"
                  rows={4}
                  className="input-field"
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                />
              </div>

              <div className="p-grid-2">
                <div className="p-field">
                  <span className="p-label">LinkedIn</span>
                  <div className="p-input-wrap">
                    <FaLinkedin className="p-input-icon" />
                    <input
                      name="linkedinUrl"
                      className="input-field"
                      placeholder="https://linkedin.com/in/..."
                      value={form.linkedinUrl}
                      onChange={(e) => setField("linkedinUrl", e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-field">
                  <span className="p-label">GitHub</span>
                  <div className="p-input-wrap">
                    <FaGithub className="p-input-icon" />
                    <input
                      name="githubUrl"
                      className="input-field"
                      placeholder="https://github.com/..."
                      value={form.githubUrl}
                      onChange={(e) => setField("githubUrl", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button className="p-btn primary full" disabled={loading}>
                {loading ? "Čuvanje..." : "Sačuvaj izmene"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}