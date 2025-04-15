import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { database, ref, get, update } from '../firebase';
import { toast } from 'react-toastify';
import { clearUserSession } from '../auth';

const Activation = () => {
  const { userId, softwareId } = useParams();
  const [walletPoints, setWalletPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const plans = [
    { id: 1, name: 'Basic Plan', price: 100 },
    { id: 2, name: 'Pro Plan', price: 200 },
    { id: 3, name: 'Ultimate Plan', price: 300 },
  ];

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const snapshot = await get(ref(database, 'users/' + userId));
        if (snapshot.exists()) {
          setWalletPoints(snapshot.val().walletPoints || 0);
        }
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch wallet info.');
        setLoading(false);
      }
    };

    fetchWallet();
  }, [userId]);

  const handleBuy = async (plan) => {
    if (walletPoints >= plan.price) {
      const newPoints = walletPoints - plan.price;
      try {
        await update(ref(database, 'users/' + userId), {
          walletPoints: newPoints,
          activatedPlan: plan.name,
          activatedAt: new Date().toISOString(),
        });

        setWalletPoints(newPoints);
        toast.success(`🎉 Purchased: ${plan.name}`);

        if (softwareId === "1") {
          navigate(`/register/school/${userId}`);
        } else if (softwareId === "2") {
          navigate(`/register/college/${userId}`);
        } else {
          navigate(`/register/${softwareId}`);
        }
      } catch (err) {
        toast.error('❌ Purchase failed.');
      }
    } else {
      toast.warning('⚠️ Not enough points. Please recharge.');
    }
  };

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-4 max-w-md mx-auto relative">
      {/* Header Bar */}
      {/* <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 text-sm underline"
        >
          ← Back
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-700 text-xl font-bold"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div> */}

      {/* Wallet & Plans */}
      <h2 className="text-xl font-bold mb-2">Choose a Plan</h2>
      <p className="mb-4">Wallet Points: <strong>{walletPoints}</strong></p>

      {plans.map((plan) => (
        <div key={plan.id} className="mb-4 p-4 border rounded shadow">
          <h3 className="text-lg font-semibold">{plan.name}</h3>
          <p>Price: {plan.price} points</p>
          <button
            onClick={() => handleBuy(plan)}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600"
          >
            Buy
          </button>
        </div>
      ))}
    </div>
  );
};

export default Activation;
