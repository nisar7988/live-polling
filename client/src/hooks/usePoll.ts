import { useState, useEffect } from "react";
import { startPollAPI, fetchPollStatusAPI, fetchPollResultsAPI } from "../api/pollService";

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

  const startPoll = async () => {
    if (!question.trim()) return;
    try {
      await startPollAPI(question);
      setActive(true);
      setTimeLeft(30000);
      setResults([]);
      setTotalVotes(0);
    } catch (error) {
      console.error("Error starting poll:", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const data = await fetchPollStatusAPI();
      setActive(data.active);
      setTimeLeft(data.timeLeft);
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
    startPoll,
  };
};
