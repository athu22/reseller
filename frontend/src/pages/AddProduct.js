import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, ref, set, push, get } from '../firebase';
import { getUserSession } from '../auth';
import { toast } from 'react-hot-toast';
import { Image, X, Plus, Upload, Camera, Tag, FileText, DollarSign, Grid, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('digital');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [digitalProductType, setDigitalProductType] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [licenseKey, setLicenseKey] = useState('');

  const userId = getUserSession();

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

    if (activeTab === 'physical') {
      if (!productName || !description || !price || !category || images.length === 0) {
        toast.error('Please fill all fields and add at least one image');
        return;
      }
    } else {
      if (!productName || !description || !price || !category || !digitalProductType || !downloadLink) {
        toast.error('Please fill all required fields');
        return;
      }
    }

    setIsUploading(true);
    try {
      // Get user's mobile number from the database
      const userRef = ref(database, 'users/' + userId);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      
      if (!userData || !userData.phone) {
        toast.error('User mobile number not found');
        return;
      }

      const mobileNumber = userData.phone;
      const productType = activeTab === 'digital' ? 'digitalProduct' : 'physicalProduct';
      
      // Get the current products to determine the next ID
      const productsRef = ref(database, `users/${mobileNumber}/products/${productType}`);
      const productsSnapshot = await get(productsRef);
      let nextId = 1;
      
      if (productsSnapshot.exists()) {
        const products = productsSnapshot.val();
        const existingIds = Object.keys(products).map(Number);
        nextId = Math.max(...existingIds) + 1;
      }
      
      // Create a new product with sequential ID
      const productRef = ref(database, `users/${mobileNumber}/products/${productType}/${nextId}`);
      const productData = {
        name: productName,
        description,
        price: parseFloat(price),
        category,
        type: activeTab,
        userId,
        createdAt: new Date().toISOString(),
      };

      if (activeTab === 'physical') {
        productData.images = imagePreviews;
      } else {
        productData.digitalProductType = digitalProductType;
        productData.downloadLink = downloadLink;
        if (licenseKey) productData.licenseKey = licenseKey;
      }

      await set(productRef, productData);

      toast.success('Product added successfully!');
      // Reset form
      setProductName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImages([]);
      setImagePreviews([]);
      setDigitalProductType('');
      setDownloadLink('');
      setLicenseKey('');
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

  const digitalProductTypes = [
    { value: 'software', label: 'Software', icon: '💻' },
    { value: 'ebook', label: 'E-Book', icon: '📚' },
    { value: 'course', label: 'Online Course', icon: '🎓' },
    { value: 'template', label: 'Template', icon: '📝' },
    { value: 'asset', label: 'Digital Asset', icon: '🎨' },
  ];

  const tabVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

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
        </div>

        {/* Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'digital' ? (
              <motion.div
                key="digital"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4 md:mb-6">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mr-2 md:mr-3" />
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">Digital Product Details</h2>
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
                      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
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

                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Product Type
                    </label>
                    <select
                      value={digitalProductType}
                      onChange={(e) => setDigitalProductType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                    >
                      <option value="">Select product type</option>
                      {digitalProductTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Download Link
                    </label>
                    <input
                      type="url"
                      value={downloadLink}
                      onChange={(e) => setDownloadLink(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                      placeholder="Enter download link"
                    />
                  </div>

                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      License Key (Optional)
                    </label>
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base"
                      placeholder="Enter license key if applicable"
                    />
                  </div>
                </div>

                <div className="mt-6 md:mt-8 flex justify-end">
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
            ) : (
              <motion.div
                key="physical"
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
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
                            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
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
                            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
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
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>
  );
};

export default AddProduct; 