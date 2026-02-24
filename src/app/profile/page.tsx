"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/app/profile/profile-pages.css";
import { apiFetch } from "@/lib/api";

interface Stats {
  totalCompetencies: number;
  totalCredentials: number;
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const r = await apiFetch<Stats>("/api/user/stats");
      if (r.ok && r.data) setStats(r.data);
      else console.error("Stats error:", r.status, r.errorText);
    })();
  }, []);

  return (
    <main className="p-page">
      <div className="p-wrap">
        <header className="p-header">
          <div className="p-header-left">
            <h1 className="p-title">Moj Profil</h1>
            <p className="p-subtitle">Korisnički kontrolni centar</p>
          </div>

          <Link href="/profile/edit" className="p-btn">
            Uredi profil
          </Link>
        </header>

        <div className="p-grid-2cards">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Kompetencije</span>
              <span className="stat-dot blue" />
            </div>

            <div className="stat-main">
              <span className="stat-value blue">{stats ? stats.totalCompetencies : 0}</span>
              <span className="stat-suffix">Aktivne</span>
            </div>

            <Link href="/profile/skills" className="stat-link blue">
              Upravljaj veštinama →
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Sertifikacija</span>
              <span className="stat-dot green" />
            </div>

            <div className="stat-main">
              <span className="stat-value green">{stats ? stats.totalCredentials : 0}</span>
              <span className="stat-suffix">Podneto</span>
            </div>

            <Link href="/profile/credentials" className="stat-link green">
              Moji dokumenti →
            </Link>
          </div>
        </div>

        <div className="p-cta">
          <p>Potreban vam je novi sertifikat?</p>
          <Link href="/profile/credentials" className="p-btn primary">
            Dodaj odmah
          </Link>
        </div>
      </div>
    </main>
  );
}