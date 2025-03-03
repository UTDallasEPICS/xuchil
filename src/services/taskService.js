const db = require('../config/db');

// Helper function to compute duration (in hours) from start to end timestamps.
const computeDurationHours = (start, end) => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate - startDate; // difference in milliseconds
  return diffMs / (1000 * 60 * 60); // convert ms to hours
};

// Get all tasks with computed duration if task is done.
const getAllTasks = async () => {
  const [rows] = await db.query('SELECT * FROM tasks');
  return rows.map(task => {
    if (task.status === 'done' && task.start_timestamp && task.end_timestamp) {
      task.durationHours = computeDurationHours(task.start_timestamp, task.end_timestamp);
    } else {
      task.durationHours = null;
    }
    return task;
  });
};

// Get a single task by id and compute its duration.
const getTaskById = async (id) => {
  const [rows] = await db.query('SELECT * FROM tasks WHERE log_id = ?', [id]);
  if (rows.length === 0) {
    throw new Error('Task not found');
  }
  const task = rows[0];
  if (task.status === 'done' && task.start_timestamp && task.end_timestamp) {
    task.durationHours = computeDurationHours(task.start_timestamp, task.end_timestamp);
  } else {
    task.durationHours = null;
  }
  return task;
};

// Create a new task with validation logic.
const createTask = async (taskData) => {
  const {
    worker_id,
    product_id,
    activity,
    input_weight,
    output_weight,
    loss_weight,
    status,
    start_timestamp,
    end_timestamp,
    notes
  } = taskData;

  // Business rule: if task status is 'done', end_timestamp must be provided.
  if (status === 'done' && !end_timestamp) {
    throw new Error('End timestamp is required when task status is done.');
  }
  
  const [result] = await db.query(
    `INSERT INTO tasks 
      (worker_id, product_id, activity, input_weight, output_weight, loss_weight, status, start_timestamp, end_timestamp, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [worker_id, product_id, activity, input_weight, output_weight, loss_weight, status, start_timestamp, end_timestamp, notes]
  );
  return result.insertId;
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask
};
