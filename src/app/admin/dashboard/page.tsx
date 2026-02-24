import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/guards";
import Link from "next/link";
import { FiUsers, FiSettings, FiDatabase, FiShield, FiActivity } from "react-icons/fi";

export default async function AdminDashboard() {
  const u = await getAuthUser();
  if (!u) redirect("/login");
  if ((u.role ?? "user") !== "admin") redirect("/");

  return (
    <main style={containerStyle}>
      <div style={contentWrapStyle}>
        <h1 style={titleStyle}>Admin Dashboard</h1>
        <p style={subtitleStyle}>Dobrodošli nazad, {u.name}. Upravljajte sistemom putem brzih prečica ispod.</p>

        {/* Quick Links Grid */}
        <div style={gridStyle}>
          <Link href="/admin/users" style={cardStyle}>
            <div style={iconWrapStyle}>
              <FiUsers size={24} />
            </div>
            <span style={cardLabelStyle}>Korisnici</span>
          </Link>

          
 

         
        </div>
      </div>
    </main>
  );
}

// Stilovi
const containerStyle: React.CSSProperties = {
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  textAlign: "center",
};

const contentWrapStyle: React.CSSProperties = {
  maxWidth: "800px",
  width: "100%",
};

const titleStyle: React.CSSProperties = {
  fontSize: "42px",
  fontWeight: 800,
  color: "#ffffff",
  marginBottom: "12px",
  letterSpacing: "-0.02em",
};

const subtitleStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "16px",
  marginBottom: "48px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "20px",
  justifyContent: "center",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  padding: "24px 16px",
  textDecoration: "none",
  borderRadius: "20px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(12px)",
  transition: "transform 0.2s ease, background 0.2s ease",
  color: "#e5e7eb",
};

const iconWrapStyle: React.CSSProperties = {
  width: "56px",
  height: "56px",
  display: "grid",
  placeItems: "center",
  borderRadius: "16px",
  background: "rgba(99, 102, 241, 0.15)", // Indigo prozirna
  color: "#818cf8",
  marginBottom: "4px",
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
};