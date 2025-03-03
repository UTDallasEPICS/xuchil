const db = require('../config/db');

// Retrieve all products.
const getAllProducts = async () => {
  const [rows] = await db.query('SELECT * FROM products');
  return rows;
};

// Retrieve products by category.
const getProductsByCategory = async (category) => {
  const [rows] = await db.query('SELECT * FROM products WHERE category = ?', [category]);
  return rows;
};

module.exports = {
  getAllProducts,
  getProductsByCategory
};
