const fs = require("fs");
const path = require("path");

const SESSION_PATH = path.join(__dirname, "../session.json");

let poll = {
  question: "",
  pollType: "Single Choice",
  duration: 30000,
  options: ["A", "B", "C", "D"],
  votes: { A: 0, B: 0, C: 0, D: 0 },
  voters: {},
  startTime: 0,
  endTime: 0,
  active: false,
  nextPageToken: null,
  liveChatId: null,
  error: null,
  correctAnswerMarked: false,
  correctAnswer: null,
};

let pollInterval = null;
let viewerCount = 0;
let leaderboard = {}; // { userId: { userName: string, correct: number, total: number } }
let pollHistory = []; // Array of completed polls
let quiz = { questions: [], currentIndex: -1, topic: null, difficulty: null, sessionSummary: null };

/**
 * Saves the current leaderboard and poll history to a local file.
 */
function saveSession() {
  try {
    const data = {
      leaderboard,
      pollHistory,
      quiz,
      lastPoll: poll
    };
    fs.writeFileSync(SESSION_PATH, JSON.stringify(data, null, 2));
    console.log("Session persisted successfully.");
  } catch (err) {
    console.error("Error saving session:", err);
  }
}

/**
 * Loads the leaderboard and history from the local file.
 */
function loadSession() {
  if (fs.existsSync(SESSION_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(SESSION_PATH));
      leaderboard = data.leaderboard || {};
      pollHistory = data.pollHistory || [];
      quiz = { ...quiz, ...(data.quiz || {}) };
      // We don't restore the active poll state to avoid issues with timers, 
      // but we keep the last liveChatId
      if (data.lastPoll) {
        poll.liveChatId = data.lastPoll.liveChatId;
      }
      console.log("Session loaded successfully.");
    } catch (err) {
      console.error("Error loading session:", err);
    }
  }
}

/**
 * Resets all session data.
 */
function clearSessionData() {
  leaderboard = {};
  pollHistory = [];
  poll.voters = {};
  poll.votes = { A: 0, B: 0, C: 0, D: 0 };
  poll.active = false;
  quiz = { questions: [], currentIndex: -1, topic: null, difficulty: null, sessionSummary: null };
  
  if (fs.existsSync(SESSION_PATH)) {
    fs.unlinkSync(SESSION_PATH);
  }
  console.log("Session data cleared.");
}

// Initial load
loadSession();

module.exports = {
  getPoll: () => poll,
  setPoll: (newPoll) => { poll = newPoll; },
  getPollInterval: () => pollInterval,
  setPollInterval: (interval) => { pollInterval = interval; },
  getViewerCount: () => viewerCount,
  setViewerCount: (count) => { viewerCount = count; },
  getLeaderboard: () => leaderboard,
  setLeaderboard: (newLeaderboard) => { 
    leaderboard = newLeaderboard; 
    saveSession();
  },
  getPollHistory: () => pollHistory,
  setPollHistory: (history) => { 
    pollHistory = history; 
    saveSession();
  },
  getQuiz: () => quiz,
  setQuiz: (nextQuiz) => { quiz = nextQuiz; saveSession(); },
  saveSession,
  clearSessionData,
};
