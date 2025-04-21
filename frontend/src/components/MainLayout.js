import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, UserPlus, User, MoreVertical, ChevronLeft, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clearUserSession, getUserSession } from '../auth';
import { ref, set, database, onValue } from '../firebase';
import Wallet from './Wallet';
import { motion, AnimatePresence } from 'framer-motion';

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

  const userId = getUserSession();

  const handleLogout = () => {
    clearUserSession();
    navigate('/create-user/1');
  };

  useEffect(() => {
    if (userId) {
      const walletRef = ref(database, 'users/' + userId + '/walletPoints');
      const unsubscribe = onValue(walletRef, (snapshot) => {
        if (snapshot.exists()) {
          const newPoints = snapshot.val();
          setAnimateWallet(true);
          setWalletPoints(newPoints);
          setTimeout(() => setAnimateWallet(false), 800);
        }
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const handleRecharge = async (amount) => {
    if (userId) {
      const newBalance = walletPoints + amount;
      await set(ref(database, 'users/' + userId + '/walletPoints'), newBalance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-16 md:pb-0">
      {/* Top Bar - Mobile Optimized */}
      <div className="flex justify-between items-center px-4 py-3 shadow-lg bg-white/80 backdrop-blur-sm sticky top-0 z-50">
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
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-wide"
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
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 min-w-[100px] flex items-center justify-center gap-2"
              animate={animateWallet ? { scale: [1, 1.1, 1], opacity: [1, 0.9, 1] } : {}}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">💰</span>
              <span>{walletPoints} ₹</span>
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
                      className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100"
                    >
                      <span className="text-lg">📄</span>
                      <span>Landing Page</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-center gap-3"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Modal - Mobile Optimized */}
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
              className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm rounded-t-2xl shadow-2xl z-50 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Wallet</h2>
                <motion.button
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
                  onClick={() => setWalletOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>
              <Wallet points={walletPoints} onRecharge={handleRecharge} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg border-t border-gray-100 flex justify-around items-center py-3 md:hidden z-50">
        <NavButton
          icon={<Home size={24} />}
          label="Software"
          active={location.pathname === '/'}
          onClick={() => navigate('/')}
        />
        <NavButton
          icon={<UserPlus size={24} />}
          label="Create"
          active={location.pathname.startsWith('/create-user')}
          onClick={() => navigate('/create-user/1')}
        />
        <NavButton
          icon={<User size={24} />}
          label="Profile"
          active={location.pathname === '/profile'}
          onClick={() => navigate('/profile')}
        />
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <motion.button
    className={`flex flex-col items-center gap-1.5 p-2 relative ${
      active ? 'text-blue-600' : 'text-gray-500'
    } hover:text-blue-700 transition-all duration-200`}
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Active Indicator */}
    {active && (
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
        active ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'hover:bg-gray-50'
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
    {active && (
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