import { useState } from 'react';

const Wallet = ({ points, onRecharge }) => {
  const [amount, setAmount] = useState('');

  const handleRecharge = () => {
    const value = parseInt(amount);
    if (!isNaN(value) && value > 0) {
      onRecharge(value);
      setAmount('');
    }
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
        onClick={handleRecharge}
        className="bg-yellow-500 text-white px-4 py-2 rounded w-full hover:bg-yellow-600"
      >
        Add Points
      </button>
    </div>
  );
};

export default Wallet;
