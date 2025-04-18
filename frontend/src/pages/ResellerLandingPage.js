// import React, { useState, useEffect } from "react";
// import { ref, set, onValue } from "firebase/database";
// import { database } from "../FireB"; // Ensure this path is correct
// import { useNavigate, useLocation } from "react-router-dom";

// // Default state structure
// const defaultState = {
//   header: {
//     logo: "/school-logo.png",
//     schoolName: "Reseller_Name",
//   },
//   hero: {
//     backgroundImage:
//       "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
//     title: "Company_Name",
//     subtitle: "Where Excellence Meets Opportunity",
//   },
//   about: {
//     image: "https://images.unsplash.com/photo-1588072432836-e10032774350",
//     text: "Established in 1995, .....Company has been a beacon of academic excellence and character development. Our holistic approach combines rigorous academics with creative arts and athletic development.",
//     stats: {
//       years: "25+ Years",
//       graduationRate: "98%",
//     },
//   },
//   software: Array.from({ length: 6 }).map(() => ({
//     name: "Software Name",
//   })),
//   packages: Array.from({ length: 6 }).map(() => ({
//     name: "Package Name",
//     investment: "-",
//     benefit: "-",
//   })),
//   benefits: Array.from({ length: 6 }).map(() => ({ name: "" })), // Initialize benefits as objects with a `name` property
//   contact: {
//     name: "",
//     email: "",
//     message: "",
//   },
//   footer: {
//     address: "123 Education Road, Knowledge City, KC 12345",
//     copyright: "© 2023 ABC International School. All rights reserved.",
//   },
// };

// const ResellerLandingPage = ({ currentUserEmailNode }) => {
//   const [editableContent, setEditableContent] = useState(defaultState);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const contentRef = ref(database, `${currentUserEmailNode}/landing/`);
//     onValue(contentRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         // Convert benefits object back to array if necessary
//         const benefitsArray = data.benefits
//           ? Object.keys(data.benefits).map((key) => data.benefits[key])
//           : defaultState.benefits;

//         setEditableContent({
//           ...defaultState,
//           ...data,
//           software: data.software || defaultState.software,
//           packages: data.packages || defaultState.packages,
//           benefits: benefitsArray, // Ensure benefits is always an array
//         });
//       }
//     });
//   }, [currentUserEmailNode]);

//   const handleSave = () => {
//     const contentRef = ref(database, `${currentUserEmailNode}/landing/`);
//     const contentToSave = {
//       ...editableContent,
//       benefits: editableContent.benefits.reduce((acc, benefit, index) => {
//         acc[`benefit${index}`] = benefit; // Convert array to object with string keys
//         return acc;
//       }, {}),
//     };
//     set(contentRef, contentToSave)
//       .then(() => alert("Content saved successfully!"))
//       .catch((error) => console.error("Error saving content: ", error));
//   };

//   const handleShareLink = () => {
//     const viewUrl = `${window.location.origin}/view-landing/${currentUserEmailNode}`;
//     navigator.clipboard
//       .writeText(viewUrl)
//       .then(() => alert("View-only link copied to clipboard!"))
//       .catch((error) => {
//         console.error("Failed to copy link:", error);
//         alert("Failed to copy link to clipboard");
//       });
//   };

//   const handleTextChange = (path, value) => {
//     setEditableContent((prevState) => {
//       const updatedState = JSON.parse(JSON.stringify(prevState));
//       let current = updatedState;
//       const keys = path.split(".");

//       // Check for array indexing (e.g., benefits[0].name)
//       const arrayMatch = path.match(/(\w+)\[(\d+)\](?:\.(\w+))?/);
//       if (arrayMatch) {
//         const [, arrayName, index, key] = arrayMatch;
//         if (
//           updatedState[arrayName] &&
//           updatedState[arrayName][index] !== undefined
//         ) {
//           if (key) {
//             updatedState[arrayName][index][key] = value;
//           } else {
//             updatedState[arrayName][index] = value;
//           }
//         }
//       } else {
//         // Traverse nested objects
//         for (let i = 0; i < keys.length - 1; i++) {
//           if (!current[keys[i]]) current[keys[i]] = {};
//           current = current[keys[i]];
//         }
//         current[keys[keys.length - 1]] = value;
//       }

//       return updatedState;
//     });
//   };

//   const handleImageChange = (path, file) => {
//     const reader = new FileReader();
//     reader.onload = (e) => handleTextChange(path, e.target.result);
//     reader.readAsDataURL(file);
//   };

