"use client";
import { Chart } from "react-google-charts";

interface AdminChartsProps {
  stats: {
    total: number;
    admins: number;
    moderators: number;
    users: number;
    active: number;
    inactive: number;
  };
}

export default function AdminCharts({ stats }: AdminChartsProps) {
  // Podaci za Pie Chart (Uloge)
  const roleData = [
    ["Uloga", "Broj"],
    ["Admini", stats.admins],
    ["Moderatori", stats.moderators],
    ["Korisnici", stats.users],
  ];

  // Podaci za Bar Chart (Status)
  const statusData = [
    ["Status", "Broj", { role: "style" }],
    ["Aktivni", stats.active, "#4ade80"],
    ["Neaktivni", stats.inactive, "#f87171"],
  ];

  const commonOptions = {
    backgroundColor: "transparent",
    legend: { textStyle: { color: "#aeb8d6", fontSize: 12 } },
    titleTextStyle: { color: "#ffffff", fontSize: 16, bold: true },
    chartArea: { width: "80%", height: "70%" },
  };

  return (
    <div style={chartsGrid}>
      {/* Pie Chart: Distribucija uloga */}
      <div style={chartCard}>
        <Chart
          chartType="PieChart"
          data={roleData}
          options={{
            ...commonOptions,
            title: "Distribucija uloga",
            is3D: true,
            slices: {
              0: { color: "#818cf8" },
              1: { color: "#6366f1" },
              2: { color: "#4338ca" },
            },
          }}
          width="100%"
          height="300px"
        />
      </div>

      {/* Bar Chart: Status korisnika */}
      <div style={chartCard}>
        <Chart
          chartType="BarChart"
          data={statusData}
          options={{
            ...commonOptions,
            title: "Status naloga",
            hAxis: { textStyle: { color: "#aeb8d6" }, gridlines: { color: "rgba(255,255,255,0.1)" } },
            vAxis: { textStyle: { color: "#aeb8d6" } },
            legend: { position: "none" },
          }}
          width="100%"
          height="300px"
        />
      </div>
    </div>
  );
}

const chartsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "30px",
  width: "100%",
};

const chartCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
  padding: "16px",
  backdropFilter: "blur(10px)",
};