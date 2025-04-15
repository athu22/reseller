// backend/generateReferralLink.js
const express = require('express');
const router = express.Router();

router.post('/generate-referral-link', (req, res) => {
  const { userId, softwareId } = req.body;

  if (!userId || !softwareId) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const baseURL = 'https://localhost:3000/referral'; // Replace with your frontend domain
  const link = `${baseURL}?ref=${userId}&course=${softwareId}`;

  return res.json({ success: true, referralLink: link });
});

module.exports = router;