//   return (
//     <>
//       {/* Header */}
//       <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-lg">
//         <div className="container mx-auto px-4 flex justify-between items-center">
//           {/* Editable Logo */}
//           <div className="relative">
//             <img
//               src={editableContent.header.logo}
//               alt="Logo"
//               className="h-12 cursor-pointer"
//             />
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) =>
//                 handleImageChange("header.logo", e.target.files[0])
//               }
//               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//             />
//           </div>
//           <h1
//             contentEditable
//             suppressContentEditableWarning
//             onInput={(e) =>
//               handleTextChange("header.schoolName", e.target.innerText)
//             }
//             className="text-2xl font-bold cursor-text"
//           >
//             {editableContent?.header?.schoolName ||
//               defaultState.header.schoolName}
//           </h1>
//           <button
//             onClick={handleSave}
//             className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-300"
//           >
//             Save Changes
//           </button>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section
//         style={{
//           backgroundImage: `url(${editableContent.hero.backgroundImage})`,
//         }}
//         className="relative bg-cover bg-center h-[500px] flex flex-col justify-center items-center text-white overflow-hidden"
//       >
//         {/* Gradient Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900 to-black opacity-80"></div>

//         {/* Content */}
//         <div className="relative z-10 text-center px-4">
//           <h1
//             contentEditable
//             suppressContentEditableWarning
//             onBlur={(e) => handleTextChange("hero.title", e.target.innerText)}
//             className="text-5xl md:text-6xl font-bold mb-4 cursor-text text-shadow-lg"
//           >
//             {editableContent?.hero?.title || defaultState.hero.title}
//           </h1>
//           <p
//             contentEditable
//             suppressContentEditableWarning
//             onBlur={(e) =>
//               handleTextChange("hero.subtitle", e.target.innerText)
//             }
//             className="text-xl md:text-2xl cursor-text text-shadow-md"
//           >
//             {editableContent?.hero?.subtitle || defaultState.hero.subtitle}
//           </p>
//         </div>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) =>
//             handleImageChange("hero.backgroundImage", e.target.files[0])
//           }
//           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//         />
//       </section>

//       {/* About Section */}
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
//           <div className="flex flex-col md:flex-row gap-8 items-center">
//             <div className="relative w-full md:w-1/2">
//               <img
//                 src={editableContent.about.image}
//                 alt="About Us"
//                 className="w-full rounded-lg shadow-lg"
//               />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) =>
//                   handleImageChange("about.image", e.target.files[0])
//                 }
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               />
//             </div>
//             <div className="w-full md:w-1/2">
//               <p
//                 contentEditable
//                 suppressContentEditableWarning
//                 onInput={(e) =>
//                   handleTextChange("about.text", e.target.innerText)
//                 }
//                 className="text-gray-700 text-lg leading-relaxed cursor-text"
//               >
//                 {editableContent?.about?.text || defaultState.about.text}
//               </p>
//               <div className="mt-8 flex justify-between">
//                 <div className="text-center">
//                   <span
//                     contentEditable
//                     suppressContentEditableWarning
//                     onInput={(e) =>
//                       handleTextChange("about.stats.years", e.target.innerText)
//                     }
//                     className="font-bold text-indigo-600 text-3xl cursor-text"
//                   >
//                     {editableContent?.about?.stats?.years ||
//                       defaultState.about.stats.years}
//                   </span>
//                   <p className="text-gray-600">Years of Excellence</p>
//                 </div>
//                 <div className="text-center">
//                   <span
//                     contentEditable
//                     suppressContentEditableWarning
//                     onInput={(e) =>
//                       handleTextChange(
//                         "about.stats.graduationRate",
//                         e.target.innerText
//                       )
//                     }
//                     className="font-bold text-indigo-600 text-3xl cursor-text"
//                   >
//                     {editableContent?.about?.stats?.graduationRate ||
//                       defaultState.about.stats.graduationRate}
//                   </span>
//                   <p className="text-gray-600">Graduation Rate</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Software Section */}
  

//       <section className="py-16 bg-gray-50">
//   <div className="container mx-auto px-4">
//     <h2 className="text-3xl font-bold text-center mb-8">Our Software</h2>
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//       {/* Left Column */}
//       <div className="space-y-4">
//         {(editableContent.software || []).slice(0, 3).map((software, index) => (
//           <div
//             key={index}
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
//           >
//             <input
//               type="text"
//               value={software.name}
//               onChange={(e) =>
//                 handleTextChange(`software[${index}].name`, e.target.value)
//               }
//               placeholder="Enter Software Name"
//               className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
//             />
//             <details className="group">
//               <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600">
//                 Read More
//               </summary>
//               <textarea
//                 value={software.description}
//                 onChange={(e) =>
//                   handleTextChange(`software[${index}].description`, e.target.value)
//                 }
//                 placeholder="Enter Software Description"
//                 className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-4"
//                 rows="3"
//               />
//             </details>
//           </div>
//         ))}
//       </div>

