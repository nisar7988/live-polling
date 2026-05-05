import React from "react";
import type { PollResult } from "../hooks/usePoll";

interface PollResultsProps {
  totalVotes: number;
  results: PollResult[];
  resetPoll: () => void;
}

export const PollResults: React.FC<PollResultsProps> = ({ totalVotes, results, resetPoll }) => {
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
      background: "linear-gradient(160deg, #0d0d2b 0%, #0a0a22 60%, #080820 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
      padding: "40px",
    },
    title: {
      color: "white",
      fontSize: "28px",
      fontWeight: 800,
      marginBottom: "10px",
      textAlign: "center" as const,
    },
    subtitle: {
      color: "rgba(255,255,255,0.6)",
      fontSize: "16px",
      textAlign: "center" as const,
      marginBottom: "30px",
    },
    resultItem: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      padding: "16px 20px",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative" as const,
      overflow: "hidden" as const,
    },
    resultBar: (percentage: string) => ({
      position: "absolute" as const,
      top: 0,
      left: 0,
      height: "100%",
      width: `${percentage}%`,
      background: "rgba(91, 142, 255, 0.2)",
      zIndex: 0,
      transition: "width 1s ease-in-out",
    }),
    resultContent: {
      position: "relative" as const,
      zIndex: 1,
      display: "flex",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
    },
    optionLabel: {
      color: "white",
      fontSize: "18px",
      fontWeight: 700,
    },
    optionStats: {
      color: "rgba(255,255,255,0.8)",
      fontSize: "16px",
      fontWeight: 600,
    },
    button: {
      background: '#3b6ef5',
      color: 'white',
      border: 'none',
      borderRadius: 14,
      padding: '14px 40px',
      fontSize: 18,
      fontWeight: 800,
      cursor: 'pointer',
      width: '100%',
      marginTop: '30px',
      boxShadow: '0 4px 12px rgba(59, 110, 245, 0.4)'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.title}>Poll Results</div>
        <div style={styles.subtitle}>Total Votes: {totalVotes}</div>
        
        {results.map((result) => (
          <div key={result.option} style={styles.resultItem}>
            <div style={styles.resultBar(result.percentage)} />
            <div style={styles.resultContent}>
              <span style={styles.optionLabel}>Option {result.option}</span>
              <span style={styles.optionStats}>{result.votes} votes ({result.percentage}%)</span>
            </div>
          </div>
        ))}
        
        <button style={styles.button} onClick={resetPoll}>Start New Poll</button>
      </div>
    </div>
  );
};
