"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import styles from "./ModeratorDashboard.module.css";

/**
 * Tipovi podataka koji stižu sa backend rute /api/moderator/stats
 * (ovo nam pomaže da imamo type-safety u frontu).
 */
type StatusCount = { status: string; count: number };
type MonthCount = { ym: string; count: number };
type CategoryCount = { category: string; count: number };

type Stats = {
  statusCounts: StatusCount[];
  perMonth: MonthCount[];
  competenciesByCategory: CategoryCount[];
};

/**
 * Backend vraća mesec kao string "YYYY-MM".
 * U UI samo formatiramo prikaz u "MM/YYYY" da bude čitljivije na grafiku.
 */
function toMonthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return `${m}/${y}`;
}

/**
 * Mala mapa statusa -> naziv koji je lepši za prikaz (opciono).
 * Ako ti već u bazi stoji "active/pending/rejected" dovoljno je i ovako.
 */
function prettyStatus(s: string) {
  if (!s) return "unknown";
  const x = s.toLowerCase();
  if (x === "active") return "Aktivni";
  if (x === "pending") return "Na čekanju";
  if (x === "rejected") return "Odbijeni";
  return s;
}

/**
 * Tema (boje) za grafikone da ne budu “šljašteće” i da se uklapaju u UI.
 * Ovde centralno menjaš paletu, a svi grafikoni je koriste.
 */
const CHART_THEME = {
  fontName: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  text: "#0f172a",
  subText: "#334155",
  grid: "#e5e7eb",
  bg: "transparent",
  // Paleta (biraj 4-6 skladnih boja)
  colors: ["#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"],
};

