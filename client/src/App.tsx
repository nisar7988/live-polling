import { useState } from "react";
import { usePoll } from "./hooks/usePoll";
import { useAuth } from "./hooks/useAuth";
import { ActivePoll } from "./components/ActivePoll";
import { PollResults } from "./components/PollResults";
import { SessionOverview } from "./components/SessionOverview";
import { AiQuizGenerator } from "./components/AiQuizGenerator";

function App() {
  const {
    question,
    active,
    timeLeft,
    results,
    totalVotes,
    error: pollError,
    correctAnswerMarked,
    correctAnswer,
    leaderboard,
    pollHistory,
    resetPoll,
    resetSession,
    stopPoll,
    markCorrectAnswer,
    explanation,
    quiz,
    generateQuiz,
    startNextQuestion,
    generateSessionSummary,
  } = usePoll();

  const { isAuthenticated, loading, login } = useAuth();
  const [showSessionOverview, setShowSessionOverview] = useState(false);

  const styles: Record<string, any> = {
    wrapper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#080820",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      padding: 20,
    },
    loginCard: {
      width: "100%",
      maxWidth: 440,
      background: "linear-gradient(160deg, #0d0d2b 0%, #0a0a22 60%, #080820 100%)",
      borderRadius: 24,
      padding: "48px 32px",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      textAlign: "center",
    },
    iconContainer: {
      width: 80,
      height: 80,
      background: "#ef4444",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
      boxShadow: "0 12px 24px rgba(239, 68, 68, 0.2)",
    },
    title: {
      color: "white",
      fontSize: 32,
      fontWeight: 800,
      marginBottom: 12,
      letterSpacing: -0.5,
    },
    description: {
      color: "rgba(255,255,255,0.6)",
      fontSize: 16,
      lineHeight: 1.6,
      marginBottom: 40,
    },
    loginBtn: {
      width: "100%",
      padding: "16px 24px",
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: 16,
      fontSize: 18,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      transition: "all 0.2s ease",
      boxShadow: "0 8px 16px rgba(239, 68, 68, 0.2)",
    },
    footerText: {
      marginTop: 32,
      color: "rgba(255,255,255,0.3)",
      fontSize: 12,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    loadingSpinner: {
      width: 48,
      height: 48,
      border: "3px solid rgba(59, 110, 245, 0.1)",
      borderTop: "3px solid #3b6ef5",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
    },
    sessionBtn: {
      position: "fixed",
      top: 20,
      right: 20,
      padding: "10px 18px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      color: "white",
      fontWeight: 600,
      fontSize: 14,
      cursor: "pointer",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      gap: 8,
      transition: "background 0.2s",
    }
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingSpinner} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.wrapper}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800&display=swap" rel="stylesheet" />
        <div style={styles.loginCard}>
          <div style={styles.iconContainer}>
            <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <h1 style={styles.title}>YouTube Live Poll</h1>
          <p style={styles.description}>
            Connect your channel to start real-time polling in your live chat.
          </p>

          <button
            style={styles.loginBtn}
            onClick={login}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "#ff5252";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#ef4444";
            }}
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.16 5.44-7.84 5.44-4.88 0-8.88-4.04-8.88-9s4-9 8.88-9c2.8 0 4.64 1.16 5.72 2.2l2.6-2.52C18.6 1.48 15.8 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.2 0 12-5.08 12-12.2 0-.84-.08-1.48-.2-2.2h-11.8z" />
            </svg>
            Login with YouTube
          </button>

          <p style={styles.footerText}>Safe & Secure Authentication</p>
        </div>
      </div>
    );
  }

  if (showSessionOverview) {
    return (
      <SessionOverview 
        leaderboard={leaderboard} 
        history={pollHistory}
        onBack={() => setShowSessionOverview(false)}
        onGenerateSummary={generateSessionSummary}
        onReset={async () => {
          await resetSession();
          setShowSessionOverview(false);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080820", position: "relative" }}>
      {/* Session Summary Floating Button */}
      {!active && (
        <button 
          style={styles.sessionBtn}
          onClick={() => setShowSessionOverview(true)}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        >
          📊 Session History ({pollHistory.length})
        </button>
      )}

      {!active && results.length === 0 && (
        <AiQuizGenerator error={pollError} quiz={quiz} generateQuiz={generateQuiz} startNextQuestion={startNextQuestion} />
      )}

      {active && (
        <ActivePoll
          question={question}
          timeLeft={timeLeft}
          stopPoll={stopPoll}
        />
      )}

      {!active && results.length > 0 && (
        <PollResults
          totalVotes={totalVotes}
          results={results}
          resetPoll={resetPoll}
          correctAnswerMarked={correctAnswerMarked}
          correctAnswer={correctAnswer}
          leaderboard={leaderboard}
          markCorrectAnswer={markCorrectAnswer}
          explanation={explanation}
          onNextQuestion={quiz && quiz.questions[quiz.currentIndex + 1] ? () => startNextQuestion(30000) : undefined}
        />
      )}
    </div>
  );
}

export default App;
