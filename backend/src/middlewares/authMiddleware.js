// backend/src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';

// Use a named export instead of module.exports or exports.
export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "YOUR_SUPER_SECRET_KEY");

      console.log("✅ Decoded token:", decoded);

      req.user = decoded;
      return next();
    } catch (error) {
      console.error("❌ Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed or expired." });
    }
  }

  console.error("❌ No token provided");
  return res.status(401).json({ message: "Not authorized, no token provided." });
};
