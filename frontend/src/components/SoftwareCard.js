//frontend 

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserSession, setUserSession } from '../auth';
import { database, ref, get, set } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

const SoftwareCard = ({ software }) => {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showNumberPopup, setShowNumberPopup] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileInfo, setMobileInfo] = useState(null);
  const [mobileError, setMobileError] = useState('');
  const [mobileConfirmed, setMobileConfirmed] = useState(false);
  const [showActivateView, setShowActivateView] = useState(false);
  const [walletPoints, setWalletPoints] = useState(0);

  const handleBuyClick = () => {
    const userId = getUserSession();

    if (software.name.includes('Course')) {
      if (userId) {
        setShowNumberPopup(true);
      } else {
        setShowLogin(true);
      }
    } else {
      if (userId) {
        navigate(`/activation/${userId}/${software.id}`);
      } else {
        setShowLogin(true);
      }
    }
  };

  useEffect(() => {
    const userId = getUserSession();
    if (userId) {
      const walletRef = ref(database, `users/${userId}/walletPoints`);
      get(walletRef).then((snapshot) => {
        if (snapshot.exists()) {
          setWalletPoints(snapshot.val());
        }
      });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const snapshot = await get(ref(database, 'users'));
      const users = snapshot.val() || {};
      let foundId = null;

      Object.entries(users).forEach(([uid, user]) => {
        if (
          user.username === loginForm.username &&
          user.password === loginForm.password
        ) {
          foundId = uid;
        }
      });

      if (foundId) {
        setUserSession(foundId);
        setShowLogin(false);
        if (software.name.includes('Course')) {
          setShowNumberPopup(true);
        } else {
          navigate(`/activation/${foundId}/${software.id}`);
        }
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (err) {
      setLoginError('Error occurred. Try again.');
    }
  };

  const checkMobileNumber = async () => {
    setMobileInfo(null);
    setMobileError('');
    try {
      const res = await fetch(`http://localhost:5050/api/check-number/${mobileNumber}`);
      const data = await res.json();

      if (res.ok && data.imei) {
        setMobileInfo({
          imei: data.imei || 'Not available',
          insDate: data.insDate || 'Not available',
          status: data.status || 'Unknown',
        });
        setMobileConfirmed(true);
      } else {
        setMobileError(data.message || 'Please install the app.');
      }
    } catch (err) {
      setMobileError('Something went wrong. Try again.');
    }
  };

const handleCourseDone = async () => {
  const userId = getUserSession();
  if (!userId || !mobileNumber) {
    alert("Missing user or mobile number.");
    return;
  }

  const courseName = software.name; // exact name for course node
  const courseType = getCourseType(software.name);

  try {
    // Check if this specific course is already activated
    const courseCheckRef = ref(database, `Users/ExpertSkill/${mobileNumber}/Premium Course/${courseName}`);
    const courseSnap = await get(courseCheckRef);

    if (courseSnap.exists()) {
      alert("Course is already activated for this number.");
      return; // Stop further execution if course is already activated
    }

    // Proceed with course activation if course is not activated
    const res = await fetch("http://localhost:5050/api/activate-course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, mobileNumber, courseType }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const newBalance = walletPoints - (software.discountedPrice || software.originalPrice || 499);
      await set(ref(database, `users/${userId}/walletPoints`), newBalance);
      setWalletPoints(newBalance);

      alert("Course activated successfully!");
      setShowNumberPopup(false);
      setShowActivateView(false);
      setMobileConfirmed(false);
    } else {
      alert(data.message || "Activation failed. Try again.");
    }
  } catch (error) {
    console.error("Error activating:", error);
    alert("Something went wrong. Please try later.");
  }
};

  
  // Helper function to get course type from course name
  const getCourseType = (courseName) => {
    if (courseName.toLowerCase().includes("android")) {
      return "android";
    } else if (courseName.toLowerCase().includes("brain")) {
      return "brain";
    } else if (courseName.toLowerCase().includes("career development course part-ii")) {
      return "career2";
    } else if (courseName.toLowerCase().includes("career development course part-i")) {
      return "career1";
    } else if (courseName.toLowerCase().includes("foundation development course")) {
      return "foundation";
    } else if (courseName.toLowerCase().includes("skill development course")) {
      return "skill";
    } else if (courseName.toLowerCase().includes("basic")) {
      return "basic";
    } else if (courseName.toLowerCase().includes("computer")) {
      return "computer";
    } else {
      return "english";
    }
  };
  
  
  
  
  
  
  
  

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-white border rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col w-full max-w-sm mx-auto"
      >
        <img
          src={software.image}
          alt={software.name}
          className="w-full h-40 sm:h-44 object-cover rounded-t-2xl"
        />

        <div className="p-4 flex flex-col gap-2">
          <motion.h2 className="text-base sm:text-lg font-bold text-blue-700">
            {software.name}
          </motion.h2>

          <motion.p className="text-sm text-gray-600 leading-snug">
            {software.description}
          </motion.p>

          {software.discountedPrice && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-red-600 font-bold text-lg">
                ₹{software.discountedPrice}
              </span>
              <span className="line-through text-gray-400 text-sm">
                ₹{software.originalPrice}
              </span>
              <span className="text-green-600 text-xs font-medium ml-auto bg-green-100 px-2 py-0.5 rounded">
                {Math.round(
                  ((software.originalPrice - software.discountedPrice) /
                    software.originalPrice) *
                    100
                )}
                % OFF
              </span>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBuyClick}
            className="mt-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:brightness-105 transition-all"
          >
            {software.name.includes('Course') ? 'Activate' : 'Buy Now'}
          </motion.button>
        </div>
      </motion.div>
      

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowLogin(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '-20%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-blue-600">Login to Continue</h3>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-400 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {loginError && (
                <p className="text-red-500 text-sm mb-3 text-center">{loginError}</p>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded-md text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-green-600 transition"
                >
                  Login
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Number Input Popup */}
      <AnimatePresence>
        {showNumberPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowNumberPopup(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '-30%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 p-6"
            >
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                Enter Mobile Number
              </h3>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full border px-3 py-2 rounded-md text-sm mb-3"
              />
              <button
                onClick={checkMobileNumber}
                className="w-full bg-blue-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-blue-600"
              >
                Check Now
              </button>

              {mobileError && (
                <p className="text-red-600 mt-3 text-sm text-center">{mobileError}</p>
              )}

{mobileConfirmed && !showActivateView && (
  <>
   <button
  onClick={() => setShowActivateView(true)}
  className="mt-4 w-full py-2 rounded-full text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition"
>
  Activate Now
</button>

    {walletPoints < (software.discountedPrice || software.originalPrice || 499) && (
      <p className="text-red-500 text-sm mt-2 text-center">
        Not enough balance. Please recharge your wallet.
      </p>
    )}
  </>
)}


              {showActivateView && (
                <div className="mt-6 text-sm text-gray-800 space-y-3 bg-gray-100 p-4 rounded-xl">
                  <p><strong>Price:</strong> ₹{software.discountedPrice || 499}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</p>
                  <p><strong>Videos:</strong> 50</p>
                  <button
                    onClick={handleCourseDone}
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-full text-sm font-semibold hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              )}

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SoftwareCard;
