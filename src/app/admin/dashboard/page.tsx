import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/guards";
import Link from "next/link";
import { FiUsers, FiSettings, FiDatabase, FiArrowRight } from "react-icons/fi";
import { db } from "@/db";
import { users } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import AdminCharts from "@/app/components/AdminCharts";

export default async function AdminDashboard() {
  const u = await getAuthUser();
  if (!u) redirect("/login");
  if ((u.role ?? "user") !== "admin") redirect("/");

  // Statistika iz baze
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
    <div className="cred-page">
      {/* Header sekcija - identična kao na listi korisnika */}
      <header className="cred-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Dobrodošli nazad, {u.name}. Kontrolni centar sistema.</p>
        </div>
        <div className="header-actions">
          <span className="pill">Admin Access</span>
        </div>
      </header>

      {/* Glavni sadržaj */}
      <div style={dashboardGridStyle}>
        
        {/* LEVA KOLONA: Brze akcije/Meni */}
        <div style={sidebarStyle}>
          <h2 style={sectionTitleStyle}>Upravljanje</h2>
          
          <Link href="/admin/users" className="btn" style={menuLinkStyle}>
            <FiUsers size={18} />
            <span>Korisnici</span>
            <FiArrowRight style={{ marginLeft: "auto", opacity: 0.5 }} />
          </Link>

          {/* Onemogućeni linkovi jer još nemaju rute, ali čuvaju dizajn */}
          <div className="btn muted" style={{ ...menuLinkStyle, cursor: "not-allowed", opacity: 0.6 }}>
            <FiSettings size={18} />
            <span>Podešavanja (Uskoro)</span>
          </div>

          <div className="btn muted" style={{ ...menuLinkStyle, cursor: "not-allowed", opacity: 0.6 }}>
            <FiDatabase size={18} />
            <span>Sistemski Logovi</span>
          </div>
        </div>

        {/* DESNA KOLONA: Grafikoni */}
        <div className="cred-card" style={{ padding: "20px" }}>
          <AdminCharts stats={stats} />
        </div>

      </div>
    </div>
  );
}

// Inline stilovi koji dopunjuju tvoj globalni CSS za specifičan dashboard layout
const dashboardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(250px, 300px) 1fr",
  gap: "20px",
  maxWidth: "980px",
  margin: "0 auto",
  width: "100%",
};

const sidebarStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const menuLinkStyle: React.CSSProperties = {
  justifyContent: "flex-start",
  padding: "14px 18px",
  width: "100%",
  background: "rgba(255, 255, 255, 0.04)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#aeb8d6",
  marginBottom: "8px",
  paddingLeft: "4px",
};