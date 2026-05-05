let poll = {
  question: "",
  pollType: "Single Choice", // Default poll type
  duration: 30000, // Default duration in ms
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

module.exports = {
  getPoll: () => poll,
  setPoll: (newPoll) => { poll = newPoll; },
  getPollInterval: () => pollInterval,
  setPollInterval: (interval) => { pollInterval = interval; },
  getViewerCount: () => viewerCount,
  setViewerCount: (count) => { viewerCount = count; },
  getLeaderboard: () => leaderboard,
  setLeaderboard: (newLeaderboard) => { leaderboard = newLeaderboard; },
};