//       {/* Right Column */}
//       <div className="space-y-4">
//         {(editableContent.software || []).slice(3, 6).map((software, index) => (
//           <div
//             key={index + 3} // Ensure unique keys
//             className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
//           >
//             <input
//               type="text"
//               value={software.name}
//               onChange={(e) =>
//                 handleTextChange(`software[${index + 3}].name`, e.target.value)
//               }
//               placeholder="Enter Software Name"
//               className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
//             />
//             <details className="group">
//               <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600">
//                 Read More
//               </summary>
//               <textarea
//                 value={software.description}
//                 onChange={(e) =>
//                   handleTextChange(`software[${index + 3}].description`, e.target.value)
//                 }
//                 placeholder="Enter Software Description"
//                 className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-4"
//                 rows="3"
//               />
//             </details>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// </section>

//       {/* Packages Section */}
//       <section className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-8">All Packages</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {(editableContent.packages || []).map((pkg, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
//               >
//                 {/* Package Name */}
//                 <h3
//                   contentEditable
//                   suppressContentEditableWarning
//                   onBlur={(e) =>
//                     handleTextChange(
//                       `packages[${index}].name`,
//                       e.target.innerText
//                     )
//                   }
//                   className="text-2xl font-bold text-indigo-600 mb-6 cursor-text text-center"
//                 >
//                   {pkg.name || "Enter Package Name"}
//                 </h3>

//                 {/* Investment Amount */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-600 mb-2">
//                     Investment Amount
//                   </label>
//                   <input
//                     type="text"
//                     value={pkg.investment}
//                     onChange={(e) =>
//                       handleTextChange(
//                         `packages[${index}].investment`,
//                         e.target.value
//                       )
//                     }
//                     placeholder="Enter investment amount"
//                     className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 {/* Benefit Amount */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-600 mb-2">
//                     Benefit Amount
//                   </label>
//                   <input
//                     type="text"
//                     value={pkg.benefit}
//                     onChange={(e) =>
//                       handleTextChange(
//                         `packages[${index}].benefit`,
//                         e.target.value
//                       )
//                     }
//                     placeholder="Enter benefit amount"
//                     className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Benefits Section */}

//       <section className="py-8 bg-gray-50 relative overflow-hidden">
//         {/* Animated Gradient Background */}
//         <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 opacity-50 animate-gradient-x"></div>

//         <div className="container mx-auto px-4 relative z-10">
//           <h2 className="text-3xl font-bold text-center mb-4">All Benefits</h2>
//           <div className="flex flex-col items-center space-y-3">
//             {(editableContent.benefits || []).map((benefit, index) => (
//               <div
//                 key={index}
//                 className="w-full max-w-2xl bg-white rounded-full border border-gray-200 overflow-hidden"
//               >
//                 <input
//                   type="text"
//                   value={benefit.name}
//                   onChange={(e) =>
//                     handleTextChange(`benefits[${index}].name`, e.target.value)
//                   }
//                   placeholder={`Benefit ${index + 1}`}
//                   className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Contact Section */}

//       <section className="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">
//             Get In Touch
//           </h2>

//           {/* 3 Cards Section */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 justify-center">
//             {/* Card 1: Address */}
//             <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//               <div className="flex items-center mb-4 ">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6 text-indigo-600 mr-2"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//                   />
//                 </svg>
//                 <h3 className="text-lg font-semibold text-gray-700">Address</h3>
//               </div>
//               <textarea
//                 value={editableContent.contact.address}
//                 onChange={(e) =>
//                   handleTextChange("contact.address", e.target.value)
//                 }
//                 placeholder="Enter your address"
//                 className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 rows="2"
//               />
//             </div>

//             {/* Card 2: Email */}
//             <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//               <div className="flex items-center mb-4">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6 text-indigo-600 mr-2"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                   />
//                 </svg>
//                 <h3 className="text-lg font-semibold text-gray-700">Email</h3>
//               </div>
//               <input
//                 type="email"
//                 value={editableContent.contact.email}
//                 onChange={(e) =>
//                   handleTextChange("contact.email", e.target.value)
//                 }
//                 placeholder="Enter your email"
//                 className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               />
//             </div>

