const axios = require("axios");
const { getPoll, getPollInterval } = require("../store/pollStore");
const { getAuthClient } = require("./authService");

/**
 * Helper to get a fresh access token from the auth client
 */
async function getFreshToken() {
  const authClient = getAuthClient();
  if (!authClient.credentials || !authClient.credentials.refresh_token) {
    return null;
  }
  try {
    const { token } = await authClient.getAccessToken();
    return token;
  } catch (error) {
    console.error("Error getting fresh token:", error.message);
    return null;
  }
}

async function getActiveLiveChatId() {
  const token = await getFreshToken();
  if (!token) {
    console.warn("No authenticated user found.");
    return null;
  }

  try {
    const params = {
      part: "snippet,contentDetails,status",
      mine: true,
    };
    
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveBroadcasts",
      {
        params,
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const broadcasts = response.data.items || [];

    // Filter for broadcasts that are currently live and have a liveChatId
    const activeBroadcast =
      broadcasts.find(
        (b) => b.status?.lifeCycleStatus === "live" && b.snippet?.liveChatId,
      ) || broadcasts.find((b) => b.snippet?.liveChatId); 
    
    const liveChatId = activeBroadcast?.snippet?.liveChatId;

    if (liveChatId) {
      console.log("Successfully fetched active liveChatId:", liveChatId);
    } else {
      console.warn("No active live broadcast found for this user.");
    }

    return liveChatId || null;
  } catch (error) {
    console.error(
      "Error fetching active live chat ID:",
      error.response?.data || error.message,
    );
    return null;
  }
}

async function pollYouTubeChat() {
  const poll = getPoll();
  if (!poll.active) return;

  const liveChatId = poll.liveChatId;
  
  if (!liveChatId) {
    // If no live chat ID, we skip (mock polling removed for now to favor real auth)
    console.warn("[POLLING] No liveChatId found, skipping poll.");
    return;
  }

  try {
    const token = await getFreshToken();
    if (!token) {
      throw new Error("User not authenticated.");
    }

    const params = {
      liveChatId: liveChatId,
      part: "snippet,authorDetails",
      // Removed hardcoded key, using Bearer token instead
    };

    if (poll.nextPageToken) {
      params.pageToken = poll.nextPageToken;
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveChat/messages",
      { 
        params, 
        headers: { Authorization: `Bearer ${token}` } 
      },
    );

    const messages = response.data.items || [];
    poll.nextPageToken = response.data.nextPageToken;

    messages.forEach((message) => {
      const publishedAt = new Date(message.snippet.publishedAt).getTime();

      // Skip messages sent before the poll started
      if (publishedAt < poll.startTime) {
        return;
      }

      const text = message.snippet.displayMessage.trim().toUpperCase();
      const userId = message.authorDetails.channelId;
      const userName = message.authorDetails.displayName;

      let matchedOption = null;

      if (poll.pollType === "Integer Type") {
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
        matchedOption = poll.options.find(
          (option) =>
            text === option ||
            text.startsWith(option + " ") ||
            text.includes(" " + option),
        );
      }

      if (matchedOption) {
        if (!poll.voters[userId]) {
          poll.votes[matchedOption]++;
          poll.voters[userId] = { option: matchedOption, userName: userName };
          console.log(`[VOTE SUCCESS] ${userName} voted for: ${matchedOption}`);
        }
      }
    });
  } catch (error) {
    console.error("Error polling YouTube chat:", error.message);
    
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
  const token = await getFreshToken();
  if (!token) return 0;

  try {
    const params = {
      part: "snippet,contentDetails,status",
      mine: true,
    };
    
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/liveBroadcasts",
      {
        params,
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const broadcasts = response.data.items || [];
    const activeBroadcast =
      broadcasts.find((b) => b.status?.lifeCycleStatus === "live") ||
      broadcasts[0];

    if (!activeBroadcast) return 0;

    const videoId = activeBroadcast.id;

    const videoResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "liveStreamingDetails",
          id: videoId,
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );
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
