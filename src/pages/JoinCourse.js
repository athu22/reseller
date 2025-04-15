import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const JoinCourse = () => {
  const { linkId } = useParams();
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchLinkData = async () => {
      const res = await fetch(`http://localhost:5000/api/link/${linkId}`);
      const data = await res.json();
      setCourse(data.course);
    };
    fetchLinkData();
  }, [linkId]);

  const handlePayAndActivate = async () => {
    const buyerId = localStorage.getItem('userId');
    const res = await fetch(`http://localhost:5000/api/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId, buyerId })
    });
    const data = await res.json();
    setMessage(data.message);
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{course.name}</h2>
      <p>{course.description}</p>
      <p className="text-green-600">₹1 Only</p>
      <button onClick={handlePayAndActivate} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
        Pay ₹1 & Activate
      </button>
      {message && <p className="mt-4 text-blue-600">{message}</p>}
    </div>
  );
};

export default JoinCourse;