const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- PUBLIC ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running for King777 V1' });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!pool || typeof pool.query !== 'function') {
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

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                available_balance: user.available_balance
            }
        });
    } catch (err) {
        console.error('Login Catch Error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- JWT MIDDLEWARE ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access Denied: No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = decodedUser;
        next();
    });
};

// --- SECURE ROUTES ---

app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const userQuery = await pool.query(
            'SELECT id, username, role, available_balance FROM users WHERE id = $1', 
            [req.user.id]
        );
        res.json(userQuery.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/users/create', authenticateToken, async (req, res) => {
    const { username, password, role } = req.body;
    const creator = req.user;

    try {
        const validRoles = {
            'SUPER_ADMIN': ['ADMIN'],
            'ADMIN': ['MASTER'],
            'MASTER': ['AGENT'],
            'AGENT': ['PLAYER']
        };

        if (!validRoles[creator.role] || !validRoles[creator.role].includes(role)) {
            return res.status(403).json({ error: `A ${creator.role} cannot create a ${role}.` });
        }

        const userExists = await pool.query('SELECT username FROM users WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        const newUser = await pool.query(
            `INSERT INTO users (username, password_hash, master_password_hash, role, parent_id, available_balance) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, role`,
            [username, password, password, role, creator.id, 0.00]
        );

        res.json({ message: 'User created successfully', user: newUser.rows[0] });

    } catch (err) {
        console.error('Create User Error:', err.message);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.get('/api/users/downline', authenticateToken, async (req, res) => {
    try {
        const downlineQuery = await pool.query(
            'SELECT id, username, role, available_balance FROM users WHERE parent_id = $1 ORDER BY id DESC',
            [req.user.id]
        );
        res.json(downlineQuery.rows);
    } catch (err) {
        console.error('Fetch Downline Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch downline' });
    }
});
// --- TRANSFER POINTS ---
app.post('/api/users/transfer', authenticateToken, async (req, res) => {
    const { targetUserId, amount, transactionPassword } = req.body;
    const senderId = req.user.id;
    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ error: 'Invalid transfer amount' });
    }

    // Acquire a dedicated database connection for a secure transaction block
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start secure transaction

        // 1. Verify Sender and their Password
        const senderRes = await client.query('SELECT available_balance, password_hash FROM users WHERE id = $1 FOR UPDATE', [senderId]);
        const sender = senderRes.rows[0];

        if (transactionPassword !== sender.password_hash) {
            await client.query('ROLLBACK');
            return res.status(401).json({ error: 'Invalid transaction password' });
        }

        if (parseFloat(sender.available_balance) < transferAmount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient balance for transfer' });
        }

        // 2. Verify Target User is a valid downline
        const targetRes = await client.query('SELECT id FROM users WHERE id = $1 AND parent_id = $2 FOR UPDATE', [targetUserId, senderId]);
        if (targetRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Invalid target user or not in your direct downline' });
        }

        // 3. Execute the Transfer
        await client.query('UPDATE users SET available_balance = available_balance - $1 WHERE id = $2', [transferAmount, senderId]);
        await client.query('UPDATE users SET available_balance = available_balance + $1 WHERE id = $2', [transferAmount, targetUserId]);

        await client.query('COMMIT'); // Save changes securely
        res.json({ message: 'Transfer completed successfully' });

    } catch (err) {
        await client.query('ROLLBACK'); // Cancel everything if any error occurs
        console.error('Transfer Error:', err.message);
        res.status(500).json({ error: 'Transfer failed due to server error' });
    } finally {
        client.release(); // Free up the database connection
    }
});
// --- SERVER START ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`King777 Backend running on port ${PORT}`);
});