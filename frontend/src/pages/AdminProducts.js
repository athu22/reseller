import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, ref, get } from '../firebase';
import { getUserSession } from '../auth';
import { Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userSession = getUserSession();
        if (!userSession || !userSession.userId) return;

        // Get all users to find all admins
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val();
        
        if (!usersData) return;

        let allProducts = [];

        // Iterate through all users to find admins and their products
        for (const [userId, userData] of Object.entries(usersData)) {
          if (userData.role === 'admin' || userData.role === 'super_admin') {
            const productsRef = ref(database, `users/${userId}/products/physicalProduct`);
            const productsSnapshot = await get(productsRef);
            
            if (productsSnapshot.exists()) {
              const products = productsSnapshot.val();
              const productsArray = Object.entries(products)
                .map(([id, data]) => ({
                  id,
                  ...data,
                  adminId: userId
                }));
              
              // Only add products for the current admin
              if (userId === userSession.userId) {
                allProducts = [...allProducts, ...productsArray];
              }
            }
          }
        }
            
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/add-product"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Add Product</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No products added yet</p>
            <Link
              to="/add-product"
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3]">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        +{product.images.length - 1}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
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
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        product.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : product.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                      <Link
                        to={`/admin-product/${product.adminId}/${product.id}`}
                        className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminProducts; 