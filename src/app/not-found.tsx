export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <h1
        style={{
          fontSize: "120px",
          margin: "0",
          fontWeight: "700",
          color: "#1e293b",
        }}
      >
        404
      </h1>

      <p
        style={{
          fontSize: "20px",
          color: "#64748b",
          marginBottom: "24px",
        }}
      >
        Stranica nije pronađena.
      </p>

      <a
        href="/"
        style={{
          padding: "12px 24px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          textDecoration: "none",
          borderRadius: "8px",
          fontWeight: "500",
          transition: "0.3s",
        }}
      >
        Nazad na početnu
      </a>
    </main>
  );
}