const express = require("express");
const { startPoll, getPollStatus, getPollResult } = require("../controllers/pollController");

const router = express.Router();

router.post("/start-poll", startPoll);
router.get("/poll-status", getPollStatus);
router.get("/poll-result", getPollResult);

module.exports = router;
