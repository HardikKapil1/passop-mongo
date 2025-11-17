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
const client = new MongoClient(process.env.MONGO_URI, {
  // optional: use unified topology and sensible timeouts
  serverSelectionTimeoutMS: 5000,
});

async function startServer() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "passwordmanager");

    // Make db accessible everywhere
    app.locals.db = db;

    console.log("✅ Connected to MongoDB");

    // Routes
    app.use("/auth", authRoutes);
    app.use("/passwords", passwordRoutes);

    // Health route (also checks DB)
    app.get("/", async (req, res) => {
      try {
        // quick ping to DB
        await db.command({ ping: 1 });
        return res.send("Password Manager Backend Running ✔");
      } catch (err) {
        console.error("DB ping failed:", err);
        return res.status(500).send("Backend running but DB ping failed");
      }
    });

    // Start server
    const server = app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down server...");
      try {
        await client.close();
        server.close(() => {
          console.log("Closed HTTP server and MongoDB connection. Bye.");
          process.exit(0);
        });
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();
