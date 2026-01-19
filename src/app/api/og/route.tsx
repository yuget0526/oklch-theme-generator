import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract colors from query params (defaulting if missing)
    const p = searchParams.get("p") ? `#${searchParams.get("p")}` : "#3b82f6";
    const s = searchParams.get("s") ? `#${searchParams.get("s")}` : "#059669";
    const t = searchParams.get("t") ? `#${searchParams.get("t")}` : "#8b5cf6";
    const m = searchParams.get("m") || "light";

    // Simple background based on mode
    const bg = m === "dark" ? "#1a1a1a" : "#ffffff";
    const textColor = m === "dark" ? "#ffffff" : "#000000";

    return new ImageResponse(
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <h1
            style={{
              fontSize: 60,
              fontWeight: "bold",
              color: textColor,
              margin: 0,
            }}
          >
            a11yPalette
          </h1>
        </div>

        <div style={{ display: "flex", gap: "40px" }}>
          {/* Primary Color Swatch */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: p,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            />
          </div>

          {/* Secondary Color Swatch */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: s,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            />
          </div>

          {/* Tertiary Color Swatch */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: t,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: textColor,
            opacity: 0.8,
          }}
        >
          Accessible Color Palette Generator
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.log(errorMessage);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
