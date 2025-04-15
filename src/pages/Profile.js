import { useEffect, useState } from 'react';
import { database, ref, get } from '../firebase';
import softwareList from '../data/softwareList';
import { motion } from 'framer-motion';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) setUserId(storedUserId);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const snapshot = await get(ref(database, 'users/' + userId));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
          if (data.mobileNumber) {
            setMobileNumber(data.mobileNumber);
            fetchCourseDetails(data.mobileNumber);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    const fetchCourseDetails = async (mobile) => {
      try {
        const courseRef = ref(database, `Users/ExpertSkill/${mobile}`);
        const snap = await get(courseRef);
        if (snap.exists()) {
          const courseData = snap.val();
          const courseList = Object.entries(courseData).map(([courseName, details]) => {
            const subSections = details?.Hindi || {};
            const totalSections = Object.keys(subSections).length;
            return {
              courseName,
              amount: details.amount,
              date: details.date,
              totalSections,
              sections: subSections
            };
          });
          setCourses(courseList);
        }
      } catch (err) {
        console.error('Error fetching course details:', err);
      }
    };

    fetchUser();
  }, [userId]);

  const getSoftwareName = (id) => {
    const software = softwareList.find((s) => s.id.toString() === id?.toString());
    return software ? software.name : 'Unknown Software';
  };

  if (!userId) return <p className="text-center text-gray-500 mt-10">🔒 Please log in to view your profile.</p>;
  if (!userData) return <p className="text-center text-gray-500 mt-10">Loading profile...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 max-w-md mx-auto"
    >
      <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-5 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-2 text-blue-700">👤 {userData.username}</h2>
        <p className="text-sm text-gray-600">Welcome back to your dashboard</p>
        <div className="mt-4 text-lg">
          <span className="font-semibold text-gray-700">Wallet:</span>{' '}
          <span className="text-green-600 font-bold">{userData.walletPoints || 0} pts</span>
        </div>
        {mobileNumber && (
          <p className="text-sm mt-2 text-blue-600">📱 Course Activated For: <strong>{mobileNumber}</strong></p>
        )}
      </div>

      {/* Show Activated Software */}
      {userData.activatedPlan ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-white border border-blue-100 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold text-blue-600 mb-2">🎯 Activated Software</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Software:</strong> {getSoftwareName(userData.softwareId)}</p>
            <p><strong>Plan:</strong> {userData.activatedPlan}</p>
            <p><strong>Activated On:</strong> {new Date(userData.activatedAt).toLocaleString()}</p>
          </div>
        </motion.div>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-gray-500 text-center"
        >
          💤 No active plan. Start exploring and activate a software to get started!
        </motion.p>
      )}

      {/* Show Courses */}
      {courses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-2">📘 Activated Courses</h3>
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-blue-100 p-4 mb-4 rounded-xl shadow-sm text-sm"
            >
              <p><strong>📚 Course:</strong> {course.courseName}</p>
              <p><strong>💰 Amount:</strong> ₹{course.amount}</p>
              <p><strong>📅 Date:</strong> {course.date}</p>
              <p><strong>🎥 Total Sections:</strong> {course.totalSections}</p>
              <ul className="mt-2 ml-4 list-disc text-gray-600">
                {Object.entries(course.sections).map(([sectionName, sec]) => (
                  <li key={sectionName}>
                    {sectionName} — Videos: {sec.Value} / {sec.Evalue}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Profile;
