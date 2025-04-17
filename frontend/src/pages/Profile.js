import { useEffect, useState } from 'react';
import { database, ref, get } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [imei, setImei] = useState('');
  const [insDate, setInsDate] = useState('');
  const [status, setStatus] = useState('');
  const [number, setNumber] = useState('');
  const [searchNumber, setSearchNumber] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const [expandedCourseIndex, setExpandedCourseIndex] = useState(null);


  const fetchImeiAndCourses = async (mobile) => {
    try {
      const response = await fetch(`http://localhost:5050/api/check-number/${mobile}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setImei(data.imei);
      setNumber(data.number);
      setInsDate(data.insDate);
      setStatus(data.status);
      setCourses(data.courses);
    } catch (err) {
      console.error('Error fetching IMEI and courses:', err);
    }
  };

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
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchUser();
  }, [userId]);

  if (!userId) return <p className="text-center text-gray-500 mt-10">🔒 Please log in to view your profile.</p>;
  if (!userData) return <p className="text-center text-gray-500 mt-10">Loading profile...</p>;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.4 }}
      className="p-4 max-w-md mx-auto"
    >
      {/* Profile Card */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-blue-100 to-blue-50 p-5 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-bold mb-1 text-blue-700 flex items-center gap-2">
          👤 {userData.username}
        </h2>
        <p className="text-sm text-gray-600">Welcome back to your dashboard</p>
        <div className="mt-3 text-lg">
          <span className="font-semibold text-gray-700">Wallet:</span>{' '}
          <span className="text-green-600 font-bold animate-pulse">
            {userData.walletPoints || 0} pts
          </span>
        </div>
      </motion.div>

      {/* Search Section */}
      <motion.div className="mt-6 text-sm text-blue-700">
        <label className="block font-semibold mb-1">📱 Search by number:</label>
        <input
          type="text"
          value={searchNumber}
          onChange={(e) => setSearchNumber(e.target.value)}
          placeholder="Enter number"
          className="w-full p-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full"
          onClick={() => {
            fetchImeiAndCourses(searchNumber);
            setSearchClicked(true);
          }}
        >
          🔍 Search
        </motion.button>
      </motion.div>

      {/* IMEI Info Section */}
      <AnimatePresence>
        {searchClicked && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-5 bg-white p-4 rounded-xl shadow-md border border-blue-100"
          >
            <h3 className="text-md font-bold text-blue-600 mb-2">📄 Number Details</h3>
            <p><strong>IMEI:</strong> {imei || 'N/A'}</p>
            <p><strong>Installed On:</strong> {insDate || 'N/A'}</p>
            <p><strong>Status:</strong> {status || 'N/A'}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activated Courses Section */}
      <AnimatePresence>
        {courses.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-6"
          >
            <h3 className="text-lg font-semibold text-blue-600 mb-2">📘 Activated Courses</h3>
            {courses.map((course, index) => (
  <motion.div
    key={index}
    whileHover={{ scale: 1.01 }}
    onClick={() => setExpandedCourseIndex(index === expandedCourseIndex ? null : index)}
    className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 p-4 mb-4 rounded-xl shadow-md text-sm cursor-pointer"
  >
    <p><strong>📚</strong> {course.courseName}</p>
    

    {expandedCourseIndex === index && (
      <div className="mt-2 pl-3 text-gray-700">
        <p><strong>💰 Amount:</strong> ₹{course.amount}</p>

        {course.sections.map((section, sIndex) => (
          <div key={sIndex} className="mt-2">
            <p className="font-semibold text-blue-600">{section.language}</p>
            <ul className="ml-4 list-disc text-sm">
              {section.topics.map((topic, tIndex) => (
                <li key={tIndex}>
                  {topic.topic}: <strong>Videos:</strong> {topic.value},
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )}
  </motion.div>
))}

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
