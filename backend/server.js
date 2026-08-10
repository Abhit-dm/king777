const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- V1 API ROUTES ---

// 1. Basic Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running for King777 V1' });
});

// 2. Login Endpoint (Raw password check for V1 testing)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const user = userQuery.rows[0];
        // Note: For testing V1, we are doing a raw string check. 
        // Before launch, we will implement bcrypt here!
        if (password !== user.password_hash) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                available_balance: user.available_balance
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`King777 Backend running on port ${PORT}`);
});