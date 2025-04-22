const express = require('express');
const cors = require('cors');
const checkMobileRoute = require('./checkMobileNumber');
const activateCourseRoute = require('./activateCourse');
const profileRoutes = require('./profile');

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
  
app.use(express.json()); 

// Mount routes
app.use('/api', checkMobileRoute);
app.use('/api', activateCourseRoute);
app.use('/api', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: err.message 
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
