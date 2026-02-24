"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@/app/profile/profile-pages.css";
import { apiFetch } from "@/lib/api";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

interface Stats {
  totalCompetencies: number;
  totalCredentials: number;
}

type ProfileDto = {
  headline: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl?: string | null;
  isPublic?: boolean | null;
};

function safeUrl(u: string | null | undefined) {
  if (!u) return "";
  return String(u).trim();
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<ProfileDto | null>(null);

  useEffect(() => {
    (async () => {
      const [rStats, rProfile] = await Promise.all([
        apiFetch<Stats>("/api/user/stats"),
        apiFetch<ProfileDto>("/api/user/profile"),
      ]);

      if (rStats.ok && rStats.data) setStats(rStats.data);
      else console.error("Stats error:", rStats.status, rStats.errorText);

      if (rProfile.ok) setProfile(rProfile.data ?? null);
      else console.error("Profile error:", rProfile.status, rProfile.errorText);
    })();
  }, []);

  const linkedin = safeUrl(profile?.linkedinUrl);
  const github = safeUrl(profile?.githubUrl);
  const website = safeUrl(profile?.websiteUrl);
 

const userSkills = ["javascript", "react", "node", "typescript"];
const q = encodeURIComponent(userSkills.join(" "));


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
        <Link href={`/jobs?q=${q}`} className="p-btn">Pretraži poslove po mojim veštinama</Link>    
        {/* PROFIL KARTICA */}
        <div className="p-profile">
          <div className="glass-card p-profile-card">
            <div className="p-profile-top">
              <div className="p-avatar" aria-hidden="true">
                {profile?.headline?.trim()?.[0]?.toUpperCase() || "P"}
              </div>

              <div className="p-profile-main">
                <div className="p-profile-name">Profil</div>
                <div className="p-profile-headline">
                  {profile?.headline?.trim() ? profile.headline : "Dodajte headline (npr. Fullstack Developer)"}
                </div>
              </div>

              <div className="p-badges">
                <span className={`p-badge ${profile?.isPublic ? "ok" : "muted"}`}>
                  {profile?.isPublic ? "Public" : "Private"}
                </span>
                <span className="p-badge">
                  {stats ? stats.totalCompetencies : 0} veština
                </span>
                <span className="p-badge">
                  {stats ? stats.totalCredentials : 0} dok.
                </span>
              </div>
            </div>

            <div className="p-profile-body">
              <p className="p-profile-bio">
                {profile?.bio?.trim()
                  ? profile.bio
                  : "Dodajte kratku biografiju da bi profil izgledao potpunije."}
              </p>

              <div className="p-profile-links">
                {linkedin ? (
                  <a className="p-link" href={linkedin} target="_blank" rel="noreferrer">
                    <FaLinkedin /> LinkedIn
                  </a>
                ) : null}

                {github ? (
                  <a className="p-link" href={github} target="_blank" rel="noreferrer">
                    <FaGithub /> GitHub
                  </a>
                ) : null}

                {website ? (
                  <a className="p-link" href={website} target="_blank" rel="noreferrer">
                    <FaGlobe /> Website
                  </a>
                ) : null}

                {!linkedin && !github && !website ? (
                  <span className="p-muted" style={{ textTransform: "none", letterSpacing: 0 }}>
                    Dodajte linkove u “Uredi profil”.
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Kratak “highlight” blok desno */}
          <div className="glass-card p-profile-side">
            <div className="p-card-head">
              <h3>Pregled</h3>
            </div>

            <div className="p-side-list">
              <div className="p-side-item">
                <div className="p-side-k">Kompetencije</div>
                <div className="p-side-v">{stats ? stats.totalCompetencies : 0}</div>
              </div>

              <div className="p-side-item">
                <div className="p-side-k">Kredencijali</div>
                <div className="p-side-v">{stats ? stats.totalCredentials : 0}</div>
              </div>

              <div className="p-side-item">
                <div className="p-side-k">Status profila</div>
                <div className="p-side-v">{profile?.isPublic ? "Javno" : "Privatno"}</div>
              </div>

              <div className="p-side-actions">
                <Link href="/profile/skills" className="p-btn primary full">
                  Uredi veštine
                </Link>
                <Link href="/profile/credentials" className="p-btn full">
                  Dodaj dokument
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* tvoje postojeće kartice */}
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