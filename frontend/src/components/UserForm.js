import { useState } from 'react';
import { database, ref, set, get, update } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { setUserSession } from '../auth';
import { motion } from 'framer-motion';

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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const phone = loginForm.phone.trim();
    if (!/^\d{10}$/.test(phone)) {
      setLoginError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const snapshot = await get(ref(database, `users/${phone}`));
      const user = snapshot.val();

      if (user && user.password === loginForm.password) {
        setUserSession(phone);
        navigate('/');
      } else {
        setLoginError('Invalid phone number or password');
      }
    } catch (err) {
      setLoginError('Error occurred. Try again.');
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
      alert('Please enter a valid 10-digit phone number.');
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
  
        // ✅ Redirect to login after successful user creation
        setIsCreatingUser(false);
        alert('User created successfully! Please log in.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong!');
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
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 max-w-md mx-auto"
    >
      {!isCreatingUser && (
        <motion.form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-xl shadow mb-6 border border-gray-100"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
        >
          <h2 className="text-xl font-bold mb-4 text-center text-gray-800">🔐 Login</h2>
          {loginError && <p className="text-red-500 text-sm mb-3">{loginError}</p>}
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
            className="w-full border px-4 py-2 mb-3 rounded focus:outline-none"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="w-full border px-4 py-2 mb-4 rounded focus:outline-none"
            required
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 transition">
            Login
          </button>
          <p className="text-sm text-center mt-3">
            Don't have an account?{' '}
            <span
              onClick={() => setIsCreatingUser(true)}
              className="text-blue-600 cursor-pointer underline"
            >
              Create a new user
            </span>
          </p>
        </motion.form>
      )}

      {isCreatingUser && (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow mb-6 border border-gray-100"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
        >
          <h2 className="text-xl font-bold mb-4 text-center text-gray-800">🧾 Create New User</h2>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full border px-4 py-2 mb-3 rounded focus:outline-none"
            required
          />
          <input
            name="phone"
            type="tel"
            maxLength="10"
            pattern="[0-9]{10}"
            placeholder="Mobile Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
            className="w-full border px-4 py-2 mb-3 rounded focus:outline-none"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border px-4 py-2 mb-4 rounded focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Create User'}
          </button>
          <p className="text-sm text-center mt-3">
            Already have an account?{' '}
            <span
              onClick={() => setIsCreatingUser(false)}
              className="text-blue-600 cursor-pointer underline"
            >
              Back to Login
            </span>
          </p>
        </motion.form>
      )}

      {userData && showUserInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-green-100 p-5 rounded-lg shadow relative"
        >
          <button
            onClick={() => setShowUserInfo(false)}
            className="absolute top-2 right-2 text-red-600 text-lg font-bold"
          >
            ×
          </button>

          <h3 className="text-lg font-bold mb-3 text-green-800">👤 User Info</h3>
          <p><strong>Phone:</strong> {userId}</p>
          <p><strong>Username:</strong> {userData.username}</p>
          <p><strong>Software ID:</strong> {userData.softwareId || 'None'}</p>
          <p><strong>Wallet Points:</strong> {userData.walletPoints || 0}</p>

          <div className="mt-4">
            <input
              type="number"
              placeholder="Recharge Amount"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="w-full border px-3 py-2 mb-3 rounded"
            />
            <button
              onClick={handleRecharge}
              className="bg-yellow-500 text-white px-4 py-2 rounded w-full hover:bg-yellow-600 transition"
            >
              Recharge Wallet
            </button>
          </div>

          <button
            onClick={() => navigate(`/activation/${userId}/${softwareId}`)}
            className="mt-4 bg-purple-500 text-white px-4 py-2 rounded w-full hover:bg-purple-600 transition"
          >
            Go to Activation
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UserForm;
