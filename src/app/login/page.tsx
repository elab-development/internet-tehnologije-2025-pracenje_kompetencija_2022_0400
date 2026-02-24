"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../register/register.css";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import AuthField from "../components/AuthField";
 

type ApiOk = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  token?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("mina@fon.rs");
  const [password, setPassword] = useState("mina123");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  function redirectByRole(role: string | null) {
    const r = role ?? "user";
    if (r === "admin") return router.replace("/admin/dashboard");
    if (r === "moderator") return router.replace("/moderator/dashboard");
    return router.replace("/profile");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password) {
      setError("Popuni sva polja.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as ApiOk | { error: string };

      if (!res.ok) {
        setError("error" in data ? data.error : "Greška pri prijavi.");
        return;
      }

      const ok = data as ApiOk;

      localStorage.setItem(
        "auth_user",
        JSON.stringify({ id: ok.id, name: ok.name, email: ok.email, role: ok.role ?? "user" })
      );

      if (ok.token) {
        localStorage.setItem("auth_token", ok.token);
      }

      setSuccess("Uspešna prijava! Preusmeravam...");
      setTimeout(() => redirectByRole(ok.role), 300);
    } catch {
      setError("Došlo je do greške. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <h1>Prijava</h1>
          <p>Uloguj se i nastavi praćenje kompetencija i kredencijala.</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <AuthField
            label="Email"
            icon={<FiMail />}
            value={email}
            onChange={setEmail}
            placeholder="npr. petar@example.com"
            autoComplete="email"
            type="email"
            disabled={loading}
            name="email"
            id="login-email"
            required
          />

          <AuthField
            label="Lozinka"
            icon={<FiLock />}
            value={password}
            onChange={setPassword}
            placeholder="tvoja lozinka"
            autoComplete="current-password"
            type="password"
            disabled={loading}
            name="password"
            id="login-password"
            required
          />

          {error && <div className="msg error">{error}</div>}
          {success && <div className="msg success">{success}</div>}

          <button className="btn primary full" disabled={loading} type="submit">
            {loading ? "Prijavljujem..." : "Prijavi se"}
            <FiArrowRight className="btn-icon" />
          </button>

          <p className="auth-footer">
            Nemaš nalog? <Link href="/register">Registruj se</Link>
          </p>
        </form>
      </section>
    </main>
  );
}