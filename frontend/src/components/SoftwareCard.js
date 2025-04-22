import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserSession, setUserSession } from '../auth';
import { database, ref, get, set } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { X, Check, ArrowRight, Star, Clock, Users } from 'lucide-react';

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
    if (userId) {
      setShowNumberPopup(true);
    } else {
      setShowLogin(true);
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
        // Number exists in database, activate the course directly
        const userId = getUserSession();
        if (!userId) {
          setMobileError('User session expired. Please login again.');
          return;
        }

        const courseType = getCourseType(software.name);
        const activateRes = await fetch("http://localhost:5050/api/activate-course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, mobileNumber, courseType }),
        });

        const activateData = await activateRes.json();

        if (activateRes.ok && activateData.success) {
          // Update wallet points
          const newBalance = walletPoints - (software.discountedPrice || software.originalPrice || 499);
          await set(ref(database, `users/${userId}/walletPoints`), newBalance);
          setWalletPoints(newBalance);

          // Show success message and close popup
          toast.success('Course activated successfully!');
          setShowNumberPopup(false);
          setMobileConfirmed(false);
          setMobileNumber('');
        } else {
          setMobileError(activateData.message || 'Failed to activate course. Please try again.');
        }
      } else {
        setMobileError(data.message || 'Please install the app first.');
      }
    } catch (err) {
      console.error('Error:', err);
      setMobileError('Something went wrong. Please try again.');
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col w-full max-w-sm mx-auto overflow-hidden"
      >
        <div className="relative aspect-video group">
          <img
            src={software.image}
            alt={software.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-4 sm:p-6 flex flex-col gap-3">
          <motion.h2 
            className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {software.name}
          </motion.h2>

          <motion.p 
            className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {software.description}
          </motion.p>

          <motion.div 
            className="flex items-center gap-2 mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">4.8</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="w-4 h-4" />
              <span className="text-sm">1.2k+ students</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">8 weeks</span>
            </div>
          </motion.div>

          {software.discountedPrice && (
            <motion.div 
              className="flex items-center gap-2 mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-xl font-bold text-blue-600">
                ₹{software.discountedPrice}
              </span>
              <span className="line-through text-gray-400 text-sm">
                ₹{software.originalPrice}
              </span>
              <span className="ml-auto text-green-600 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full">
                {Math.round(
                  ((software.originalPrice - software.discountedPrice) /
                    software.originalPrice) *
                    100
                )}
                % OFF
              </span>
            </motion.div>
          )}

          <motion.div 
            className="flex flex-col gap-2 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyClick}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {software.name.includes('Course') ? 'Get Started' : 'Buy Now'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {software.name.includes('Course') && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                    .then(() => toast.success('Course link copied to clipboard!'))
                    .catch(() => toast.error('Failed to copy link'));
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Share Course Link
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
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

      {/* Mobile Number Input Popup - Enhanced Design */}
      <AnimatePresence>
        {showNumberPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowNumberPopup(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ 
                type: 'spring',
                bounce: 0.3,
                duration: 0.6
              }}
              className="fixed bottom-[80px] left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            >
              <motion.div 
                className="flex justify-between items-center mb-4 sm:mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Get Started with {software.name}
                </h3>
                <motion.button
                  onClick={() => setShowNumberPopup(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <X size={20} />
                </motion.button>
              </motion.div>

              <motion.div 
                className="space-y-4 sm:space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Benefits Section */}
                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: 'spring', bounce: 0.3 }}
                >
                  <h4 className="font-semibold text-blue-700">Course Benefits:</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {[
                      'Expert-led video tutorials',
                      'Interactive learning materials',
                      '24/7 access to course content',
                      'Certificate upon completion'
                    ].map((benefit, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-2 sm:gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <motion.span 
                          className="text-green-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                        >
                          <Check className="w-5 h-5" />
                        </motion.span>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Mobile Number Input */}
                <motion.div 
                  className="space-y-3 sm:space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <motion.input
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={mobileNumber}
                      onChange={(e) => {
                        const newValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setMobileNumber(newValue);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm sm:text-base"
                      maxLength="10"
                      pattern="[0-9]{10}"
                      required
                      animate={{
                        borderColor: mobileNumber.length === 10 ? '#10B981' : '#E5E7EB',
                        boxShadow: mobileNumber.length === 10 ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : 'none'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                        color: mobileNumber.length === 10 ? '#10B981' : '#9CA3AF'
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      📱
                    </motion.div>
                    
                    {/* Digit Counter Animation */}
                    <motion.div 
                      className="absolute -bottom-4 sm:-bottom-6 right-3 sm:right-4 text-xs text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.span
                        animate={{
                          color: mobileNumber.length === 10 ? '#10B981' : '#6B7280',
                          scale: mobileNumber.length === 10 ? [1, 1.2, 1] : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {mobileNumber.length}/10
                      </motion.span>
                    </motion.div>

                    {/* Digit Entry Animation */}
                    {mobileNumber.length > 0 && (
                      <motion.div 
                        className="absolute -top-8 sm:-top-12 left-0 right-0 flex justify-center gap-1 sm:gap-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {Array.from(mobileNumber).map((digit, index) => (
                          <motion.div
                            key={index}
                            className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-blue-600"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: 1,
                              opacity: 1,
                              backgroundColor: mobileNumber.length === 10 ? '#D1FAE5' : '#EFF6FF',
                              color: mobileNumber.length === 10 ? '#059669' : '#2563EB'
                            }}
                            transition={{ 
                              type: 'spring',
                              delay: index * 0.05,
                              stiffness: 300
                            }}
                          >
                            {digit}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.button
                    onClick={checkMobileNumber}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    animate={{
                      background: mobileNumber.length === 10 
                        ? 'linear-gradient(to right, #10B981, #059669)'
                        : 'linear-gradient(to right, #3B82F6, #2563EB)',
                      scale: mobileNumber.length === 10 ? 1.02 : 1
                    }}
                  >
                    {mobileNumber.length === 10 ? 'Continue' : 'Enter 10 digits'}
                  </motion.button>
                </motion.div>
              </motion.div>

              {mobileError && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', bounce: 0.3 }}
                  className="text-red-500 mt-3 sm:mt-4 text-xs sm:text-sm text-center bg-red-50 p-2 sm:p-3 rounded-lg"
                >
                  {mobileError}
                </motion.p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SoftwareCard;
