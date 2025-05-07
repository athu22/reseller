import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, ref, get, push, set, onValue } from '../firebase';
import { getUserSession } from '../auth';
import { toast } from 'react-hot-toast';
import { Star, Users, Clock, Check, X, Share2, Heart, ArrowRight, Truck, Shield } from 'lucide-react';
import softwareList from '../data/softwareList';

const ProductDetails = ({software}) => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [mobileInfo, setMobileInfo] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showNumberPopup, setShowNumberPopup] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [walletPoints, setWalletPoints] = useState(0);
  const [mobileConfirmed, setMobileConfirmed] = useState(false);
  const [isBonusLocked, setIsBonusLocked] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    // Find product from softwareList
    const foundProduct = softwareList.find(p => p.id === parseInt(productId));
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      toast.error('Product not found');
      navigate('/');
    }
    setLoading(false);

    // Fetch user data
    const fetchUserData = async () => {
      const userSession = getUserSession();
      if (userSession && userSession.userId) {
        const userRef = ref(database, `users/${userSession.userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setIsBonusLocked(!data.hasClaimedWelcomeBonus);
          setWalletPoints(data.walletPoints || 0);
        }
      }
    };

    // Fetch reviews
    const reviewsRef = ref(database, `reviews/${foundProduct?.name}`);
    onValue(reviewsRef, (snapshot) => {
      if (snapshot.exists()) {
        const reviewsData = snapshot.val();
        // Convert numbered reviews to array and sort by number
        const reviewsArray = Object.entries(reviewsData)
          .map(([number, review]) => ({
            id: number,
            ...review
          }))
          .sort((a, b) => Number(a.id) - Number(b.id));
        
        setReviews(reviewsArray);
        
        // Calculate average rating
        const totalRating = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(reviewsArray.length > 0 ? totalRating / reviewsArray.length : 0);
      } else {
        setReviews([]);
        setAverageRating(0);
      }
    });

    fetchUserData();
  }, [productId, navigate]);

  const handleBuyClick = async () => {
    const userSession = getUserSession();
    if (!userSession || !userSession.userId) {
      setShowLogin(true);
      return;
    }

    // Check if wallet is locked
    if (isBonusLocked) {
      toast.error('Please unlock your wallet by paying ₹1000 to activate the course', {
        icon: '🔒',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    // If wallet is unlocked, proceed with course activation
    setShowNumberPopup(true);
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

        const courseType = getCourseType(product.name);
        const activateRes = await fetch("http://localhost:5050/api/activate-course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, mobileNumber, courseType }),
        });

        const activateData = await activateRes.json();

        if (activateRes.ok && activateData.success) {
          // Update wallet points
          const newBalance = walletPoints - (product.discountedPrice || product.originalPrice || 499);
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

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleReviewSubmit = async () => {
    const userSession = getUserSession();
    if (!userSession || !userSession.userId) {
      setShowLogin(true);
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      // Get the current reviews to determine the next review number
      const reviewsRef = ref(database, `reviews/${product.name}`);
      const snapshot = await get(reviewsRef);
      let nextReviewNumber = 1;
      
      if (snapshot.exists()) {
        const reviews = snapshot.val();
        // Find the highest review number and add 1
        nextReviewNumber = Math.max(...Object.keys(reviews).map(Number)) + 1;
      }

      // Store the review with sequential numbering
      await set(ref(database, `reviews/${product.name}/${nextReviewNumber}`), {
        userId: userSession.userId,
        userName: userSession.name || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        timestamp: Date.now()
      });

      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Left Column - Image Section */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center bg-green-100 px-2 py-1 rounded">
                    <span className="text-green-800 font-medium">{averageRating.toFixed(1)}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current ml-1" />
                  </div>
                  <div className="text-gray-500 text-sm">{reviews.length} reviews</div>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{product.discountedPrice || product.originalPrice}
                  </span>
                  {product.discountedPrice && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{product.originalPrice}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {Math.round(
                          ((product.originalPrice - product.discountedPrice) /
                            product.originalPrice) *
                            100
                        )}
                        % off
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Inclusive of all taxes
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
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">What you'll learn</h2>
                <ul className="space-y-2">
                  {[
                    'Expert-led video tutorials',
                    'Interactive learning materials',
                    '24/7 access to course content',
                    'Certificate upon completion',
                    'Lifetime access to updates',
                    'Community support'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyClick}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {product.name.includes('Course') ? 'Get Started' : 'Buy Now'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {review.userName.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{review.userName}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet.</p>
            )}
          </div>

          {/* Stars and Comment Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Your Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Write your review here..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleReviewSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Submit Review
                </button>
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

        {/* Mobile Number Popup */}
        <AnimatePresence>
          {showNumberPopup && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setShowNumberPopup(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: '0%' }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', bounce: 0.2 }}
                className="fixed bottom-24 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Enter Mobile Number</h3>
                  <button
                    onClick={() => setShowNumberPopup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobileNumber}
                    onChange={(e) => {
                      const newValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setMobileNumber(newValue);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    required
                  />
                  {mobileError && (
                    <p className="text-red-500 text-sm">{mobileError}</p>
                  )}
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
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductDetails; 