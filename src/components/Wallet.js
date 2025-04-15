import { useState } from 'react';
import { toast } from 'react-toastify';

const Wallet = ({ points, onRecharge }) => {
  const [amount, setAmount] = useState('');

  const handleRazorpay = () => {
    const value = parseInt(amount);
    if (isNaN(value) || value <= 0) {
      toast.warning('Please enter a valid amount');
      return;
    }
  
    const options = {
      key: 'rzp_live_GyXbMu1y7DNbpK', // 🔑 Replace with your Razorpay Key ID
      amount: 1 * 100, // Always charge ₹1
      currency: 'INR',
      name: 'Your App Name',
      description: `Pay ₹1 to receive ₹${value} in wallet`,
      handler: function (response) {
        // Razorpay payment success — reward full amount
        onRecharge(value);
        toast.success(`Recharge successful: ₹${value} added to your wallet!`);
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
  

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Wallet</h2>
      <p className="mb-2">Current Points: <strong>{points}</strong></p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to recharge"
        className="block w-full border px-3 py-2 mb-3 rounded"
      />
      <button
        onClick={handleRazorpay}
        className="bg-yellow-500 text-white px-4 py-2 rounded w-full hover:bg-yellow-600"
      >
        Add Points with Razorpay
      </button>
    </div>
  );
};

export default Wallet;
