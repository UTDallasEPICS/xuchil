const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Import user routes and set them up
const invRoutes = require('./routes/invRoutes');
app.use('/inventory', invRoutes);

// A simple home route
app.get('/', (req, res) => {
  res.send('Inventory query test');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});