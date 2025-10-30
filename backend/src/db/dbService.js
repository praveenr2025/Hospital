// backend/src/db/dbService.js (UPDATED)

// Import the configured pool from the new config file
import pool from '../config/db.js'; 

// --- Authentication Functions ---

export const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

// ... (createUser and findUserById functions remain the same, using 'pool') ...

export const createUser = async ({ email, password_hash, role, full_name }) => {
    const query = `
        INSERT INTO users (email, password_hash, role, full_name)
        VALUES ($1, $2, $3, $4) 
        RETURNING user_id, email, role;
    `;
    const values = [email, password_hash, role, full_name];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const findUserById = async (id) => {
    const query = 'SELECT user_id, email, role, full_name FROM users WHERE user_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};