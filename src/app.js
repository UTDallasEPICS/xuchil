const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Import user routes and set them up
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// A simple home route
app.get('/', (req, res) => {
  res.send('Welcome to the XuchilDemo1 API!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});