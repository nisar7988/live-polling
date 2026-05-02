require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pollRoutes = require("./routes/pollRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Use routes
app.use("/", pollRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
