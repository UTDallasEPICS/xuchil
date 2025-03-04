const db = require('../config/db');

// Get all users from the database
const getAllUsers = async () => {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
};

// Create a new user in the database
const createUser = async (userData) => {
  const { username, password, role, email, phoneno } = userData;
  const [result] = await db.query(
    'INSERT INTO users (username, password, role, email, phoneno) VALUES (?, ?, ?, ?, ?)',
    [username, password, role, email, phoneno]
  );
  return result.insertId;
};

module.exports = {
  getAllUsers,
  createUser
}; 