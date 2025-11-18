const Password = require("../models/Password");

const addPassword = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const passwordModel = new Password(db);

    const { site, username, password, id } = req.body;

    const userId = req.user.id; // coming from JWT middleware

    const result = await passwordModel.createPassword({
      site,
      username,
      password,   // already encrypted by frontend
      userId,
      id
    });

    res.json({ success: true, insertedId: result.insertedId });
  } catch {
    res.status(500).json({ error: "Failed to add password" });
  }
};

const getPasswords = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const passwordModel = new Password(db);

    const userId = req.user.id;
    const passwords = await passwordModel.getAllPasswords(userId);

    res.json(passwords);
  } catch {
    res.status(500).json({ error: "Failed to get passwords" });
  }
};

const deletePassword = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const passwordModel = new Password(db);

    const { id } = req.body;
    const userId = req.user.id;

    const result = await passwordModel.deletePassword(id, userId);

    res.json({ success: true, result });
  } catch {
    res.status(500).json({ error: "Failed to delete" });
  }
};

module.exports = {
  addPassword,
  getPasswords,
  deletePassword,
};
