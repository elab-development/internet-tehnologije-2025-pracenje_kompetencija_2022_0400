"use client";

import { useState } from "react";
import Link from "next/link";
import "../register/register.css"; 
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

type ApiOk = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

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

      setSuccess("Uspešna prijava! Preusmeravam...");
      setTimeout(() => {
        window.location.href = "/"; // ili "/dashboard"
      }, 600);
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
          <label className="field">
            <span>Email</span>
            <div className="input">
              <FiMail />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="npr. petar@example.com"
                autoComplete="email"
                type="email"
              />
            </div>
          </label>

          <label className="field">
            <span>Lozinka</span>
            <div className="input">
              <FiLock />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="tvoja lozinka"
                autoComplete="current-password"
                type="password"
              />
            </div>
          </label>

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