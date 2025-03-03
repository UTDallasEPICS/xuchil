const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /users - Retrieve all users
router.get('/', userController.getUsers);

// POST /users - Create a new user
router.post('/', userController.addUser);

module.exports = router;
