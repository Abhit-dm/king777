const pool = require('../db');

// Super Admin generates new tokens into their own account
const generateTokens = async (req, res) => {
    const { amount } = req.body;
    const adminId = req.user.id;
    const mintAmount = parseFloat(amount);

    if (isNaN(mintAmount) || mintAmount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Add to Super Admin balance
        await client.query('UPDATE users SET available_balance = available_balance + $1 WHERE id = $2', [mintAmount, adminId]);
        
        // Log to immutable ledger
        await client.query(
            'INSERT INTO transactions (sender_id, receiver_id, type, amount) VALUES ($1, $2, $3, $4)',
            [adminId, adminId, 'GENERATE', mintAmount]
        );

        await client.query('COMMIT');
        res.json({ message: `${mintAmount} tokens generated successfully.` });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Token generation failed.' });
    } finally {
        client.release();
    }
};

// Fetch reports with custom date filters
const getReports = async (req, res) => {
    const { startDate, endDate, type } = req.query;
    let query = `
        SELECT t.id, t.type, t.amount, t.created_at, 
               s.username AS sender, r.username AS receiver 
        FROM transactions t
        LEFT JOIN users s ON t.sender_id = s.id
        LEFT JOIN users r ON t.receiver_id = r.id
        WHERE 1=1
    `;
    const values = [];

    if (startDate) {
        values.push(startDate);
        query += ` AND t.created_at >= $${values.length}`;
    }
    if (endDate) {
        // Add 1 day to include the full end date
        values.push(`${endDate} 23:59:59`); 
        query += ` AND t.created_at <= $${values.length}`;
    }
    if (type) {
        values.push(type);
        query += ` AND t.type = $${values.length}`;
    }

    query += ' ORDER BY t.created_at DESC';

    try {
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports.' });
    }
};

module.exports = { generateTokens, getReports };