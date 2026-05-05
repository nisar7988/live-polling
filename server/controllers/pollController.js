const { getPoll, setPoll, getPollInterval, setPollInterval } = require("../store/pollStore");
const { pollYouTubeChat, getActiveLiveChatId } = require("../services/youtubeService");

const startPoll = async (req, res) => {
  const { pollType = "Single Choice", duration = 30000 } = req.body;
  const poll = getPoll();

  if (poll.active) {
    return res.status(400).json({ error: "Poll already active" });
  }

  // Fetch active live chat ID dynamically
  let liveChatId = await getActiveLiveChatId();

  if (!liveChatId) {
    console.warn("Could not fetch active live chat ID dynamically. Falling back to LIVE_CHAT_ID from .env");
    liveChatId = process.env.LIVE_CHAT_ID;
  }

  if (!liveChatId) {
    return res.status(400).json({ 
      error: "No active YouTube live broadcast found and no fallback LIVE_CHAT_ID provided. Please make sure you are live or provide a LIVE_CHAT_ID in .env before starting the poll." 
    });
  }

  let options = ["A", "B", "C", "D"];
  if (pollType === "Integer Type") {
    options = []; // For integer type, we track all numbers that appear
  }

  const uppercasedOptions = options.map(o => o.toUpperCase());
  const initialVotes = {};
  uppercasedOptions.forEach(option => {
    initialVotes[option] = 0;
  });

  const now = Date.now();
  setPoll({
    question: "",
    pollType,
    options: uppercasedOptions,
    votes: initialVotes,
    voters: {},
    startTime: now,
    endTime: now + duration,
    active: true,
    nextPageToken: null,
    liveChatId,
  });

  // Start polling every 8-10 seconds
  const interval = setInterval(pollYouTubeChat, 8000);
  setPollInterval(interval);

  // Stop poll after duration
  setTimeout(async () => {
    clearInterval(getPollInterval());
    const poll = getPoll();
    poll.active = false;
    
    // Refresh chat ID for the next poll
    const nextLiveChatId = await getActiveLiveChatId();
    if (nextLiveChatId) {
      poll.liveChatId = nextLiveChatId;
      console.log("Live chat ID refreshed after poll:", nextLiveChatId);
    }
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

  const totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
  const results = poll.options.map((option) => ({
    option,
    votes: poll.votes[option] || 0,
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
