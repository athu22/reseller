import React, { useState, useEffect } from "react";

import { Fade, Slide, Zoom } from "react-awesome-reveal";
import { ref, onValue } from "firebase/database";
import { database} from "../firebase";
import { useParams } from "react-router-dom";

const defaultContent = {
  header: {
    logo: "/school-logo.png",
    schoolName: "Reseller_Name",
  },
  hero: {
    backgroundImage:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    title: "Company_Name",
    subtitle: "Where Excellence Meets Opportunity",
  },
  about: {
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350",
    text: "Established in 1995, .....Company has been a beacon of academic excellence and character development. Our holistic approach combines rigorous academics with creative arts and athletic development.",
    stats: {
      years: "25+ Years",
      graduationRate: "98%",
    },
  },
  software: Array.from({ length: 6 }).map(() => ({
    name: "Software Name",
    description: "Software Description",
  })),
  packages: Array.from({ length: 6 }).map(() => ({
    name: "Package Name",
    investment: "-",
    benefit: "-",
  })),
  benefits: Array.from({ length: 6 }).map(() => ({ name: "" })), // Initialize benefits as objects with a `name` property
  contact: {
    name: "",
    email: "",
    message: "",
    address: "",
    phone: "",
  },
  footer: {
    address: "123 Education Road, Knowledge City, KC 12345",
    copyright: "© 2023 ABC International School. All rights reserved.",
  },
};

