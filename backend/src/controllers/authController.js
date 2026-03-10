const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password } = req.body;

  if (User.findByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  if (User.findByUsername(username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = User.create({ email, username, passwordHash });
  const token = generateToken(user);

  res.status(201).json({ user, token });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = User.findByEmail(email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user);
  const { password_hash, ...userData } = user;

  res.json({ user: userData, token });
}

function getProfile(req, res) {
  const user = User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
}

module.exports = { signup, login, getProfile };
