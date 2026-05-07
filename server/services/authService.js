const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const TOKEN_PATH = path.join(__dirname, "../tokens.json");

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  "https://live-polling-gray.vercel.app/auth/callback", // Default redirect URI
);

// Load tokens from file if it exists
if (fs.existsSync(TOKEN_PATH)) {
  try {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oauth2Client.setCredentials(tokens);
    console.log("Loaded tokens from persistence.");
  } catch (err) {
    console.error("Error loading tokens:", err);
  }
}

// Save tokens on change
oauth2Client.on("tokens", (tokens) => {
  try {
    const currentTokens = fs.existsSync(TOKEN_PATH)
      ? JSON.parse(fs.readFileSync(TOKEN_PATH))
      : {};

    const updatedTokens = { ...currentTokens, ...tokens };
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(updatedTokens, null, 2));
    console.log("Tokens updated and persisted.");
  } catch (err) {
    console.error("Error saving tokens:", err);
  }
});

async function getAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent", // Force refresh token
  });
}

async function handleCallback(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save tokens explicitly the first time
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

  return tokens;
}

async function getAuthenticatedUser() {
  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return null;
  }

  try {
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const response = await youtube.channels.list({
      part: "snippet",
      mine: true,
    });

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        thumbnails: channel.snippet.thumbnails,
      };
    }
    return null;
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    return null;
  }
}

function logout() {
  oauth2Client.setCredentials(null);
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
  }
}

function getAuthClient() {
  return oauth2Client;
}

module.exports = {
  getAuthUrl,
  handleCallback,
  getAuthenticatedUser,
  getAuthClient,
  logout,
};
