"use client";

import { useEffect, useMemo, useState } from "react";
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

type GhUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
};

type GhRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

function safeUrl(u: string | null | undefined) {
  if (!u) return "";
  return String(u).trim();
}

function parseGithubUsername(urlOrUser: string) {
  const s = (urlOrUser || "").trim();
  if (!s) return "";

  // ako korisnik upiše samo "octocat"
  if (!s.includes("http") && !s.includes("/")) return s;

  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    const parts = u.pathname.split("/").filter(Boolean);
    // github.com/{username}/...
    return parts[0] ?? "";
  } catch {
    // fallback: izvuci poslednji "segment"
    const parts = s.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  }
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<ProfileDto | null>(null);

  const [ghUser, setGhUser] = useState<GhUser | null>(null);
  const [ghRepos, setGhRepos] = useState<GhRepo[]>([]);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghErr, setGhErr] = useState<string>("");

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

  const ghUsername = useMemo(() => parseGithubUsername(github), [github]);

  useEffect(() => {
    async function loadGithub() {
      if (!ghUsername) {
        setGhUser(null);
        setGhRepos([]);
        setGhErr("");
        return;
      }

      setGhLoading(true);
      setGhErr("");

      try {
        const [uRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${encodeURIComponent(ghUsername)}`, {
            headers: { Accept: "application/vnd.github+json" },
            cache: "no-store",
          }),
          fetch(
            `https://api.github.com/users/${encodeURIComponent(
              ghUsername
            )}/repos?per_page=6&sort=updated`,
            {
              headers: { Accept: "application/vnd.github+json" },
              cache: "no-store",
            }
          ),
        ]);

        if (!uRes.ok) {
          setGhUser(null);
          setGhRepos([]);
          setGhErr("Ne mogu da učitam GitHub profil (proveri link).");
          return;
        }

        const u = (await uRes.json()) as GhUser;
        setGhUser(u);

        if (rRes.ok) {
          const repos = (await rRes.json()) as GhRepo[];
          setGhRepos(Array.isArray(repos) ? repos : []);
        } else {
          setGhRepos([]);
        }
      } catch {
        setGhUser(null);
        setGhRepos([]);
        setGhErr("Greška pri pozivu GitHub API-ja.");
      } finally {
        setGhLoading(false);
      }
    }

    void loadGithub();
  }, [ghUsername]);

  const topLanguages = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of ghRepos) {
      if (!r.language) continue;
      m.set(r.language, (m.get(r.language) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([lang]) => lang);
  }, [ghRepos]);

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

        <Link href={`/jobs?q=${q}`} className="p-btn">
          Pretraži poslove po mojim veštinama
        </Link>

        <div className="p-profile">
          <div className="glass-card p-profile-card">
            <div className="p-profile-top">
              <div className="p-avatar" aria-hidden="true">
                {profile?.headline?.trim()?.[0]?.toUpperCase() || "P"}
              </div>

              <div className="p-profile-main">
                <div className="p-profile-name">Profil</div>
                <div className="p-profile-headline">
                  {profile?.headline?.trim()
                    ? profile.headline
                    : "Dodajte headline (npr. Fullstack Developer)"}
                </div>
              </div>

              <div className="p-badges">
                <span className={`p-badge ${profile?.isPublic ? "ok" : "muted"}`}>
                  {profile?.isPublic ? "Public" : "Private"}
                </span>
                <span className="p-badge">{stats ? stats.totalCompetencies : 0} veština</span>
                <span className="p-badge">{stats ? stats.totalCredentials : 0} dok.</span>
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

              {/* GitHub blok: prikazuje se samo ako postoji github link */}
              {github ? (
                <div className="p-gh">
                  <div className="p-gh-head">
                    <h3 className="p-gh-title">GitHub pregled</h3>
                    {ghUser?.html_url ? (
                      <a className="p-gh-open" href={ghUser.html_url} target="_blank" rel="noreferrer">
                        Otvori profil
                      </a>
                    ) : null}
                  </div>

                  {ghLoading ? (
                    <div className="p-gh-state">Učitavam GitHub podatke...</div>
                  ) : ghErr ? (
                    <div className="p-gh-state">{ghErr}</div>
                  ) : ghUser ? (
                    <div className="p-gh-grid">
                      <div className="p-gh-user">
                        <img className="p-gh-avatar" src={ghUser.avatar_url} alt="GitHub avatar" />
                        <div className="p-gh-userMeta">
                          <div className="p-gh-login">@{ghUser.login}</div>
                          <div className="p-gh-name">{ghUser.name ?? "—"}</div>

                          <div className="p-gh-stats">
                            <span>{ghUser.public_repos} repo</span>
                            <span>{ghUser.followers} followers</span>
                            <span>{ghUser.following} following</span>
                          </div>

                          {topLanguages.length ? (
                            <div className="p-gh-langs">
                              {topLanguages.map((l) => (
                                <span key={l} className="p-gh-pill">
                                  {l}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="p-gh-repos">
                        <div className="p-gh-subtitle">Poslednje ažurirani repo-i</div>
                        {ghRepos.length === 0 ? (
                          <div className="p-gh-empty">Nema repo-a za prikaz.</div>
                        ) : (
                          <ul className="p-gh-list">
                            {ghRepos.map((r) => (
                              <li key={r.id} className="p-gh-item">
                                <a className="p-gh-repoName" href={r.html_url} target="_blank" rel="noreferrer">
                                  {r.name}
                                </a>
                                <div className="p-gh-repoMeta">
                                  <span>{r.language ?? "—"}</span>
                                  <span>★ {r.stargazers_count}</span>
                                  <span>Forks {r.forks_count}</span>
                                </div>
                                {r.description ? <div className="p-gh-desc">{r.description}</div> : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-gh-state">Nema GitHub podataka.</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

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