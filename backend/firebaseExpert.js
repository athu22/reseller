const admin = require('firebase-admin');
const serviceAccount = require('./smartalc-b7eec-firebase-adminsdk-39dk5-4934640224.json'); // Make sure this file is .gitignored

const expertApp = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://smartalc-b7eec.firebaseio.com', // change this to your ExpertSkill DB
  },
  'expertApp' // naming it to avoid conflicts with your main Firebase instance
);

const expertDb = expertApp.database();
module.exports = expertDb;