//             {/* Card 3: Phone Number */}
//             <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
//               <div className="flex items-center mb-4">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6 text-indigo-600 mr-2"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                   />
//                 </svg>
//                 <h3 className="text-lg font-semibold text-gray-700">Phone</h3>
//               </div>
//               <textarea
//                 value={editableContent.contact.phone}
//                 onChange={(e) =>
//                   handleTextChange("contact.phone", e.target.value)
//                 }
//                 placeholder="Enter your phone number"
//                 className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 rows="2"
//               />
//             </div>
//           </div>

//           {/* Share Link Button */}
//           {/* <div className="max-w-2xl mx-auto">
//             <button
//               onClick={handleShareLink}
//               className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
//             >
//               Share Link
//             </button>
//           </div> */}

//           <div className="fixed bottom-4 right-4 z-50">
//             <button
//               onClick={handleShareLink}
//               className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
//             >
//               Share Link
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
//         <div className="container mx-auto px-4 text-center">
//           <p
//             contentEditable
//             suppressContentEditableWarning
//             onInput={(e) =>
//               handleTextChange("footer.address", e.target.innerText)
//             }
//             className="mb-2 cursor-text"
//           >
//             {editableContent?.footer?.address || defaultState.footer.address}
//           </p>
//           <p
//             contentEditable
//             suppressContentEditableWarning
//             onInput={(e) =>
//               handleTextChange("footer.copyright", e.target.innerText)
//             }
//             className="cursor-text"
//           >
//             {editableContent?.footer?.copyright ||
//               defaultState.footer.copyright}
//           </p>
//         </div>
//       </footer>
//     </>
//   );
// };

// export default ResellerLandingPage;



// -----------------------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { database } from "../firebase"; // Ensure this path is correct
import { useNavigate, useLocation } from "react-router-dom";

// Default state structure
const defaultState = {
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
  },
  footer: {
    address: "123 Education Road, Knowledge City, KC 12345",
    copyright: "© 2023 ABC International School. All rights reserved.",
  },
};

