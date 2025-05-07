import { useState } from 'react';
import { database, ref, set, get, update } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { setUserSession } from '../auth';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Github, Mail, Lock, User as UserIcon, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const UserForm = ({ softwareId }) => {
  const [form, setForm] = useState({ username: '', password: '', phone: '' });
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const phone = loginForm.phone.trim();
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number', {
        icon: '📱',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    try {
      const snapshot = await get(ref(database, `users/${phone}`));
      const user = snapshot.val();

      if (user && user.password === loginForm.password) {
        // Check if user is an admin and if they are active
        if (user.role === 'admin') {
          // Get the super admin's ID who created this admin
          const superAdminId = user.createdBy;
          if (superAdminId) {
            // Check admin's status in super admin's admins list
            const adminStatusSnapshot = await get(ref(database, `users/${superAdminId}/admins/${phone}`));
            const adminStatus = adminStatusSnapshot.val();
            
            if (!adminStatus || !adminStatus.isActive) {
              toast.error('Your admin account is inactive. Please contact the super admin.', {
                icon: '❌',
                style: {
                  background: '#EF4444',
                  color: '#fff',
                },
              });
              return;
            }
          }
        }

        // Set user session with role
        setUserSession(phone, user.role || 'user');
        
        toast.success('Login successful!', {
          icon: '👋',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });

        // Redirect all users to home page
        navigate('/');
      } else {
        toast.error('Invalid phone number or password', {
          icon: '❌',
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        });
      }
    } catch (err) {
      toast.error('Error occurred. Try again.', {
        icon: '⚠️',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const phone = form.phone.trim();
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number', {
        icon: '📱',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
      setLoading(false);
      return;
    }
  
    try {
      const phoneRef = ref(database, 'users/' + phone);
      const snapshot = await get(phoneRef);
  
      if (snapshot.exists()) {
        const existingUser = snapshot.val();
        setUserData(existingUser);
        setUserId(phone);
        setShowUserInfo(true);
        toast.success('User found!', {
          icon: '👋',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
      } else {
        const newUser = {
          username: form.username,
          password: form.password,
          phone: phone,
          createdAt: new Date().toISOString(),
          softwareId,
          walletPoints: 0,
        };
        await set(phoneRef, newUser);
  
        setIsCreatingUser(false);
        toast.success('Account created successfully! Please log in.', {
          icon: '✅',
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Something went wrong!', {
        icon: '⚠️',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    const amount = parseInt(rechargeAmount);
    if (!isNaN(amount) && amount > 0 && userId) {
      const newPoints = (userData.walletPoints || 0) + amount;
      await update(ref(database, 'users/' + userId), {
        walletPoints: newPoints,
      });

      setUserData({ ...userData, walletPoints: newPoints });
      setRechargeAmount('');
      toast.success('Wallet recharged successfully!', {
        icon: '💰',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Github className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800">
                {isCreatingUser ? 'Create Account' : 'Sign in to your account'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isCreatingUser ? 'Join our community' : 'Welcome back!'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!isCreatingUser ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        maxLength="10"
                        pattern="[0-9]{10}"
                        placeholder="Mobile Number"
                        value={loginForm.phone}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, phone: e.target.value.replace(/\D/g, '') })
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Sign in
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsCreatingUser(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="username"
                        type="text"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        maxLength="10"
                        pattern="[0-9]{10}"
                        placeholder="Mobile Number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={form.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCreatingUser(false)}
                    className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to sign in
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserForm;
