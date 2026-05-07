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
      setActive(false);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const markCorrectAnswer = async (answer: string) => {
    try {
      await pollService.markCorrectAnswer(answer);
      setCorrectAnswerMarked(true);
      setCorrectAnswer(answer);
      // Refresh session data after marking correct answer
      await fetchSessionSummary();
    } catch (error: any) {
      console.error("Error marking correct answer:", error);
      setError(error.message || "Failed to mark answer");
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
    startPoll,
    resetPoll,
    resetSession,
    stopPoll,
    markCorrectAnswer,
    fetchSessionSummary,
  };
};
