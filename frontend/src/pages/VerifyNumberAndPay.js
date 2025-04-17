// src/pages/VerifyMobile.jsx
import React, { useState } from 'react';
import axios from 'axios';

const VerifyMobile = () => {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!mobile) {
      setError('Please enter your mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `http://localhost:5050/api/check-number/${mobile}`
      );

      if (response.data.success) {
        // ✅ Redirect to payment page
        window.location.href = `/pay?mobile=${mobile}`;
      } else {
        setError('Mobile number not found. Please install the app.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h2>Verify Mobile Number</h2>
      <input
        type="text"
        placeholder="Enter mobile number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        style={{ padding: '10px', width: '100%' }}
      />
      <button
        onClick={handleVerify}
        style={{ padding: '10px 20px', marginTop: '10px' }}
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify & Proceed'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default VerifyMobile;
