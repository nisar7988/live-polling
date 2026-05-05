require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pollRoutes = require("./routes/pollRoutes");
const { getActiveLiveChatId } = require("./services/youtubeService");
const { getPoll } = require("./store/pollStore");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Use routes
app.use("/", pollRoutes);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Fetch initial live chat ID
  try {
    const liveChatId = await getActiveLiveChatId();
    if (liveChatId) {
      getPoll().liveChatId = liveChatId;
      console.log("Initial live chat ID fetched successfully:", liveChatId);
    }
  } catch (error) {
    console.error("Error fetching initial live chat ID:", error.message);
  }
});
