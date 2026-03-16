import { ImageResponse } from "next/og";
import { getMatchById, getMatchGames, getMatchPlayers } from "@/features/matches";

export const runtime = "nodejs";
export const alt = "Match Overview — Statto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ groupId: string; matchId: string }>;
};

export default async function OGImage({ params }: Props) {
  const { matchId } = await params;

  let match = null;
  let players: { id: number; nickname: string }[] = [];
  let games: Awaited<ReturnType<typeof getMatchGames>> = [];

  try {
    match = await getMatchById(Number(matchId));
    if (match) {
      [games, players] = await Promise.all([
        getMatchGames(match.id),
        getMatchPlayers(match.id),
      ]);
    }
  } catch {
    // silently fall back to generic image
  }

  const dateStr = match
    ? match.date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Match Overview";

  const statusLabel: Record<string, string> = {
    new: "Upcoming",
    in_progress: "● Live",
    paused: "Paused",
    done: "Completed",
  };
  const status = match ? (statusLabel[match.status] ?? match.status) : null;
  const isLive = match?.status === "in_progress";

  // Compute basic per-player win tallies from games
  const winMap = new Map<number, number>();
  for (const player of players) winMap.set(player.id, 0);

  for (const game of games) {
    if (game.scores.length < 2) continue;
    const maxScore = Math.max(...game.scores.map((s) => s.score));
    const winners = game.scores.filter((s) => s.score === maxScore);
    if (winners.length < game.scores.length) {
      for (const w of winners) {
        winMap.set(w.playerId, (winMap.get(w.playerId) ?? 0) + 1);
      }
    }
  }

  const playerStats = players
    .map((p) => ({ ...p, wins: winMap.get(p.id) ?? 0 }))
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 6); // cap at 6 for layout

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #1e1035 0%, #2d1b69 40%, #3b0e8c 70%, #1e1035 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative blur circles */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          }}
        />
        {/* Grid dots */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Top bar — brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "32px 52px 0",
          }}
        >
          {/* Logo icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 13,
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))",
              boxShadow: "0 0 24px rgba(139,92,246,0.5)",
            }}
          >
            <svg
              width="24"
              height="24"
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
          <span
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              color: "#c4b5fd",
              letterSpacing: "-0.5px",
            }}
          >
            Statto
          </span>

          {/* Status pill */}
          {status && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                padding: "6px 18px",
                borderRadius: 100,
                background: isLive
                  ? "rgba(16,185,129,0.2)"
                  : "rgba(139,92,246,0.2)",
                border: `1px solid ${isLive ? "rgba(16,185,129,0.5)" : "rgba(139,92,246,0.4)"}`,
                color: isLive ? "#34d399" : "#c4b5fd",
                fontSize: 17,
                fontWeight: 600,
              }}
            >
              {status}
            </div>
          )}
        </div>

        {/* Main content area */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "24px 52px 40px",
            gap: 40,
          }}
        >
          {/* Left: match info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: "0 0 auto",
              maxWidth: 480,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 15,
                fontWeight: 500,
                color: "rgba(167,139,250,0.7)",
                textTransform: "uppercase",
                letterSpacing: "2px",
                marginBottom: 8,
              }}
            >
              Match #{matchId}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 700,
                color: "#ede9fe",
                lineHeight: 1.2,
                marginBottom: 16,
                letterSpacing: "-0.5px",
              }}
            >
              {dateStr}
            </div>

            {/* Stats summary */}
            <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "14px 22px",
                  borderRadius: 16,
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  minWidth: 90,
                }}
              >
              <span
                  style={{ display: "flex", fontSize: 32, fontWeight: 800, color: "#c4b5fd" }}
                >
                  {players.length}
                </span>
                <span
                  style={{
                    display: "flex",
                    fontSize: 13,
                    color: "rgba(196,181,253,0.6)",
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  Players
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "14px 22px",
                  borderRadius: 16,
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  minWidth: 90,
                }}
              >
                <span
                  style={{ display: "flex", fontSize: 32, fontWeight: 800, color: "#c4b5fd" }}
                >
                  {games.length}
                </span>
                <span
                  style={{
                    display: "flex",
                    fontSize: 13,
                    color: "rgba(196,181,253,0.6)",
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  Games
                </span>
              </div>
            </div>
          </div>

          {/* Right: player leaderboard */}
          {playerStats.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                justifyContent: "center",
                gap: 10,
              }}
            >
              {playerStats.map((player, idx) => (
                <div
                  key={player.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 20px",
                    borderRadius: 14,
                    background:
                      idx === 0
                        ? "linear-gradient(135deg, rgba(109,40,217,0.4), rgba(139,92,246,0.25))"
                        : "rgba(255,255,255,0.06)",
                    border:
                      idx === 0
                        ? "1px solid rgba(139,92,246,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                    gap: 14,
                  }}
                >
                  {/* Rank */}
                  <span
                    style={{
                      display: "flex",
                      fontSize: idx === 0 ? 22 : 18,
                      width: 28,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                  </span>

                  {/* Name */}
                  <span
                    style={{
                      display: "flex",
                      flex: 1,
                      fontSize: 19,
                      fontWeight: idx === 0 ? 700 : 500,
                      color: idx === 0 ? "#e9d5ff" : "#d8b4fe",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {player.nickname}
                  </span>

                  {/* Wins */}
                  <span
                    style={{
                      display: "flex",
                      fontSize: 17,
                      fontWeight: 700,
                      color: idx === 0 ? "#c4b5fd" : "rgba(196,181,253,0.55)",
                    }}
                  >
                    {player.wins} W
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