const ViewResellerLandingPage = () => {
  const [content, setContent] = useState(defaultContent);
  const { userId } = useParams();

  useEffect(() => {
    // Decode the userId from the URL and convert it to Firebase-safe format
    const decodedEmail = decodeURIComponent(userId);
    const firebaseSafeEmail = decodedEmail.replace('.', '_'); // Firebase-safe format

    // Create the reference to the correct path in Firebase
    const contentRef = ref(database, `${firebaseSafeEmail}/landing/`);

    // Fetch data from Firebase
    onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert benefits object back to array if necessary
        const benefitsArray = data.benefits
          ? Object.keys(data.benefits).map((key) => data.benefits[key])
          : defaultContent.benefits;

        setContent({
          ...defaultContent,
          ...data,
          software: data.software || defaultContent.software,
          packages: data.packages || defaultContent.packages,
          benefits: benefitsArray, // Ensure benefits is always an array
        });
      }
    });
  }, [userId]);

  if (!content) return <div className="text-center p-8">Loading...</div>;

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
  //     {/* Header */}
  //     <Fade triggerOnce>
  //       <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-lg">
  //         <div className="container mx-auto px-4 flex justify-between items-center">
  //           <div className="flex items-center">
  //             <img
  //               src={content.header.logo}
  //               alt="School Logo"
  //               className="h-12 w-12 mr-3"
  //             />
  //             <h1 className="text-2xl font-bold">
  //               {content.header.schoolName}
  //             </h1>
  //           </div>
  //         </div>
  //       </header>
  //     </Fade>

  //     {/* Hero Section */}
  //     <section
  //       style={{
  //         backgroundImage: `url(${content.hero.backgroundImage})`,
  //       }}
  //       className="relative bg-cover bg-center h-[500px] flex flex-col justify-center items-center text-white overflow-hidden"
  //     >
  //       {/* Gradient Overlay */}
  //       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900 to-black opacity-80"></div>

  //       {/* Content */}
  //       <div className="relative z-10 text-center px-4">
  //         <h1 className="text-5xl md:text-6xl font-bold mb-4 text-shadow-lg">
  //           {content.hero.title}
  //         </h1>
  //         <p className="text-xl md:text-2xl text-shadow-md">
  //           {content.hero.subtitle}
  //         </p>
  //       </div>
  //     </section>

  //     {/* About Section */}
  //     <section className="py-16 bg-white">
  //       <div className="container mx-auto px-4">
  //         <Fade triggerOnce>
  //           <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
  //         </Fade>
  //         <Slide direction="up" triggerOnce>
  //           <div className="flex flex-col md:flex-row gap-8 items-center">
  //             <div className="relative w-full md:w-1/2">
  //               <img
  //                 src={content.about.image}
  //                 alt="About Us"
  //                 className="w-full rounded-lg shadow-lg"
  //               />
  //             </div>
  //             <div className="w-full md:w-1/2">
  //               <p className="text-gray-700 text-lg leading-relaxed">
  //                 {content.about.text}
  //               </p>
  //               <div className="mt-8 flex justify-between">
  //                 <div className="text-center">
  //                   <span className="font-bold text-indigo-600 text-3xl">
  //                     {content.about.stats.years}
  //                   </span>
  //                   <p className="text-gray-600">Years of Excellence</p>
  //                 </div>
  //                 <div className="text-center">
  //                   <span className="font-bold text-indigo-600 text-3xl">
  //                     {content.about.stats.graduationRate}
  //                   </span>
  //                   <p className="text-gray-600">Graduation Rate</p>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </Slide>
  //       </div>
  //     </section>

  //     {/* Software Section */}
  //     <section className="py-16 bg-gray-50">
  //       <div className="container mx-auto px-4">
  //         <h2 className="text-3xl font-bold text-center mb-8">Our Software</h2>
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  //           {(content.software || []).map((software, index) => (
  //             <div
  //               key={index}
  //               className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  //             >
  //               <h3 className="text-xl font-bold text-indigo-600 mb-2">
  //                 {software.name}
  //               </h3>
  //               <details className="group">
  //                 <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600">
  //                   Read More
  //                 </summary>
  //                 <p className="mt-4 text-gray-700">
  //                   {software.description}
  //                 </p>
  //               </details>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </section>

      

  //     {/* Packages Section */}
  //     <section className="py-16 bg-white">
  //       <div className="container mx-auto px-4">
  //         <h2 className="text-3xl font-bold text-center mb-8">Our Packages</h2>
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  //           {(content.packages || []).map((pkg, index) => (
  //             <div
  //               key={index}
  //               className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  //             >
  //               <h3 className="text-2xl font-bold text-indigo-600 mb-6 text-center">
  //                 {pkg.name}
  //               </h3>
  //               <p className="text-gray-600 mb-4">
  //                 <strong>Investment:</strong> {pkg.investment}
  //               </p>
  //               <p className="text-gray-600">
  //                 <strong>Benefit:</strong> {pkg.benefit}
  //               </p>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </section>

  //     {/* Benefits Section */}
  //     <section className="py-8 bg-gray-50 relative overflow-hidden">
  //       {/* Animated Gradient Background */}
  //       <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 opacity-50 animate-gradient-x"></div>

  //       <div className="container mx-auto px-4 relative z-10">
  //         <h2 className="text-3xl font-bold text-center mb-4">Our Benefits</h2>
  //         <div className="flex flex-col items-center space-y-3">
  //           {(content.benefits || []).map((benefit, index) => (
  //             <div
  //               key={index}
  //               className="w-full max-w-2xl bg-white rounded-full border border-gray-200 overflow-hidden"
  //             >
  //               <h3 className="text-xl font-bold text-indigo-600 mb-2 text-center">
  //                 {benefit.name}
  //               </h3>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </section>

  //     {/* Contact Section */}
  //     <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
  //       <div className="container mx-auto px-4">
  //         <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">
  //           Get In Touch
  //         </h2>

  //         {/* 3 Cards Section */}
  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 justify-center">
  //           {/* Card 1: Address */}
  //           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
  //             <div className="flex items-center mb-4 ">
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 className="h-6 w-6 text-indigo-600 mr-2"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth={2}
  //                   d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
  //                 />
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth={2}
  //                   d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
  //                 />
  //               </svg>
  //               <h3 className="text-lg font-semibold text-gray-700">Address</h3>
  //             </div>
  //             <p className="text-lg text-gray-700">
  //               {content.contact.address}
  //             </p>
  //           </div>

  //           {/* Card 2: Email */}
  //           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
  //             <div className="flex items-center mb-4">
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 className="h-6 w-6 text-indigo-600 mr-2"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth={2}
  //                   d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  //                 />
  //               </svg>
  //               <h3 className="text-lg font-semibold text-gray-700">Email</h3>
  //             </div>
  //             <p className="text-lg text-gray-700">
  //               {content.contact.email}
  //             </p>
  //           </div>

  //           {/* Card 3: Phone Number */}
  //           <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
  //             <div className="flex items-center mb-4">
  //               <svg
  //                 xmlns="http://www.w3.org/2000/svg"
  //                 className="h-6 w-6 text-indigo-600 mr-2"
  //                 fill="none"
  //                 viewBox="0 0 24 24"
  //                 stroke="currentColor"
  //               >
  //                 <path
  //                   strokeLinecap="round"
  //                   strokeLinejoin="round"
  //                   strokeWidth={2}
  //                   d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
  //                 />
  //               </svg>
  //               <h3 className="text-lg font-semibold text-gray-700">Phone</h3>
  //             </div>
  //             <p className="text-lg text-gray-700">
  //               {content.contact.phone}
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     {/* Footer */}
  //     <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
  //       <div className="container mx-auto px-4 text-center">
  //         <Fade triggerOnce>
  //           <p className="mb-2">{content.footer.address}</p>
  //           <p>{content.footer.copyright}</p>
  //         </Fade>
  //       </div>
  //     </footer>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <Fade triggerOnce>
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center">
              <img
                src={content.header.logo}
                alt="School Logo"
                className="h-12 w-12 mr-3 rounded-full border-2 border-white shadow-md"
              />
              <h1 className="text-2xl font-bold">
                {content.header.schoolName}
              </h1>
            </div>
          </div>
        </header>
      </Fade>
  
      {/* Hero Section */}
      <section
        style={{
          backgroundImage: `url(${content.hero.backgroundImage})`,
        }}
        className="relative bg-cover bg-center h-[500px] flex flex-col justify-center items-center text-white overflow-hidden"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900 to-black opacity-80"></div>
  
        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-shadow-lg animate-fade-in">
            {content.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-shadow-md animate-fade-in">
            {content.hero.subtitle}
          </p>
        </div>
      </section>
  
      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Fade triggerOnce>
            <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">
              About Us
            </h2>
          </Fade>
          <Slide direction="up" triggerOnce>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative w-full md:w-1/2">
                <img
                  src={content.about.image}
                  alt="About Us"
                  className="w-full rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="w-full md:w-1/2">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {content.about.text}
                </p>
                <div className="mt-8 flex justify-between">
                  <div className="text-center">
                    <span className="font-bold text-indigo-600 text-3xl">
                      {content.about.stats.years}
                    </span>
                    <p className="text-gray-600">Years of Excellence</p>
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-indigo-600 text-3xl">
                      {content.about.stats.graduationRate}
                    </span>
                    <p className="text-gray-600">Graduation Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </Slide>
        </div>
      </section>
  
      {/* Software Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">
            Our Software
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(content.software || []).map((software, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold text-indigo-600 mb-2">
                  {software.name}
                </h3>
                <details className="group">
                  <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600">
                    Read More
                  </summary>
                  <p className="mt-4 text-gray-700">
                    {software.description}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>
  
      {/* Packages Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">
            Our Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(content.packages || []).map((pkg, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold text-indigo-600 mb-6 text-center">
                  {pkg.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  <strong>Investment:</strong> {pkg.investment}
                </p>
                <p className="text-gray-600">
                  <strong>Benefit:</strong> {pkg.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
  
      {/* Benefits Section */}
      <section className="py-8 bg-gray-50 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 opacity-50 animate-gradient-x"></div>
  
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-4 text-indigo-600">
            Our Benefits
          </h2>
          <div className="flex flex-col items-center space-y-3">
            {(content.benefits || []).map((benefit, index) => (
              <div
                key={index}
                className="w-full max-w-2xl bg-white rounded-full border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-bold text-indigo-600 mb-2 text-center">
                  {benefit.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
  
      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">
            Get In Touch
          </h2>
  
          {/* 3 Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 justify-center">
            {/* Card 1: Address */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600 mr-2"
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
                <h3 className="text-lg font-semibold text-gray-700">Address</h3>
              </div>
              <p className="text-lg text-gray-700">
                {content.contact.address}
              </p>
            </div>
  
            {/* Card 2: Email */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600 mr-2"
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
                <h3 className="text-lg font-semibold text-gray-700">Email</h3>
              </div>
              <p className="text-lg text-gray-700">
                {content.contact.email}
              </p>
            </div>
  
            {/* Card 3: Phone Number */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600 mr-2"
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
                <h3 className="text-lg font-semibold text-gray-700">Phone</h3>
              </div>
              <p className="text-lg text-gray-700">
                {content.contact.phone}
              </p>
            </div>
          </div>
        </div>
      </section>
  
      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <Fade triggerOnce>
            <p className="mb-2">{content.footer.address}</p>
            <p>{content.footer.copyright}</p>
          </Fade>
        </div>
      </footer>
    </div>
  );


};

export default ViewResellerLandingPage;
// --------------------------------------------------------------------------------------------------
