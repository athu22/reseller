// src/pages/ActivationPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ActivationPage = () => {
  const { userId, courseId } = useParams();
  const [userData, setUserData] = useState(null);
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false);

  const courseName = "English Speaking Course"; // or get from DB based on courseId
  const amount = 1; // ₹1 for testing

  useEffect(() => {
    // Call backend to check number
    axios.get(`http://localhost:5050/check-number/${userId}`)
      .then(res => {
        if (res.data.success) {
          setUserData(res.data);
          setStatus('found');
        } else {
          setStatus('not_found');
          setError(res.data.message);
        }
      })
      .catch(() => {
        setStatus('error');
        setError('Something went wrong.');
      });
  }, [userId]);

  const handleActivate = async () => {
    setLoadingPayment(true);
    try {
      const res = await axios.post('http://localhost:5000/payment', {
        userId,
        courseId,
        courseName,
        amount,
      });
      if (res.data.success) {
        window.location.href = res.data.link; // redirect to Razorpay link
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Payment initiation failed');
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Activate Course</h2>
      {status === 'checking' && <p>Checking your number...</p>}
      {status === 'found' && (
        <div>
          <p><strong>IMEI:</strong> {userData.imei}</p>
          <p><strong>InsDate:</strong> {userData.insDate}</p>
          <p><strong>Status:</strong> {userData.status}</p>
          <button onClick={handleActivate} disabled={loadingPayment}>
            {loadingPayment ? 'Redirecting...' : 'Activate Now'}
          </button>
        </div>
      )}
      {status === 'not_found' && <p style={{ color: 'red' }}>{error}</p>}
      {status === 'error' && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};

export default ActivationPage;
