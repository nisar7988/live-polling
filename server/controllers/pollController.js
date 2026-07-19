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
  clearSessionData,
  getQuiz,
  setQuiz
} = require("../store/pollStore");
const { pollYouTubeChat, getActiveLiveChatId } = require("../services/youtubeService");
const authService = require("../services/authService");
const { generateQuiz, createSessionSummary } = require("../services/openaiService");

const ANSWERS = ["A", "B", "C", "D"];

function normalizeOptions(options) {
  if (!Array.isArray(options) || options.length < 2 || options.length > 4) {
    throw new Error("A poll requires between two and four options.");
  }
  const normalized = options.map((option) => String(option).trim().toUpperCase());
  if (new Set(normalized).size !== normalized.length || normalized.some((option) => !ANSWERS.includes(option))) {
    throw new Error("Poll options must be unique values from A through D.");
  }
  return normalized;
}

async function startPollFromPayload(payload) {
  const { pollType = "Single Choice", question = "", options: requestedOptions, duration = 30000, quizQuestion = null } = payload;
  const poll = getPoll();
  if (poll.active) throw new Error("Poll already active");
  if (!Number.isFinite(duration) || duration < 0) throw new Error("Poll duration must be a positive number.");

  const user = await authService.getAuthenticatedUser();
  if (!user) {
    const error = new Error("YouTube authentication required.");
    error.status = 401;
    throw error;
  }

  const liveChatId = await getActiveLiveChatId();
  if (!liveChatId) throw new Error("No active YouTube live broadcast found. Please go live before starting.");

  const options = pollType === "Integer Type" ? [] : normalizeOptions(requestedOptions || ANSWERS);
  const votes = Object.fromEntries(options.map((option) => [option, 0]));
  const now = Date.now();
  setPoll({ question, pollType, duration, options, votes, voters: {}, startTime: now, endTime: duration ? now + duration : null, active: true, nextPageToken: null, liveChatId, error: null, correctAnswerMarked: false, correctAnswer: null, quizQuestion });

  setPollInterval(setInterval(pollYouTubeChat, 8000));
  if (duration > 0) {
    setTimeout(async () => {
      if (!getPoll().active) return;
      clearInterval(getPollInterval());
      setPollInterval(null);
      getPoll().active = false;
      saveSession();
    }, duration);
  }
}

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
  try {
    await startPollFromPayload(req.body);
    res.json({ message: "Poll started" });
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

const getPollStatus = (req, res) => {
  const poll = getPoll();
  const timeLeft = poll.active && poll.endTime ? Math.max(0, poll.endTime - Date.now()) : 0;
  const totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
  const liveResults = poll.options.map((option) => ({
    option,
    votes: poll.votes[option] || 0,
    percentage: totalVotes ? Number((((poll.votes[option] || 0) / totalVotes) * 100).toFixed(2)) : 0,
  }));
  res.json({ 
    active: poll.active, 
    timeLeft, 
    error: poll.error || null, 
    viewerCount: getViewerCount(),
    correctAnswerMarked: poll.correctAnswerMarked,
    correctAnswer: poll.correctAnswer,
    question: poll.question,
    options: poll.options,
    quizQuestion: poll.quizQuestion || null,
    totalVotes,
    liveResults,
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

  res.json({ results, totalVotes, correctAnswerMarked: poll.correctAnswerMarked, correctAnswer: poll.correctAnswer, question: poll.question, quizQuestion: poll.quizQuestion || null });
};

const markCorrectAnswer = (req, res) => {
  const requestedAnswer = String(req.body.correctAnswer || "").toUpperCase();
  const poll = getPoll();

  if (poll.active) {
    return res.status(400).json({ error: "Cannot mark answer while poll is active" });
  }

  if (poll.correctAnswerMarked) {
    return res.status(400).json({ error: "Already marked" });
  }

  const correctAnswer = poll.quizQuestion?.correctAnswer || requestedAnswer;
  if (!poll.options.includes(correctAnswer)) return res.status(400).json({ error: "Correct answer must be one of the poll options" });
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
    explanation: poll.quizQuestion?.explanation || null,
    timestamp: poll.startTime,
  });

  setLeaderboard(leaderboard);
  setPollHistory(history);
  saveSession();

  res.json({ message: "Correct answer marked and session updated", correctAnswer, explanation: poll.quizQuestion?.explanation || null });
};

const generateAiQuiz = async (req, res) => {
  const topic = String(req.body.topic || "").trim();
  const difficulty = String(req.body.difficulty || "Medium").trim();
  const questionCount = Number(req.body.questionCount);
  if (!topic) return res.status(400).json({ error: "A quiz topic is required." });
  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 20) return res.status(400).json({ error: "Question count must be between 1 and 20." });
  try {
    const questions = await generateQuiz({ topic, difficulty, questionCount });
    const quiz = { questions, currentIndex: -1, topic, difficulty, sessionSummary: null };
    setQuiz(quiz);
    res.json({ quiz });
  } catch (error) { res.status(502).json({ error: error.message }); }
};

const nextAiQuestion = async (req, res) => {
  const quiz = getQuiz();
  const nextIndex = quiz.currentIndex + 1;
  if (!quiz.questions[nextIndex]) return res.status(400).json({ error: "No remaining quiz questions." });
  const quizQuestion = quiz.questions[nextIndex];
  try {
    await startPollFromPayload({ question: quizQuestion.question, options: ANSWERS, duration: Number(req.body.duration) || 30000, quizQuestion });
    setQuiz({ ...quiz, currentIndex: nextIndex });
    res.json({ message: "Quiz question started", question: quizQuestion, currentIndex: nextIndex, remainingQuestions: quiz.questions.length - nextIndex - 1 });
  } catch (error) { res.status(error.status || 400).json({ error: error.message }); }
};

const getAiSessionSummary = async (req, res) => {
  const history = getPollHistory();
  const leaderboard = Object.values(getLeaderboard());
  const totalQuestions = history.length;
  const totalVotes = history.reduce((sum, item) => sum + Object.values(item.votes).reduce((voteSum, count) => voteSum + count, 0), 0);
  const questionRates = history.map((item) => {
    const questionVotes = Object.values(item.votes).reduce((sum, count) => sum + count, 0);
    return { question: item.question, correctRate: questionVotes ? ((item.votes[item.correctAnswer] || 0) / questionVotes) : 0 };
  });
  const metrics = { totalQuestions, totalVotes, averageScore: leaderboard.length ? leaderboard.reduce((sum, item) => sum + item.correct / Math.max(item.total, 1), 0) / leaderboard.length : 0, hardestQuestion: questionRates.sort((a, b) => a.correctRate - b.correctRate)[0] || null, mostActiveParticipant: [...leaderboard].sort((a, b) => b.total - a.total)[0] || null };
  try {
    const summary = await createSessionSummary(metrics);
    setQuiz({ ...getQuiz(), sessionSummary: summary });
    res.json({ metrics, summary });
  } catch (error) { res.status(502).json({ error: error.message }); }
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
  generateAiQuiz,
  nextAiQuestion,
  getAiSessionSummary,
};
