const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userModel = new User(db);

    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const existingUser = await userModel.findByEmail(email);
    if (existingUser)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await userModel.createUser({
      username,
      email,
      passwordHash,
    });

    res.json({ success: true, userId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const userModel = new User(db);

    const { email, password } = req.body;

    const user = await userModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { register, login };
