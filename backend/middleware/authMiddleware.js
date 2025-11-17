const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header)
      return res.status(401).json({ error: "No authorization header" });

    const token = header.split(" ")[1];
    if (!token)
      return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid token" });
  }
};
