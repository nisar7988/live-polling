import { api } from './httpClient';

export interface PollStatusResponse {
  active: boolean;
  timeLeft: number;
  error: string | null;
  viewerCount: number;
  correctAnswerMarked: boolean;
  correctAnswer: string | null;
  question: string;
  options: string[];
  quizQuestion: QuizQuestion | null;
  totalVotes: number;
  liveResults: PollResult[];
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
  question: string;
  quizQuestion: QuizQuestion | null;
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
  explanation?: string | null;
}

export interface QuizQuestion {
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation: string;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  topic: string | null;
  difficulty: string | null;
  sessionSummary: string | null;
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
    api.post<{ message: string; correctAnswer: string; explanation: string | null }>('/mark-correct', { correctAnswer }),

  generateQuiz: (topic: string, difficulty: string, questionCount: number) =>
    api.post<{ quiz: QuizState }>('/ai/generate-quiz', { topic, difficulty, questionCount }),

  nextQuestion: (duration: number) =>
    api.post<{ message: string; question: QuizQuestion; currentIndex: number; remainingQuestions: number }>('/ai/next-question', { duration }),

  getAiSessionSummary: () =>
    api.post<{ metrics: Record<string, unknown>; summary: string }>('/ai/session-summary'),

  getSessionSummary: () => api.get<SessionSummaryResponse>('/session-summary'),

  resetSession: () => api.post<{ message: string }>('/reset-session'),

  stopPoll: () => api.post<{ message: string }>('/stop-poll'),

  resetPoll: () => api.post<{ message: string }>('/reset-poll'),
};
