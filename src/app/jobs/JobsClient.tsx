"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./jobs.css";

type Job = {
  id: number;
  title: string;
  company_name: string;
  category: string;
  description: string;
  url: string;
  tags: string[];
};

type MatchInfo = {
  percent: number;
  matched: string[];
  missing: string[];
  score: number;
};

export default function JobsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const userSkills = ["javascript", "react", "node", "typescript"];
  const [activeSkills, setActiveSkills] = useState<string[]>(userSkills);

  useEffect(() => {
    setActiveSkills(userSkills);
  }, []);

  const skillsQuery = useMemo(() => activeSkills.join(" "), [activeSkills]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("https://remotive.com/api/remote-jobs?limit=50");
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  function normalizeText(s: string) {
    return s.toLowerCase();
  }

  function getJobText(job: Job) {
    return normalizeText(
      job.title +
        " " +
        job.company_name +
        " " +
        job.category +
        " " +
        job.tags.join(" ") +
        " " +
        job.description
    );
  }

  function computeMatch(job: Job): MatchInfo {
    const text = getJobText(job);

    const matched: string[] = [];
    const missing: string[] = [];

    for (const s of activeSkills) {
      if (text.includes(s.toLowerCase())) matched.push(s);
      else missing.push(s);
    }

    const percent =
      activeSkills.length === 0 ? 0 : Math.round((matched.length / activeSkills.length) * 100);

    return { percent, matched, missing, score: matched.length };
  }

  const view = useMemo(() => {
    const q = query.trim().toLowerCase();

    const enriched = jobs.map((job) => {
      const match = computeMatch(job);
      const hay = (job.title + " " + job.company_name + " " + job.tags.join(" ") + " " + job.category).toLowerCase();

      const queryTokens = q ? q.split(/\s+/).filter(Boolean) : [];
      const queryHit = queryTokens.length === 0 ? true : queryTokens.some((t) => hay.includes(t));

      return { job, match, queryHit };
    });

    if (q) {
      return enriched.sort((a, b) => {
        if (a.queryHit !== b.queryHit) return a.queryHit ? -1 : 1;
        if (a.match.score !== b.match.score) return b.match.score - a.match.score;
        return a.job.title.localeCompare(b.job.title);
      });
    }

    return enriched.sort((a, b) => {
      if (a.match.score !== b.match.score) return b.match.score - a.match.score;
      return a.job.title.localeCompare(b.job.title);
    });
  }, [jobs, query, activeSkills]);

  function searchByMySkills() {
    const q = skillsQuery.trim();
    setQuery(q);
    router.replace(`/jobs?q=${encodeURIComponent(q)}`);
  }

  function toggleSkill(skill: string) {
    setActiveSkills((prev) => {
      const next = prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill];
      return next;
    });
  }

  function enableAllSkills() {
    setActiveSkills(userSkills);
  }

  function clearAllSkills() {
    setActiveSkills([]);
  }

  function barColor(percent: number) {
    if (percent >= 70) return "#22c55e";
    if (percent >= 40) return "#f59e0b";
    return "#ef4444";
  }

  return (
    <main className="page">
      <div className="container">
        <header className="hero">
          <h1>Otvorene pozicije</h1>
          <p>
            Pretraga poslova i procena poklapanja sa tvojim veštinama. Možeš privremeno isključiti
            neke veštine iz računanja match-a.
          </p>

          <div className="toolbar">
            <button
              type="button"
              className="btn primary"
              onClick={searchByMySkills}
              disabled={activeSkills.length === 0}
            >
              Pretraži po mojim veštinama
            </button>

            <a className="link" href={`/jobs?q=${encodeURIComponent(skillsQuery)}`}>
              Link za pretragu po veštinama
            </a>
          </div>

          <div className="searchBox">
            <input
              className="searchInput"
              placeholder="Pretraži (naziv, firma, tagovi)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <div className="searchHint">Aktivne veštine (klikom isključi/uključi):</div>

            <div className="skillsBar">
              {userSkills.map((s) => {
                const on = activeSkills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className={`skillChip ${on ? "on" : "off"}`}
                    onClick={() => toggleSkill(s)}
                    aria-pressed={on}
                  >
                    {s}
                  </button>
                );
              })}

              <div className="skillsActions">
                <button type="button" className="btn" onClick={enableAllSkills}>
                  Uključi sve
                </button>
                <button type="button" className="btn" onClick={clearAllSkills}>
                  Isključi sve
                </button>
              </div>
            </div>

            <div className="smallNote">Match se računa samo na osnovu trenutno aktivnih veština.</div>
          </div>
        </header>

        {loading ? (
          <div className="state">Učitavanje poslova...</div>
        ) : view.length === 0 ? (
          <div className="state">Nema dostupnih poslova.</div>
        ) : (
          <section className="grid">
            {view.map(({ job, match }) => (
              <article key={job.id} className="card">
                <div className="cardTop">
                  <div>
                    <h3 className="title">{job.title}</h3>
                    <p className="meta">
                      <strong>{job.company_name}</strong> • {job.category}
                    </p>

                    <div className="badges">
                      {match.matched.map((s) => (
                        <span key={`m-${job.id}-${s}`} className="badge ok">
                          {s}
                        </span>
                      ))}
                      {match.missing.map((s) => (
                        <span key={`x-${job.id}-${s}`} className="badge miss">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="matchWrap">
                  <div className="matchRow">
                    <span>Match</span>
                    <strong>{match.percent}%</strong>
                  </div>

                  <div className="bar">
                    <div
                      className="barFill"
                      style={{
                        width: `${match.percent}%`,
                        background: barColor(match.percent),
                      }}
                    />
                  </div>

                  <div className="smallNote">
                    Poklapanje je procena na osnovu opisa i tagova. (Aktivne veštine: {activeSkills.length})
                  </div>
                </div>

                <div className="footer">
                  <a className="actionLink" href={job.url} target="_blank" rel="noreferrer">
                    Pogledaj oglas
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}