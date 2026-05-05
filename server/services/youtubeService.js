const axios = require("axios");
const { getPoll } = require("../store/pollStore");

async function refreshAccessToken() {
  if (!process.env.YOUTUBE_REFRESH_TOKEN) {
    console.warn("No YOUTUBE_REFRESH_TOKEN found, cannot refresh access token.");
    return null;
  }

  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    });

    const newAccessToken = response.data.access_token;
    process.env.YOUTUBE_ACCESS_TOKEN = newAccessToken;
    console.log("Successfully refreshed YouTube access token.");
    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing YouTube access token:", error.response?.data || error.message);
    return null;
  }
}

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
  if (!process.env.YOUTUBE_ACCESS_TOKEN && !process.env.YOUTUBE_REFRESH_TOKEN) {
    console.warn("No YouTube credentials found (Access or Refresh token).");
    return null;
  }

  const fetchId = async (token) => {
    const params = {
      part: "snippet,contentDetails",
      mine: true,
    };
    return await axios.get(
      "https://www.googleapis.com/youtube/v3/liveBroadcasts",
      {
        params,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  try {
    let token = process.env.YOUTUBE_ACCESS_TOKEN;
    let response;
    
    try {
      response = await fetchId(token);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("Access token expired, attempting refresh...");
        token = await refreshAccessToken();
        if (token) {
          response = await fetchId(token);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

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

    const fetchMessages = async (token) => {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return await axios.get(
        "https://www.googleapis.com/youtube/v3/liveChat/messages",
        { params, headers }
      );
    };

    let token = process.env.YOUTUBE_ACCESS_TOKEN;
    let response;

    try {
      response = await fetchMessages(token);
    } catch (error) {
      if (error.response?.status === 401 && process.env.YOUTUBE_REFRESH_TOKEN) {
        console.log("Access token expired during polling, attempting refresh...");
        token = await refreshAccessToken();
        if (token) {
          response = await fetchMessages(token);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
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
