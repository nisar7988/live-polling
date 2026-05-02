const axios = require("axios");
const { getPoll } = require("../store/pollStore");

function mockPollYouTubeChat(poll) {
  try {
    // Generate 1 to 5 random mock votes
    const numVotes = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < numVotes; i++) {
      const randomOptionIndex = Math.floor(Math.random() * poll.options.length);
      const text = poll.options[randomOptionIndex];
      
      const userId = `mock_user_${Math.floor(Math.random() * 1000000)}`;

      if (poll.votes[text] === undefined) {
        poll.votes[text] = 0;
      }

      if (!poll.voters[userId]) {
        poll.votes[text]++;
        poll.voters[userId] = text;
      }
    }
  } catch (error) {
    console.error("Error in mock polling:", error.message);
  }
}

async function pollYouTubeChat() {
  const poll = getPoll();
  if (!poll.active) return;

  // Use mock data if no live chat ID is configured
  if (!process.env.LIVE_CHAT_ID) {
    return mockPollYouTubeChat(poll);
  }

  try {
    const params = {
      liveChatId: process.env.LIVE_CHAT_ID,
      part: "snippet,authorDetails",
      key: process.env.YOUTUBE_API_KEY,
    };

    if (poll.nextPageToken) {
      params.pageToken = poll.nextPageToken;
    }

    // If using OAuth, add Authorization header
    const headers = {};
    if (process.env.ACCESS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.ACCESS_TOKEN}`;
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveChat/messages",
      {
        params,
        headers,
      },
    );

    const messages = response.data.items || [];
    poll.nextPageToken = response.data.nextPageToken;

    messages.forEach((message) => {
      const text = message.snippet.displayMessage.toUpperCase();
      const userId = message.authorDetails.channelId;

      if (["A", "B", "C"].includes(text) && !poll.voters[userId]) {
        poll.votes[text]++;
        poll.voters[userId] = text;
      }
    });
  } catch (error) {
    console.error("Error polling YouTube chat:", error.message);
  }
}

module.exports = {
  pollYouTubeChat,
};
