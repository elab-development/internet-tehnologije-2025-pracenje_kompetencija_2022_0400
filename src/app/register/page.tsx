"use client";

import { useState } from "react";
import Link from "next/link";
import "./register.css";
import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";

type ApiOk = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Popuni sva polja.");
      return;
    }
    if (password.length < 6) {
      setError("Lozinka mora imati bar 6 karaktera.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await res.json()) as ApiOk | { error: string };

      if (!res.ok) {
        setError("error" in data ? data.error : "Greška pri registraciji.");
        return;
      }

      setSuccess("Uspešna registracija! Preusmeravam...");
      // cookie (JWT) je već setovan iz API rute
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
          <h1>Registracija</h1>
          <p>Napravi nalog i kreni da pratiš kompetencije i kredencijale.</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Ime i prezime</span>
            <div className="input">
              <FiUser />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="npr. Petar Petrović"
                autoComplete="name"
              />
            </div>
          </label>

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
                placeholder="min 6 karaktera"
                autoComplete="new-password"
                type="password"
              />
            </div>
          </label>

          {error && <div className="msg error">{error}</div>}
          {success && <div className="msg success">{success}</div>}

          <button className="btn primary full" disabled={loading} type="submit">
            {loading ? "Kreiram nalog..." : "Kreiraj nalog"}
            <FiArrowRight className="btn-icon" />
          </button>

          <p className="auth-footer">
            Već imaš nalog? <Link href="/login">Prijavi se</Link>
          </p>
        </form>
      </section>
    </main>
  );
}