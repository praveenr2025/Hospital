// backend/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../db/dbService.js'; 


const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY', {
        expiresIn: '1h', 
    });
};


export const register = async (req, res) => {
    const { email, password, role, full_name } = req.body; 


     const allowedRoles = ['doctor', 'nurse', 'receptionist', 'admin'];
    if (!email || !password || !role || !allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'Please provide valid email, password, and a staff role.' });
    }

    try {

        const existingUser = await db.findUserByEmail(email); 
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.createUser({
            email,
            password_hash: hashedPassword,
            role, 
            full_name: full_name || 'Staff Member',
        });

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


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await db.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

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


export const getCurrentUser = async (req, res) => {
    const user = await db.findUserById(req.user.id);
    
    if (user) {
        res.json({
            id: user.user_id,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
        });
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
};
