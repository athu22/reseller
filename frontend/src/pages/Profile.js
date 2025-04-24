import { useEffect, useState } from 'react';
import { database, ref, get, set, query, orderByChild, equalTo, update } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserSession } from '../auth';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Calendar, MapPin, Edit2, Star, Users, Clock, BookOpen, Camera, Save, X, Gift, BarChart2, Settings, Bell, Shield, ChevronDown, ArrowLeft, PlusCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    designation: '',
    bio: '',
    profileImage: '',
  });
  const [courses, setCourses] = useState([]);
  const [imei, setImei] = useState('');
  const [insDate, setInsDate] = useState('');
  const [status, setStatus] = useState('');
  const [number, setNumber] = useState('');
  const [searchNumber, setSearchNumber] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);
  const [expandedCourseIndex, setExpandedCourseIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isBonusLocked, setIsBonusLocked] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const userSession = getUserSession();
  const userId = userSession?.userId;
  const userRole = userSession?.role;
  const navigate = useNavigate();

  // --- Hooks for Super Admin View (Moved to Top Level) ---
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ username: '', password: '', phone: '' });
  const [viewMode, setViewMode] = useState('default'); // 'default', 'analytics', 'users'
  const [managedAdmins, setManagedAdmins] = useState([]); // State for admin list
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // --- Sample Data Sets (Can remain here or be moved if preferred) ---
  const weeklyData = [
    { name: 'Mon', sales: 2200 }, { name: 'Tue', sales: 1800 }, { name: 'Wed', sales: 2500 },
    { name: 'Thu', sales: 2100 }, { name: 'Fri', sales: 3100 }, { name: 'Sat', sales: 3500 },
    { name: 'Sun', sales: 3200 },
  ];
  const monthlyData = [
    { name: 'Week 1', sales: 4000 }, { name: 'Week 2', sales: 3000 }, { name: 'Week 3', sales: 2000 },
    { name: 'Week 4', sales: 2780 },
  ];
  const yearlyData = [
    { name: 'Jan', sales: 40000 }, { name: 'Feb', sales: 35000 }, { name: 'Mar', sales: 50000 },
    { name: 'Apr', sales: 45000 }, { name: 'May', sales: 60000 }, { name: 'Jun', sales: 55000 },
    { name: 'Jul', sales: 65000 }, { name: 'Aug', sales: 60000 }, { name: 'Sep', sales: 58000 },
    { name: 'Oct', sales: 70000 }, { name: 'Nov', sales: 75000 }, { name: 'Dec', sales: 80000 },
  ];
  // --- End Sample Data Sets ---

  // useEffect to update chart data
  useEffect(() => {
    if (userRole === 'super_admin' && viewMode === 'analytics') { // Only run if analytics is shown
      console.log(`Updating chart data for filter: ${timeFilter}`);
      if (timeFilter === 'This Week') {
        setChartData(weeklyData);
      } else if (timeFilter === 'This Month') {
        setChartData(monthlyData);
      } else if (timeFilter === 'This Year') {
        setChartData(yearlyData);
      } else {
        setChartData(monthlyData); 
      }
    }
  }, [timeFilter, userRole, viewMode]); // Added viewMode dependency

  // useEffect to fetch managed admins when viewMode is 'users'
  useEffect(() => {
    if (viewMode === 'users') {
      fetchManagedAdmins();
    }
  }, [viewMode, userId]); // Removed fetchManagedAdmins from dependencies

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
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const snapshot = await get(ref(database, `users/${userId}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
          setCurrentBalance(data.walletPoints || 0);
          setFormData({
            username: data.username || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            company: data.company || '',
            designation: data.designation || '',
            bio: data.bio || '',
            profileImage: data.profileImage || '/default-avatar.png',
          });
          
          // Check if user is new and hasn't claimed welcome bonus
          if (!data.hasClaimedWelcomeBonus) {
            setShowWelcomeBonus(true);
            setIsBonusLocked(true);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) {
      toast.error('Please login to save changes', {
        icon: '🔒',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    try {
      await set(ref(database, `users/${userId}`), {
        ...userData,
        ...formData,
      });
      setUserData({ ...userData, ...formData });
      setIsEditing(false);
      toast.success('Profile updated successfully!', {
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile changes', {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData({ ...formData, profileImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = async () => {
    if (!userId) {
      toast.error('Please login to save changes', {
        icon: '🔒',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    try {
      await set(ref(database, `users/${userId}`), {
        ...userData,
        ...formData,
      });
      setUserData({ ...userData, ...formData });
      setShowImageUpload(false);
      toast.success('Profile photo updated successfully!', {
        icon: '✅',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error saving profile photo:', error);
      toast.error('Failed to save profile photo', {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  const handleWelcomeBonusPayment = async () => {
    setIsPaying(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get current wallet points
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      const currentData = snapshot.val() || {};
      const currentPoints = currentData.walletPoints || 0;
      
      // Update user's wallet and mark bonus as claimed
      const newWalletPoints = currentPoints + 1000;
      await set(ref(database, `users/${userId}`), {
        ...currentData,
        hasClaimedWelcomeBonus: true,
        walletPoints: newWalletPoints,
        lastUpdated: new Date().toISOString(),
      });
      
      // Update local state
      setUserData({ 
        ...currentData, 
        hasClaimedWelcomeBonus: true,
        walletPoints: newWalletPoints,
      });
      setCurrentBalance(newWalletPoints);
      setShowWelcomeBonus(false);
      setIsBonusLocked(false);
      
      toast.success('Welcome bonus unlocked! ₹1000 has been added to your wallet', {
        icon: '🎉',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.', {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminData.username || !newAdminData.password || !newAdminData.phone) { 
      toast.error('Please fill in all fields');
      return;
    }
    if (!/^\d+$/.test(newAdminData.phone) || newAdminData.phone.length < 10) {
        toast.error('Invalid phone');
        return;
    }
    if (newAdminData.password.length < 6) {
        toast.error('Password too short');
        return;
    }
    
    if (!userId) { toast.error('Super Admin ID missing'); return; }

    const adminPhone = newAdminData.phone;
    
    // --- Define both paths --- 
    const rootAdminRefPath = `users/${adminPhone}`; 
    const nestedAdminRefPath = `users/${userId}/admins/${adminPhone}`;
    // --- End paths --- 

    try {
      // --- Check existence at the ROOT path first (for login conflicts) --- 
      const rootSnapshot = await get(ref(database, rootAdminRefPath));
      if (rootSnapshot.exists()) {
        const existingUserData = rootSnapshot.val();
        // Prevent creating an admin if ANY user already exists with that phone
        if (existingUserData.role === 'admin') {
           toast.error('An admin with this phone number already exists.');
        } else if (existingUserData.role === 'user') {
           toast.error('A regular user with this phone number already exists. Cannot create admin.');
        } else if (existingUserData.role === 'super_admin') {
            toast.error('A super admin with this phone number already exists. Cannot create admin.');
        } else {
           toast.error('A user with this phone number already exists.');
        }
        return;
      }
      // --- End root existence check ---

      // Prepare the data to be written
      const adminDataToWrite = {
        username: newAdminData.username,
        phone: adminPhone,
        password: newAdminData.password, // *** INSECURE ***
        role: 'admin',
        createdBy: userId, 
        createdAt: new Date().toISOString(),
        walletPoints: 0, 
      };

      // --- Perform atomic multi-path update --- 
      const updates = {};
      updates[rootAdminRefPath] = adminDataToWrite;
      updates[nestedAdminRefPath] = adminDataToWrite;

      await update(ref(database), updates); // Update starting from the root
      // --- End multi-path update --- 

      toast.success(`Admin '${newAdminData.username}' added successfully!`);
      setShowAddAdminForm(false);
      setNewAdminData({ username: '', password: '', phone: '' });
      
       // Refetch admins list (which reads from nested path)
       if (viewMode === 'users') {
           fetchManagedAdmins(); 
       }

    } catch (error) {
      console.error("Error adding new admin:", error);
      toast.error('Failed to add admin.');
    }
  };

   // fetchManagedAdmins should still fetch from `users/${userId}/admins`
   const fetchManagedAdmins = async () => {
       if (userId) { 
        setLoadingAdmins(true);
        try {
          const adminsRef = ref(database, `users/${userId}/admins`);
          const snapshot = await get(adminsRef);
          if (snapshot.exists()) {
            const adminsData = snapshot.val();
            const adminsList = Object.keys(adminsData)
              .map(key => ({ id: key, ...adminsData[key] })); 
            setManagedAdmins(adminsList);
          } else {
            setManagedAdmins([]);
          }
        } catch (error) { 
          console.error("Error fetching managed admins:", error);
          toast.error("Failed to load managed admins list.");
          setManagedAdmins([]);
        } finally {
          setLoadingAdmins(false);
        }
      } 
   };

  // Admin View
  if (userRole === 'admin') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-100 p-4"
      >
        {/* Profile Header */}
        <motion.div
          {...fadeInUp}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <img
              src={formData.profileImage || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowImageUpload(true)}
              className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-md hover:bg-blue-600 transition"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{formData.username || 'Admin'}</h1>
          <p className="text-sm text-gray-500 mb-4">Admin</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white text-blue-500 px-5 py-2 rounded-full text-sm font-medium shadow-md hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </motion.button>
        </motion.div>

        {/* Image Upload Modal */}
        <AnimatePresence>
          {showImageUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", bounce: 0.2 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Change Profile Photo</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setShowImageUpload(false);
                        setImagePreview(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 transition"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                  
                  <div className="mb-8">
                    <div className="relative w-48 h-48 mx-auto group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition"></div>
                      <img
                        src={imagePreview || formData.profileImage}
                        alt="Preview"
                        className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block">
                      <span className="sr-only">Choose profile photo</span>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500
                            file:text-white
                            hover:file:from-blue-600 hover:file:to-indigo-600
                            transition-all duration-200"
                        />
                      </div>
                    </label>

                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowImageUpload(false);
                          setImagePreview(null);
                        }}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 transition font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleImageSave}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] shadow-lg"
                      >
                        Save Photo
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Admin Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition"
                  onClick={() => navigate('/')}
                >
                  <div className="p-3 bg-blue-100 rounded-full mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Users</h3>
                  <p className="text-sm text-gray-600">View and manage all users</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition"
                  onClick={() => navigate('/add-product')}
                >
                  <div className="p-3 bg-green-100 rounded-full mb-4">
                    <PlusCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Add Products</h3>
                  <p className="text-sm text-gray-600">Create and manage products</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition"
                  onClick={() => navigate('/wallet/' + userId)}
                >
                  <div className="p-3 bg-purple-100 rounded-full mb-4">
                    <Gift className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Wallet</h3>
                  <p className="text-sm text-gray-600">Manage wallet and transactions</p>
                </motion.div>
              </div>

              {/* Admin Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Users</span>
                      <span className="font-semibold text-gray-800">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active Products</span>
                      <span className="font-semibold text-gray-800">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Sales</span>
                      <span className="font-semibold text-gray-800">₹0</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">No recent activity</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition shadow"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Super Admin View
  if (userRole === 'super_admin') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-100 p-4"
      >
        {/* Profile Header */}
        <motion.div
          {...fadeInUp}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <img
              src={formData.profileImage || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowImageUpload(true)}
              className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2 shadow-md hover:bg-blue-600 transition"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{formData.username || 'Super Admin'}</h1>
          <p className="text-sm text-gray-500 mb-4">Super Admin</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white text-blue-500 px-5 py-2 rounded-full text-sm font-medium shadow-md hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </motion.button>
        </motion.div>

        {/* Image Upload Modal */}
        <AnimatePresence>
          {showImageUpload && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", bounce: 0.2 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Change Profile Photo</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setShowImageUpload(false);
                        setImagePreview(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 transition"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                  
                  <div className="mb-8">
                    <div className="relative w-48 h-48 mx-auto group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition"></div>
                      <img
                        src={imagePreview || formData.profileImage}
                        alt="Preview"
                        className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block">
                      <span className="sr-only">Choose profile photo</span>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500
                            file:text-white
                            hover:file:from-blue-600 hover:file:to-indigo-600
                            transition-all duration-200"
                        />
                      </div>
                    </label>

                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowImageUpload(false);
                          setImagePreview(null);
                        }}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 transition font-medium"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleImageSave}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] shadow-lg"
                      >
                        Save Photo
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Main Content Area (Cards or Analytics or User Management) */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  {viewMode === 'default' && (
                    <motion.div
                      key="cards"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      {/* Manage Users Card */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition"
                        onClick={() => setViewMode('users')}
                      >
                        <div className="p-3 bg-blue-100 rounded-full mb-2">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Manage Users</p>
                      </motion.div>

                      {/* View Analytics Card */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition"
                        onClick={() => setViewMode('analytics')}
                      >
                        <div className="p-3 bg-green-100 rounded-full mb-2">
                          <BarChart2 className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Analytics</p>
                      </motion.div>

                      {/* Notifications Card */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition"
                      >
                        <div className="p-3 bg-yellow-100 rounded-full mb-2">
                          <Bell className="w-6 h-6 text-yellow-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Notifications</p>
                      </motion.div>

                      {/* Settings Card */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition"
                      >
                        <div className="p-3 bg-purple-100 rounded-full mb-2">
                          <Settings className="w-6 h-6 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Settings</p>
                      </motion.div>
                    </motion.div>
                  )}

                  {viewMode === 'analytics' && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="mt-0"
                    >
                      <motion.button
                        onClick={() => setViewMode('default')}
                        className="mb-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </motion.button>
                      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0 flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-blue-500" />
                            Sales Overview ({timeFilter})
                          </h3>
                          <div className="relative w-full sm:w-auto">
                            <select
                              value={timeFilter}
                              onChange={(e) => setTimeFilter(e.target.value)}
                              className="appearance-none w-full sm:w-auto bg-gray-50 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                            >
                              <option>This Week</option>
                              <option>This Month</option>
                              <option>This Year</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                        <div className="h-60 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                              <YAxis stroke="#888888" fontSize={12} />
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', borderColor: '#cccccc' }} itemStyle={{ color: '#333' }} />
                              <Legend wrapperStyle={{ fontSize: '14px' }}/>
                              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Sales" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {viewMode === 'users' && (
                    <motion.div
                      key="users"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="mt-0"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <motion.button
                          onClick={() => setViewMode('default')}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </motion.button>
                        <motion.button
                          onClick={() => setShowAddAdminForm(true)}
                          className="flex items-center gap-1 text-sm bg-blue-500 text-white px-3 py-1 rounded-md shadow hover:bg-blue-600 transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <PlusCircle className="w-4 h-4" />
                          Add Admin
                        </motion.button>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Managed Admins</h3>
                      
                      {loadingAdmins ? (
                        <p className="text-center text-gray-500">Loading admins...</p>
                      ) : managedAdmins.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {managedAdmins.map((admin) => (
                            <motion.div
                              key={admin.id}
                              className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * managedAdmins.indexOf(admin) }}
                            >
                              <div>
                                <p className="font-medium text-gray-800">{admin.username}</p>
                                <p className="text-sm text-gray-500">{admin.phone}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-4">No admins added yet.</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition shadow"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Regular User View (existing code)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20"
    >
      {/* Profile Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 shadow-lg relative z-10"
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition backdrop-blur-sm z-20"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Profile Content */}
      <div className="max-w-md mx-auto px-4 -mt-10 relative z-0">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-90 relative"
        >
          {/* Profile Image Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="h-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="absolute -bottom-16 left-6 z-10"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition"></div>
                <img
                  src={imagePreview || formData.profileImage}
                  alt="Profile"
                  className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform object-cover"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowImageUpload(true)}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer backdrop-blur-sm"
                >
                  <Camera className="w-6 h-6 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Image Upload Modal */}
          <AnimatePresence>
            {showImageUpload && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", bounce: 0.2 }}
                  className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">Change Profile Photo</h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setShowImageUpload(false);
                          setImagePreview(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 transition"
                      >
                        <X className="w-6 h-6" />
                      </motion.button>
                    </div>
                    
                    <div className="mb-8">
                      <div className="relative w-48 h-48 mx-auto group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition"></div>
                        <img
                          src={imagePreview || formData.profileImage}
                          alt="Preview"
                          className="relative w-full h-full rounded-full object-cover border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-3 file:px-6
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-gradient-to-r file:from-blue-500 file:to-indigo-500
                              file:text-white
                              hover:file:from-blue-600 hover:file:to-indigo-600
                              transition-all duration-200"
                          />
                        </div>
                      </label>

                      <div className="flex justify-end space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowImageUpload(false);
                            setImagePreview(null);
                          }}
                          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition font-medium"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleImageSave}
                          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] shadow-lg"
                        >
                          Save Photo
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Form */}
          <div className="p-6 pt-20">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter your username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      rows="2"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Enter your designation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      rows="3"
                      placeholder="Write something about yourself"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition shadow"
                  >
                    Save Changes
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{formData.username || 'No username set'}</h2>
                    <p className="text-gray-600">
                      {formData.designation ? `${formData.designation} at ${formData.company || 'No company set'}` : 'No designation set'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 p-4 rounded-xl"
                    >
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{formData.email || 'No email set'}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 p-4 rounded-xl"
                    >
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{formData.phone || 'No phone set'}</p>
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50 p-4 rounded-xl"
                  >
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-800">{formData.address || 'No address set'}</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50 p-4 rounded-xl"
                  >
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium text-gray-800">{formData.bio || 'No bio set'}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Wallet Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-90"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <div className="flex items-center gap-2">
                <motion.p 
                  key={currentBalance}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold text-green-600"
                >
                  {currentBalance} ₹
                </motion.p>
                {isBonusLocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    Locked
                  </motion.div>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition transform hover:scale-[1.02] shadow-lg"
            >
              Add Money
            </motion.button>
          </div>

          {/* Welcome Bonus Section */}
          <AnimatePresence>
            {showWelcomeBonus && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-white relative overflow-hidden"
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
                    onClick={handleWelcomeBonusPayment}
                    disabled={isPaying}
                    className="w-full bg-white text-yellow-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPaying ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full"
                        />
                        Processing...
                      </div>
                    ) : (
                      'Pay ₹1000 to Unlock Bonus'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-90"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Search by Number</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              placeholder="Enter mobile number"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                fetchImeiAndCourses(searchNumber);
                setSearchClicked(true);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] shadow-lg"
            >
              Search
            </motion.button>
          </div>

          <AnimatePresence>
            {searchClicked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 p-4 rounded-xl"
                >
                  <p className="text-sm text-gray-500">IMEI</p>
                  <p className="font-medium text-gray-800">{imei || 'N/A'}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 p-4 rounded-xl"
                >
                  <p className="text-sm text-gray-500">Installation Date</p>
                  <p className="font-medium text-gray-800">{insDate || 'N/A'}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-50 p-4 rounded-xl"
                >
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-800">{status || 'N/A'}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Courses Section */}
        {courses.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-90"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activated Courses</h3>
            <div className="space-y-4">
              {courses.map((course, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setExpandedCourseIndex(index === expandedCourseIndex ? null : index)}
                  className="bg-gray-50 p-4 rounded-xl cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-800">{course.courseName}</p>
                    <span className="text-blue-600 font-bold">₹{course.amount}</span>
                  </div>
                  <AnimatePresence>
                    {expandedCourseIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-3"
                      >
                        {course.sections.map((section, sIndex) => (
                          <motion.div
                            key={sIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: sIndex * 0.1 }}
                            className="pl-2"
                          >
                            <p className="text-sm font-medium text-gray-700">{section.language}</p>
                            <ul className="mt-1 space-y-1">
                              {section.topics.map((topic, tIndex) => (
                                <motion.li
                                  key={tIndex}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: tIndex * 0.1 }}
                                  className="text-sm text-gray-600"
                                >
                                  {topic.topic}: {topic.value} videos
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