export default function ModeratorDashboardClient() {
  /**
   * stats: kompletan payload sa statistikama (dolazi iz našeg API-ja)
   * err: poruka greške ako fetch ne uspe
   * chartsReady: postaje true tek kad se Google Charts biblioteka učita i inicijalizuje
   */
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string>("");
  const [chartsReady, setChartsReady] = useState(false);

  /**
   * 1) Učitavanje statistika sa našeg backend endpoint-a:
   *    GET /api/moderator/stats
   *
   * cache: "no-store" -> uvek povuci sveže podatke (dashboard statistike se često menjaju).
   *
   * "alive" flag koristimo da sprečimo setState nakon unmount-a komponente.
   */
  useEffect(() => {
    let alive = true;

    (async () => {
      setErr("");

      const res = await fetch("/api/moderator/stats", { cache: "no-store" });
      const data = (await res.json().catch(() => null)) as Stats | null;

      if (!alive) return;

      if (!res.ok || !data) {
        setErr("Ne mogu da učitam statistike.");
        setStats(null);
        return;
      }

      setStats(data);
    })();

    return () => {
      alive = false;
    };
  }, []);

  /**
   * 2) Google Charts očekuje DataTable format.
   * Najlakše je da mu damo "arrayToDataTable" oblik:
   * [
   *   ["Kolona1", "Kolona2"],
   *   ["vrednost", broj],
   *   ...
   * ]
   *
   * useMemo: da ne računamo ponovo tabelu na svaki render, nego samo kad se promeni stats.
   */
  const statusDataTable = useMemo(() => {
    // Lepši labeli (Aktivni/Na čekanju/Odbijeni) umesto raw stringa (active/pending/rejected)
    const rows = (stats?.statusCounts ?? []).map((x) => [prettyStatus(x.status), x.count]);
    return [["Status", "Broj"], ...rows];
  }, [stats]);

  const monthDataTable = useMemo(() => {
    const rows = (stats?.perMonth ?? []).map((x) => [toMonthLabel(x.ym), x.count]);
    return [["Mesec", "Broj"], ...rows];
  }, [stats]);

  const categoryDataTable = useMemo(() => {
    const rows = (stats?.competenciesByCategory ?? []).map((x) => [x.category, x.count]);
    return [["Kategorija", "Broj"], ...rows];
  }, [stats]);

  /**
   * 3) Crtanje grafikona:
   * - ovo sme da se desi tek kad imamo:
   *   (a) chartsReady == true (Google Charts učitan)
   *   (b) stats != null (podatke smo povukli)
   *
   * google charts radi nad DOM-om (div id="..."), pa se crta u te elemente.
   */
  useEffect(() => {
    if (!chartsReady || !stats) return;

    // Google Charts loader kreira globalni objekat window.google
    const g = (window as any).google;
    if (!g?.visualization) return;

    /**
     * Zajedničke opcije (stil) koje važe za sve grafikone:
     * - font, boje, gridlines, tooltip, background...
     * Ovde podešavamo da sve izgleda skladno i “mekše”.
     */
    const baseOptions = {
      backgroundColor: CHART_THEME.bg,
      fontName: CHART_THEME.fontName,
      colors: CHART_THEME.colors,
      titleTextStyle: { color: CHART_THEME.text, fontSize: 14, bold: true },
      tooltip: {
        textStyle: { color: CHART_THEME.text, fontSize: 12 },
        showColorCode: true,
      },
      chartArea: { width: "85%", height: "75%" },
    } as const;

    /**
     * draw() funkcija crta sva 3 grafikona.
     * Pozivamo je odmah i još na resize da grafici ostanu responsive.
     */
    function draw() {
      // PIE: Credentials po statusu
      const pieEl = document.getElementById("chart-status");
      if (pieEl) {
        const dt = g.visualization.arrayToDataTable(statusDataTable);
        const chart = new g.visualization.PieChart(pieEl);

        chart.draw(dt, {
          ...baseOptions,
          title: "Credentials po statusu",
          legend: {
            position: "right",
            textStyle: { color: CHART_THEME.subText, fontSize: 12 },
          },
          pieHole: 0.45, // donut stil (mnogo lepše deluje)
          pieSliceTextStyle: { color: "white", fontSize: 12, bold: true },
          sliceVisibilityThreshold: 0.02,
          chartArea: { width: "88%", height: "82%" },
        });
      }

      // LINE: Broj kreiranih credentials po mesecima
      const lineEl = document.getElementById("chart-months");
      if (lineEl) {
        const dt = g.visualization.arrayToDataTable(monthDataTable);
        const chart = new g.visualization.LineChart(lineEl);

        chart.draw(dt, {
          ...baseOptions,
          title: "Broj kreiranih credentials (poslednjih 6 meseci)",
          legend: { position: "none" },
          // Ose i mreža (da bude “mekše” i čitljivije)
          hAxis: {
            slantedText: true,
            textStyle: { color: CHART_THEME.subText, fontSize: 11 },
            gridlines: { color: CHART_THEME.grid },
            minorGridlines: { color: "transparent" },
          },
          vAxis: {
            minValue: 0,
            textStyle: { color: CHART_THEME.subText, fontSize: 11 },
            gridlines: { color: CHART_THEME.grid },
            minorGridlines: { color: "transparent" },
          },
          // Stil linije i tačaka
          lineWidth: 3,
          pointSize: 5,
          curveType: "function", // blago zaobljena linija
        });
      }

      // BAR: Kompetencije po kategoriji
      const barEl = document.getElementById("chart-categories");
      if (barEl) {
        const dt = g.visualization.arrayToDataTable(categoryDataTable);
        const chart = new g.visualization.ColumnChart(barEl);

        chart.draw(dt, {
          ...baseOptions,
          title: "Kompetencije po kategoriji",
          legend: { position: "none" },
          bar: { groupWidth: "55%" },
          hAxis: {
            slantedText: true,
            textStyle: { color: CHART_THEME.subText, fontSize: 11 },
            gridlines: { color: "transparent" },
          },
          vAxis: {
            minValue: 0,
            textStyle: { color: CHART_THEME.subText, fontSize: 11 },
            gridlines: { color: CHART_THEME.grid },
            minorGridlines: { color: "transparent" },
          },
        });
      }
    }

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [chartsReady, stats, statusDataTable, monthDataTable, categoryDataTable]);

  return (
    <>
      {/**
        * 4) Ovde "dodajemo Google Charts API":
        * - Učitavamo https://www.gstatic.com/charts/loader.js
        * - Kad se učita, dobijamo window.google i pozivamo:
        *   google.charts.load("current", { packages: ["corechart"] })
        * - Tek kad se corechart paket učita, setujemo chartsReady=true
        */}
      <Script
        src="https://www.gstatic.com/charts/loader.js"
        strategy="afterInteractive"
        onLoad={() => {
          const g = (window as any).google;
          if (!g) return;

          g.charts.load("current", { packages: ["corechart"] });
          g.charts.setOnLoadCallback(() => setChartsReady(true));
        }}
      />

      {err ? <div className={styles.alertError}>{err}</div> : null}

      {!stats ? (
        <div className={styles.alertLoading}>Učitavanje...</div>
      ) : (
        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.span6}`}>
            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>Pregled statusa</p>
                <p className={styles.cardHint}>Pie chart</p>
              </div>
              <div className={styles.chartSurface}>
                <div id="chart-status" className={styles.h320} />
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.span6}`}>
            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>Trend po mesecima</p>
                <p className={styles.cardHint}>Line chart</p>
              </div>
              <div className={styles.chartSurface}>
                <div id="chart-months" className={styles.h320} />
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.span12}`}>
            <div className={styles.cardInner}>
              <div className={styles.cardHeader}>
                <p className={styles.cardTitle}>Kompetencije po kategoriji</p>
                <p className={styles.cardHint}>Column chart</p>
              </div>
              <div className={styles.chartSurface}>
                <div id="chart-categories" className={styles.h340} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}