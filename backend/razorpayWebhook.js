const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const expertDb = require('./firebaseExpert');

const router = express.Router();

router.post('/razorpay-webhook', express.json({ verify: (req, res, buf) => { req.rawBody = buf } }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers['x-razorpay-signature'];
  const expectedSignature = crypto.createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.log('❌ Invalid Razorpay Signature');
    return res.status(400).send('Invalid signature');
  }

  const payload = req.body;

  if (payload.event === 'payment_link.paid') {
    const paymentLinkId = payload.payload.payment_link.entity.id;

    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const linkData = await razorpay.paymentLink.fetch(paymentLinkId);
      const [_, userId, courseId] = linkData.callback_url.split('/activation/');

      // Fetch user's mobile number from Firebase
      const userSnapshot = await expertDb.ref(`Users/ExpertSkill/${userId}`).once('value');
      const userData = userSnapshot.val();
      const mobileNumber = userData?.mobileNumber;

      if (!mobileNumber) {
        console.error('❌ Mobile number not found for user:', userId);
        return res.status(404).send('Mobile number not found');
      }

      const fixedDate = "18/04/2022";

      const courseData = {
        Amount: "299",
        Desc: "> 120+ Course Videos \n> 1000+ Question Database \n> Suitable For All Age Group\n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          Hindi: {
            "English Grammer": {
              Date: fixedDate,
              Evalue: "50",
              Value: "50"
            },
            "Spoken English": {
              Date: fixedDate,
              Evalue: "50",
              Value: "50"
            }
          }
        },
        Value: "6",
        Wdate: fixedDate
      };

      const premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nEnglish Grammar",
        Date: fixedDate,
        Evalue: "50",
        Value: "50"
      };

      await expertDb.ref(`Users/ExpertSkill/${mobileNumber}/Premium Course/English Speaking Course`).set(courseData);
      await expertDb.ref(`Premium Course/${mobileNumber}`).set(premiumData);

      await expertDb.ref(`paymentLinks/${userId}/${courseId}`).update({
        status: 'paid',
        paidAt: Date.now()
      });

      console.log(`✅ Course activated for mobile number: ${mobileNumber}`);
    } catch (error) {
      console.error('❌ Error processing payment webhook:', error);
    }
  }

  res.status(200).json({ status: 'ok' });
});

module.exports = router;
