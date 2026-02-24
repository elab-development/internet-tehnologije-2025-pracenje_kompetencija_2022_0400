import type React from "react";
import Link from "next/link";
import { FiFileText, FiAward, FiUsers, FiBarChart2 } from "react-icons/fi";
import ModeratorDashboardClient from "@/app/components/ModeratorDashboardClient";

export default function ModeratorDashboardPage() {
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
        Moderator dashboard
      </h1> 
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <Link href="/moderator/credentials" style={cardStyle}>
          <div style={iconWrapStyle}>
            <FiFileText size={20} />
          </div>
          <div>
            <div style={cardTitle}>Upravljanje kredencijalima</div>
            <div style={cardText}>Pregled, odobravanje i odbijanje zahteva</div>
          </div>
        </Link>

        <Link href="/competencies" style={cardStyle}>
          <div style={iconWrapStyle}>
            <FiAward size={20} />
          </div>
          <div>
            <div style={cardTitle}>Upravljanje kompetencijama</div>
            <div style={cardText}>Dodavanje, izmena i brisanje</div>
          </div>
        </Link> 
 
      </div>

      <ModeratorDashboardClient />
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  textDecoration: "none",
  padding: "14px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
  backdropFilter: "blur(8px)",
  color: "#e5e7eb",
  transition: "all 0.15s ease",
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