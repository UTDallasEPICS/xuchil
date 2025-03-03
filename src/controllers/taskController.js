const taskService = require('../services/taskService');

// Handler for GET /tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handler for GET /tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json(task);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Handler for POST /tasks
const addTask = async (req, res) => {
  try {
    const taskId = await taskService.createTask(req.body);
    res.status(201).json({ message: 'Task created', taskId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  addTask
};
