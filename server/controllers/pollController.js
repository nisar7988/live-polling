const { 
  getPoll, 
  setPoll, 
  getPollInterval, 
  setPollInterval, 
  getViewerCount, 
  getLeaderboard, 
  setLeaderboard,
  getPollHistory,
  setPollHistory,
  saveSession,
  clearSessionData
} = require("../store/pollStore");
const { pollYouTubeChat, getActiveLiveChatId } = require("../services/youtubeService");
const authService = require("../services/authService");

const getAuthUrl = async (req, res) => {
  try {
    const url = await authService.getAuthUrl();
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleAuthCallback = async (req, res) => {
  const code = req.query.code || req.body.code;
  if (!code) {
    return res.status(400).send("<h1>Authentication Failed</h1><p>No code provided.</p>");
  }
  try {
    await authService.handleCallback(code);
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #080820; color: white;">
          <h1 style="color: #10b981;">Login Successful!</h1>
          <p>You have successfully authenticated with YouTube.</p>
          <p>You can now close this window and return to the app.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`<h1>Authentication Error</h1><p>${error.message}</p>`);
  }
};

const getAuthStatus = async (req, res) => {
  try {
    const user = await authService.getAuthenticatedUser();
    res.json({ isAuthenticated: !!user, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  authService.logout();
  res.json({ message: "Logged out successfully" });
};

const startPoll = async (req, res) => {
  const { pollType = "Single Choice", duration = 30000, question = "" } = req.body;
  const poll = getPoll();

  if (poll.active) {
    return res.status(400).json({ error: "Poll already active" });
  }

  const user = await authService.getAuthenticatedUser();
  if (!user) {
    return res.status(401).json({ error: "YouTube authentication required." });
  }

  let liveChatId = await getActiveLiveChatId();

  if (!liveChatId) {
    return res.status(400).json({ 
      error: "No active YouTube live broadcast found. Please go live before starting." 
    });
  }

  let options = ["A", "B", "C", "D"];
  if (pollType === "Integer Type") {
    options = []; 
  }

  const uppercasedOptions = options.map(o => o.toUpperCase());
  const initialVotes = {};
  uppercasedOptions.forEach(option => {
    initialVotes[option] = 0;
  });

  const now = Date.now();
  setPoll({
    question,
    pollType,
    options: uppercasedOptions,
    votes: initialVotes,
    voters: {},
    startTime: now,
    endTime: now + duration,
    active: true,
    nextPageToken: null,
    liveChatId,
    error: null,
    correctAnswerMarked: false,
    correctAnswer: null,
  });

  const interval = setInterval(pollYouTubeChat, 8000);
  setPollInterval(interval);

  setTimeout(async () => {
    const currentInterval = getPollInterval();
    if (currentInterval) {
      clearInterval(currentInterval);
    }
    const poll = getPoll();
    poll.active = false;
    saveSession();
    
    const nextLiveChatId = await getActiveLiveChatId();
    if (nextLiveChatId) {
      poll.liveChatId = nextLiveChatId;
    }
  }, duration);

  res.json({ message: "Poll started" });
};

const getPollStatus = (req, res) => {
  const poll = getPoll();
  const timeLeft = poll.active ? Math.max(0, poll.endTime - Date.now()) : 0;
  res.json({ 
    active: poll.active, 
    timeLeft, 
    error: poll.error || null, 
    viewerCount: getViewerCount(),
    correctAnswerMarked: poll.correctAnswerMarked,
    correctAnswer: poll.correctAnswer 
  });
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

  res.json({ results, totalVotes, correctAnswerMarked: poll.correctAnswerMarked, correctAnswer: poll.correctAnswer });
};

const markCorrectAnswer = (req, res) => {
  const { correctAnswer } = req.body;
  const poll = getPoll();

  if (poll.active) {
    return res.status(400).json({ error: "Cannot mark answer while poll is active" });
  }

  if (poll.correctAnswerMarked) {
    return res.status(400).json({ error: "Already marked" });
  }

  poll.correctAnswerMarked = true;
  poll.correctAnswer = correctAnswer;

  const leaderboard = getLeaderboard();
  for (const userId in poll.voters) {
    const voterInfo = poll.voters[userId];
    const optionVoted = typeof voterInfo === 'string' ? voterInfo : voterInfo.option;
    const userName = typeof voterInfo === 'string' ? `User ${userId}` : voterInfo.userName;

    if (!leaderboard[userId]) {
      leaderboard[userId] = { userName, correct: 0, total: 0 };
    }
    
    leaderboard[userId].total += 1;
    if (optionVoted === correctAnswer) {
      leaderboard[userId].correct += 1;
    }
    leaderboard[userId].userName = userName;
  }

  // Save to history
  const history = getPollHistory();
  history.push({
    question: poll.question,
    options: poll.options,
    votes: poll.votes,
    correctAnswer: poll.correctAnswer,
    timestamp: poll.startTime,
  });

  setLeaderboard(leaderboard);
  setPollHistory(history);
  saveSession();

  res.json({ message: "Correct answer marked and session updated" });
};

const getSessionSummary = (req, res) => {
  const leaderboard = getLeaderboard();
  const sortedLeaderboard = Object.values(leaderboard).sort((a, b) => b.correct - a.correct);
  
  res.json({ 
    leaderboard: sortedLeaderboard,
    pollHistory: getPollHistory()
  });
};

const resetSession = (req, res) => {
  clearSessionData();
  res.json({ message: "Session reset successfully" });
};

const stopPoll = async (req, res) => {
  const poll = getPoll();
  if (!poll.active) {
    return res.status(400).json({ error: "No active poll" });
  }

  clearInterval(getPollInterval());
  setPollInterval(null);
  poll.active = false;
  poll.endTime = Date.now();
  saveSession();

  try {
    const nextLiveChatId = await getActiveLiveChatId();
    if (nextLiveChatId) {
      poll.liveChatId = nextLiveChatId;
    }
  } catch (err) {
    console.error("Error refreshing chat ID:", err);
  }

  res.json({ message: "Poll stopped" });
};

const resetPoll = (req, res) => {
  clearInterval(getPollInterval());
  setPollInterval(null);

  const initialPoll = {
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
    liveChatId: getPoll().liveChatId,
    error: null,
    correctAnswerMarked: false,
    correctAnswer: null,
  };

  setPoll(initialPoll);
  saveSession();
  
  res.json({ message: "Current poll reset" });
};

module.exports = {
  startPoll,
  getPollStatus,
  getPollResult,
  markCorrectAnswer,
  getSessionSummary,
  resetSession,
  stopPoll,
  resetPoll,
  getAuthUrl,
  handleAuthCallback,
  getAuthStatus,
  logout,
};
