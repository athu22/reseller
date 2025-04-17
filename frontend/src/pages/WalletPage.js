import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { database, ref, get, update } from '../firebase';
import UserLayout from '../components/UserLayout';
import { toast } from 'react-toastify';

const WalletPage = () => {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const softwareId = searchParams.get('softwareId');

  const [points, setPoints] = useState(0);
  const [amount, setAmount] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const snapshot = await get(ref(database, 'users/' + userId));
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setPoints(userData.walletPoints || 0);
          setUsername(userData.username || '');
        }
      } catch (error) {
        toast.error('Failed to fetch user data.');
      }
    };

    fetchPoints();
  }, [userId]);

  const handleRazorpay = async () => {
    const addedPoints = parseInt(amount);
    if (isNaN(addedPoints) || addedPoints <= 0) {
      toast.warning('Please enter a valid recharge amount.');
      return;
    }

    const options = {
      key: "rzp_live_GyXbMu1y7DNbpK", // Replace with your Razorpay Key ID
      amount: addedPoints * 100, // Razorpay works in paisa
      currency: "INR",
      name: "Your App Name",
      description: "Wallet Recharge",
      handler: async function (response) {
        try {
          const newPoints = points + addedPoints;
          await update(ref(database, 'users/' + userId), {
            walletPoints: newPoints,
          });
          setPoints(newPoints);
          setAmount('');
          toast.success(`Recharge successful: ${addedPoints} points added!`);
          navigate(`/activation/${userId}/${softwareId}`);
        } catch (err) {
          toast.error("Failed to update points after payment.");
        }
      },
      prefill: {
        name: username,
        email: "", // optional
        contact: "", // optional
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <UserLayout>
        <h2 className="text-xl font-bold mb-4">{username}'s Wallet</h2>
        <p className="mb-2">Current Points: <strong>{points}</strong></p>
        <input
          type="number"
          placeholder="Add Points"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="block w-full border px-3 py-2 mb-3 rounded"
        />
        <button
          onClick={handleRazorpay}
          className="bg-yellow-500 px-4 py-2 rounded text-white w-full hover:bg-yellow-600"
        >
          Recharge with Razorpay
        </button>
      </UserLayout>
    </div>
  );
};

export default WalletPage;