const ResellerLandingPage = ({ currentUserEmailNode }) => {
  const [editableContent, setEditableContent] = useState(defaultState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const contentRef = ref(database, `${currentUserEmailNode}/landing/`);
    onValue(contentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convert benefits object back to array if necessary
        const benefitsArray = data.benefits
          ? Object.keys(data.benefits).map((key) => data.benefits[key])
          : defaultState.benefits;

        setEditableContent({
          ...defaultState,
          ...data,
          software: data.software || defaultState.software,
          packages: data.packages || defaultState.packages,
          benefits: benefitsArray, // Ensure benefits is always an array
        });
      }
    });
  }, [currentUserEmailNode]);

  const handleSave = () => {
    const contentRef = ref(database, `${currentUserEmailNode}/landing/`);
    const contentToSave = {
      ...editableContent,
      benefits: editableContent.benefits.reduce((acc, benefit, index) => {
        acc[`benefit${index}`] = benefit; // Convert array to object with string keys
        return acc;
      }, {}),
    };
    set(contentRef, contentToSave)
      .then(() => alert("Content saved successfully!"))
      .catch((error) => console.error("Error saving content: ", error));
  };

  const handleShareLink = () => {
    const viewUrl = `${window.location.origin}/view-landing`;
    navigator.clipboard
      .writeText(viewUrl)
      .then(() => alert("View-only link copied to clipboard!"))
      .catch((error) => {
        console.error("Failed to copy link:", error);
        alert("Failed to copy link to clipboard");
      });
  };

  const handleTextChange = (path, value) => {
    setEditableContent((prevState) => {
      const updatedState = JSON.parse(JSON.stringify(prevState));
      let current = updatedState;
      const keys = path.split(".");

      // Check for array indexing (e.g., benefits[0].name)
      const arrayMatch = path.match(/(\w+)\[(\d+)\](?:\.(\w+))?/);
      if (arrayMatch) {
        const [, arrayName, index, key] = arrayMatch;
        if (
          updatedState[arrayName] &&
          updatedState[arrayName][index] !== undefined
        ) {
          if (key) {
            updatedState[arrayName][index][key] = value;
          } else {
            updatedState[arrayName][index] = value;
          }
        }
      } else {
        // Traverse nested objects
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      }

      return updatedState;
    });
  };

  const handleImageChange = (path, file) => {
    const reader = new FileReader();
    reader.onload = (e) => handleTextChange(path, e.target.result);
    reader.readAsDataURL(file);
  };

  // return (
  //   <>
  //     {/* Header */}
  //     <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-lg">
  //       <div className="container mx-auto px-4 flex justify-between items-center">
  //         {/* Editable Logo */}
  //         <div className="relative">
  //           <img
  //             src={editableContent.header.logo}
  //             alt="Logo"
  //             className="h-12 cursor-pointer"
  //           />
  //           <input
  //             type="file"
  //             accept="image/*"
  //             onChange={(e) =>
  //               handleImageChange("header.logo", e.target.files[0])
  //             }
  //             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  //           />
  //         </div>
  //         <h1
  //           contentEditable
  //           suppressContentEditableWarning
  //           onInput={(e) =>
  //             handleTextChange("header.schoolName", e.target.innerText)
  //           }
  //           className="text-2xl font-bold cursor-text"
  //         >
  //           {editableContent?.header?.schoolName ||
  //             defaultState.header.schoolName}
  //         </h1>
  //         <button
  //           onClick={handleSave}
  //           className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-300"
  //         >
  //           Save Changes
  //         </button>
  //       </div>
  //     </header>

  //     {/* Hero Section */}
  //     <section
  //       style={{
  //         backgroundImage: `url(${editableContent.hero.backgroundImage})`,
  //       }}
  //       className="relative bg-cover bg-center h-[500px] flex flex-col justify-center items-center text-white overflow-hidden"
  //     >
  //       {/* Gradient Overlay */}
  //       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900 to-black opacity-80"></div>

  //       {/* Content */}
  //       <div className="relative z-10 text-center px-4">
  //         <h1
  //           contentEditable
  //           suppressContentEditableWarning
  //           onBlur={(e) => handleTextChange("hero.title", e.target.innerText)}
  //           className="text-5xl md:text-6xl font-bold mb-4 cursor-text text-shadow-lg"
  //         >
  //           {editableContent?.hero?.title || defaultState.hero.title}
  //         </h1>
  //         <p
  //           contentEditable
  //           suppressContentEditableWarning
  //           onBlur={(e) =>
  //             handleTextChange("hero.subtitle", e.target.innerText)
  //           }
  //           className="text-xl md:text-2xl cursor-text text-shadow-md"
  //         >
  //           {editableContent?.hero?.subtitle || defaultState.hero.subtitle}
  //         </p>
  //       </div>
  //       <input
  //         type="file"
  //         accept="image/*"
  //         onChange={(e) =>
  //           handleImageChange("hero.backgroundImage", e.target.files[0])
  //         }
  //         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  //       />
  //     </section>

  //     {/* About Section */}
  //     <section className="py-16 bg-white">
  //       <div className="container mx-auto px-4">
  //         <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
  //         <div className="flex flex-col md:flex-row gap-8 items-center">
  //           <div className="relative w-full md:w-1/2">
  //             <img
  //               src={editableContent.about.image}
  //               alt="About Us"
  //               className="w-full rounded-lg shadow-lg"
  //             />
  //             <input
  //               type="file"
  //               accept="image/*"
  //               onChange={(e) =>
  //                 handleImageChange("about.image", e.target.files[0])
  //               }
  //               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  //             />
  //           </div>
  //           <div className="w-full md:w-1/2">
  //             <p
  //               contentEditable
  //               suppressContentEditableWarning
  //               onInput={(e) =>
  //                 handleTextChange("about.text", e.target.innerText)
  //               }
  //               className="text-gray-700 text-lg leading-relaxed cursor-text"
  //             >
  //               {editableContent?.about?.text || defaultState.about.text}
  //             </p>
  //             <div className="mt-8 flex justify-between">
  //               <div className="text-center">
  //                 <span
  //                   contentEditable
  //                   suppressContentEditableWarning
  //                   onInput={(e) =>
  //                     handleTextChange("about.stats.years", e.target.innerText)
  //                   }
  //                   className="font-bold text-indigo-600 text-3xl cursor-text"
  //                 >
  //                   {editableContent?.about?.stats?.years ||
  //                     defaultState.about.stats.years}
  //                 </span>
  //                 <p className="text-gray-600">Years of Excellence</p>
  //               </div>
  //               <div className="text-center">
  //                 <span
  //                   contentEditable
  //                   suppressContentEditableWarning
  //                   onInput={(e) =>
  //                     handleTextChange(
  //                       "about.stats.graduationRate",
  //                       e.target.innerText
  //                     )
  //                   }
  //                   className="font-bold text-indigo-600 text-3xl cursor-text"
  //                 >
  //                   {editableContent?.about?.stats?.graduationRate ||
  //                     defaultState.about.stats.graduationRate}
  //                 </span>
  //                 <p className="text-gray-600">Graduation Rate</p>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     {/* Software Section */}
  //     <section className="py-16 bg-gray-50">
  //       <div className="container mx-auto px-4">
  //         <h2 className="text-3xl font-bold text-center mb-8">Our Software</h2>
  //         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  //           {/* Left Column */}
  //           <div className="space-y-4">
  //             {(editableContent.software || []).slice(0, 3).map((software, index) => (
  //               <div
  //                 key={index}
  //                 className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  //               >
  //                 <input
  //                   type="text"
  //                   value={software.name}
  //                   onChange={(e) =>
  //                     handleTextChange(`software[${index}].name`, e.target.value)
  //                   }
  //                   placeholder="Enter Software Name"
  //                   className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
  //                 />
  //                 <details className="group">
  //                   <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600">
  //                     Read More
  //                   </summary>
  //                   <textarea
  //                     value={software.description}
  //                     onChange={(e) =>
  //                       handleTextChange(`software[${index}].description`, e.target.value)
  //                     }
  //                     placeholder="Enter Software Description"
  //                     className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-4"
  //                     rows="3"
  //                   />
  //                 </details>
  //               </div>
  //             ))}
  //           </div>

  //           {/* Right Column */}
  //           <div className="space-y-4">
  //             {(editableContent.software || []).slice(3, 6).map((software, index) => (
  //               <div
  //                 key={index + 3} // Ensure unique keys
  //                 className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  //               >
  //                 <input
  //                   type="text"
  //                   value={software.name}
  //                   onChange={(e) =>
  //                     handleTextChange(`software[${index + 3}].name`, e.target.value)
  //                   }
  //                   placeholder="Enter Software Name"
  //                   className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
  //                 />
  //                 <details className="group">
  //                   <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600">
  //                     Read More
  //                   </summary>
  //                   <textarea
  //                     value={software.description}
  //                     onChange={(e) =>
  //                       handleTextChange(`software[${index + 3}].description`, e.target.value)
  //                     }
  //                     placeholder="Enter Software Description"
  //                     className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-4"
  //                     rows="3"
  //                   />
  //                 </details>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </section>

  //     {/* Packages Section */}
  //     <section className="py-16 bg-white">
  //       <div className="container mx-auto px-4">
  //         <h2 className="text-3xl font-bold text-center mb-8">All Packages</h2>
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  //           {(editableContent.packages || []).map((pkg, index) => (
  //             <div
  //               key={index}
  //               className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  //             >
  //               {/* Package Name */}
  //               <h3
  //                 contentEditable
  //                 suppressContentEditableWarning
  //                 onBlur={(e) =>
  //                   handleTextChange(
  //                     `packages[${index}].name`,
  //                     e.target.innerText
  //                   )
  //                 }
  //                 className="text-2xl font-bold text-indigo-600 mb-6 cursor-text text-center"
  //               >
  //                 {pkg.name || "Enter Package Name"}
  //               </h3>

  //               {/* Investment Amount */}
  //               <div className="mb-6">
  //                 <label className="block text-sm font-medium text-gray-600 mb-2">
  //                   Investment Amount
  //                 </label>
  //                 <input
  //                   type="text"
  //                   value={pkg.investment}
  //                   onChange={(e) =>
  //                     handleTextChange(
  //                       `packages[${index}].investment`,
  //                       e.target.value
  //                     )
  //                   }
  //                   placeholder="Enter investment amount"
  //                   className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //                 />
  //               </div>

  //               {/* Benefit Amount */}
  //               <div className="mb-6">
  //                 <label className="block text-sm font-medium text-gray-600 mb-2">
  //                   Benefit Amount
  //                 </label>
  //                 <input
  //                   type="text"
  //                   value={pkg.benefit}
  //                   onChange={(e) =>
  //                     handleTextChange(
  //                       `packages[${index}].benefit`,
  //                       e.target.value
  //                     )
  //                   }
  //                   placeholder="Enter benefit amount"
  //                   className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //                 />
  //               </div>
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
  //         <h2 className="text-3xl font-bold text-center mb-4">All Benefits</h2>
  //         <div className="flex flex-col items-center space-y-3">
  //           {(editableContent.benefits || []).map((benefit, index) => (
  //             <div
  //               key={index}
  //               className="w-full max-w-2xl bg-white rounded-full border border-gray-200 overflow-hidden"
  //             >
  //               <input
  //                 type="text"
  //                 value={benefit.name}
  //                 onChange={(e) =>
  //                   handleTextChange(`benefits[${index}].name`, e.target.value)
  //                 }
  //                 placeholder={`Benefit ${index + 1}`}
  //                 className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
  //               />
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
  //             <textarea
  //               value={editableContent.contact.address}
  //               onChange={(e) =>
  //                 handleTextChange("contact.address", e.target.value)
  //               }
  //               placeholder="Enter your address"
  //               className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //               rows="2"
  //             />
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
  //             <input
  //               type="email"
  //               value={editableContent.contact.email}
  //               onChange={(e) =>
  //                 handleTextChange("contact.email", e.target.value)
  //               }
  //               placeholder="Enter your email"
  //               className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //             />
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
  //             <textarea
  //               value={editableContent.contact.phone}
  //               onChange={(e) =>
  //                 handleTextChange("contact.phone", e.target.value)
  //               }
  //               placeholder="Enter your phone number"
  //               className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //               rows="2"
  //             />
  //           </div>
  //         </div>

  //         {/* Share Link Button */}
  //         <div className="fixed bottom-4 right-4 z-50">
  //           <button
  //             onClick={handleShareLink}
  //             className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
  //           >
  //             Share Link
  //           </button>
  //         </div>
  //       </div>
  //     </section>

  //     {/* Footer */}
  //     <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
  //       <div className="container mx-auto px-4 text-center">
  //         <p
  //           contentEditable
  //           suppressContentEditableWarning
  //           onInput={(e) =>
  //             handleTextChange("footer.address", e.target.innerText)
  //           }
  //           className="mb-2 cursor-text"
  //         >
  //           {editableContent?.footer?.address || defaultState.footer.address}
  //         </p>
  //         <p
  //           contentEditable
  //           suppressContentEditableWarning
  //           onInput={(e) =>
  //             handleTextChange("footer.copyright", e.target.innerText)
  //           }
  //           className="cursor-text"
  //         >
  //           {editableContent?.footer?.copyright ||
  //             defaultState.footer.copyright}
  //         </p>
  //       </div>
  //     </footer>
  //   </>
  // );


  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Editable Logo */}
          <div className="relative group">
            <img
              src={editableContent.header.logo}
              alt="Logo"
              className="h-12 cursor-pointer transition-transform duration-300 group-hover:scale-110"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange("header.logo", e.target.files[0])
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <h1
            contentEditable
            suppressContentEditableWarning
            onInput={(e) =>
              handleTextChange("header.schoolName", e.target.innerText)
            }
            className="text-2xl font-bold cursor-text hover:bg-white/10 px-2 rounded transition-colors duration-300"
          >
            {editableContent?.header?.schoolName ||
              defaultState.header.schoolName}
          </h1>
          <button
            onClick={handleSave}
            className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          backgroundImage: `url(${editableContent.hero.backgroundImage})`,
        }}
        className="relative bg-cover bg-center h-[500px] flex flex-col justify-center items-center text-white overflow-hidden"
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900 to-black opacity-80"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <h1
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleTextChange("hero.title", e.target.innerText)}
            className="text-5xl md:text-6xl font-bold mb-4 cursor-text text-shadow-lg hover:bg-white/10 px-2 rounded transition-colors duration-300"
          >
            {editableContent?.hero?.title || defaultState.hero.title}
          </h1>
          <p
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) =>
              handleTextChange("hero.subtitle", e.target.innerText)
            }
            className="text-xl md:text-2xl cursor-text text-shadow-md hover:bg-white/10 px-2 rounded transition-colors duration-300"
          >
            {editableContent?.hero?.subtitle || defaultState.hero.subtitle}
          </p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleImageChange("hero.backgroundImage", e.target.files[0])
          }
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative w-full md:w-1/2 group">
              <img
                src={editableContent.about.image}
                alt="About Us"
                className="w-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageChange("about.image", e.target.files[0])
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <div className="w-full md:w-1/2">
              <p
                contentEditable
                suppressContentEditableWarning
                onInput={(e) =>
                  handleTextChange("about.text", e.target.innerText)
                }
                className="text-gray-700 text-lg leading-relaxed cursor-text hover:bg-gray-100 px-2 rounded transition-colors duration-300"
              >
                {editableContent?.about?.text || defaultState.about.text}
              </p>
              <div className="mt-8 flex justify-between">
                <div className="text-center">
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) =>
                      handleTextChange("about.stats.years", e.target.innerText)
                    }
                    className="font-bold text-indigo-600 text-3xl cursor-text hover:bg-indigo-100 px-2 rounded transition-colors duration-300"
                  >
                    {editableContent?.about?.stats?.years ||
                      defaultState.about.stats.years}
                  </span>
                  <p className="text-gray-600">Years of Excellence</p>
                </div>
                <div className="text-center">
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) =>
                      handleTextChange(
                        "about.stats.graduationRate",
                        e.target.innerText
                      )
                    }
                    className="font-bold text-indigo-600 text-3xl cursor-text hover:bg-indigo-100 px-2 rounded transition-colors duration-300"
                  >
                    {editableContent?.about?.stats?.graduationRate ||
                      defaultState.about.stats.graduationRate}
                  </span>
                  <p className="text-gray-600">Graduation Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Software Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Software</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-4">
              {(editableContent.software || []).slice(0, 3).map((software, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <input
                    type="text"
                    value={software.name}
                    onChange={(e) =>
                      handleTextChange(`software[${index}].name`, e.target.value)
                    }
                    placeholder="Enter Software Name"
                    className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                  />
                  <details className="group">
                    <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600">
                      Read More
                    </summary>
                    <textarea
                      value={software.description}
                      onChange={(e) =>
                        handleTextChange(`software[${index}].description`, e.target.value)
                      }
                      placeholder="Enter Software Description"
                      className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-4"
                      rows="3"
                    />
                  </details>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {(editableContent.software || []).slice(3, 6).map((software, index) => (
                <div
                  key={index + 3} // Ensure unique keys
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <input
                    type="text"
                    value={software.name}
                    onChange={(e) =>
                      handleTextChange(`software[${index + 3}].name`, e.target.value)
                    }
                    placeholder="Enter Software Name"
                    className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                  />
                  <details className="group">
                    <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600">
                      Read More
                    </summary>
                    <textarea
                      value={software.description}
                      onChange={(e) =>
                        handleTextChange(`software[${index + 3}].description`, e.target.value)
                      }
                      placeholder="Enter Software Description"
                      className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-4"
                      rows="3"
                    />
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">All Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(editableContent.packages || []).map((pkg, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Package Name */}
                <h3
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    handleTextChange(
                      `packages[${index}].name`,
                      e.target.innerText
                    )
                  }
                  className="text-2xl font-bold text-indigo-600 mb-6 cursor-text text-center hover:bg-indigo-100 px-2 rounded transition-colors duration-300"
                >
                  {pkg.name || "Enter Package Name"}
                </h3>

                {/* Investment Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Investment Amount
                  </label>
                  <input
                    type="text"
                    value={pkg.investment}
                    onChange={(e) =>
                      handleTextChange(
                        `packages[${index}].investment`,
                        e.target.value
                      )
                    }
                    placeholder="Enter investment amount"
                    className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Benefit Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Benefit Amount
                  </label>
                  <input
                    type="text"
                    value={pkg.benefit}
                    onChange={(e) =>
                      handleTextChange(
                        `packages[${index}].benefit`,
                        e.target.value
                      )
                    }
                    placeholder="Enter benefit amount"
                    className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
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
          <h2 className="text-3xl font-bold text-center mb-4">All Benefits</h2>
          <div className="flex flex-col items-center space-y-3">
            {(editableContent.benefits || []).map((benefit, index) => (
              <div
                key={index}
                className="w-full max-w-2xl bg-white rounded-full border border-gray-200 overflow-hidden"
              >
                <input
                  type="text"
                  value={benefit.name}
                  onChange={(e) =>
                    handleTextChange(`benefits[${index}].name`, e.target.value)
                  }
                  placeholder={`Benefit ${index + 1}`}
                  className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                />
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
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4 ">
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
              <textarea
                value={editableContent.contact.address}
                onChange={(e) =>
                  handleTextChange("contact.address", e.target.value)
                }
                placeholder="Enter your address"
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="2"
              />
            </div>

            {/* Card 2: Email */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
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
              <input
                type="email"
                value={editableContent.contact.email}
                onChange={(e) =>
                  handleTextChange("contact.email", e.target.value)
                }
                placeholder="Enter your email"
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Card 3: Phone Number */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
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
              <textarea
                value={editableContent.contact.phone}
                onChange={(e) =>
                  handleTextChange("contact.phone", e.target.value)
                }
                placeholder="Enter your phone number"
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="2"
              />
            </div>
          </div>

          {/* Share Link Button */}
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={handleShareLink}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Share Link
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p
            contentEditable
            suppressContentEditableWarning
            onInput={(e) =>
              handleTextChange("footer.address", e.target.innerText)
            }
            className="mb-2 cursor-text hover:bg-white/10 px-2 rounded transition-colors duration-300"
          >
            {editableContent?.footer?.address || defaultState.footer.address}
          </p>
          <p
            contentEditable
            suppressContentEditableWarning
            onInput={(e) =>
              handleTextChange("footer.copyright", e.target.innerText)
            }
            className="cursor-text hover:bg-white/10 px-2 rounded transition-colors duration-300"
          >
            {editableContent?.footer?.copyright ||
              defaultState.footer.copyright}
          </p>
        </div>
      </footer>
    </>
  );

};

export default ResellerLandingPage;