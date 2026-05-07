import React from "react";

interface ActivePollProps {
  question: string;
  timeLeft: number;
  stopPoll: () => void;
}

export const ActivePoll: React.FC<ActivePollProps> = ({ question, timeLeft, stopPoll }) => {
  const styles: Record<string, React.CSSProperties> = {
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
      background: "linear-gradient(160deg, #0d0d2b 0%, #0a0a22 60%, #080820 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
      padding: "50px 30px",
      textAlign: "center",
    },
    title: {
      color: "white",
      fontSize: "28px",
      fontWeight: 800,
      marginBottom: "20px",
    },
    time: {
      color: "#5b8eff",
      fontSize: "48px",
      fontWeight: 800,
      margin: "20px 0",
      textShadow: "0 0 20px rgba(91, 142, 255, 0.4)",
    },
    subtitle: {
      color: "rgba(255,255,255,0.6)",
      fontSize: "18px",
      fontWeight: 500,
    },
    stopBtn: {
      marginTop: "30px",
      background: "#ff4d4d",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "12px 30px",
      fontSize: "16px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(255, 77, 77, 0.3)",
      transition: "background 0.2s",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.title}>{question || "Live Poll"}</div>
        <div style={styles.subtitle}>Polling is running...</div>
        <div style={styles.time}>{Math.ceil(timeLeft / 1000)}s</div>
        <div style={styles.subtitle}>Waiting for responses</div>
        <button style={styles.stopBtn} onClick={stopPoll}>
          Stop Poll
        </button>
      </div>
    </div>
  );
};
