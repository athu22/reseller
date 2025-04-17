const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Load your service account key (JSON file from Firebase project settings)
const serviceAccount = require('./smartalc-b7eec-firebase-adminsdk-39dk5-4934640224.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://smartalc-b7eec.firebaseio.com',
  });
}

const db = admin.database();

router.get('/check-number/:number', async (req, res) => {
  const number = req.params.number;
  try {
    const ref = db.ref(`Users/ExpertSkill/${number}`);
    const snapshot = await ref.once('value');

    if (!snapshot.exists()) {
      return res.json({ success: false, message: 'Install the app' });
    }

    const data = snapshot.val();
    const imei = data.IMEI || 'N/A';
    const insDate = data.InsDate || 'N/A';
    const status = data.status || 'N/A';

    const courseRef = db.ref(`Users/ExpertSkill/${number}/Premium Course`);
    const courseSnapshot = await courseRef.once('value');
    const courses = [];

    if (courseSnapshot.exists()) {
      const courseData = courseSnapshot.val();
      for (const [courseName, courseInfo] of Object.entries(courseData)) {
        const amount = courseInfo.Amount || 0;
        const sections = courseInfo.Section || {};

        const formattedSections = Object.entries(sections).map(([lang, topics]) => ({
          language: lang,
          topics: Object.entries(topics).map(([topic, details]) => ({
            topic,
            value: details.Value || 0,
            evalue: details.Evalue || 0,
            date: details.Date || 'N/A',
          })),
        }));

        courses.push({
          courseName,
          amount,
          sections: formattedSections,
        });
      }
    }

    return res.json({
      success: true,
      imei,
      insDate,
      status,
      courses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
