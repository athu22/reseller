import softwareList from '../data/softwareList';
import SoftwareCard from '../components/SoftwareCard';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, UserPlusIcon, UserIcon, Phone, Heart, Share2, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, ref, get } from '../firebase';
import { getUserSession } from '../auth';

const Home = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('digital');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [physicalProducts, setPhysicalProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhone, setUserPhone] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userSession = getUserSession();
        if (!userSession || !userSession.userId) return;

        const userRef = ref(database, `users/${userSession.userId}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        
        if (userData && userData.phone) {
          setUserPhone(userData.phone);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchPhysicalProducts = async () => {
      try {
        const userSession = getUserSession();
        if (!userSession || !userSession.userId) return;

        const userRef = ref(database, `users/${userSession.userId}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        
        if (!userData || !userData.phone) return;

        const mobileNumber = userData.phone;
        const productsRef = ref(database, `users/${mobileNumber}/products/physicalProduct`);
        const productsSnapshot = await get(productsRef);
        
        if (productsSnapshot.exists()) {
          const products = productsSnapshot.val();
          const productsArray = Object.entries(products).map(([id, data]) => ({
            id,
            ...data
          }));
          setPhysicalProducts(productsArray);
        }
      } catch (error) {
        console.error('Error fetching physical products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhysicalProducts();
  }, []);

  const filteredSoftware = softwareList.filter((software) =>
    software.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPhysicalProducts = physicalProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const tabVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleCall = (e) => {
    e.stopPropagation(); // Prevent card click when clicking call button
    if (userPhone) {
      window.location.href = `tel:${userPhone}`;
    }
  };

  const openGallery = (product, index = 0) => {
    setSelectedProduct(product);
    setCurrentImageIndex(index);
  };

  const closeGallery = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  // Add a function to handle base64 image loading
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTkgM0g1QzMuOSAzIDMgMy45IDMgNXYxNGMwIDEuMS45IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjVjMC0xLjEtLjktMi0yLTJ6bTAgMTZINVY1aDE0djE0ek0xMSAxN2gydi02bDMgM2wzLTM2aDJMNyAxN2g0eiIgZmlsbD0iIzk5OSIvPjwvc3ZnPg==';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white"
    >
      {/* Search Bar */}
      <div className="p-4 flex-1">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg mb-6"
        >
          <div className="relative">
            <motion.div
              className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                isSearchFocused ? 'bg-blue-50' : 'bg-transparent'
              }`}
              initial={false}
              animate={{ scale: isSearchFocused ? 1.02 : 1 }}
            />
            <div className="relative flex items-center">
              <svg
                className={`absolute left-3 h-5 w-5 transition-colors duration-300 ${
                  isSearchFocused ? 'text-blue-500' : 'text-gray-400'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <motion.input
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none transition-all duration-300 ${
                  isSearchFocused
                    ? 'border-blue-400 bg-transparent'
                    : 'border-gray-200 bg-white'
                }`}
              />
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <div className="relative">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {['digital', 'physical'].map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-300 ${
                      activeTab === tab 
                        ? 'text-white font-semibold' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {/* {tab === 'digital' ? 'Digital Products' : 'Physical Products'} */}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 shadow-md rounded-md"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">
                      {tab === 'digital' ? 'Digital Products' : 'Physical Products'}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content based on active tab */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'digital' ? (
              <motion.div
                key="digital"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="col-span-full"
              >
                <AnimatePresence>
                  {filteredSoftware.map((software) => (
                    <motion.div
                      key={software.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className="cursor-pointer"
                    >
                      <SoftwareCard software={software} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="physical"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="col-span-full"
              >
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                  </div>
                ) : filteredPhysicalProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No physical products found</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredPhysicalProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          whileHover={{ scale: 1.02 }}
                          className="cursor-pointer group"
                        >
                          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
                            <div className="relative aspect-[4/3]">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => openGallery(product, 0)}
                                  onError={handleImageError}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              {product.images && product.images.length > 1 && (
                                <div 
                                  className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-black/70 transition-colors"
                                  onClick={() => openGallery(product, 0)}
                                >
                                  +{product.images.length - 1}
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="text-base font-medium text-gray-800 line-clamp-2 flex-1">
                                  {product.name}
                                </h3>
                                <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                                  ₹{product.price}
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {product.category}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(product.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                {product.description}
                              </p>
                              {userPhone && (
                                <div className="mt-3 flex items-center justify-between">
                                  <span className="text-sm text-gray-500">
                                    Contact: {userPhone}
                                  </span>
                                  <button
                                    onClick={handleCall}
                                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm hover:bg-green-600 transition-colors"
                                  >
                                    <Phone size={16} />
                                    Call
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeGallery}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeGallery}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="relative aspect-[4/3]">
                <img
                  src={selectedProduct.images[currentImageIndex]}
                  alt={`${selectedProduct.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                  onError={handleImageError}
                />

                {selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              <div className="p-4 bg-white">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {selectedProduct.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Image {currentImageIndex + 1} of {selectedProduct.images.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navbar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-inner p-2 flex justify-around items-center sm:hidden rounded-t-xl"
      >
        <NavButton icon={<HomeIcon size={22} />} label="Software" onClick={() => navigate('/')} active={location.pathname === '/'} />
        <NavButton icon={<UserPlusIcon size={22} />} label="Create" onClick={() => navigate('/create-user/1')} active={location.pathname.includes('/create-user')} />
        <NavButton icon={<UserIcon size={22} />} label="Profile" onClick={() => navigate('/profile')} active={location.pathname === '/profile'} />
      </motion.div>
    </motion.div>
  );
};

// Bottom Nav Button (with active state)
const NavButton = ({ icon, label, onClick, active }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center text-sm transition-all duration-300 ${
        active ? 'text-blue-600 font-semibold' : 'text-gray-700'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </motion.button>
  );
};

export default Home;
