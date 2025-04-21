import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";
import { useParams } from "react-router-dom";

const ComputerCourseLandingPage = () => {
  const [content, setContent] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId, courseId } = useParams();

  useEffect(() => {
    // Fetch creator's profile data
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCreatorProfile(data);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching creator profile:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    // Load course content
    const contentRef = ref(database, `courses/${courseId}/landing/`);
    onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setContent(data);
      } else {
        // Set default template for Computer course
        setContent({
          header: {
            logo: "/school-logo.png",
            courseName: "संगणक कोर्स",
          },
          hero: {
            backgroundImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
            title: "संगणक कोर्स",
            subtitle: "डिजिटल युगातील कौशल्ये शिका",
          },
          about: {
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
            text: "हा कोर्स आपल्याला संगणकाच्या मूलभूत ते प्रगत वापराचे ज्ञान देईल. आमचे अनुभवी शिक्षक आणि व्यावहारिक प्रशिक्षण आपल्याला संगणकावर प्रभुत्व मिळविण्यास मदत करेल.",
            stats: {
              duration: "४ महिने",
              completionRate: "९५%",
            },
          },
          features: {
            title: "कोर्सची वैशिष्ट्ये",
            items: [
              {
                title: "मूलभूत संगणक ज्ञान",
                description: "संगणकाच्या मूलभूत घटकांचे ज्ञान आणि वापर",
                icon: "💻"
              },
              {
                title: "MS Office प्रशिक्षण",
                description: "Word, Excel, PowerPoint चा व्यावसायिक वापर",
                icon: "📊"
              },
              {
                title: "इंटरनेट आणि ईमेल",
                description: "इंटरनेटचा सुरक्षित वापर आणि ईमेल व्यवस्थापन",
                icon: "🌐"
              },
              {
                title: "डेटा सुरक्षा",
                description: "डेटा सुरक्षा आणि व्हायरस संरक्षण",
                icon: "🔒"
              }
            ]
          },
          curriculum: {
            title: "अभ्यासक्रम",
            modules: [
              {
                title: "मॉड्यूल १: मूलभूत संगणक",
                topics: [
                  "संगणकाची मूलभूत माहिती",
                  "ऑपरेटिंग सिस्टम",
                  "फाइल व्यवस्थापन",
                  "कीबोर्ड आणि माउस वापर"
                ]
              },
              {
                title: "मॉड्यूल २: MS Office",
                topics: [
                  "MS Word",
                  "MS Excel",
                  "MS PowerPoint",
                  "MS Access"
                ]
              },
              {
                title: "मॉड्यूल ३: इंटरनेट आणि सुरक्षा",
                topics: [
                  "इंटरनेट वापर",
                  "ईमेल व्यवस्थापन",
                  "डेटा सुरक्षा",
                  "व्हायरस संरक्षण"
                ]
              }
            ]
          },
          testimonials: {
            title: "विद्यार्थ्यांचे अनुभव",
            reviews: [
              {
                name: "सुनील जाधव",
                role: "क्लर्क",
                text: "या कोर्समुळे माझी संगणक कौशल्ये खूप सुधारली. आता मी आत्मविश्वासाने संगणक वापरू शकतो.",
                rating: 5
              },
              {
                name: "मीनाक्षी शिंदे",
                role: "शिक्षिका",
                text: "शिक्षकांची पद्धत आणि सामग्री खूप उपयुक्त आहे. प्रत्येक वर्गात नवीन काहीतरी शिकायला मिळते.",
                rating: 5
              }
            ]
          }
        });
      }
    });
  }, [userId, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <img
              src={content.header.logo}
              alt="Course Logo"
              className="h-10 w-10 rounded-full border-2 border-white shadow-md mr-3"
            />
            <h1 className="text-lg font-bold">
              {content.header.courseName}
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          backgroundImage: `url(${content.hero.backgroundImage})`,
        }}
        className="relative bg-cover bg-center min-h-[60vh] flex flex-col justify-center items-center text-white overflow-hidden bg-blue-50"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900 to-black opacity-80"></div>
        <div className="relative z-10 text-center px-4 w-full max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-3 text-shadow-lg">
            {content.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-shadow-md">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* About Course Section */}
      <section className="py-12 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
            About Course
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-1/2">
              <img
                src={content.about.image}
                alt="About Course"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="w-full md:w-1/2">
              <p className="text-gray-700 text-base leading-relaxed">
                {content.about.text}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <span className="font-bold text-blue-600 text-2xl">
                    {content.about.stats.duration}
                  </span>
                  <p className="text-gray-600 text-sm">Course Duration</p>
                </div>
                <div className="text-center">
                  <span className="font-bold text-blue-600 text-2xl">
                    {content.about.stats.completionRate}
                  </span>
                  <p className="text-gray-600 text-sm">Completion Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">
            {content.features.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features.items.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">
            {content.curriculum.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.curriculum.modules.map((module, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {module.title}
                </h3>
                <ul className="space-y-2">
                  {module.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-center text-gray-600">
                      <span className="mr-2">•</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">
            {content.testimonials.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.testimonials.reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {review.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {review.name}
                    </h3>
                    <p className="text-gray-600">{review.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{review.text}</p>
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
            Get In Touch
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Address Card */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="text-base font-semibold text-gray-700">Address</h3>
              </div>
              <p className="text-gray-700">
                {creatorProfile?.address || "No address provided"}
              </p>
            </div>

            {/* Email Card */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-base font-semibold text-gray-700">Email</h3>
              </div>
              <p className="text-gray-700">
                {creatorProfile?.email || "No email provided"}
              </p>
            </div>

            {/* Phone Card */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <h3 className="text-base font-semibold text-gray-700">Phone</h3>
              </div>
              <p className="text-gray-700">
                {creatorProfile?.phone || "No phone number provided"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-sm">
            © 2024 {content.header.courseName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComputerCourseLandingPage; 