const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');

// GET /inventory - Retrieve entire inventory
router.get('/getInv/:id?', invController.getInventory);

// POST /inventory - post a new item to the inventory
router.post('/add2inv', invController.addToInventory);

// PUT /inventory - update an existing item in the inventory
router.put('/updateItem/:id', invController.updateInventory)

module.exports = router;