import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, UserPlus, User, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clearUserSession, getUserSession } from '../auth';
import { ref, get, set, database, onValue } from '../firebase';
import Wallet from './Wallet';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 shadow-md bg-white sticky top-0 z-50">
        {location.pathname !== '/' ? (
          <button onClick={() => navigate(-1)} className="text-blue-600 font-semibold text-lg">
            ←
          </button>
        ) : (
          <h1 className="text-xl font-bold text-blue-700 tracking-wide">💻 MyApp</h1>
        )}

        {userId && (
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setWalletOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow hover:brightness-110 transition"
              animate={animateWallet ? { scale: [1, 1.2, 1], opacity: [1, 0.9, 1] } : {}}
              transition={{ duration: 0.6 }}
            >
              💰 {walletPoints} ₹
            </motion.button>

            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}>
                <MoreVertical className="text-gray-600" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-xl shadow z-50 overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wallet Modal */}
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
              animate={{ y: '-20%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 p-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-600">Wallet</h2>
                <button
                  className="text-gray-500 hover:text-black text-2xl"
                  onClick={() => setWalletOpen(false)}
                >
                  &times;
                </button>
              </div>
              <Wallet points={walletPoints} onRecharge={handleRecharge} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Outlet />

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t flex justify-around items-center py-3 md:hidden z-50">
        <NavButton
          icon={<Home size={20} />}
          label="Software"
          active={location.pathname === '/'}
          onClick={() => navigate('/')}
        />
        <NavButton
          icon={<UserPlus size={20} />}
          label="Create"
          active={location.pathname.startsWith('/create-user')}
          onClick={() => navigate('/create-user/1')}
        />
        <NavButton
          icon={<User size={20} />}
          label="Profile"
          active={location.pathname === '/profile'}
          onClick={() => navigate('/profile')}
        />
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    className={`flex flex-col items-center gap-1 text-xs font-medium ${
      active ? 'text-blue-600' : 'text-gray-500'
    } hover:text-blue-700 transition`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default MainLayout;