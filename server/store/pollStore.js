let poll = {
  question: "",
  options: ["A", "B", "C"],
  votes: { A: 0, B: 0, C: 0 },
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
