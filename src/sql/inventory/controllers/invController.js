const invService = require('../services/invServices');

// Handler for GET /inventory/{id?}
const getInventory = async (req, res) => {
  try {
    const { id } = req.params; 
    
    // If an id is provided, search for that specific inventory item
    if (id) {
      const inventory = await invService.getInventoryItem(id);
      
      // Check if the item was found
      if (inventory.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      return res.status(200).json(inventory);
    } else {
      // If no id, return all inventory items
      const inventory = await invService.getInventory();
      return res.status(200).json(inventory);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Handler for POST /inventory
const addToInventory = async (req, res) => {
  try {
    const inventoryId = await invService.createInventoryItem(req.body);
    res.status(201).json({ message: 'Item added to inventory: ', inventoryId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handler to PUT /inventory/{id}
const updateInventory = async (req, res) => {
  try {
    const inventoryId = await invService.createInventoryItem(req.body);
    res.status(201).json({ message: 'Item updated: ', inventoryId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getInventory,
  addToInventory,
  updateInventory
};