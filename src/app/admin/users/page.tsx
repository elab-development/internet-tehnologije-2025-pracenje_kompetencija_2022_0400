import type React from "react";
import Link from "next/link";
import { FiUsers, FiUserPlus, FiShield, FiActivity } from "react-icons/fi";
import AdminUsersClient from "@/app/components/AdminUsersClient";
 

export default function AdminUsersPage() {
  return (
    <div style={{ padding: 24, margin: "0 auto", maxWidth: 1000 }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 8,
          color: "#e5e7eb",
        }}
      >
        Upravljanje korisnicima
      </h1>
      <p style={{ color: "#9ca3af", marginBottom: 24, fontSize: 14 }}>
        Pregled, izmena i administracija svih registrovanih korisnika u sistemu.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 32,
        }}
      >
         
         
      </div>

      {/* Glavna klijentska komponenta sa tabelom i logikom */}
      <AdminUsersClient />
    </div>
  );
}

const statCardStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
  backdropFilter: "blur(8px)",
  color: "#e5e7eb",
};

const iconWrapStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: "grid",
  placeItems: "center",
  borderRadius: 12,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(148,163,184,0.14)",
  color: "#c7d2fe",
  flexShrink: 0,
};

const cardTitle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 14,
  marginBottom: 2,
};

const cardText: React.CSSProperties = {
  fontSize: 12,
  color: "#9ca3af",
};