const express = require("express");
const { startPoll, getPollStatus, getPollResult, markCorrectAnswer, stopPoll, resetPoll, getAuthUrl, handleAuthCallback, getAuthStatus, logout, getSessionSummary, resetSession, generateAiQuiz, nextAiQuestion, getAiSessionSummary } = require("../controllers/pollController");

const router = express.Router();

// Auth routes
router.get("/auth/url", getAuthUrl);
router.get("/auth/callback", handleAuthCallback); // Changed to GET for browser redirect
router.get("/auth/status", getAuthStatus);
router.post("/auth/logout", logout);

// Session routes
router.get("/session-summary", getSessionSummary);
router.post("/reset-session", resetSession);
router.post("/ai/generate-quiz", generateAiQuiz);
router.post("/ai/next-question", nextAiQuestion);
router.post("/ai/session-summary", getAiSessionSummary);

// Poll routes
router.post("/start-poll", startPoll);
router.get("/poll-status", getPollStatus);
router.get("/poll-result", getPollResult);
router.post("/mark-correct", markCorrectAnswer);
router.post("/stop-poll", stopPoll);
router.post("/reset-poll", resetPoll);

module.exports = router;
