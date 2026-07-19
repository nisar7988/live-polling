import React from "react";
import type { LeaderboardEntry } from "../api/pollService";
import type { PastPoll } from "../api/pollService";
import { Leaderboard } from "./Leaderboard";

interface SessionOverviewProps {
  leaderboard: LeaderboardEntry[];
  history: PastPoll[];
  onBack: () => void;
  onReset: () => void;
  onGenerateSummary: () => Promise<{ metrics: Record<string, unknown>; summary: string }>;
}

export const SessionOverview: React.FC<SessionOverviewProps> = ({
  leaderboard,
  history,
  onBack,
  onReset,
  onGenerateSummary,
}) => {
  const [summary, setSummary] = React.useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = React.useState(false);
  const handleGenerateSummary = async () => {
    setLoadingSummary(true);
    try {
      const data = await onGenerateSummary();
      setSummary(data.summary);
    } finally {
      setLoadingSummary(false);
    }
  };
  const styles: Record<string, React.CSSProperties> = {
    wrapper: {
      padding: "40px 20px",
      minHeight: "100vh",
      background: "#080820",
      color: "white",
      fontFamily: "'Nunito', sans-serif",
    },
    container: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "40px",
    },
    title: {
      fontSize: "32px",
      fontWeight: 800,
      margin: 0,
    },
    btnGroup: {
      display: "flex",
      gap: "12px",
    },
    btn: {
      padding: "10px 20px",
      borderRadius: "12px",
      border: "none",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.2s",
    },
    backBtn: {
      background: "rgba(255,255,255,0.1)",
      color: "white",
    },
    resetBtn: {
      background: "#ef4444",
      color: "white",
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: 700,
      color: "rgba(255,255,255,0.6)",
      marginBottom: "20px",
      marginTop: "40px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    historyList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    pollCard: {
      background: "rgba(255,255,255,0.05)",
      borderRadius: "16px",
      padding: "20px",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    pollQuestion: {
      fontSize: "18px",
      fontWeight: 700,
      marginBottom: "12px",
    },
    pollMeta: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.4)",
    },
    correctBadge: {
      background: "rgba(16, 185, 129, 0.2)",
      color: "#10b981",
      padding: "4px 10px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 700,
      marginLeft: "10px",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Session Summary</h1>
          <div style={styles.btnGroup}>
            <button
              style={{ ...styles.btn, ...styles.backBtn }}
              onClick={onBack}
            >
              Back to Poll
            </button>
            <button
              style={{ ...styles.btn, ...styles.resetBtn }}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure? This will wipe the entire session history and leaderboard scores!",
                  )
                ) {
                  onReset();
                }
              }}
            >
              End Session
            </button>
            <button style={{ ...styles.btn, background: "#3b6ef5", color: "white" }} onClick={handleGenerateSummary} disabled={loadingSummary || history.length === 0}>
              {loadingSummary ? "Generating…" : "AI Summary"}
            </button>
          </div>
        </div>

        <Leaderboard data={leaderboard} />
        {summary && <section style={{ marginTop: 24, padding: 20, borderRadius: 16, background: "rgba(59,110,245,.14)", lineHeight: 1.6 }}><strong>AI Session Feedback</strong><p style={{ marginBottom: 0 }}>{summary}</p></section>}

        <h2 style={styles.sectionTitle}>Poll History ({history.length})</h2>
        <div style={styles.historyList}>
          {history.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)" }}>
              No polls run in this session yet.
            </p>
          ) : (
            history
              .slice()
              .reverse()
              .map((poll, i) => (
                <div key={i} style={styles.pollCard}>
                  <div style={styles.pollQuestion}>
                    {poll.question || "Live Poll"}
                    {poll.correctAnswer && (
                      <span style={styles.correctBadge}>
                        Answer: {poll.correctAnswer}
                      </span>
                    )}
                  </div>
                  <div style={styles.pollMeta}>
                    {new Date(poll.timestamp).toLocaleTimeString()} •{" "}
                    {Object.values(poll.votes).reduce((a, b) => a + b, 0)} votes
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
