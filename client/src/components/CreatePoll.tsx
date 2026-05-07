import { useState } from "react";

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

export default function CreatePoll({ startPoll, error, viewerCount, resetPoll, user, logout }: any) {
  const [pollType, setPollType] = useState("single");
  const [timeOption, setTimeOption] = useState("30");

  const handleStart = () => {
    const duration =
      timeOption === "timeless" ? 0 : parseInt(timeOption) * 1000;
    startPoll(["A", "B", "C", "D"], duration);
  };

  const styles: Record<string, any> = {
    wrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#080820",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      padding: 20,
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

    // User Profile Header
    userHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 16,
      marginBottom: 16,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: "2px solid #3b6ef5",
    },
    userName: {
      color: "white",
      fontWeight: 700,
      fontSize: 14,
    },
    userRole: {
      color: "#3b6ef5",
      fontSize: 12,
      fontWeight: 600,
      display: "block",
    },
    logoutBtn: {
      background: "rgba(255,255,255,0.05)",
      color: "rgba(255,255,255,0.6)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "6px 12px",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
    },

    // Header
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
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
            {/* User Profile Header */}
            {user && (
              <div style={styles.userHeader}>
                <div style={styles.userInfo}>
                  <img src={user.thumbnails?.default?.url} alt={user.title} style={styles.userAvatar} />
                  <div>
                    <span style={styles.userName}>{user.title}</span>
                    <span style={styles.userRole}>YouTube Channel</span>
                  </div>
                </div>
                <button 
                  style={styles.logoutBtn} 
                  onClick={logout}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,0,0,0.1)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  Logout
                </button>
              </div>
            )}

            {/* Header */}
            <div style={styles.header}>
              <p style={styles.title}>Select Poll Type</p>
              <button style={styles.restartBtn} onClick={resetPoll}>
                Reset All
              </button>
            </div>

            {/* Poll Type Tabs */}
            <div style={styles.tabRow}>
              {POLL_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  style={{
                    ...styles.tab(pollType === pt.id),
                    opacity: pt.id === "single" ? 1 : 0.4,
                    cursor: pt.id === "single" ? "pointer" : "not-allowed",
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {error && (
                <div style={{ color: "#ef4444", fontSize: 14, fontWeight: 600 }}>{error}</div>
              )}
              <button
                onClick={handleStart}
                style={{
                  background: "#3b6ef5",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 40px",
                  fontSize: 18,
                  fontWeight: 800,
                  cursor: "pointer",
                  width: "100%",
                  boxShadow: "0 4px 12px rgba(59, 110, 245, 0.4)",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                {viewerCount > 0
                  ? `${viewerCount} students have joined`
                  : "Waiting for students..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
