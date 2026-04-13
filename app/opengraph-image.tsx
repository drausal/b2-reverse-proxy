import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "B2 Reverse Proxy – High-Performance Cloud Storage Gateway";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #000000 0%, #18181b 50%, #000000 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "150px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(6,182,212,0.15)",
            filter: "blur(80px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "150px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(59,130,246,0.15)",
            filter: "blur(80px)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #06b6d4, #2563eb)",
            fontSize: "36px",
            fontWeight: 700,
            color: "white",
            marginBottom: "24px",
          }}
        >
          B2
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            background: "linear-gradient(90deg, #06b6d4, #3b82f6, #a855f7)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.1,
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          B2 Reverse Proxy
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Serve Backblaze B2 files through your own domain with zero latency overhead.
        </div>

        {/* Domain badge */}
        <div
          style={{
            display: "flex",
            marginTop: "32px",
            padding: "10px 24px",
            borderRadius: "9999px",
            border: "1px solid rgba(6,182,212,0.3)",
            background: "rgba(6,182,212,0.1)",
            color: "#22d3ee",
            fontSize: "18px",
          }}
        >
          files.on.tires
        </div>
      </div>
    ),
    { ...size }
  );
}
