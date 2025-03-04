const userService = require('../services/userService');

// Handler for GET /users
const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handler for POST /users
const addUser = async (req, res) => {
  try {
    const userId = await userService.createUser(req.body);
    res.status(201).json({ message: 'User created', userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  addUser
};