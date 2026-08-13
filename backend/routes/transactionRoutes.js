const express = require('express');
const router = express.Router();
const { authenticateToken, requireSuperAdmin } = require('../middleware/authMiddleware');
const { generateTokens, getReports } = require('../controllers/transactionController');

// Only Super Admin can hit this route
router.post('/generate', authenticateToken, requireSuperAdmin, generateTokens);

// Available for reporting
router.get('/reports', authenticateToken, getReports);

module.exports = router;