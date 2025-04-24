import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, UserPlus, User, MoreVertical, ChevronLeft, X, Wallet as WalletIcon, LogOut, Settings, HelpCircle, Lock, Gift, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clearUserSession, getUserSession } from '../auth';
import { ref, set, database, onValue, push, get } from '../firebase';
import Wallet from './Wallet';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast';

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletPoints, setWalletPoints] = useState(0);
  const [animateWallet, setAnimateWallet] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isBonusLocked, setIsBonusLocked] = useState(true);

  const userSession = getUserSession();
  const userId = userSession.userId;

  const handleLogout = () => {
    clearUserSession();
    navigate('/create-user/1');
  };

  useEffect(() => {
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setIsBonusLocked(!data.hasClaimedWelcomeBonus);
          setWalletPoints(data.walletPoints || 0);
          setAnimateWallet(true);
          setTimeout(() => setAnimateWallet(false), 800);
        }
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const handleRecharge = async (amount) => {
    if (userId) {
      const newBalance = walletPoints + amount;
      await set(ref(database, `users/${userId}/walletPoints`), newBalance);
      setToast({
        show: true,
        message: `Successfully recharged ${amount} points!`,
        type: 'success'
      });
    } else {
      setToast({
        show: true,
        message: 'Please login to recharge',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pb-16 md:pb-0">
      {/* Top Bar - Enhanced Design */}
      <motion.div 
        className="flex justify-between items-center px-4 py-3 shadow-lg bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {location.pathname !== '/' ? (
          <motion.button 
            onClick={() => navigate(-1)} 
            className="text-blue-600 font-semibold p-2 -ml-2 rounded-full hover:bg-blue-50 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        ) : (
          <motion.h1 
            className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-wide"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            💻 MyApp
          </motion.h1>
        )}

        {userId && (
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setWalletOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition transform hover:scale-[1.02] shadow-lg"
            >
              <WalletIcon className="w-5 h-5" />
              <motion.span
                key={walletPoints}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {walletPoints} ₹
              </motion.span>
              {isBonusLocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  Locked
                </motion.div>
              )}
            </motion.button>

            <div className="relative">
              <motion.button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreVertical className="w-6 h-6 text-gray-600" />
              </motion.button>
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: "spring", bounce: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-xl z-60 overflow-hidden"
                  >
                    <button
                      onClick={() => navigate(`/editable-page/${userId}`)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100"
                    >
                      <Settings className="w-4 h-4 text-blue-600" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => navigate('/help')}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100"
                    >
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>Help & Support</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>

      {/* Wallet Modal - Enhanced Design */}
      <AnimatePresence>
        {walletOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setWalletOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-16 left-0 right-0 bg-white/90 backdrop-blur-sm rounded-t-2xl shadow-2xl z-50 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.h2 
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Wallet
                </motion.h2>
                <motion.button
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
                  onClick={() => setWalletOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              
              {/* Welcome Bonus Section */}
              {isBonusLocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-white relative overflow-hidden mb-6"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-600/20 rounded-full -mt-12 -mr-12"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-600/20 rounded-full -mb-12 -ml-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <Gift className="w-8 h-8" />
                      <h3 className="text-xl font-bold">Welcome Bonus!</h3>
                    </div>
                    <p className="mb-4">Pay ₹1000 to unlock your welcome bonus of ₹1000</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setWalletOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full bg-white text-yellow-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition transform hover:scale-[1.02] shadow-lg"
                    >
                      Pay ₹1000 to Unlock Bonus
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              <Wallet points={walletPoints} onRecharge={handleRecharge} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Main Content - Enhanced Design */}
      <motion.main 
        className="container mx-auto px-4 py-6"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Outlet />
      </motion.main>

      {/* Bottom Navigation - Enhanced Design */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-100 flex justify-around items-center py-2 md:hidden z-50"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <NavButton
          icon={<Home size={24} />}
          label="Software"
          active={location.pathname === '/'}
          onClick={() => navigate('/')}
        />
        {userId ? (
          <NavButton
            icon={
              <motion.div
                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50 blur-md"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Plus size={28} className="text-white relative z-10" />
              </motion.div>
            }
            label="Add"
            active={location.pathname === '/add-product'}
            onClick={() => navigate('/add-product')}
            isSpecial={true}
          />
        ) : (
          <NavButton
            icon={<UserPlus size={24} />}
            label="Create"
            active={location.pathname.startsWith('/create-user')}
            onClick={() => navigate('/create-user/1')}
          />
        )}
        <NavButton
          icon={<User size={24} />}
          label="Profile"
          active={location.pathname === '/profile'}
          onClick={() => navigate('/profile')}
        />
      </motion.div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick, isSpecial }) => (
  <motion.button
    className={`flex flex-col items-center gap-1.5 p-2 relative ${
      active ? 'text-blue-600' : 'text-gray-500'
    } hover:text-blue-700 transition-all duration-200 ${isSpecial ? '-mt-6' : ''}`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Active Indicator */}
    {active && !isSpecial && (
      <motion.div
        layoutId="activeNavIndicator"
        className="absolute -top-1 w-12 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", bounce: 0.3 }}
      />
    )}

    {/* Icon Container */}
    <motion.div
      className={`p-2 rounded-full ${
        active 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' 
          : 'hover:bg-gray-50'
      }`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        scale: active ? 1.1 : 1,
        rotate: active ? 5 : 0,
      }}
      transition={{ type: "spring", bounce: 0.3 }}
    >
      {icon}
    </motion.div>

    {/* Label */}
    <motion.span
      className={`text-xs font-medium ${
        active ? 'text-blue-600' : 'text-gray-500'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: active ? 1.1 : 1
      }}
      transition={{ duration: 0.2 }}
    >
      {label}
    </motion.span>

    {/* Hover Effect */}
    <motion.div
      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0"
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    />

    {/* Active Background Effect */}
    {active && !isSpecial && (
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
    )}
  </motion.button>
);

export default MainLayout;