const axios = require("axios");
const { getPoll, getPollInterval } = require("../store/pollStore");

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
      let text;
      if (poll.pollType === "Integer Type") {
        // Generate a random number between 1 and 100
        text = String(Math.floor(Math.random() * 100) + 1);
      } else {
        const randomOptionIndex = Math.floor(Math.random() * poll.options.length);
        text = poll.options[randomOptionIndex];
      }
      
      const userId = `mock_user_${Math.floor(Math.random() * 1000000)}`;

      if (poll.votes[text] === undefined) {
        poll.votes[text] = 0;
        if (!poll.options.includes(text)) {
          poll.options.push(text);
        }
      }

      if (!poll.voters[userId]) {
        poll.votes[text]++;
        poll.voters[userId] = { option: text, userName: `Mock User ${userId.replace('mock_user_', '')}` };
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
      part: "snippet,contentDetails,status",
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
    
    // Filter for broadcasts that are currently live and have a liveChatId
    const activeBroadcast = broadcasts.find(b => 
      b.status?.lifeCycleStatus === "live" && b.snippet?.liveChatId
    ) || broadcasts.find(b => b.snippet?.liveChatId); // Fallback to any broadcast with a chat ID if none are explicitly "live"
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
  console.log(`[POLLING] Chat ID: ${liveChatId} | Options: [${poll.options.join(", ")}]`);

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
      console.log(response.data,"response.data") // Removed verbose logging

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
    // console.log(response.data,"response.data") // Removed verbose logging

    const messages = response.data.items || [];
    poll.nextPageToken = response.data.nextPageToken;

    messages.forEach((message) => {
      const publishedAt = new Date(message.snippet.publishedAt).getTime();
      
      // Skip messages sent before the poll started
      if (publishedAt < poll.startTime) {
        console.log(`[VOTE SKIP] Message before poll start: ${message.snippet.displayMessage}`);
        return;
      }

      const text = message.snippet.displayMessage.trim().toUpperCase();
      const userId = message.authorDetails.channelId;
      const userName = message.authorDetails.displayName;

      console.log(`[CHAT] ${userName}: "${text}"`);

      let matchedOption = null;

      if (poll.pollType === "Integer Type") {
        // Find the first number in the text
        const match = text.match(/\d+/);
        if (match) {
          matchedOption = match[0];
          if (poll.votes[matchedOption] === undefined) {
            poll.votes[matchedOption] = 0;
            if (!poll.options.includes(matchedOption)) {
              poll.options.push(matchedOption);
            }
          }
        }
      } else {
        // Single Choice: Find if any option (A, B, C, D) is in the message
        matchedOption = poll.options.find(option => 
          text === option || text.startsWith(option + " ") || text.includes(" " + option)
        );
      }

      if (matchedOption) {
        if (!poll.voters[userId]) {
          poll.votes[matchedOption]++;
          poll.voters[userId] = { option: matchedOption, userName: userName };
          console.log(`[VOTE SUCCESS] ${userName} voted for: ${matchedOption}`);
        } else {
          console.log(`[VOTE SKIP] ${userName} already voted (current vote: ${poll.voters[userId].option})`);
        }
      }
    });
  } catch (error) {
    console.error("Error polling YouTube chat:", error.message);
    if (error.response && error.response.data) {
      console.error("Error details:", JSON.stringify(error.response.data, null, 2));
    }
    
    // Set error on the poll and stop it
    const errMessage = error.response?.data?.error?.message || error.message;
    poll.error = `YouTube API Error: ${errMessage}`;
    poll.active = false;
    
    const interval = getPollInterval();
    if (interval) {
      clearInterval(interval);
    }
  }
}

async function getActiveViewerCount() {
  if (!process.env.YOUTUBE_ACCESS_TOKEN && !process.env.YOUTUBE_REFRESH_TOKEN) {
    return 0;
  }

  const fetchId = async (token) => {
    const params = {
      part: "snippet,contentDetails,status",
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
      if (error.response?.status === 401 && process.env.YOUTUBE_REFRESH_TOKEN) {
        token = await refreshAccessToken();
        if (token) {
          response = await fetchId(token);
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }

    const broadcasts = response.data.items || [];
    const activeBroadcast = broadcasts.find(b => 
      b.status?.lifeCycleStatus === "live"
    ) || broadcasts[0];
    
    if (!activeBroadcast) return 0;
    
    const videoId = activeBroadcast.id;
    
    const videoResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        part: "liveStreamingDetails",
        id: videoId,
      },
      headers: { Authorization: `Bearer ${token}` }
    });
    const video = videoResponse.data.items?.[0];
    if (video?.liveStreamingDetails?.concurrentViewers) {
      return parseInt(video.liveStreamingDetails.concurrentViewers, 10);
    }
    return 0;
  } catch (error) {
    console.error("Error fetching viewer count:", error.message);
    return 0;
  }
}

function startViewerCountPoller() {
  const { setViewerCount } = require("../store/pollStore");
  const pollViewers = async () => {
    const count = await getActiveViewerCount();

    if (count > 0) setViewerCount(count);
  };
  pollViewers();
  setInterval(pollViewers, 30000); // every 30s
}

module.exports = {
  pollYouTubeChat,
  getActiveLiveChatId,
  startViewerCountPoller,
};
