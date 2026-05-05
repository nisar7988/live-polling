import { useState, useEffect } from "react";
import {
  startPollAPI,
  fetchPollStatusAPI,
  fetchPollResultsAPI,
} from "../api/pollService";

export interface PollResult {
  option: string;
  votes: number;
  percentage: string;
}

export const usePoll = () => {
  const [question, setQuestion] = useState("");
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<PollResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState(0);

  const startPoll = async (options: string[], duration: number = 30000) => {
    if (options.length < 2) return;
    setError(null);
    try {
      await startPollAPI(question || "Live Poll", options, duration);
      setActive(true);
      setTimeLeft(duration);
      setResults([]);
      setTotalVotes(0);
    } catch (err: any) {
      console.error("Error starting poll:", err);
      setError(err.message || "An unexpected error occurred");
    }
  };

  const resetPoll = () => {
    setActive(false);
    setResults([]);
    setTimeLeft(0);
    setTotalVotes(0);
    setError(null);
  };

  const fetchStatus = async () => {
    try {
      const data = await fetchPollStatusAPI();
      setActive(data.active);
      setTimeLeft(data.timeLeft);
      if (data.viewerCount !== undefined) {
        setViewerCount(data.viewerCount);
      }
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
      const data = await fetchPollResultsAPI();
      setResults(data.results);
      setTotalVotes(data.totalVotes);
      setActive(false);
    } catch (error) {
      console.error("Error fetching results:", error);
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
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return {
    question,
    setQuestion,
    active,
    timeLeft,
    results,
    totalVotes,
    error,
    viewerCount,
    startPoll,
    resetPoll,
  };
};
