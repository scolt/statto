import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Statto — Track Your Game Stats";
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e1035 0%, #2d1b69 40%, #3b0e8c 70%, #1e1035 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid dots */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 28,
            background: "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))",
            marginBottom: 28,
            boxShadow: "0 0 60px rgba(139,92,246,0.5), 0 0 0 1px rgba(255,255,255,0.15)",
          }}
        >
          {/* Lightning bolt / Zap icon */}
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: "-3px",
            background: "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #7c3aed 100%)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 20,
            lineHeight: 1,
          }}
        >
          Statto
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(196,181,253,0.85)",
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.4,
            letterSpacing: "0.01em",
          }}
        >
          <span>Track your stats, compete with friends,</span>
          <span>and settle the score once and for all.</span>
        </div>

        {/* Bottom stats chips */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 52,
          }}
        >
          {["📊 Leaderboards", "⚡ Live Matches", "🏆 Group Stats"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 22px",
                borderRadius: 100,
                background: "rgba(139,92,246,0.18)",
                border: "1px solid rgba(139,92,246,0.35)",
                color: "rgba(221,214,254,0.9)",
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
