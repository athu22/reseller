const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Load Firebase service account key
const serviceAccount = require('./smartalc-b7eec-firebase-adminsdk-39dk5-4934640224.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://smartalc-b7eec.firebaseio.com',
  });
}

const db = admin.database();

router.post('/activate-course', async (req, res) => {
  const { userId, mobileNumber, courseType } = req.body;

  if (!userId || !mobileNumber || !courseType) {
    return res.status(400).json({ success: false, message: 'Missing user ID, mobile number, or course type' });
  }

  try {
    let coursePath = '';
    let courseData = {};
    let premiumData = {};
    let fixedDate = "18/04/2022";

    const courseConfig = {
      english: {
        path: "English Speaking Course",
        amount: "299",
        desc: "> 120+ Course Videos \n> 1000+ Question Database \n> Suitable For All Age Group\n> In-App Study & Exam for Students",
        section: {
          Hindi: {
            "English Grammer": { Evalue: "50", Value: "50" },
            "Spoken English": { Evalue: "50", Value: "50" }
          }
        },
        value: "6"
      },
      computer: {
        path: "Advanced Computer Course",
        amount: "999",
        desc: "> 100+ Study Videos \n> 500+ Question Database \n> Suitable For Above 14+ Age Group \n> In-App Study & Exam for Students",
        fixedDate: "12/11/2021",
        section: {
          Hindi: { "Computer Course": { Evalue: "90", Value: "90" } },
          Marathi: { "Computer Course": { Evalue: "90", Value: "90" } }
        },
        value: "8"
      },
      basic: {
        path: "Basic Computer Course",
        amount: "499",
        fixedDate: "30/10/2021",
        desc: "> 60+ Study Videos \n> 500+ Question Database \n> Suitable For Above 14+ Age Group\n> In-App Study & Exam for Students",
        section: {
          Hindi: { "Computer Course": { Evalue: "60", Value: "60" } },
          Marathi: { "Computer Course": { Evalue: "60", Value: "60" } }
        },
        value: "7"
      },
      android: {
        path: "Android Development Course",
        amount: "3498",
        desc: "> 120+ Study Videos \n> 3000+ Question Database \n> Suitable For 15+ Age Group\n> In-App Study & Exam for Students",
        section: {
          Hindi: { "Android": { Evalue: "120", Value: "120" } },
          Marathi: { "Android": { Evalue: "120", Value: "120" } }
        },
        value: "9"
      },
      brain: {
        path: "Brain Development Course",
        amount: "699",
        desc: "> 100+ National Level Animation Videos \n> 2100+ Question Database \n> Suitable For 3rd to 5th Class \n> In-App Study & Exam for Students",
        section: {
          English: {
            "Environmental science": { Evalue: "51", Value: "51" },
            Mathematics: { Evalue: "47", Value: "47" },
            Science: { Evalue: "17", Value: "17" }
          },
          Hindi: {
            "Environmental science": { Evalue: "43", Value: "43" },
            Mathematics: { Evalue: "44", Value: "44" },
            Science: { Evalue: "8", Value: "8" }
          }
        },
        value: "2"
      },
      career1: {
        path: "Career Development Course Part-I",
        amount: "1499",
        desc: "> 120+ National Level Animation Videos \n> 3000+ Question Database \n> Suitable For 9th and 10th Class\n> In-App Study & Exam for Students",
        section: {
          English: {
            Biology: { Evalue: "28", Value: "28" },
            Chemistry: { Evalue: "14", Value: "14" },
            Mathematics: { Evalue: "37", Value: "37" },
            Physics: { Evalue: "12", Value: "12" }
          },
          Hindi: {
            Biology: { Evalue: "28", Value: "28" },
            Chemistry: { Evalue: "14", Value: "14" },
            Mathematics: { Evalue: "33", Value: "33" },
            Physics: { Evalue: "13", Value: "13" }
          }
        },
        value: "4"
      },
      career2: {
        path: "Career Development Course Part-II",
        amount: "1999",
        desc: "> 320+ National Level Animation Videos \n> 3000+ Question Database \n> Suitable For 9th and 10th Class\n> In-App Study & Exam for Students",
        section: {
          English: {
            Biology: { Evalue: "68", Value: "68" },
            Chemistry: { Evalue: "41", Value: "41" },
            Mathematics: { Evalue: "45", Value: "45" },
            Physics: { Evalue: "36", Value: "36" }
          },
          Hindi: {
            Biology: { Evalue: "66", Value: "66" },
            Chemistry: { Evalue: "41", Value: "41" },
            Mathematics: { Evalue: "42", Value: "42" },
            Physics: { Evalue: "35", Value: "35" }
          }
        },
        value: "5"
      },
      foundation: {
        path: "Foundation Development Course",
        amount: "699",
        desc: "> 70+ National Level Animation Videos \n> 2100+ Question Database \n> Suitable For K.G to 2nd Class \n> In-App Study & Exam for Students",
        section: {
          English: {
            "Environmental science": { Evalue: "29", Value: "29" },
            "GK and Rhymes": { Evalue: "17", Value: "17" },
            Mathematics: { Evalue: "29", Value: "29" }
          },
          Hindi: {
            "Environmental science": { Evalue: "36", Value: "36" },
            Mathematics: { Evalue: "21", Value: "21" }
          }
        },
        value: "1"
      },
      skill: {
        path: "Skill Development Course",
        amount: "999",
        desc: "> 120+ National Level Animation Videos \n> 2100+ question database \n> Suitable For 6th to 8th Class\n> In-App Study & Exam for Students",
        section: {
          English: {
            Mathematics: { Evalue: "39", Value: "39" },
            Science: { Evalue: "69", Value: "69" }
          },
          Hindi: {
            Mathematics: { Evalue: "41", Value: "41" },
            Science: { Evalue: "48", Value: "48" }
          }
        },
        value: "3"
      }
    };

    const selectedCourse = courseConfig[courseType];

    if (!selectedCourse) {
      return res.status(400).json({ success: false, message: 'Invalid course type' });
    }

    // Use custom date if provided
    if (selectedCourse.fixedDate) fixedDate = selectedCourse.fixedDate;

    coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/${selectedCourse.path}`;

    courseData = {
      Amount: selectedCourse.amount,
      Desc: selectedCourse.desc,
      PDate: fixedDate,
      Section: {},
      Value: selectedCourse.value,
      Wdate: fixedDate
    };

    for (const lang in selectedCourse.section) {
      courseData.Section[lang] = {};
      for (const topic in selectedCourse.section[lang]) {
        courseData.Section[lang][topic] = {
          Date: fixedDate,
          Evalue: selectedCourse.section[lang][topic].Evalue,
          Value: selectedCourse.section[lang][topic].Value
        };
      }
    }

    premiumData = {
      Desc: selectedCourse.desc,
      PDate: fixedDate,
      Section: Object.entries(selectedCourse.section).map(([lang, topics]) =>
        Object.keys(topics).map(topic => `${lang} ${topic}`)
      ).flat().join('\n'),
      Date: fixedDate,
      Evalue: Object.values(selectedCourse.section)[0][Object.keys(selectedCourse.section[Object.keys(selectedCourse.section)[0]])[0]].Evalue,
      Value: Object.values(selectedCourse.section)[0][Object.keys(selectedCourse.section[Object.keys(selectedCourse.section)[0]])[0]].Value
    };

    const courseRef = db.ref(coursePath);
    const snapshot = await courseRef.once('value');

    if (snapshot.exists()) {
      return res.json({ success: false, message: 'Course is already activated for this user.' });
    }

    // Write data
    await courseRef.set(courseData);
    await db.ref(`${mobileNumber}/Premium Course`).set(premiumData);

    // ✅ Update status to Prime User
    await db.ref(`Users/ExpertSkill/${mobileNumber}/Status`).set('Prime User');

    return res.json({ success: true, message: 'Course activated and status updated to Prime User' });

  } catch (err) {
    console.error('Activation Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during activation' });
  }
});

module.exports = router;
