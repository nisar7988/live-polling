import { useState, useEffect, useCallback } from "react";
import type {
  PollResult,
  LeaderboardEntry,
  PastPoll,
} from "../api/pollService";
import { pollService } from "../api/pollService";

export const usePoll = () => {
  const [question, setQuestion] = useState("");
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<PollResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [correctAnswerMarked, setCorrectAnswerMarked] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pollHistory, setPollHistory] = useState<PastPoll[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<import("../api/pollService").QuizState | null>(null);

  const fetchSessionSummary = useCallback(async () => {
    try {
      const data = await pollService.getSessionSummary();
      setLeaderboard(data.leaderboard || []);
      setPollHistory(data.pollHistory || []);
    } catch (error) {
      console.error("Error fetching session summary:", error);
    }
  }, []);

  const startPoll = async (options: string[], duration: number = 30000) => {
    if (options.length < 2) return;
    setError(null);
    try {
      await pollService.startPoll(question || "Live Poll", options, duration);
      setActive(true);
      setTimeLeft(duration);
      setResults([]);
      setTotalVotes(0);
      setCorrectAnswerMarked(false);
      setCorrectAnswer(null);
      setExplanation(null);
    } catch (err: any) {
      console.error("Error starting poll:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  const resetPoll = async () => {
    try {
      await pollService.resetPoll();
      setActive(false);
      setResults([]);
      setTimeLeft(0);
      setTotalVotes(0);
      setError(null);
      setCorrectAnswerMarked(false);
      setCorrectAnswer(null);
      setExplanation(null);
    } catch (err: any) {
      console.error("Error resetting poll:", err);
      setError(err.message || "Failed to reset poll");
    }
  };

  const resetSession = async () => {
    try {
      await pollService.resetSession();
      setLeaderboard([]);
      setPollHistory([]);
      await resetPoll();
    } catch (err: any) {
      console.error("Error resetting session:", err);
      setError("Failed to reset session");
    }
  };

  const stopPoll = async () => {
    try {
      await pollService.stopPoll();
      await fetchResults();
    } catch (err: any) {
      console.error("Error stopping poll:", err);
      setError(err.message || "Failed to stop poll");
    }
  };

  const fetchStatus = async () => {
    try {
      const data = await pollService.getStatus();
      setActive(data.active);
      setTimeLeft(data.timeLeft);
      if (data.viewerCount !== undefined) {
        setViewerCount(data.viewerCount);
      }
      setCorrectAnswerMarked(data.correctAnswerMarked || false);
      setCorrectAnswer(data.correctAnswer || null);
      if (data.question) setQuestion(data.question);

      if (data.error) {
        setError(data.error);
        setActive(false);
        setTimeLeft(0);
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const fetchResults = async () => {
    try {
      const data = await pollService.getPollResults();
      setResults(data.results);
      setTotalVotes(data.totalVotes);
      setCorrectAnswerMarked(data.correctAnswerMarked || false);
      setCorrectAnswer(data.correctAnswer || null);
      setQuestion(data.question || "");
      setActive(false);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const markCorrectAnswer = async (answer: string) => {
    try {
      const data = await pollService.markCorrectAnswer(answer);
      setCorrectAnswerMarked(true);
      setCorrectAnswer(data.correctAnswer);
      setExplanation(data.explanation);
      // Refresh session data after marking correct answer
      await fetchSessionSummary();
    } catch (error: any) {
      console.error("Error marking correct answer:", error);
      setError(error.message || "Failed to mark answer");
    }
  };

  const generateQuiz = async (topic: string, difficulty: string, questionCount: number) => {
    setError(null);
    try {
      const data = await pollService.generateQuiz(topic, difficulty, questionCount);
      setQuiz(data.quiz);
      return data.quiz;
    } catch (err: any) {
      setError(err.message || "Failed to generate quiz");
      throw err;
    }
  };

  const startNextQuestion = async (duration: number) => {
    setError(null);
    try {
      const data = await pollService.nextQuestion(duration);
      setQuestion(data.question.question);
      setActive(true);
      setTimeLeft(duration);
      setResults([]);
      setTotalVotes(0);
      setCorrectAnswerMarked(false);
      setCorrectAnswer(null);
      setExplanation(null);
      setQuiz((current) => current ? { ...current, currentIndex: data.currentIndex } : current);
    } catch (err: any) {
      setError(err.message || "Failed to start quiz question");
      throw err;
    }
  };

  const generateSessionSummary = async () => {
    try {
      return await pollService.getAiSessionSummary();
    } catch (err: any) {
      setError(err.message || "Failed to generate session summary");
      throw err;
    }
  };

  useEffect(() => {
    if (!active) return;

    const interval = window.setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1000, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (active && timeLeft <= 0) {
      fetchResults();
    }
  }, [active, timeLeft]);

  useEffect(() => {
    const statusInterval = setInterval(fetchStatus, 2000);
    // Fetch summary on mount
    fetchSessionSummary();
    return () => {
      clearInterval(statusInterval);
    };
  }, [fetchSessionSummary]);

  return {
    question,
    setQuestion,
    active,
    timeLeft,
    results,
    totalVotes,
    error,
    viewerCount,
    correctAnswerMarked,
    correctAnswer,
    leaderboard,
    pollHistory,
    explanation,
    quiz,
    startPoll,
    resetPoll,
    resetSession,
    stopPoll,
    markCorrectAnswer,
    generateQuiz,
    startNextQuestion,
    generateSessionSummary,
    fetchSessionSummary,
  };
};
