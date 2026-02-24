"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./navbar.css";

type Role = "user" | "moderator" | "admin";
type MeRes =
  | { user: null }
  | { user: { id: string; name: string | null; email: string; role: Role } };

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
  const isLoggedIn = role !== "guest";
  const isAdmin = role === "admin";
  const isModerator = role === "moderator";
  const isUser = role === "user";

  const modDashboardHref = "/moderator/dashboard";
  const modCredentialsHref = "/moderator/credentials";
  const adminDashboardHref = "/admin/dashboard";

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href={isModerator ? modDashboardHref : isAdmin ? adminDashboardHref : "/"}>
          PraćenjeKompetencija
        </Link>

        <nav className="links">
          {/* POČETNA samo za goste */}
          {!isLoggedIn && (
            <Link className={isActive("/") ? "active" : ""} href="/">
              Početna
            </Link>
          )}

          {/* MODERATOR - prvo dashboard */}
          {isModerator && (
            <>
              <Link className={isActive(modDashboardHref) ? "active" : ""} href={modDashboardHref}>
                Moderator
              </Link>
              <Link className={isActive(modCredentialsHref) ? "active" : ""} href={modCredentialsHref}>
                Kredencijali
              </Link>
                <Link className={isActive("/competencies") ? "active" : ""} href="/competencies">
                  Kompetencije
                </Link>
            </>
          )}

          {/* ADMIN */}
          {isAdmin && (
            <>
            <Link className={isActive(adminDashboardHref) ? "active" : ""} href={adminDashboardHref}>
              Admin
            </Link>
                <Link className={isActive("/competencies") ? "active" : ""} href="/competencies">
              Kompetencije
            </Link>
            </>
          )}

          {/* USER */}
          {isUser && (
            <Link className={isActive("/profile") ? "active" : ""} href="/profile">
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