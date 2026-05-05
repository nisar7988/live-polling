const express = require("express");
const { startPoll, getPollStatus, getPollResult, markCorrectAnswer, getLeaderboard } = require("../controllers/pollController");

const router = express.Router();

router.post("/start-poll", startPoll);
router.get("/poll-status", getPollStatus);
router.get("/poll-result", getPollResult);
router.post("/mark-correct", markCorrectAnswer);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
