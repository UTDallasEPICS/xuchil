const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Import user routes and set them up
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// Import and use task routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/tasks', taskRoutes);

// Import and use product routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// A simple home route
app.get('/', (req, res) => {
  res.send('Welcome to the XuchilDemo1 API!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
