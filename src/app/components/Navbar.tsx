"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./navbar.css";

type MeRes =
  | { user: null }
  | { user: { id: string; name: string | null; email: string; role: string } };

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MeRes extends { user: infer U } ? U : never>(null as any);

  async function loadMe() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json()) as MeRes;
      setUser(data.user);
      // sync LS user (korisno da ti bude uvek up-to-date)
      if (data.user) localStorage.setItem("auth_user", JSON.stringify(data.user));
      else localStorage.removeItem("auth_user");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    setUser(null);
    router.replace("/login");
  }

  const role = user?.role ?? "guest";

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          PraćenjeKompetencija
        </Link>

        <nav className="links">
          <Link className={pathname === "/" ? "active" : ""} href="/">
            Početna
          </Link>

          <Link className={pathname === "/competencies" ? "active" : ""} href="/competencies">
            Kompetencije
          </Link>

          {role === "admin" && (
            <Link className={pathname.startsWith("/admin") ? "active" : ""} href="/admin/dashboard">
              Admin
            </Link>
          )}

          {role === "moderator" && (
            <Link
              className={pathname.startsWith("/moderator") ? "active" : ""}
              href="/moderator/dashboard"
            >
              Moderator
            </Link>
          )}

          {role === "user" && (
            <Link className={pathname === "/profile" ? "active" : ""} href="/profile">
              Profil
            </Link>
          )}
        </nav>

        <div className="right">
          {loading ? (
            <span className="muted">...</span>
          ) : user ? (
            <>
              <span className="pill">{user.role}</span>
              <span className="muted hide-sm">{user.email}</span>
              <button className="btn" onClick={logout}>
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link className="btn" href="/login">
                Prijava
              </Link>
              <Link className="btn primary" href="/register">
                Registracija
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}