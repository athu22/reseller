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
    
    if (courseType === 'english') {
      const fixedDate = "18/04/2022";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/English Speaking Course`;
      courseData = {
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
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nEnglish Grammar",
        Date: fixedDate,
        Evalue: "50",
        Value: "50"
      };
    }

    if (courseType === 'computer') {
      const fixedDate = "12/11/2021";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/Advanced Computer Course`;
      courseData = {
        Amount: "999",
        Desc: "> 100+ Study Videos \n> 500+ Question Database \n> Suitable For Above 14+ Age Group \n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          Hindi: {
            "Computer Course": {
              Date: fixedDate,
              Evalue: "90",
              Value: "90"
            }
          },
          Marathi: {
            "Computer Course": {
              Date: fixedDate,
              Evalue: "90",
              Value: "90"
            }
          }
        },
        Value: "8",
        Wdate: fixedDate
      };
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nMarathi\nComputer Course",
        Date: fixedDate,
        Evalue: "90",
        Value: "90"
      };
    }

    if (courseType === 'basic') {
      const fixedDate = "30/10/2021";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/Basic Computer Course`;
      courseData = {
        Amount: "499",
        Desc: "> 60+ Study Videos \n> 500+ Question Database \n> Suitable For Above 14+ Age Group\n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          Hindi: {
            "Computer Course": {
            Date: fixedDate,
            Evalue: "60",
            Value: "60"
            }
          },
          Marathi: {
            "Computer Course": {
            Date: fixedDate,
            Evalue: "60",
            Value: "60"
          }
        }
        },
        Value: "7",
        Wdate: fixedDate
      };
      
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nMarathi\nComputer Course",
        Date: fixedDate,
        Evalue: "60",
        Value: "60"
      };
    }
    if (courseType === 'android') {
      fixedDate = "18/04/2022";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/Android Development Course`;
      courseData = {
        Amount: "3498",
        Desc: "> 120+ Study Videos \n> 3000+ Question Database \n> Suitable For 15+ Age Group\n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          Hindi: {
            "Android":{
            Date: fixedDate,
            Evalue: "120",
            Value: "120"
            }
          },
          Marathi: {
            "Android":{
            Date: fixedDate,
            Evalue: "120",
            Value: "120"
          }
        }
        },
        Value: "9",
        Wdate: fixedDate
      };
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nMarathi",
        Date: fixedDate,
        Evalue: "120",
        Value: "120"
      };
    }
    if (courseType === 'brain') {
      fixedDate = "18/04/2022";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/Brain Development Course`;
      courseData = {
        Amount: "699",
        Desc: "> 100+ National Level Animation Videos \n> 2100+ Question Database \n> Suitable For 3rd to 5th Class \n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          English: {
            "Environmental science": {
              Date: fixedDate,
              Evalue: "51",
              Value: "51"
            },
            Mathematics: {
              Date: fixedDate,
              Evalue: "47",
              Value: "47"
            },
            Science: {
              Date: fixedDate,
              Evalue: "17",
              Value: "17"
            }
          },
          Hindi: {
            "Environmental science": {
              Date: fixedDate,
              Evalue: "43",
              Value: "43"
            },
            Mathematics: {
              Date: fixedDate,
              Evalue: "44",
              Value: "44"
            },
            Science: {
              Date: fixedDate,
              Evalue: "8",
              Value: "8"
            }
          }
        },
        Value: "2",
        Wdate: fixedDate
      };
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nEnglish\nEnvironmental science\nMathematics\nScience",
        Date: fixedDate,
        Evalue: "51",
        Value: "51"
      };
    }
    if (courseType === 'career1') {
      fixedDate = "18/04/2022";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/Career Development Course Part-I`;
      courseData = {
        Amount: "1499",
        Desc: "> 120+ National Level Animation Videos \n> 3000+ Question Database \n> Suitable For 9th and 10th Class\n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          English: {
            Biology: {
              Date: fixedDate,
              Evalue: "28",
              Value: "28"
            },
            Chemistry: {
              Date: fixedDate,
              Evalue: "14",
              Value: "14"
            },
            Mathematics: {
              Date: fixedDate,
              Evalue: "37",
              Value: "37"
            },
            Physics: {
              Date: fixedDate,
              Evalue: "12",
              Value: "12"
            }
          },
          Hindi: {
            Biology: {
              Date: fixedDate,
              Evalue: "28",
              Value: "28"
            },
            Chemistry: {
              Date: fixedDate,
              Evalue: "14",
              Value: "14"
            },
            Mathematics: {
              Date: fixedDate,
              Evalue: "33",
              Value: "33"
            },
            Physics: {
              Date: fixedDate,
              Evalue: "13",
              Value: "13"
            }
          }
        },
        Value: "4",
        Wdate: fixedDate
      };
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nEnglish\nBiology\nChemistry\nMathematics\nPhysics",
        Date: fixedDate,
        Evalue: "37",
        Value: "37"
      };
    }
    if (courseType === 'career2') {
      fixedDate = "18/04/2022";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/Career Development Course Part-II`;
      courseData = {
        Amount: "1999",
        Desc: "> 320+ National Level Animation Videos \n> 3000+ Question Database \n> Suitable For 9th and 10th Class\n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          English: {
            Biology: {
              Date: fixedDate,
              Evalue: "68",
              Value: "68"
            },
            Chemistry: {
              Date: fixedDate,
              Evalue: "41",
              Value: "41"
            },
            Mathematics: {
              Date: fixedDate,
              Evalue: "45",
              Value: "45"
            },
            Physics: {
              Date: fixedDate,
              Evalue: "36",
              Value: "36"
            }
          },
          Hindi: {
            Biology: {
              Date: fixedDate,
              Evalue: "66",
              Value: "66"
            },
            Chemistry: {
              Date: fixedDate,
              Evalue: "41",
              Value: "41"
            },
            Mathematics: {
              Date: fixedDate,
              Evalue: "42",
              Value: "42"
            },
            Physics: {
              Date: fixedDate,
              Evalue: "35",
              Value: "35"
            }
          }
        },
        Value: "5",
        Wdate: fixedDate
      };
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nEnglish\nBiology\nChemistry\nMathematics\nPhysics",
        Date: fixedDate,
        Evalue: "68",
        Value: "68"
      };
    }
    if (courseType === 'foundation') {
      fixedDate = "18/04/2022";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/Foundation Development Course`;
      courseData = {
        Amount: "699",
        Desc: "> 70+ National Level Animation Videos \n> 2100+ Question Database \n> Suitable For K.G to 2nd Class \n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          English: {
            "Environmental science": {
              Date: fixedDate,
              Evalue: "29",
              Value: "29"
            },
            "GK and Rhymes": {
              Date: fixedDate,
              Evalue: "17",
              Value: "17"
            },
            Mathematics: {
              Date: fixedDate,
              Evalue: "29",
              Value: "29"
            }
          },
          Hindi: {
            "Environmental science": {
              Date: fixedDate,
              Evalue: "36",
              Value: "36"
            },
            Mathematics: {
              Date: fixedDate,
              Evalue: "21",
              Value: "21"
            }
          }
        },
        Value: "1",
        Wdate: fixedDate
      };
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nEnglish\nEnvironmental science\nGK and Rhymes\nMathematics",
        Date: fixedDate,
        Evalue: "36",
        Value: "36"
      };
    }
    if (courseType === 'skill') {
      fixedDate = "18/04/2022";
      coursePath = `Users/ExpertSkill/${mobileNumber}/Premium Course/Skill Development Course`;
      courseData = {
        Amount: "999",
        Desc: "> 120+ National Level Animation Videos \n> 2100+ question database \n> Suitable For 6th to 8th Class\n> In-App Study & Exam for Students",
        PDate: fixedDate,
        Section: {
          English: {
            Mathematics: {
              Date: fixedDate,
              Evalue: "39",
              Value: "39"
            },
            Science: {
              Date: fixedDate,
              Evalue: "69",
              Value: "69"
            }
          },
          Hindi: {
            Mathematics: {
              Date: fixedDate,
              Evalue: "41",
              Value: "41"
            },
            Science: {
              Date: fixedDate,
              Evalue: "48",
              Value: "48"
            }
          }
        },
        Value: "3",
        Wdate: fixedDate
      };
      premiumData = {
        Desc: courseData.Desc,
        PDate: fixedDate,
        Section: "Hindi\nEnglish\nMathematics\nScience",
        Date: fixedDate,
        Evalue: "69",
        Value: "69"
      };
    }
        



    

    // Save main course and premium summary
    const courseRef = db.ref(coursePath);
    const snapshot = await courseRef.once('value');
    
    if (snapshot.exists()) {
      // If the course node exists, return a message indicating the course is already activated
      return res.json({ success: false, message: 'Course is already activated for this user.' });
    }

    // Save main course and premium summary if the course does not exist
    await courseRef.set(courseData);
    await db.ref(`${mobileNumber}/Premium Course`).set(premiumData);

    return res.json({ success: true, message: 'Course activated successfully' });

  } catch (err) {
    console.error('Activation Error:', err);
    return res.status(500).json({ success: false, message: 'Server error during activation' });
  }
});






module.exports = router;
