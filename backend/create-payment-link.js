require('dotenv').config(); // 👈 Add this line first
const express = require('express');
const Razorpay = require('razorpay');
const expertDb = require('./firebaseExpert');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
// console.log('Razorpay Key Secret:', process.env.RAZORPAY_KEY_SECRET);


router.post('/', async (req, res) => {
  const { courseName, amount, userId, courseId } = req.body;

  if (!courseName || !amount || !userId || !courseId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: parseInt(amount) * 100,
      currency: 'INR',
      accept_partial: false,
      description: `Payment for ${courseName}`,
      // ❌ Don't set customer.contact here — Razorpay will ask user to fill it
      notify: {
        sms: false,
        email: false,
      },
      callback_url: `http://localhost:3000/activation/${userId}/${courseId}`,
      callback_method: 'get',
    });

    const paymentLinkUrl = paymentLink.short_url;

    const paymentRefPath = `paymentLinks/${userId}/${courseId}`;
    await expertDb.ref(paymentRefPath).set({
      courseName,
      amount,
      paymentLink: paymentLinkUrl,
      status: 'pending',
      createdAt: Date.now(),
    });

    return res.status(200).json({
      success: true,
      link: paymentLinkUrl,
      message: 'Payment link created successfully',
    });

  } catch (error) {
    console.error('❌ Razorpay Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment link',
      error: error?.error?.description || error.message || 'Unknown error',
    });
  }
});

module.exports = router;
