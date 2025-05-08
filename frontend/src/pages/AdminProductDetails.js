import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, ref, get, onValue, set, push } from '../firebase';
import { getUserSession } from '../auth';
import { toast } from 'react-hot-toast';
import { Star, Users, Clock, Check, X, Share2, Heart, ArrowRight, Truck, Shield, Image as ImageIcon } from 'lucide-react';

const AdminProductDetails = () => {
  const { adminId, productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showNumberPopup, setShowNumberPopup] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [averageRating, setAverageRating] = useState(0);

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

    // Fetch reviews
    const fetchReviews = () => {
      const reviewsRef = ref(database, `reviews/${product?.name}`);
      const unsubscribe = onValue(reviewsRef, (snapshot) => {
        if (snapshot.exists()) {
          const reviewsData = snapshot.val();
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

      return unsubscribe;
    };

    fetchProduct();
    const unsubscribe = fetchReviews();
    return () => unsubscribe();
  }, [adminId, productId, navigate, product?.name]);

  const handleBuyClick = async () => {
    const userSession = getUserSession();
    if (!userSession || !userSession.userId) {
      setShowLogin(true);
      return;
    }

    try {
      // Get user data
      const userRef = ref(database, `users/${userSession.userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      if (!userData) {
        toast.error('User data not found');
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
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      toast.success('Order request sent successfully!');
      setShowNumberPopup(true);
    } catch (error) {
      console.error('Error creating order request:', error);
      toast.error('Failed to create order request');
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
      const reviewsRef = ref(database, `reviews/${product.name}`);
      const snapshot = await get(reviewsRef);
      let nextReviewNumber = 1;
      
      if (snapshot.exists()) {
        const reviews = snapshot.val();
        nextReviewNumber = Math.max(...Object.keys(reviews).map(Number)) + 1;
      }

      await set(ref(database, `reviews/${product.name}/${nextReviewNumber}`), {
        userId: userSession.userId,
        userName: userSession.name || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        timestamp: Date.now()
      });

      setNewReview({ rating: 5, comment: '' });
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
                  {product.images && product.images[selectedImage] ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
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
                    ₹{product.price}
                  </span>
                  {product.mrp && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.mrp}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Inclusive of all taxes
                </div>
                {product.maxSellAmount && (
                  <div className="mt-2 text-sm text-blue-600">
                    Max Sell Amount: ₹{product.maxSellAmount}
                  </div>
                )}
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
                <h2 className="text-lg font-semibold text-gray-900">Category</h2>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {product.category}
                </span>
              </div>

              <div className="pt-4 space-y-4">
                <button
                  onClick={() => navigate(`/buy-product/${adminId}/${productId}`)}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-md text-lg font-semibold shadow-sm hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Buy Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-4 rounded-md text-lg font-semibold hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
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
                    className="w-full px-4 py-3 rounded-md border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    required
                  />
                  {mobileError && (
                    <p className="text-red-500 text-sm">{mobileError}</p>
                  )}
                  <button
                    onClick={() => {
                      // Add your mobile number verification logic here
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminProductDetails; 