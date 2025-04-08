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

  const handleRecharge = async () => {
    const addedPoints = parseInt(amount);
    if (!isNaN(addedPoints) && addedPoints > 0) {
      const newPoints = points + addedPoints;
      try {
        await update(ref(database, 'users/' + userId), {
          walletPoints: newPoints
        });
        setPoints(newPoints);
        setAmount('');
        toast.success(`Wallet recharged with ${addedPoints} points`);
        navigate(`/activation/${userId}/${softwareId}`);
      } catch (error) {
        toast.error('Failed to recharge wallet.');
      }
    } else {
      toast.warning('Please enter a valid recharge amount.');
    }
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
          onClick={handleRecharge}
          className="bg-yellow-500 px-4 py-2 rounded text-white w-full hover:bg-yellow-600"
        >
          Recharge
        </button>
      </UserLayout>
    </div>
  );
};

export default WalletPage;
