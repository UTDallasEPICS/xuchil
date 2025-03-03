const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /products - Retrieve all products
router.get('/', productController.getProducts);

// GET /products/category/:category - Retrieve products filtered by category
router.get('/category/:category', productController.getProductsByCategory);

module.exports = router;
