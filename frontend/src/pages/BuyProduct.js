import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { database, ref, get, push, set } from '../firebase';
import { getUserSession } from '../auth';
import { toast } from 'react-hot-toast';
import { ArrowLeft, X, Truck, Shield, CheckCircle2 } from 'lucide-react';

const BuyProduct = () => {
  const { adminId, productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    fullAddress: '',
    pincode: '',
    city: '',
    state: ''
  });
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productRef = ref(database, `users/${adminId}/products/physicalProduct/${productId}`);
        const snapshot = await get(productRef);
        
        if (snapshot.exists()) {
          setProduct(snapshot.val());
        } else {
          toast.error('Product not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [adminId, productId, navigate]);

  const validateAddress = () => {
    if (!address.fullAddress.trim()) {
      setAddressError('Please enter your full address');
      return false;
    }
    if (!address.pincode.trim()) {
      setAddressError('Please enter your pincode');
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setAddressError('Please enter a valid 6-digit pincode');
      return false;
    }
    if (!address.city.trim()) {
      setAddressError('Please enter your city');
      return false;
    }
    if (!address.state.trim()) {
      setAddressError('Please enter your state');
      return false;
    }
    setAddressError('');
    return true;
  };

  const handleBuyClick = async () => {
    const userSession = getUserSession();
    if (!userSession || !userSession.userId) {
      setShowLogin(true);
      return;
    }

    setShowAddressForm(true);
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      return;
    }

    try {
      // Get user data
      const userSession = getUserSession();
      const userRef = ref(database, `users/${userSession.userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      if (!userData) {
        toast.error('User data not found');
        return;
      }

      // Get admin data to verify the product belongs to this admin
      const adminRef = ref(database, `users/${adminId}`);
      const adminSnapshot = await get(adminRef);
      const adminData = adminSnapshot.val();

      if (!adminData || !adminData.products?.physicalProduct?.[productId]) {
        toast.error('Invalid product or admin');
        return;
      }

      // Create order request in admin's notifications
      const notificationRef = ref(database, `users/${adminId}/notifications`);
      const newNotificationRef = push(notificationRef);
      await set(newNotificationRef, {
        type: 'order_request',
        productId,
        productName: product.name,
        price: product.price,
        category: product.category,
        images: product.images,
        buyerId: userSession.userId,
        buyerName: userData.username,
        buyerPhone: userData.phone,
        address: address,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      setShowAddressForm(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating order request:', error);
      toast.error('Failed to create order request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Buy Product</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Product Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    {product.mrp && (
                      <span className="text-lg text-gray-500 line-through">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Truck className="w-5 h-5 mr-2 text-blue-600" />
                      <span>Free Delivery</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Shield className="w-5 h-5 mr-2 text-blue-600" />
                      <span>Secure Transaction</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Category</h3>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </span>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleBuyClick}
                    className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-sm hover:bg-blue-700 transition-colors duration-200"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-24 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Login to Continue</h3>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowLogin(false);
                    navigate('/create-user/1');
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold"
                >
                  Create Account
                </button>
                <button
                  onClick={() => {
                    setShowLogin(false);
                    navigate('/login');
                  }}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-md font-semibold"
                >
                  Login
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Address Form Modal */}
      <AnimatePresence>
        {showAddressForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowAddressForm(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0.2 }}
              className="fixed bottom-12 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 p-6 pb-16 max-h-[85vh] overflow-y-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:bottom-auto sm:rounded-2xl sm:max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Delivery Address</h3>
                <button
                  onClick={() => setShowAddressForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    value={address.fullAddress}
                    onChange={(e) => setAddress(prev => ({ ...prev, fullAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter your full address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={address.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setAddress(prev => ({ ...prev, pincode: value }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your state"
                  />
                </div>
                {addressError && (
                  <p className="text-red-500 text-sm">{addressError}</p>
                )}
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Confirm Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Screen */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center w-screen h-screen min-h-screen"
          >
            {/* Expanding Green Circle Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 20 }}
              transition={{ type: 'spring', duration: 0.8, bounce: 0.2 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500 rounded-full"
              style={{ zIndex: 1 }}
            />
            {/* Checkmark and Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
              className="relative text-center px-4 w-full max-w-xs sm:max-w-md"
              style={{ zIndex: 2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                className="mb-8"
              >
                <CheckCircle2 className="w-24 h-24 text-white mx-auto drop-shadow-lg" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 drop-shadow">
                Order Placed Successfully!
              </h2>
              <p className="text-white mb-8 max-w-md mx-auto drop-shadow text-base sm:text-lg">
                Your order has been placed and the seller will contact you shortly.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-white text-green-600 px-6 py-4 rounded-xl text-lg font-semibold shadow-sm hover:bg-gray-100 transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuyProduct; 