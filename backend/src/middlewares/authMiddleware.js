// backend/src/middlewares/authMiddleware.js

import jwt from 'jsonwebtoken';

// Use a named export instead of module.exports or exports.
export const protect = (req, res, next) => {
    let token;

    // 1. Check for token in the 'Authorization' header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (format: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token
            // IMPORTANT: Use process.env.JWT_SECRET from your .env file
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY');

            // 3. Attach user info (id and role) to the request object
            req.user = decoded; 

            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            // 403 Forbidden is often used when authentication credentials are valid but access is denied. 
            // 401 Unauthorized is used when authentication is missing or invalid. We'll stick to 401.
            return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};