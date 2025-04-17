const express = require('express');
const router = express.Router();
const expertDb = require('./firebaseExpert');



router.get('/courses/:mobile', async (req, res) => {
    const { mobile } = req.params;
  
    try {
      const ref = expertDb.ref(`Users/ExpertSkill/${mobile}`);
      const snapshot = await ref.once('value');
  
      if (!snapshot.exists()) {
        return res.status(404).json({ message: 'No course found for this mobile number.' });
      }
  
      const data = snapshot.val();
  
      // Extract metadata
      const IMEI = data.IMEI || 'N/A';
      const InsDate = data.InsDate || 'N/A';
      const status = data.status || 'N/A';
  
      // Filter out metadata
      const filteredCourses = Object.entries(data)
        .filter(([key]) => !['IMEI', 'InsDate', 'status'].includes(key))
        .map(([courseName, details]) => {
          const subSections = details?.Hindi || {};
          const totalSections = Object.keys(subSections).length;
  
          return {
            courseName,
            amount: details.amount || 0,
            date: details.date || 'N/A',
            totalSections,
            sections: subSections,
          };
        });
  
      return res.json({
        IMEI,
        InsDate,
        status,
        courses: filteredCourses,
      });
    } catch (err) {
      console.error('Error fetching course details:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
 

module.exports = router;
