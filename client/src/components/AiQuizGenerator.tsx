import { useState } from "react";
import type { QuizState } from "../api/pollService";

interface AiQuizGeneratorProps {
  error: string | null;
  quiz: QuizState | null;
  generateQuiz: (topic: string, difficulty: string, questionCount: number) => Promise<QuizState>;
  startNextQuestion: (duration: number) => Promise<void>;
}

export function AiQuizGenerator({ error, quiz, generateQuiz, startNextQuestion }: AiQuizGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(5);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try { await generateQuiz(topic.trim(), difficulty, questionCount); } finally { setLoading(false); }
  };

  const canStart = Boolean(quiz?.questions[quiz.currentIndex + 1]);
  return (
    <section style={{ maxWidth: 680, margin: "0 auto", padding: 32, color: "white" }}>
      <h1 style={{ marginTop: 0 }}>LiveQuiz AI</h1>
      <p style={{ color: "rgba(255,255,255,.65)" }}>Generate a YouTube-ready quiz, then run each question as a live A–D poll.</p>
      <div style={{ display: "grid", gap: 14, background: "#101033", padding: 24, borderRadius: 16 }}>
        <input aria-label="Quiz topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Topic, e.g. React hooks" style={{ padding: 12, borderRadius: 8 }} />
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} style={{ padding: 12, borderRadius: 8 }}><option>Easy</option><option>Medium</option><option>Hard</option></select>
        <label>Questions: {questionCount}<input type="range" min="1" max="20" value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} style={{ width: "100%" }} /></label>
        <label>Vote duration: {duration}s<input type="range" min="15" max="120" step="15" value={duration} onChange={(event) => setDuration(Number(event.target.value))} style={{ width: "100%" }} /></label>
        <button onClick={generate} disabled={loading || !topic.trim()} style={{ padding: 14, borderRadius: 8, border: 0, background: "#3b6ef5", color: "white", fontWeight: 700 }}>{loading ? "Generating…" : "Generate AI Quiz"}</button>
        {quiz && <div style={{ color: "#a7f3d0" }}>Ready: {quiz.questions.length} {quiz.difficulty} questions about {quiz.topic}.</div>}
        {canStart && <button onClick={() => startNextQuestion(duration * 1000)} style={{ padding: 14, borderRadius: 8, border: 0, background: "#10b981", color: "#061b15", fontWeight: 800 }}>Start Question {quiz!.currentIndex + 2}</button>}
        {error && <div style={{ color: "#fca5a5" }}>{error}</div>}
      </div>
    </section>
  );
}
