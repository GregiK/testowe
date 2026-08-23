"use client";

// Wyłapuje błędy w samym Root Layout - Next.js wymaga, żeby ten plik renderował własne
// <html>/<body>, bo w tym przypadku zastępuje CAŁY layout, nie tylko treść strony.
// Celowo minimalny inline CSS (bez polegania na globals.css/tokenach motywu) - to
// ostatnia linia obrony, ma działać nawet jeśli coś w samym layoucie/stylach zawiodło.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
          background: "#1b1520",
          color: "#f5ece6",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <div style={{ maxWidth: 360, display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Coś poszło nie tak</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#ab97a1", margin: 0 }}>
            Aplikacja napotkała poważny błąd. Odśwież stronę - jeśli problem się powtarza,
            daj nam znać.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              width: "100%",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: "white",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #ff7a45, #ff3d77)",
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
