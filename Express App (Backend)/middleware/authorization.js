const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  req.token = null;

  if (authHeader) {
    const parts = authHeader.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.token = decoded;
        next();
      } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
          res.status(401).json({ error: true, message: "JWT token has expired" });
        } else if (e instanceof jwt.JsonWebTokenError) {
          res.status(401).json({ error: true, message: "Invalid JWT token" });
        }
      }
    } else {
      res.status(401).json({ error: true, message: "Authorization header is malformed" });
    }
  } else {
    next();
  }
};
