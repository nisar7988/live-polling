const { getPoll, setPoll, getPollInterval, setPollInterval } = require("../store/pollStore");
const { pollYouTubeChat } = require("../services/youtubeService");

const startPoll = (req, res) => {
  const { question, options = ["A", "B", "C"], duration = 30000 } = req.body;
  const poll = getPoll();

  if (poll.active) {
    return res.status(400).json({ error: "Poll already active" });
  }

  setPoll({
    question,
    options,
    votes: { A: 0, B: 0, C: 0 },
    voters: {},
    startTime: Date.now(),
    endTime: Date.now() + duration,
    active: true,
    nextPageToken: null,
  });

  // Start polling every 8-10 seconds
  const interval = setInterval(pollYouTubeChat, 8000);
  setPollInterval(interval);

  // Stop poll after duration
  setTimeout(() => {
    clearInterval(getPollInterval());
    getPoll().active = false;
  }, duration);

  res.json({ message: "Poll started" });
};

const getPollStatus = (req, res) => {
  const poll = getPoll();
  const timeLeft = poll.active ? Math.max(0, poll.endTime - Date.now()) : 0;
  res.json({ active: poll.active, timeLeft });
};

const getPollResult = (req, res) => {
  const poll = getPoll();

  if (poll.active) {
    return res.status(400).json({ error: "Poll still active" });
  }

  const totalVotes = poll.votes.A + poll.votes.B + poll.votes.C;
  const results = poll.options.map((option) => ({
    option,
    votes: poll.votes[option],
    percentage:
      totalVotes > 0 ? ((poll.votes[option] / totalVotes) * 100).toFixed(2) : 0,
  }));

  res.json({ results, totalVotes });
};

module.exports = {
  startPoll,
  getPollStatus,
  getPollResult,
};
