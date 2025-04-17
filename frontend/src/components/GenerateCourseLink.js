import { useState } from 'react';

const GenerateCourseLink = () => {
  const [link, setLink] = useState('');

  const generateLink = async () => {
    const userId = localStorage.getItem('userId');
    const courseId = 'english-course'; // Or dynamic

    const res = await fetch('http://localhost:5050/api/generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrerId: userId, courseId })
    });
    const data = await res.json();
    setLink(data.link);
  };

  return (
    <div className="p-4">
      <button onClick={generateLink} className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate Course Link
      </button>
      {link && (
        <div className="mt-4">
          <p>Your referral link:</p>
          <a href={link} target="_blank" className="text-blue-600 underline">{link}</a>
        </div>
      )}
    </div>
  );
};

export default GenerateCourseLink;