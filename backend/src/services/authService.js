const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function signup(email, password) {
  const db = await getDb();

  // Check if user already exists
  const existing = db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 400;
    throw err;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user
  db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);

  const user = db.get('SELECT id, email FROM users WHERE email = ?', [email]);

  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return { user, token };
}

async function login(email, password) {
  const db = await getDb();

  // Find user
  const user = db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  // Generate JWT
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return { user: { id: user.id, email: user.email }, token };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired token');
    error.status = 401;
    throw error;
  }
}

module.exports = { signup, login, verifyToken };
