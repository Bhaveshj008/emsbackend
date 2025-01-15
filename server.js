const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorMiddleware');

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


connectDB();

// Routes
app.use('/api/employees', require('./src/routes/employeeRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

// Error Handling Middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});