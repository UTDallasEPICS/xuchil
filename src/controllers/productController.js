const productService = require('../services/productService');

// Handler for GET /products
const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handler for GET /products/category/:category
const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await productService.getProductsByCategory(category);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductsByCategory
};
