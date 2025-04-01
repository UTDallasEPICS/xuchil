const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products - Retrieve all products
router.get('/', productController.getProducts);

// GET /api/products/:id - Retrieve a specific product
router.get('/:id', productController.getProduct);

module.exports = router;
