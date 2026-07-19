import { useCallback, useEffect, useState } from "react";
import { pollService, type PollStatusResponse } from "../api/pollService";

export function ObsOverlay() {
  const [status, setStatus] = useState<PollStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const nextStatus = await pollService.getStatus();
      setStatus(nextStatus);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Overlay cannot reach the server.");
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 2000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  if (error) return <div style={{ color: "#fecaca", fontFamily: "sans-serif" }}>{error}</div>;
  if (!status?.active) return null;

  const labels = status.quizQuestion?.options || {};
  return (
    <main style={{ width: "min(900px, 94vw)", margin: "6vh auto", color: "white", fontFamily: "Nunito, Segoe UI, sans-serif", textShadow: "0 2px 10px rgba(0,0,0,.75)" }}>
      <section style={{ padding: "28px 32px", borderRadius: 24, background: "linear-gradient(135deg, rgba(8,8,32,.92), rgba(20,30,85,.88))", border: "1px solid rgba(255,255,255,.28)", boxShadow: "0 14px 42px rgba(0,0,0,.4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "center" }}>
          <span style={{ color: "#93c5fd", fontWeight: 800, letterSpacing: 1.2 }}>LIVEQUIZ AI</span>
          <span style={{ fontSize: 32, fontWeight: 900, color: "#fde68a" }}>{Math.ceil(status.timeLeft / 1000)}s</span>
        </div>
        <h1 style={{ margin: "18px 0 22px", fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.12 }}>{status.question}</h1>
        <div style={{ display: "grid", gap: 12 }}>
          {status.liveResults.map((result) => (
            <div key={result.option} style={{ position: "relative", overflow: "hidden", borderRadius: 12, padding: "14px 18px", background: "rgba(255,255,255,.13)" }}>
              <div style={{ position: "absolute", inset: 0, width: `${result.percentage}%`, background: "linear-gradient(90deg, rgba(59,110,245,.9), rgba(16,185,129,.75))", transition: "width .5s ease" }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 20, fontWeight: 800 }}>
                <span>{result.option}. {labels[result.option] || ""}</span><span>{result.votes} votes · {result.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "20px 0 0", opacity: .82, fontWeight: 700 }}>Vote A, B, C, or D in YouTube chat · {status.totalVotes} total votes</p>
      </section>
    </main>
  );
}
