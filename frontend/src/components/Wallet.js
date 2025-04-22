import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Toast from './Toast';

const Wallet = ({ points, onRecharge }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleRazorpay = () => {
    const value = parseInt(amount);
    if (isNaN(value) || value <= 0) {
      setToastMessage('Please enter a valid amount');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    const options = {
      key: 'rzp_live_GyXbMu1y7DNbpK',
      amount: 1 * 100,
      currency: 'INR',
      name: 'Your App Name',
      description: `Pay ₹1 to receive ₹${value} in wallet`,
      handler: function (response) {
        onRecharge(value);
        setToastMessage(`Recharge successful: ₹${value} added to your wallet!`);
        setToastType('success');
        setShowToast(true);
        setAmount('');
      },
      prefill: {
        name: 'User',
        email: 'user@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#F59E0B',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setToastMessage('Please enter a valid amount');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    if (amount > points) {
      setToastMessage('Insufficient balance');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    if (!upiId || !upiId.includes('@')) {
      setToastMessage('Please enter a valid UPI ID');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    try {
      // Here you would make an API call to process the withdrawal
      // For example:
      // const response = await fetch('/api/withdraw', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ upiId, amount })
      // });
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setToastMessage(`₹${amount} has been sent to ${upiId}`);
      setToastType('success');
      setShowToast(true);
      setShowWithdraw(false);
      setUpiId('');
      setWithdrawAmount('');
      
      // Update wallet balance after successful withdrawal
      onRecharge(-amount);
    } catch (error) {
      setToastMessage('Withdrawal failed. Please try again.');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Current Balance</h3>
            <p className="text-3xl font-bold text-blue-600">{points} ₹</p>
          </div>
          {points >= 1000 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWithdraw(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Withdraw
            </motion.button>
          )}
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recharge with Razorpay</h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount to recharge"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all mb-4"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRazorpay}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Add Points with Razorpay
        </motion.button>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Withdraw Money</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <p className="text-sm text-gray-500 mt-1">Available Balance: ₹{points}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="Enter your UPI ID (e.g., username@upi)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWithdraw}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Transfer Money
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Wallet;
