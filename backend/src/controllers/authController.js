// backend/src/controllers/authController.js

// 1. Use 'import' for third-party packages
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 2. Use 'import' for local files (Note the .js extension!)
// Assuming dbService exports its functions individually or as a default object
import * as db from '../db/dbService.js'; 

// Helper function to generate a JWT token
const generateToken = (id, role) => {
    // IMPORTANT: Use process.env.JWT_SECRET from your .env file
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY', {
        expiresIn: '1h', 
    });
};

// --- Register / Signup ---
export const register = async (req, res) => {
    const { email, password, role, full_name } = req.body; 

    // Basic Validation
     const allowedRoles = ['doctor', 'nurse', 'receptionist', 'admin'];
    if (!email || !password || !role || !allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Please provide valid email, password, and a staff role.' });
    }

    try {
        // 1. Check if user exists 
        const existingUser = await db.findUserByEmail(email); 
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email.' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the user in the database
        const newUser = await db.createUser({
            email,
            password_hash: hashedPassword,
            role, 
            full_name: full_name || 'Staff Member',
        });

        // 4. Respond with token
        res.status(201).json({
            message: 'Registration successful. User created.',
            token: generateToken(newUser.user_id, newUser.role),
            user: { id: newUser.user_id, email: newUser.email, role: newUser.role },
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// --- Login ---
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find user by email
        const user = await db.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // 3. Send token and user info
        res.status(200).json({
            token: generateToken(user.user_id, user.role),
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role, 
                full_name: user.full_name,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// --- Get Current User ---
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("❌ No user decoded from token");
      return res.status(401).json({ message: "Not authorized, token missing or invalid." });
    }

    const user = await db.findUserById(req.user.id);

    if (!user) {
      console.error(`❌ No user found in DB for ID: ${req.user.id}`);
      return res.status(404).json({ message: "User not found." });
    }

    console.log(`✅ User fetched: ${user.full_name} (${user.role})`);

    res.json({
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({ message: "Server error while fetching user." });
  }
};
