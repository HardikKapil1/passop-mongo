require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

// Routes
const authRoutes = require("./routes/authRoutes");
const passwordRoutes = require("./routes/passwordRoutes");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const client = new MongoClient(process.env.MONGO_URI);

async function startServer() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);

    // Make db accessible everywhere
    app.locals.db = db;

    console.log("Connected to MongoDB");

    // Routes
    app.use("/auth", authRoutes);
    app.use("/passwords", passwordRoutes);

    // Health route
    app.get("/", (req, res) => {
      res.send("Password Manager Backend Running ✔");
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } catch (err) {
    console.error("Failed to connect:", err);
    process.exit(1);
  }
}

startServer();
