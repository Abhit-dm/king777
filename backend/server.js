const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running for King777 V1' });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Fail-safe check to catch the exact error
        if (!pool || typeof pool.query !== 'function') {
            console.error('CRITICAL POOL ERROR. Pool is currently:', pool);
            return res.status(500).json({ error: 'Database pool failed to initialize' });
        }
        
        const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const user = userQuery.rows[0];
        
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
        console.error('Server Catch Error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`King777 Backend running on port ${PORT}`);
});