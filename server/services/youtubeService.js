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

async function getActiveLiveChatId() {
  if (!process.env.YOUTUBE_ACCESS_TOKEN) {
    console.warn("No YOUTUBE_ACCESS_TOKEN found, cannot fetch live chat ID dynamically.");
    return null;
  }

  try {
    const params = {
      part: "snippet,contentDetails",
      mine: true,
    };

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveBroadcasts",
      {
        params,
        headers: {
          Authorization: `Bearer ${process.env.YOUTUBE_ACCESS_TOKEN}`,
        },
      },
    );

    // Filter for active broadcasts or just take the first one if it exists
    const broadcasts = response.data.items || [];
    const activeBroadcast = broadcasts.find(b => b.snippet.liveChatId) || broadcasts[0];
    const liveChatId = activeBroadcast?.snippet?.liveChatId;
    
    if (liveChatId) {
      console.log("Successfully fetched active liveChatId:", liveChatId);
    } else {
      console.warn("No active live broadcast found for this user.");
    }
    
    return liveChatId || null;
  } catch (error) {
    console.error("Error fetching active live chat ID:", error.response?.data || error.message);
    return null;
  }
}

async function pollYouTubeChat() {
  const poll = getPoll();
  if (!poll.active) return;

  const liveChatId = poll.liveChatId || process.env.LIVE_CHAT_ID;

  // Use mock data if no live chat ID is configured or found
  if (!liveChatId) {
    return mockPollYouTubeChat(poll);
  }

  try {
    const params = {
      liveChatId: liveChatId,
      part: "snippet,authorDetails",
      key: process.env.YOUTUBE_API_KEY,
    };

    if (poll.nextPageToken) {
      params.pageToken = poll.nextPageToken;
    }

    // If using OAuth, add Authorization header
    const headers = {};
    if (process.env.YOUTUBE_ACCESS_TOKEN) {
      headers.Authorization = `Bearer ${process.env.YOUTUBE_ACCESS_TOKEN}`;
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveChat/messages",
      {
        params,
        headers,
      },
    );
    console.log(response.data,"response.data")

    const messages = response.data.items || [];
    poll.nextPageToken = response.data.nextPageToken;

    messages.forEach((message) => {
      const text = message.snippet.displayMessage.trim().toUpperCase();
      const userId = message.authorDetails.channelId;

      if (poll.options.includes(text) && !poll.voters[userId]) {
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
  getActiveLiveChatId,
};
