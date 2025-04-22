import { useEffect, useState } from 'react';
import { database, ref, get, set } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserSession } from '../auth';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, Calendar, MapPin, Edit2, Star, Users, Clock, BookOpen, Camera, Save, X } from 'lucide-react';

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
  const userId = getUserSession();

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
        const snapshot = await get(ref(database, 'users/' + userId));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
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
      await set(ref(database, 'users/' + userId), {
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
      await set(ref(database, 'users/' + userId), {
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

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </motion.div>
    );
  }

  if (!userId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">🔒 Please Login</h2>
          <p className="text-gray-600">You need to be logged in to view your profile</p>
        </div>
      </motion.div>
    );
  }

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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.02] shadow-lg"
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
              <p className="text-3xl font-bold text-green-600">{userData?.walletPoints || 0} ₹</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition transform hover:scale-[1.02] shadow-lg"
            >
              Add Money
            </motion.button>
          </div>
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
