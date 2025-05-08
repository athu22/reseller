import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database, ref, get, onValue, update, push, set } from '../firebase';
import { getUserSession } from '../auth';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Package, Clock, Check, X, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userSession = getUserSession();
        if (!userSession || !userSession.userId) {
          navigate('/create-user/1');
          return;
        }

        // Get user data to determine role
        const userRef = ref(database, `users/${userSession.userId}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        
        if (!userData) {
          navigate('/create-user/1');
          return;
        }

        setUserRole(userData.role);

        // Get all users to find all admins
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        const usersData = usersSnapshot.val();
        
        if (!usersData) return;

        let allOrders = [];

        if (userData.role === 'admin' || userData.role === 'super_admin') {
          // For admins, show orders they received
          const notificationsRef = ref(database, `users/${userSession.userId}/notifications`);
          const notificationsSnapshot = await get(notificationsRef);
          
          if (notificationsSnapshot.exists()) {
            const notifications = notificationsSnapshot.val();
            const orderNotifications = Object.entries(notifications)
              .filter(([_, notification]) => notification.type === 'order_request')
              .map(([id, data]) => ({
                id,
                ...data,
                adminId: userSession.userId,
                adminName: userData.username
              }));
            
            allOrders = [...allOrders, ...orderNotifications];
          }
        } else {
          // For regular users, show their orders from all admins
          for (const [userId, adminData] of Object.entries(usersData)) {
            if (adminData.role === 'admin' || adminData.role === 'super_admin') {
              const notificationsRef = ref(database, `users/${userId}/notifications`);
              const notificationsSnapshot = await get(notificationsRef);
              
              if (notificationsSnapshot.exists()) {
                const notifications = notificationsSnapshot.val();
                const orderNotifications = Object.entries(notifications)
                  .filter(([_, notification]) => 
                    notification.type === 'order_request' && 
                    notification.buyerId === userSession.userId
                  )
                  .map(([id, data]) => ({
                    id,
                    ...data,
                    adminId: userId,
                    adminName: adminData.username
                  }));
                
                allOrders = [...allOrders, ...orderNotifications];
              }
            }
          }
        }

        // Sort orders by date (newest first)
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(allOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleOrderApproval = async (orderId, adminId, approve) => {
    try {
      // Update notification status
      const notificationRef = ref(database, `users/${adminId}/notifications/${orderId}`);
      await update(notificationRef, { status: approve ? 'approved' : 'rejected' });

      // Create notification for buyer
      const userSession = getUserSession();
      const buyerNotificationRef = ref(database, `users/${userSession.userId}/notifications`);
      const newBuyerNotificationRef = push(buyerNotificationRef);
      await set(newBuyerNotificationRef, {
        type: 'order_status',
        status: approve ? 'approved' : 'rejected',
        createdAt: new Date().toISOString()
      });

      toast.success(`Order ${approve ? 'approved' : 'rejected'} successfully!`);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: approve ? 'approved' : 'rejected' }
          : order
      ));
    } catch (error) {
      console.error('Error handling order approval:', error);
      toast.error('Failed to process order');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {userRole === 'admin' || userRole === 'super_admin' ? 'Received Orders' : 'My Orders'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['all', 'pending', 'approved', 'rejected'].map((tab) => (
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
                <span className="relative z-10 capitalize">
                  {tab}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
              <p className="mt-2 text-gray-500">
                {userRole === 'admin' || userRole === 'super_admin' 
                  ? 'You haven\'t received any orders yet' 
                  : 'Your order history will appear here'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {order.images && order.images.length > 0 ? (
                        <img
                          src={order.images[0]}
                          alt={order.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {order.productName}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {userRole === 'admin' || userRole === 'super_admin' 
                              ? `Order from ${order.buyerName}`
                              : `Order from ${order.adminName}`}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              ₹{order.price}
                            </span>
                            <span className="text-sm text-gray-500">
                              • {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {order.status === 'approved' && <Check className="w-3 h-3 mr-1" />}
                            {order.status === 'rejected' && <X className="w-3 h-3 mr-1" />}
                            {order.status}
                          </span>
                          
                          {/* Approve/Reject Buttons - Only show for admins on pending orders */}
                          {(userRole === 'admin' || userRole === 'super_admin') && order.status === 'pending' && (
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => handleOrderApproval(order.id, order.adminId, true)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOrderApproval(order.id, order.adminId, false)}
                                className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address Section */}
                      {order.address && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">{order.address.fullAddress}</p>
                              <p className="text-sm text-gray-600">
                                {order.address.city}, {order.address.state} - {order.address.pincode}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Additional Order Details */}
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Order ID</p>
                          <p className="font-medium text-gray-900 truncate">{order.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="font-medium text-gray-900">{order.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders; 