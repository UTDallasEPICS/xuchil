const db = require('../config/db');

// Get all items from inventory database
const getInventory = async () => {
  const [rows] = await db.query('SELECT * FROM inventory');
  return rows;
};

// Get item by ID from inventory database
const getInventoryItem = async (id) => {
  const [rows] = await db.query('SELECT * FROM inventory WHERE product_id = ?', [id]);
  return rows;
};

// Create a new inventory item in the inventory database
const createInventoryItem = async (itemData) => {
  const { product_id, quantity, threshold } = itemData;
  const [result] = await db.query(
    'INSERT INTO inventory (product_id, quantity, threshold) VALUES (?, ?, ?)',
    [product_id, quantity, threshold]
  );
  return result.insertId;
};

// Update an existing inventory item in the inventory database
const updateInventoryItem = async (itemData) => {
  const { product_id, quantity, threshold } = itemData;
  
  // Ensure `id` is passed to identify the item to be updated
  const [result] = await db.query(
    'UPDATE inventory SET quantity = ?, threshold = ? WHERE product_id = ?',
    [quantity, threshold, product_id]
  );
  
  // If `affectedRows` is 0, item does not exist
  if (result.affectedRows === 0) {
    throw new Error('Inventory item not found');
  }

  return result.affectedRows; 
};


module.exports = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem
};