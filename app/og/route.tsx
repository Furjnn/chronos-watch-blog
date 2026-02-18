import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Chronos";
  const subtitle = searchParams.get("subtitle") || "Premium Watch Blog & Reviews";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111111 0%, #1f1f1f 65%, #2b2b2b 100%)",
          color: "white",
          padding: "72px",
        }}
      >
        <div style={{ color: "#B8956A", fontSize: 28, letterSpacing: 5, marginBottom: 22 }}>CHRONOS</div>
        <div style={{ fontSize: 74, lineHeight: 1.05, marginBottom: 24, maxWidth: 1050 }}>{title}</div>
        <div style={{ color: "#D4D4D4", fontSize: 30 }}>{subtitle}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
