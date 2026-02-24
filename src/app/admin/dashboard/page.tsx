import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/guards";
import Link from "next/link";
import { FiUsers, FiSettings, FiDatabase, FiShield } from "react-icons/fi";
import { db } from "@/db";
import { users } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import AdminCharts from "@/app/components/AdminCharts";

export default async function AdminDashboard() {
  const u = await getAuthUser();
  if (!u) redirect("/login");
  if ((u.role ?? "user") !== "admin") redirect("/");

  const [totalRes] = await db.select({ value: count() }).from(users);
  const [adminsRes] = await db.select({ value: count() }).from(users).where(eq(users.role, "admin"));
  const [modsRes] = await db.select({ value: count() }).from(users).where(eq(users.role, "moderator"));
  const [activeRes] = await db.select({ value: count() }).from(users).where(eq(users.isActive, true));

  const stats = {
    total: totalRes.value,
    admins: adminsRes.value,
    moderators: modsRes.value,
    users: totalRes.value - (adminsRes.value + modsRes.value),
    active: activeRes.value,
    inactive: totalRes.value - activeRes.value,
  };

  return (
    <main style={containerStyle}>
      <div style={contentWrapStyle}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={titleStyle}>Admin Dashboard</h1>
          <p style={subtitleStyle}>Dobrodošli nazad, <span style={{color: '#818cf8'}}>{u.name}</span>.</p>
        </div>

        {/* Glavni Layout: Kartice i Grafikoni */}
        <div style={mainLayoutGrid}>
          
          {/* LEVA STRANA: Brzi linkovi */}
          <div style={sideGridStyle}>
            <Link href="/admin/users" style={cardStyle}>
              <div style={iconWrapStyle}><FiUsers size={24} /></div>
              <span style={cardLabelStyle}>Korisnici</span>
            </Link>
            <Link href="/admin/settings" style={cardStyle}>
              <div style={iconWrapStyle}><FiSettings size={24} /></div>
              <span style={cardLabelStyle}>Podešavanja</span>
            </Link>
            <Link href="/admin/logs" style={cardStyle}>
              <div style={iconWrapStyle}><FiDatabase size={24} /></div>
              <span style={cardLabelStyle}>Sistemski Logovi</span>
            </Link>
          </div>

          {/* DESNA STRANA: Grafikoni */}
          <div style={chartsWrapperStyle}>
            <AdminCharts stats={stats} />
          </div>

        </div>
      </div>
    </main>
  );
}

// NOVI I POBOLJŠANI STILOVI
const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0a0a0c", // Tamnija pozadina za bolji kontrast
  padding: "60px 20px",
  color: "#fff"
};

const contentWrapStyle: React.CSSProperties = {
  maxWidth: "1200px", // Povećano da grafikoni imaju mesta
  margin: "0 auto",
};

const titleStyle: React.CSSProperties = {
  fontSize: "36px",
  fontWeight: 800,
  marginBottom: "8px",
};

const subtitleStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "16px",
};

const mainLayoutGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "300px 1fr", // Fiksna širina za meni, ostatak za grafikone
  gap: "30px",
  alignItems: "start",
};

// Responsiveness za mobilne
const sideGridStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const chartsWrapperStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.02)",
  borderRadius: "24px",
  padding: "10px", // AdminCharts već ima svoje paddinge
  border: "1px solid rgba(255, 255, 255, 0.05)",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "20px",
  textDecoration: "none",
  borderRadius: "16px",
  background: "rgba(255, 255, 255, 0.04)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(10px)",
  color: "#e5e7eb",
  transition: "all 0.2s ease",
};

const iconWrapStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  display: "grid",
  placeItems: "center",
  borderRadius: "12px",
  background: "rgba(99, 102, 241, 0.1)",
  color: "#818cf8",
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
};