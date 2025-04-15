const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Load your service account key (JSON file from Firebase project settings)
const serviceAccount = require('./smartalc-b7eec-firebase-adminsdk-39dk5-e162430cfc.json');

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

    if (snapshot.exists()) {
      const data = snapshot.val();
      return res.json({
        success: true,
        imei: data.IMEI || 'N/A',
        insDate: data.InsDate || 'N/A',
        status: data.status || 'N/A',
      });
    } else {
      return res.json({ success: false, message: 'Install the app' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
