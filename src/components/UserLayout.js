import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { database, ref, get } from '../firebase';

const UserLayout = ({ children }) => {
  const navigate = useNavigate();
  const { userId } = useParams(); // gets userId from the URL
  const [walletPoints, setWalletPoints] = useState(null);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!userId) return;
      try {
        const snapshot = await get(ref(database, 'users/' + userId));
        if (snapshot.exists()) {
          setWalletPoints(snapshot.val().walletPoints || 0);
        }
      } catch (err) {
        console.error('Failed to fetch wallet:', err);
      }
    };

    fetchWallet();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white flex justify-between items-center px-4 py-3 shadow sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="text-blue-600 font-semibold">
          ← Back
        </button>
        <div className="text-sm text-gray-700 font-medium">
          Wallet: <span className="font-bold text-green-600">{walletPoints ?? '...'}</span> pts
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default UserLayout;
