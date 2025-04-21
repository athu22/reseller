import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserSession, setUserSession } from '../auth';
import { database, ref, get, set } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
        // Check if course exists
        const courseRef = ref(database, `courses/${software.id}`);
        get(courseRef).then((snapshot) => {
          if (snapshot.exists()) {
            // Course exists, show share button
            setShowNumberPopup(true);
          } else {
            // Course doesn't exist, create it and navigate to edit
            const courseType = getCourseType(software.name);
            navigate(`/course-page/${courseType}/${software.id}`);
          }
        });
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
        if (user.username === loginForm.username && user.password === loginForm.password) {
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

    const courseName = software.name;
    const courseType = getCourseType(software.name);

    try {
      const courseCheckRef = ref(database, `Users/ExpertSkill/${mobileNumber}/Premium Course/${courseName}`);
      const courseSnap = await get(courseCheckRef);

      if (courseSnap.exists()) {
        alert("Course is already activated for this number.");
        return;
      }

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

  const getCourseLandingPage = (courseType) => {
    switch (courseType) {
      case "android":
        return "android-course";
      case "brain":
        return "brain-course";
      case "career2":
        return "career2-course";
      case "career1":
        return "career1-course";
      case "foundation":
        return "foundation-course";
      case "skill":
        return "skill-course";
      case "basic":
        return "basic-computer-course";
      case "computer":
        return "computer-course";
      default:
        return "english-course";
    }
  };

  const getCourseLandingPageUrl = (courseId) => {
    const userId = getUserSession();
    const courseType = courseId.toLowerCase();
    if (courseType.includes('english')) {
      return `/view-english-course/${userId}/${courseId}`;
    } else if (courseType.includes('computer')) {
      return `/view-computer-course/${userId}/${courseId}`;
    } else if (courseType.includes('android')) {
      return `/view-android-course/${userId}/${courseId}`;
    } else if (courseType.includes('basic')) {
      return `/view-basic-computer-course/${userId}/${courseId}`;
    }
    return `/view-course/${userId}/${courseId}`;
  };

  const handleShareLink = async (courseId) => {
    try {
      const baseUrl = window.location.origin;
      const landingPageUrl = getCourseLandingPageUrl(courseId);
      const fullUrl = `${baseUrl}${landingPageUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-white border rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col w-full max-w-sm mx-auto overflow-hidden"
      >
        <div className="relative aspect-video">
          <img
            src={software.image}
            alt={software.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 flex flex-col gap-3">
          <motion.h2 className="text-base sm:text-lg font-bold text-blue-700 line-clamp-2">
            {software.name}
          </motion.h2>

          <motion.p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
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

          <div className="flex flex-col gap-2 mt-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyClick}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:brightness-105 transition-all"
            >
              {software.name.includes('Course') ? 'Get Started' : 'Buy Now'}
            </motion.button>

            {software.name.includes('Course') && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const currentUserId = getUserSession();
                  if (!currentUserId) {
                    setShowLogin(true);
                    return;
                  }
                  const courseType = getCourseType(software.name);
                  const landingPage = getCourseLandingPage(courseType);
                  const viewUrl = `${window.location.origin}/view-${landingPage}/${currentUserId}/${software.id}`;
                  navigator.clipboard.writeText(viewUrl)
                    .then(() => alert('Course link copied to clipboard!'))
                    .catch(() => alert('Failed to copy link'));
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:brightness-105 transition-all"
              >
                Share Course Link
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Login Modal - Mobile Optimized */}
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
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 p-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-blue-600">Login to Continue</h3>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-400 text-2xl font-bold p-2 -mr-2"
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

      {/* Mobile Number Input Popup - Mobile Optimized */}
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
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 p-4"
            >
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                {mobileConfirmed ? 'Share Course' : 'Enter Mobile Number'}
              </h3>

              {!mobileConfirmed ? (
                <>
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
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Share this course with others:</p>
                    <button
                      onClick={() => {
                        const currentUserId = getUserSession();
                        const viewUrl = `${window.location.origin}/view-course/${currentUserId}/${software.id}`;
                        navigator.clipboard.writeText(viewUrl)
                          .then(() => alert('Course link copied to clipboard!'))
                          .catch(() => alert('Failed to copy link'));
                      }}
                      className="w-full bg-green-500 text-white py-2 rounded-full text-sm font-semibold hover:bg-green-600"
                    >
                      Copy Share Link
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowNumberPopup(false);
                      setMobileConfirmed(false);
                      setMobileNumber('');
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-full text-sm font-semibold hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              )}

              {mobileError && (
                <p className="text-red-600 mt-3 text-sm text-center">{mobileError}</p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SoftwareCard;
