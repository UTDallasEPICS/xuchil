const mysql = require('mysql2');

// Create a connection pool with correct host and port settings
const pool = mysql.createPool({
  host: 'localhost',           // Only the host name
  port: 3306,                  // Specify the port separately
  user: 'root', // Replace with your MySQL username
  password: 'root', // Replace with your MySQL password
  database: 'xuchilDemo1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
