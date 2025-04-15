import softwareList from '../data/softwareList';
import SoftwareCard from '../components/SoftwareCard';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, UserPlusIcon, UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();


  const filteredSoftware = softwareList.filter((software) =>
    software.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="p-4 flex-1">
        <div className="sticky top-0 z-10 bg-white rounded-xl p-3 shadow mb-4">
          <input
            type="text"
            placeholder="🔍 Search software..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        {/* Software Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          <AnimatePresence>
            {filteredSoftware.map((software) => (
              <motion.div
                key={software.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <SoftwareCard software={software} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner p-2 flex justify-around items-center sm:hidden rounded-t-xl">
        <NavButton icon={<HomeIcon size={22} />} label="Software" onClick={() => navigate('/')} active={location.pathname === '/'} />
        <NavButton icon={<UserPlusIcon size={22} />} label="Create" onClick={() => navigate('/create-user/1')} active={location.pathname.includes('/create-user')} />
        <NavButton icon={<UserIcon size={22} />} label="Profile" onClick={() => navigate('/profile')} active={location.pathname === '/profile'} />
      </div>
    </div>
  );
};

// Bottom Nav Button (with active state)
const NavButton = ({ icon, label, onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-sm ${active ? 'text-blue-600 font-semibold' : 'text-gray-700'} transition`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export default Home;
