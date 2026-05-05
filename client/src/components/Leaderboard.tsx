import React from 'react';
import type { LeaderboardEntry } from '../hooks/usePoll';

interface LeaderboardProps {
  data: LeaderboardEntry[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  const styles = {
    wrapper: {
      marginTop: "30px",
      padding: "20px",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.05)",
    },
    title: {
      color: "white",
      fontSize: "22px",
      fontWeight: 800,
      marginBottom: "20px",
      textAlign: "center" as const,
    },
    emptyState: {
      color: "rgba(255,255,255,0.5)",
      textAlign: "center" as const,
      fontStyle: "italic",
    },
    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "10px",
      marginBottom: "8px",
      transition: "transform 0.2s ease, background 0.2s ease",
    },
    rankBadge: (rank: number) => ({
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      background: rank === 1 ? "linear-gradient(135deg, #FFD700 0%, #FDB931 100%)" :
                  rank === 2 ? "linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)" :
                  rank === 3 ? "linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)" :
                  "rgba(255,255,255,0.1)",
      color: rank <= 3 ? "#000" : "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: "14px",
      marginRight: "15px",
    }),
    userInfo: {
      display: "flex",
      alignItems: "center",
      flex: 1,
    },
    userName: {
      color: "white",
      fontSize: "16px",
      fontWeight: 600,
    },
    scoreInfo: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    scoreBadge: {
      background: "rgba(76, 175, 80, 0.2)",
      color: "#4CAF50",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: 700,
    },
    totalBadge: {
      color: "rgba(255,255,255,0.6)",
      fontSize: "14px",
    }
  };

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>🏆 Leaderboard</h3>
      
      {data.length === 0 ? (
        <div style={styles.emptyState}>No data available yet</div>
      ) : (
        data.map((entry, index) => (
          <div key={index} style={styles.row}>
            <div style={styles.userInfo}>
              <div style={styles.rankBadge(index + 1)}>{index + 1}</div>
              <span style={styles.userName}>{entry.userName}</span>
            </div>
            <div style={styles.scoreInfo}>
              <span style={styles.scoreBadge}>{entry.correct} Correct</span>
              <span style={styles.totalBadge}>{entry.total} Total</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
