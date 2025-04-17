const express = require('express');
const cors = require('cors');
const checkMobileRoute = require('./checkMobileNumber');
const activateCourseRoute = require('./activateCourse');
const profileRoutes = require('./profile');




const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));
  
app.use(express.json()); 

app.use('/api', checkMobileRoute);
app.use('/api', activateCourseRoute);
app.use('/api', profileRoutes);





const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
