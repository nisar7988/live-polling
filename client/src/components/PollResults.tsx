import React, { useState } from "react";
import type { PollResult, LeaderboardEntry } from "../api/pollService";
import { Leaderboard } from "./Leaderboard";

interface PollResultsProps {
  totalVotes: number;
  results: PollResult[];
  resetPoll: () => void;
  correctAnswerMarked: boolean;
  correctAnswer: string | null;
  leaderboard: LeaderboardEntry[];
  markCorrectAnswer: (answer: string) => Promise<void>;
  explanation: string | null;
  onNextQuestion?: () => Promise<void>;
}

export const PollResults: React.FC<PollResultsProps> = ({
  totalVotes,
  results,
  resetPoll,
  correctAnswerMarked,
  correctAnswer,
  leaderboard,
  markCorrectAnswer,
  explanation,
  onNextQuestion,
}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const styles: Record<string, any> = {
    wrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#080820",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      padding: "20px",
    },
    card: {
      position: "relative" as const,
      width: "100%",
      maxWidth: 680,
      borderRadius: 20,
      overflow: "hidden",
      background:
        "linear-gradient(160deg, #0d0d2b 0%, #0a0a22 60%, #080820 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
      padding: "40px",
      maxHeight: "90vh",
      overflowY: "auto" as const,
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
    resultItem: (isCorrect: boolean) => ({
      background: isCorrect
        ? "rgba(76, 175, 80, 0.1)"
        : "rgba(255,255,255,0.05)",
      border: isCorrect
        ? "1px solid rgba(76, 175, 80, 0.4)"
        : "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      padding: "16px 20px",
      marginBottom: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative" as const,
      overflow: "hidden" as const,
    }),
    resultBar: (percentage: string, isCorrect: boolean) => ({
      position: "absolute" as const,
      top: 0,
      left: 0,
      height: "100%",
      width: `${percentage}%`,
      background: isCorrect
        ? "rgba(76, 175, 80, 0.2)"
        : "rgba(91, 142, 255, 0.2)",
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
    optionInfo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    optionLabel: {
      color: "white",
      fontSize: "18px",
      fontWeight: 700,
    },
    correctBadge: {
      background: "#4CAF50",
      color: "white",
      padding: "2px 8px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: 800,
    },
    actionArea: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    optionStats: {
      color: "rgba(255,255,255,0.8)",
      fontSize: "16px",
      fontWeight: 600,
    },
    markButton: {
      background: "transparent",
      color: "#4CAF50",
      border: "1px solid #4CAF50",
      borderRadius: "6px",
      padding: "6px 12px",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    buttonContainer: {
      display: "flex",
      gap: "15px",
      marginTop: "30px",
    },
    button: {
      flex: 1,
      background: "#3b6ef5",
      color: "white",
      border: "none",
      borderRadius: 14,
      padding: "14px 20px",
      fontSize: 16,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(59, 110, 245, 0.4)",
      transition: "background 0.2s",
    },
    secondaryButton: {
      flex: 1,
      background: "rgba(255,255,255,0.1)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 14,
      padding: "14px 20px",
      fontSize: 16,
      fontWeight: 800,
      cursor: "pointer",
      transition: "background 0.2s",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.title}>Poll Results</div>
        <div style={styles.subtitle}>Total Votes: {totalVotes}</div>

        {results.map((result) => {
          const isCorrect = correctAnswer === result.option;

          return (
            <div key={result.option} style={styles.resultItem(isCorrect)}>
              <div style={styles.resultBar(result.percentage, isCorrect)} />
              <div style={styles.resultContent}>
                <div style={styles.optionInfo}>
                  <span style={styles.optionLabel}>Option {result.option}</span>
                  {isCorrect && (
                    <span style={styles.correctBadge}>CORRECT</span>
                  )}
                </div>
                <div style={styles.actionArea}>
                  <span style={styles.optionStats}>
                    {result.votes} votes ({result.percentage}%)
                  </span>
                  {!correctAnswerMarked && (
                    <button
                      style={styles.markButton}
                      onClick={() => markCorrectAnswer(result.option)}
                    >
                      Mark Correct
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {explanation && <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "rgba(16,185,129,.12)", color: "#d1fae5", lineHeight: 1.5 }}><strong>Why this answer is correct</strong><br />{explanation}</div>}

        <div style={styles.buttonContainer}>
          <button style={styles.button} onClick={resetPoll}>
            Start New Poll
          </button>
          <button
            style={styles.secondaryButton}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            {showLeaderboard ? "Hide Leaderboard" : "View Leaderboard"}
          </button>
          {onNextQuestion && correctAnswerMarked && <button style={styles.button} onClick={onNextQuestion}>Next Question</button>}
        </div>

        {showLeaderboard && <Leaderboard data={leaderboard} />}
      </div>
    </div>
  );
};
