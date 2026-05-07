import { api } from './httpClient';

export interface PollStatusResponse {
  active: boolean;
  timeLeft: number;
  error: string | null;
  viewerCount: number;
  correctAnswerMarked: boolean;
  correctAnswer: string | null;
}

export interface PollResult {
  option: string;
  votes: number;
  percentage: string | number;
}

export interface PollResultsResponse {
  results: PollResult[];
  totalVotes: number;
  correctAnswerMarked: boolean;
  correctAnswer: string | null;
}

export interface LeaderboardEntry {
  userName: string;
  correct: number;
  total: number;
}

export interface PastPoll {
  question: string;
  options: string[];
  votes: Record<string, number>;
  correctAnswer: string | null;
  timestamp: number;
}

export interface SessionSummaryResponse {
  leaderboard: LeaderboardEntry[];
  pollHistory: PastPoll[];
}

export const pollService = {
  startPoll: (question: string, options: string[], duration: number) =>
    api.post<{ message: string }>('/start-poll', { question, options, duration }),

  getStatus: () => api.get<PollStatusResponse>('/poll-status'),

  getResults: () => api.get<PollResult[]>('/poll-result'), // Note: backend returns object, but hook expects results array? Wait, checking hook.

  // Correcting getResults signature based on actual backend response
  getPollResults: () => api.get<PollResultsResponse>('/poll-result'),

  markCorrectAnswer: (correctAnswer: string) =>
    api.post<{ message: string }>('/mark-correct', { correctAnswer }),

  getSessionSummary: () => api.get<SessionSummaryResponse>('/session-summary'),

  resetSession: () => api.post<{ message: string }>('/reset-session'),

  stopPoll: () => api.post<{ message: string }>('/stop-poll'),

  resetPoll: () => api.post<{ message: string }>('/reset-poll'),
};
