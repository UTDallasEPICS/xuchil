const db = require('../config/db');

// Get all products
const getAllProducts = async () => {
  const [rows] = await db.query('SELECT * FROM product');
  return rows;
};

// Get a specific product by ID
const getProductById = async (id) => {
  const [rows] = await db.query('SELECT * FROM product WHERE product_id = ?', [id]);
  return rows[0] || null;
};

module.exports = {
  getAllProducts,
  getProductById
};
