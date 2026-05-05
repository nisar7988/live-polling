import { useState, useEffect, useRef } from "react";

const POLL_TYPES = [
  { id: "single", label: "Single\nChoice" },
  { id: "multiple", label: "Multiple\nChoice" },
  { id: "integer", label: "Integer\nType" },
  { id: "vote", label: "Vote\nType" },
];

const TIME_OPTIONS = [
  { id: "30", label: "30 sec" },
  { id: "45", label: "45 sec" },
  { id: "60", label: "60 sec" },
  { id: "90", label: "90 sec" },
  { id: "120", label: "120 sec" },
  { id: "150", label: "150 sec" },
  { id: "timeless", label: "Timeless Poll" },
];

function Avatar({ color }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: color,
        border: "2px solid #1a1a3e",
        marginLeft: -8,
        flexShrink: 0,
      }}
    />
  );
}

export default function CreatePoll({ startPoll, error, viewerCount }: any) {
  const [pollType, setPollType] = useState("single");
  const [timeOption, setTimeOption] = useState("30");

  const handleStart = () => {
    const duration = timeOption === "timeless" ? 0 : parseInt(timeOption) * 1000;
    startPoll(["A", "B", "C", "D"], duration);
  };

  const styles = {
    wrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#080820",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    },
    card: {
      position: "relative",
      width: "100%",
      maxWidth: 680,
      borderRadius: 20,
      overflow: "hidden",
      background:
        "linear-gradient(160deg, #0d0d2b 0%, #0a0a22 60%, #080820 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
    },
    inner: {
      position: "relative",
      zIndex: 1,
      padding: "16px 16px 20px",
    },

    // Header
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    restartBtn: {
      background: "white",
      color: "#111",
      border: "none",
      borderRadius: 12,
      padding: "8px 20px",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      letterSpacing: 0.2,
    },
    title: {
      color: "white",
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: 0.3,
      margin: 0,
    },
    headerIcons: {
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      border: "2px solid rgba(255,255,255,0.3)",
      background: "rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    },
    trophyIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      border: "2px solid rgba(255,255,255,0.3)",
      background: "rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexDirection: "column",
      gap: 0,
    },

    // Poll type tabs
    tabRow: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 10,
      marginBottom: 14,
    },
    tab: (active) => ({
      background: active ? "#3b6ef5" : "rgba(255,255,255,0.08)",
      border: active
        ? "2px solid rgba(255,255,255,0.2)"
        : "2px solid rgba(255,255,255,0.1)",
      borderRadius: 14,
      padding: "14px 10px",
      color: "white",
      fontWeight: 700,
      fontSize: 15,
      cursor: "pointer",
      textAlign: "center",
      lineHeight: 1.3,
      whiteSpace: "pre-line",
      transition: "background 0.18s, border 0.18s",
      letterSpacing: 0.1,
    }),

    // Settings panel
    panel: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14,
      padding: "18px 22px 20px",
      marginBottom: 16,
    },
    panelTitle: {
      color: "white",
      fontWeight: 700,
      fontSize: 16,
      textAlign: "center",
      marginBottom: 18,
      letterSpacing: 0.2,
    },
    radioGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      rowGap: 14,
      columnGap: 8,
    },
    radioItem: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
    },
    radioOuter: (checked) => ({
      width: 22,
      height: 22,
      borderRadius: "50%",
      border: checked
        ? "2.5px solid #5b8eff"
        : "2.5px solid rgba(255,255,255,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "border-color 0.15s",
      background: "transparent",
    }),
    radioDot: (checked) => ({
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: checked ? "#5b8eff" : "transparent",
      transition: "background 0.15s",
    }),
    radioLabel: {
      color: "white",
      fontSize: 15,
      fontWeight: 500,
    },
    timelessRow: {
      gridColumn: "1 / -1",
    },

    // Footer
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    avatarGroup: {
      display: "flex",
      alignItems: "center",
    },
    footerText: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 15,
      fontWeight: 600,
    },
    sparkle: {
      color: "rgba(255,255,255,0.6)",
      fontSize: 20,
      marginLeft: 6,
    },

    moveIcon: {
      width: 30,
      height: 30,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "grab",
    },
  };

  const normalOptions = TIME_OPTIONS.filter((t) => t.id !== "timeless");
  const timelessOption = TIME_OPTIONS.find((t) => t.id === "timeless");

  return (
    <div>
      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800&display=swap"
        rel="stylesheet"
      />
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.inner}>
            {/* Header */}
            <div style={styles.header}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={styles.moveIcon}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path
                      d="M11 2v18M2 11h18"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 5l3-3 3 3M8 17l3 3 3-3M5 8l-3 3 3 3M17 8l3 3-3 3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <p style={styles.title}>Select Poll Type</p>

              <div style={styles.headerIcons}>
                <div style={styles.trophyIcon}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 13c-3.5 0-6-2.5-6-6V3h12v4c0 3.5-2.5 6-6 6z"
                      fill="white"
                      opacity="0.9"
                    />
                    <path
                      d="M4 5H2c0 2.5 1.5 4 4 4.5M16 5h2c0 2.5-1.5 4-4 4.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 13v2M13 13v2M5 17h10"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ display: "flex", gap: 2, marginTop: 1 }}>
                    {["2", "1", "3"].map((n) => (
                      <span
                        key={n}
                        style={{ color: "white", fontSize: 8, fontWeight: 800 }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={styles.iconBtn}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div style={styles.iconBtn}>
                  <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
                    <path
                      d="M1 2h14"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Poll Type Tabs */}
            <div style={styles.tabRow}>
              {POLL_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  style={{
                    ...styles.tab(pollType === pt.id),
                    opacity: pt.id === "single" ? 1 : 0.4,
                    cursor: pt.id === "single" ? "pointer" : "not-allowed"
                  }}
                  onClick={() => {
                    if (pt.id === "single") setPollType(pt.id);
                  }}
                  disabled={pt.id !== "single"}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            {/* Settings Panel */}
            <div style={styles.panel}>
              <p style={styles.panelTitle}>
                Type A, B, C or D in the chat to answer
              </p>

              <div style={styles.radioGrid}>
                {normalOptions.map((opt) => (
                  <label
                    key={opt.id}
                    style={styles.radioItem}
                    onClick={() => setTimeOption(opt.id)}
                  >
                    <div style={styles.radioOuter(timeOption === opt.id)}>
                      <div style={styles.radioDot(timeOption === opt.id)} />
                    </div>
                    <span style={styles.radioLabel}>{opt.label}</span>
                  </label>
                ))}
                <label
                  key={timelessOption.id}
                  style={{ ...styles.radioItem, ...styles.timelessRow }}
                  onClick={() => setTimeOption(timelessOption.id)}
                >
                  <div
                    style={styles.radioOuter(timeOption === timelessOption.id)}
                  >
                    <div
                      style={styles.radioDot(timeOption === timelessOption.id)}
                    />
                  </div>
                  <span style={styles.radioLabel}>{timelessOption.label}</span>
                </label>
              </div>
            </div>

            {/* Start Button & Error */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              {error && <div style={{ color: '#ff6b6b', fontSize: 14 }}>{error}</div>}
              <button 
                onClick={handleStart}
                style={{
                  background: '#3b6ef5',
                  color: 'white',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px 40px',
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(59, 110, 245, 0.4)'
                }}
              >
                Start Poll
              </button>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <div style={styles.avatarGroup}>
                <Avatar color="#e07b3a" />
                <Avatar color="#c64a7a" />
                <Avatar color="#4a7bc6" />
              </div>
              <span style={styles.footerText}>
                {viewerCount > 0 ? `${viewerCount} students have joined` : "Waiting for students..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
