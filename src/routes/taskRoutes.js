const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /tasks - Retrieve all tasks with computed durations
router.get('/', taskController.getTasks);

// GET /tasks/:id - Retrieve a specific task by ID
router.get('/:id', taskController.getTask);

// POST /tasks - Create a new task with validation
router.post('/', taskController.addTask);

module.exports = router;