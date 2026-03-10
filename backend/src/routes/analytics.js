const express = require('express');
const authenticate = require('../middleware/auth');
const { getDashboardStats, startSession, endSession } = require('../controllers/analyticsController');

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.post('/sessions/start', startSession);
router.patch('/sessions/:id/end', endSession);

module.exports = router;
