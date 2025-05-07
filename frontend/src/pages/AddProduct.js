import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, ref, set, push, get } from '../firebase';
import { getUserSession } from '../auth';
import { toast } from 'react-hot-toast';
import { Image, X, Plus, Upload, Camera, Tag, FileText, DollarSign, Grid, ArrowLeft, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [maxSellPrice, setMaxSellPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [adminProducts, setAdminProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const userId = getUserSession();

  useEffect(() => {
    const fetchAdminProducts = async () => {
      try {
        const userSession = getUserSession();
        if (!userSession || !userSession.userId) return;

        const productsRef = ref(database, `users/${userSession.userId}/products/physicalProduct`);
        const productsSnapshot = await get(productsRef);
        
        if (productsSnapshot.exists()) {
          const products = productsSnapshot.val();
          const productsArray = Object.entries(products).map(([id, data]) => ({
            id,
            ...data
          }));
          setAdminProducts(productsArray);
        }
      } catch (error) {
        console.error('Error fetching admin products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchAdminProducts();
  }, []);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('You can upload maximum 5 images');
      return;
    }

    try {
      const newImages = [];
      const newPreviews = [];

      for (const file of files) {
        const base64String = await convertToBase64(file);
        newImages.push(base64String);
        newPreviews.push(base64String);
      }

      setImages([...images, ...newImages]);
      setImagePreviews([...imagePreviews, ...newPreviews]);
    } catch (error) {
      console.error('Error converting images:', error);
      toast.error('Failed to process images');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Please login to add a product');
      return;
    }

    if (!productName || !description || !price || !category || !maxSellPrice || !mrp || images.length === 0) {
      toast.error('Please fill all fields and add at least one image');
      return;
    }

    setIsUploading(true);
    try {
      // First, get the user's data to get their phone number and super admin
      const userRef = ref(database, 'users');
      const userSnapshot = await get(userRef);
      const usersData = userSnapshot.val();
      
      // Get the phone number from the userId object
      const userPhone = userId.userId; // Access the phone number from the userId object

      if (!userPhone || !usersData[userPhone]) {
        console.log('Available phone numbers:', Object.keys(usersData));
        console.log('Current userId:', userId);
        toast.error('User phone number not found');
        return;
      }

      // Get the super admin who created this admin
      const adminData = usersData[userPhone];
      const superAdminId = adminData.createdBy;

      if (!superAdminId) {
        toast.error('Super admin not found');
        return;
      }

      // Create a new product with sequential ID
      const productsRef = ref(database, `users/${userPhone}/products/physicalProduct`);
      const productsSnapshot = await get(productsRef);
      let nextId = 1;
      
      if (productsSnapshot.exists()) {
        const products = productsSnapshot.val();
        const existingIds = Object.keys(products).map(Number);
        nextId = Math.max(...existingIds) + 1;
      }

      const productData = {
        name: productName,
        description,
        price: parseFloat(price),
        maxSellPrice: parseFloat(maxSellPrice),
        mrp: parseFloat(mrp),
        category,
        type: 'physical',
        userId: userPhone,
        images: imagePreviews,
        createdAt: new Date().toISOString(),
        status: 'pending', // New field to track approval status
        adminId: userPhone, // Store the admin's ID
      };

      // Create the product in the admin's pending products
      const productRef = ref(database, `users/${userPhone}/products/physicalProduct/${nextId}`);
      await set(productRef, productData);

      // Create an approval request in the super admin's notifications
      const notificationRef = ref(database, `users/${superAdminId}/notifications`);
      const newNotificationRef = push(notificationRef);
      await set(newNotificationRef, {
        type: 'product_approval',
        productId: nextId,
        adminId: userPhone,
        productName,
        price,
        category,
        images: imagePreviews,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });

      toast.success('Product submitted for approval!');
      // Reset form
      setProductName('');
      setDescription('');
      setPrice('');
      setMaxSellPrice('');
      setMrp('');
      setCategory('');
      setImages([]);
      setImagePreviews([]);
      setActiveStep(1);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    { value: 'electronics', label: 'Electronics', icon: '💻' },
    { value: 'fashion', label: 'Fashion', icon: '👕' },
    { value: 'home', label: 'Home & Living', icon: '🏠' },
    { value: 'vehicles', label: 'Vehicles', icon: '🚗' },
    { value: 'property', label: 'Property', icon: '🏢' },
    { value: 'jobs', label: 'Jobs', icon: '💼' },
    { value: 'services', label: 'Services', icon: '🔧' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-4 md:py-8"
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
            Add New Product
          </h1>
          <Link
            to="/admin-products"
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <span>View My Products</span>
            <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
              {adminProducts.length}
            </span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4 md:mb-6">
                  <Camera className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mr-2 md:mr-3" />
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">Upload Product Images</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {imagePreviews.map((preview, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group aspect-square"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl shadow-md"
                      />
                      <motion.button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        <X size={14} />
                      </motion.button>
                    </motion.div>
                  ))}
                  
                  {imagePreviews.length < 5 && (
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mb-2" />
                      <span className="text-xs md:text-sm text-gray-500">Add Images</span>
                      <span className="text-xs text-gray-400">(Max 5)</span>
                    </motion.label>
                  )}
                </div>
                <div className="mt-4 md:mt-6 flex justify-end">
                  <motion.button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    disabled={imagePreviews.length === 0}
                    className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next Step
                  </motion.button>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4 md:mb-6">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mr-2 md:mr-3" />
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">Product Details</h2>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-blue-600" />
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                      rows="4"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                        placeholder="Enter price"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                        Maximum Selling Price (₹)
                      </label>
                      <input
                        type="number"
                        value={maxSellPrice}
                        onChange={(e) => setMaxSellPrice(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                        placeholder="Enter maximum selling price"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-blue-600" />
                        MRP (₹)
                      </label>
                      <input
                        type="number"
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                        placeholder="Enter MRP"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Grid className="w-4 h-4 mr-2 text-blue-600" />
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 flex justify-between">
                  <motion.button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-gray-600 hover:text-gray-800 transition-colors flex items-center p-2 rounded-full hover:bg-gray-100"
                    whileHover={{ x: -5 }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden md:inline ml-2">Back</span>
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isUploading}
                    className="bg-blue-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm md:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  );
};

export default AddProduct; 