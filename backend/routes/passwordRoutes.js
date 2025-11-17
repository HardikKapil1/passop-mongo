const express = require("express");
const router = express.Router();

const { addPassword, getPasswords, deletePassword } =
  require("../controllers/passwordController");

const auth = require("../middleware/authMiddleware");

// Protected routes (require JWT)
router.get("/", auth, getPasswords);
router.post("/", auth, addPassword);
router.delete("/", auth, deletePassword);

module.exports = router;
