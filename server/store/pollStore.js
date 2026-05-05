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
};

let pollInterval = null;

module.exports = {
  getPoll: () => poll,
  setPoll: (newPoll) => { poll = newPoll; },
  getPollInterval: () => pollInterval,
  setPollInterval: (interval) => { pollInterval = interval; },
};
