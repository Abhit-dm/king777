const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import Modular Routes
const transactionRoutes = require('./routes/transactionRoutes');
// (Note: In Phase 2, we will move users/auth into their own route files too)

// Apply Routes
app.use('/api/transactions', transactionRoutes);

// Keep existing auth/user routes below for now until we refactor them next...
// [Your existing login, create user, downline, and transfer routes stay here for now]

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`King777 Backend running on port ${PORT}`);
});