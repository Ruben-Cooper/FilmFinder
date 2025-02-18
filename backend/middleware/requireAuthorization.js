const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");

  if (!token || !req.headers.authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.token = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: true, message: "Invalid JWT token" });
  }
};
