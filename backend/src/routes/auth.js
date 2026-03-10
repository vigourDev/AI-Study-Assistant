const express = require('express');
const { body } = require('express-validator');
const { signup, login, getProfile } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('username').isLength({ min: 3, max: 30 }).trim().escape().withMessage('Username must be 3-30 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/profile', authenticate, getProfile);

module.exports = router;
