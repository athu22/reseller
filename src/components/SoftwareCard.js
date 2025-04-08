import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getUserSession, setUserSession } from '../auth';
import { database, ref, get } from '../firebase';
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
      const snapshot = await get(ref(database, `Users/ExpertSkill/${mobileNumber}`));
      const data = snapshot.val();
      if (data) {
        setMobileInfo({
          imei: data.IMEI || 'Not available',
          insDate: data.InsDate || 'Not available',
          status: data.status || 'Unknown',
        });
      } else {
        setMobileError('Please install the app.');
      }
    } catch (err) {
      setMobileError('Something went wrong.');
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
                Submit
              </button>

              {mobileError && (
                <p className="text-red-600 mt-3 text-sm text-center">{mobileError}</p>
              )}

              {mobileInfo && (
                <div className="mt-4 text-sm text-gray-700 bg-gray-100 p-3 rounded-md space-y-1">
                  <p><strong>IMEI:</strong> {mobileInfo.imei}</p>
                  <p><strong>Installation Date:</strong> {mobileInfo.insDate}</p>
                  <p><strong>Status:</strong> {mobileInfo.status}</p>
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
