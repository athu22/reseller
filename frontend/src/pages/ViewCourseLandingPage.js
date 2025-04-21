import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import { useParams } from "react-router-dom";

const courseTemplates = {
  english: {
    header: {
      logo: "/school-logo.png",
      courseName: "इंग्रजी बोलण्याचा कोर्स",
    },
    hero: {
      backgroundImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
      title: "इंग्रजी बोलण्याचा कोर्स",
      subtitle: "आपल्या करिअरला नवीन दिशा द्या",
    },
    about: {
      image: "https://images.unsplash.com/photo-1588072432836-e10032774350",
      text: "हा कोर्स आपल्याला इंग्रजी भाषेत प्रभुत्व मिळविण्यास मदत करेल. आमचे अनुभवी शिक्षक आणि व्यावहारिक पद्धत आपल्याला सर्वोत्तम शिक्षण अनुभव देईल.",
      stats: {
        duration: "३ महिने",
        completionRate: "९८%",
      },
    },
    features: {
      title: "कोर्सची वैशिष्ट्ये",
      items: [
        {
          title: "दैनंदिन संभाषण",
          description: "रोजच्या जीवनातील परिस्थितींमध्ये इंग्रजी बोलण्याचा सराव",
          icon: "💬"
        },
        {
          title: "व्याकरण आणि शब्दसंग्रह",
          description: "इंग्रजी व्याकरण आणि शब्दसंग्रहाचे सखोल ज्ञान",
          icon: "📚"
        },
        {
          title: "उच्चारण सुधारणा",
          description: "योग्य उच्चारण आणि स्वरसूत्र सुधारण्यासाठी सराव",
          icon: "🎤"
        },
        {
          title: "साक्षात्कार तयारी",
          description: "नोकरीच्या साक्षात्कारासाठी विशेष तयारी",
          icon: "💼"
        }
      ]
    },
    curriculum: {
      title: "अभ्यासक्रम",
      modules: [
        {
          title: "मॉड्यूल १: मूलभूत इंग्रजी",
          topics: [
            "मूलभूत शब्दसंग्रह",
            "साधी वाक्ये",
            "वर्तमान काळ",
            "भूतकाळ"
          ]
        },
        {
          title: "मॉड्यूल २: मध्यम स्तर",
          topics: [
            "जटिल व्याकरण",
            "वाक्प्रचार आणि म्हणी",
            "व्यावसायिक संभाषण",
            "ईमेल लेखन"
          ]
        },
        {
          title: "मॉड्यूल ३: प्रगत स्तर",
          topics: [
            "व्यावसायिक प्रस्तुतीकरण",
            "साक्षात्कार तंत्रे",
            "वादविवाद कौशल्ये",
            "सांस्कृतिक संवेदनशीलता"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "राहुल पाटील",
          role: "सॉफ्टवेअर इंजिनिअर",
          text: "या कोर्समुळे माझी इंग्रजी बोलण्याची क्षमता खूप सुधारली. आता मी आत्मविश्वासाने इंग्रजीत संभाषण करू शकतो.",
          rating: 5
        },
        {
          name: "प्रिया देशमुख",
          role: "व्यवसाय विद्यार्थी",
          text: "शिक्षकांची पद्धत आणि सामग्री खूप उपयुक्त आहे. प्रत्येक वर्गात नवीन काहीतरी शिकायला मिळते.",
          rating: 5
        }
      ]
    }
  },
  computer: {
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
      text: "हा कोर्स आपल्याला संगणकाच्या मूलभूत ते प्रगत कौशल्यांपर्यंतचे ज्ञान देईल. प्रत्यक्ष प्रयोगांसह शिका आणि आपली डिजिटल क्षमता वाढवा.",
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
          description: "संगणकाची मूलभूत माहिती आणि वापर",
          icon: "💻"
        },
        {
          title: "MS Office",
          description: "Word, Excel, PowerPoint चा व्यावहारिक वापर",
          icon: "📊"
        },
        {
          title: "इंटरनेट आणि ईमेल",
          description: "इंटरनेटचा सुरक्षित वापर आणि ईमेल व्यवस्थापन",
          icon: "🌐"
        },
        {
          title: "डिजिटल सुरक्षा",
          description: "सायबर सुरक्षा आणि डेटा संरक्षण",
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
            "संगणकाची ओळख",
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
            "प्रैक्टिकल प्रोजेक्ट्स"
          ]
        },
        {
          title: "मॉड्यूल ३: इंटरनेट आणि सुरक्षा",
          topics: [
            "इंटरनेट वापर",
            "ईमेल व्यवस्थापन",
            "सायबर सुरक्षा",
            "डेटा बॅकअप"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "सचिन जोशी",
          role: "कॉलेज विद्यार्थी",
          text: "या कोर्समुळे माझी संगणक कौशल्ये खूप सुधारली. आता मी आत्मविश्वासाने संगणक वापरू शकतो.",
          rating: 5
        },
        {
          name: "मीनाक्षी देशपांडे",
          role: "ऑफिस कर्मचारी",
          text: "MS Office शिकल्यामुळे माझे काम खूप सोपे झाले. प्रत्येक वर्गात नवीन काहीतरी शिकायला मिळते.",
          rating: 5
        }
      ]
    }
  },
  android: {
    header: {
      logo: "/school-logo.png",
      courseName: "Android Development कोर्स",
    },
    hero: {
      backgroundImage: "https://images.unsplash.com/photo-1555774698-0b77e0d9fac6",
      title: "Android Development कोर्स",
      subtitle: "आपले स्वतःचे मोबाइल ॲप्स तयार करा",
    },
    about: {
      image: "https://images.unsplash.com/photo-1555774698-0b77e0d9fac6",
      text: "हा कोर्स आपल्याला Android ॲप डेव्हलपमेंटचे संपूर्ण ज्ञान देईल. Java आणि Kotlin वापरून प्रगत ॲप्स तयार करण्याचे कौशल्य शिका.",
      stats: {
        duration: "६ महिने",
        completionRate: "९०%",
      },
    },
    features: {
      title: "कोर्सची वैशिष्ट्ये",
      items: [
        {
          title: "Java आणि Kotlin",
          description: "प्रोग्रामिंग भाषांचे सखोल ज्ञान",
          icon: "📱"
        },
        {
          title: "UI/UX डिझाइन",
          description: "आकर्षक आणि वापरकर्ता-मैत्रीपूर्ण इंटरफेस",
          icon: "🎨"
        },
        {
          title: "डेटाबेस मॅनेजमेंट",
          description: "SQLite आणि Firebase सह डेटा व्यवस्थापन",
          icon: "🗄️"
        },
        {
          title: "API इंटिग्रेशन",
          description: "बाह्य सेवांशी संवाद साधणे",
          icon: "🔌"
        }
      ]
    },
    curriculum: {
      title: "अभ्यासक्रम",
      modules: [
        {
          title: "मॉड्यूल १: मूलभूत प्रोग्रामिंग",
          topics: [
            "Java मूलभूत",
            "Kotlin मूलभूत",
            "OOP संकल्पना",
            "डेटा स्ट्रक्चर्स"
          ]
        },
        {
          title: "मॉड्यूल २: Android मूलभूत",
          topics: [
            "Android स्टुडिओ",
            "UI कंपोनेंट्स",
            "Activity आणि Fragment",
            "Intent आणि Navigation"
          ]
        },
        {
          title: "मॉड्यूल ३: प्रगत Android",
          topics: [
            "डेटाबेस मॅनेजमेंट",
            "API इंटिग्रेशन",
            "बॅकग्राउंड प्रोसेसिंग",
            "ॲप पब्लिशिंग"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "अजिंक्य पाटील",
          role: "सॉफ्टवेअर डेव्हलपर",
          text: "या कोर्समुळे मी माझे स्वतःचे ॲप्स तयार करू शकतो. प्रैक्टिकल प्रोजेक्ट्स खूप उपयुक्त आहेत.",
          rating: 5
        },
        {
          name: "स्वप्निल कुलकर्णी",
          role: "फ्रीलान्सर",
          text: "शिक्षकांचे मार्गदर्शन आणि प्रोजेक्ट-आधारित शिक्षण खूप उपयुक्त आहे.",
          rating: 5
        }
      ]
    }
  },
  basic: {
    header: {
      logo: "/school-logo.png",
      courseName: "मूलभूत संगणक कोर्स",
    },
    hero: {
      backgroundImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      title: "मूलभूत संगणक कोर्स",
      subtitle: "संगणकाची मूलभूत माहिती शिका",
    },
    about: {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      text: "हा कोर्स संगणकाच्या मूलभूत वापरावर लक्ष केंद्रित करतो. संगणकाची ओळख, कीबोर्ड वापर, माउस वापर आणि मूलभूत सॉफ्टवेअर वापर यावर भर दिला जातो.",
      stats: {
        duration: "२ महिने",
        completionRate: "९८%",
      },
    },
    features: {
      title: "कोर्सची वैशिष्ट्ये",
      items: [
        {
          title: "संगणकाची ओळख",
          description: "संगणकाची मूलभूत माहिती आणि वापर",
          icon: "💻"
        },
        {
          title: "कीबोर्ड वापर",
          description: "कीबोर्डचा प्रभावी वापर आणि टायपिंग",
          icon: "⌨️"
        },
        {
          title: "माउस वापर",
          description: "माउसचा योग्य वापर आणि नियंत्रण",
          icon: "🖱️"
        },
        {
          title: "मूलभूत सॉफ्टवेअर",
          description: "नोटपॅड, पेंट आणि इतर मूलभूत सॉफ्टवेअर",
          icon: "📝"
        }
      ]
    },
    curriculum: {
      title: "अभ्यासक्रम",
      modules: [
        {
          title: "मॉड्यूल १: संगणकाची ओळख",
          topics: [
            "संगणकाची मूलभूत माहिती",
            "संगणकाचे भाग",
            "ऑपरेटिंग सिस्टम",
            "फाइल व्यवस्थापन"
          ]
        },
        {
          title: "मॉड्यूल २: कीबोर्ड आणि माउस",
          topics: [
            "कीबोर्ड वापर",
            "टायपिंग सराव",
            "माउस वापर",
            "प्रैक्टिकल सराव"
          ]
        },
        {
          title: "मॉड्यूल ३: मूलभूत सॉफ्टवेअर",
          topics: [
            "नोटपॅड",
            "पेंट",
            "कॅल्क्युलेटर",
            "प्रैक्टिकल प्रोजेक्ट्स"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "राजेश शिंदे",
          role: "नवीन शिकणारा",
          text: "या कोर्समुळे मला संगणकाची मूलभूत माहिती मिळाली. आता मी आत्मविश्वासाने संगणक वापरू शकतो.",
          rating: 5
        },
        {
          name: "स्वाती पाटील",
          role: "गृहिणी",
          text: "कीबोर्ड आणि माउस वापर शिकल्यामुळे माझे काम खूप सोपे झाले.",
          rating: 5
        }
      ]
    }
  },
  brain: {
    header: {
      logo: "/school-logo.png",
      courseName: "मेंदू विकास कोर्स",
    },
    hero: {
      backgroundImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      title: "मेंदू विकास कोर्स",
      subtitle: "आपल्या मेंदूची क्षमता वाढवा",
    },
    about: {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      text: "हा कोर्स मेंदूच्या क्षमता वाढविण्यावर लक्ष केंद्रित करतो. स्मरणशक्ती, एकाग्रता, तार्किक विचार आणि समस्या सोडवण्याची क्षमता वाढविण्यासाठी विशेष तंत्रे शिकवली जातात.",
      stats: {
        duration: "३ महिने",
        completionRate: "९५%",
      },
    },
    features: {
      title: "कोर्सची वैशिष्ट्ये",
      items: [
        {
          title: "स्मरणशक्ती वाढ",
          description: "स्मरणशक्ती वाढविण्याची तंत्रे आणि सराव",
          icon: "🧠"
        },
        {
          title: "एकाग्रता",
          description: "एकाग्रता वाढविण्याची तंत्रे",
          icon: "🎯"
        },
        {
          title: "तार्किक विचार",
          description: "तार्किक विचार आणि समस्या सोडवणे",
          icon: "🤔"
        },
        {
          title: "मानसिक व्यायाम",
          description: "मेंदूचे व्यायाम आणि सराव",
          icon: "💪"
        }
      ]
    },
    curriculum: {
      title: "अभ्यासक्रम",
      modules: [
        {
          title: "मॉड्यूल १: स्मरणशक्ती",
          topics: [
            "स्मरणशक्ती वाढविण्याची तंत्रे",
            "मेमोरी गेम्स",
            "सराव पद्धती",
            "प्रैक्टिकल सराव"
          ]
        },
        {
          title: "मॉड्यूल २: एकाग्रता",
          topics: [
            "एकाग्रता वाढविण्याची तंत्रे",
            "ध्यान साधना",
            "मानसिक व्यायाम",
            "प्रैक्टिकल सराव"
          ]
        },
        {
          title: "मॉड्यूल ३: तार्किक विचार",
          topics: [
            "तार्किक विचार पद्धती",
            "समस्या सोडवणे",
            "निर्णय घेणे",
            "प्रैक्टिकल प्रोजेक्ट्स"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "अमित देशमुख",
          role: "विद्यार्थी",
          text: "या कोर्समुळे माझी स्मरणशक्ती आणि एकाग्रता खूप सुधारली. आता मी चांगल्या प्रकारे अभ्यास करू शकतो.",
          rating: 5
        },
        {
          name: "प्रिया जोशी",
          role: "प्राध्यापक",
          text: "मेंदूच्या व्यायामांमुळे माझी कार्यक्षमता वाढली आहे.",
          rating: 5
        }
      ]
    }
  },
  career1: {
    header: {
      logo: "/school-logo.png",
      courseName: "करिअर विकास कोर्स भाग-१",
    },
    hero: {
      backgroundImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      title: "करिअर विकास कोर्स भाग-१",
      subtitle: "आपल्या करिअरला नवीन दिशा द्या",
    },
    about: {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      text: "हा कोर्स करिअर नियोजन आणि विकासावर लक्ष केंद्रित करतो. करिअर निवड, रिझ्युमे तयार करणे, साक्षात्कार तयारी आणि व्यावसायिक कौशल्ये विकसित करणे यावर भर दिला जातो.",
      stats: {
        duration: "३ महिने",
        completionRate: "९२%",
      },
    },
    features: {
      title: "कोर्सची वैशिष्ट्ये",
      items: [
        {
          title: "करिअर नियोजन",
          description: "करिअर निवड आणि नियोजन",
          icon: "🎯"
        },
        {
          title: "रिझ्युमे तयारी",
          description: "प्रभावी रिझ्युमे तयार करणे",
          icon: "📄"
        },
        {
          title: "साक्षात्कार तयारी",
          description: "साक्षात्कारासाठी तयारी",
          icon: "💼"
        },
        {
          title: "व्यावसायिक कौशल्ये",
          description: "व्यावसायिक कौशल्ये विकसित करणे",
          icon: "📈"
        }
      ]
    },
    curriculum: {
      title: "अभ्यासक्रम",
      modules: [
        {
          title: "मॉड्यूल १: करिअर नियोजन",
          topics: [
            "करिअर निवड",
            "करिअर मार्गदर्शन",
            "स्वतःचे मूल्यमापन",
            "लक्ष्य निश्चिती"
          ]
        },
        {
          title: "मॉड्यूल २: रिझ्युमे तयारी",
          topics: [
            "रिझ्युमे तयार करणे",
            "कव्हर लेटर",
            "लिंक्डइन प्रोफाइल",
            "प्रैक्टिकल सराव"
          ]
        },
        {
          title: "मॉड्यूल ३: साक्षात्कार तयारी",
          topics: [
            "साक्षात्कार तंत्रे",
            "सामान्य प्रश्न",
            "व्यावसायिक वर्तन",
            "प्रैक्टिकल सराव"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "राहुल पाटील",
          role: "नवीन पदवीधर",
          text: "या कोर्समुळे मला चांगली नोकरी मिळाली. रिझ्युमे तयार करणे आणि साक्षात्कार तयारी खूप उपयुक्त ठरली.",
          rating: 5
        },
        {
          name: "स्वाती कुलकर्णी",
          role: "करिअर बदलणारा",
          text: "करिअर नियोजन आणि मार्गदर्शन खूप उपयुक्त ठरले.",
          rating: 5
        }
      ]
    }
  },
  career2: {
    header: {
      logo: "/school-logo.png",
      courseName: "करिअर विकास कोर्स भाग-२",
    },
    hero: {
      backgroundImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      title: "करिअर विकास कोर्स भाग-२",
      subtitle: "आपल्या करिअरला नवीन उंची द्या",
    },
    about: {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      text: "हा कोर्स करिअरच्या प्रगत पैलूंवर लक्ष केंद्रित करतो. नेतृत्व कौशल्ये, व्यवस्थापन क्षमता, संप्रेषण कौशल्ये आणि व्यावसायिक नेटवर्किंग यावर भर दिला जातो.",
      stats: {
        duration: "३ महिने",
        completionRate: "९०%",
      },
    },
    features: {
      title: "कोर्सची वैशिष्ट्ये",
      items: [
        {
          title: "नेतृत्व कौशल्ये",
          description: "नेतृत्व कौशल्ये विकसित करणे",
          icon: "👥"
        },
        {
          title: "व्यवस्थापन क्षमता",
          description: "व्यवस्थापन क्षमता वाढविणे",
          icon: "📊"
        },
        {
          title: "संप्रेषण कौशल्ये",
          description: "प्रभावी संप्रेषण कौशल्ये",
          icon: "💬"
        },
        {
          title: "नेटवर्किंग",
          description: "व्यावसायिक नेटवर्किंग",
          icon: "🌐"
        }
      ]
    },
    curriculum: {
      title: "अभ्यासक्रम",
      modules: [
        {
          title: "मॉड्यूल १: नेतृत्व कौशल्ये",
          topics: [
            "नेतृत्व गुण",
            "टीम मॅनेजमेंट",
            "संघर्ष व्यवस्थापन",
            "निर्णय घेणे"
          ]
        },
        {
          title: "मॉड्यूल २: व्यवस्थापन क्षमता",
          topics: [
            "प्रोजेक्ट मॅनेजमेंट",
            "वेळ व्यवस्थापन",
            "संसाधन व्यवस्थापन",
            "प्रैक्टिकल सराव"
          ]
        },
        {
          title: "मॉड्यूल ३: संप्रेषण आणि नेटवर्किंग",
          topics: [
            "प्रभावी संप्रेषण",
            "व्यावसायिक नेटवर्किंग",
            "सोशल मीडिया वापर",
            "प्रैक्टिकल सराव"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "अजिंक्य पाटील",
          role: "मध्यम स्तरीय व्यवस्थापक",
          text: "या कोर्समुळे माझी नेतृत्व क्षमता आणि व्यवस्थापन कौशल्ये वाढली. आता मी आत्मविश्वासाने टीम लीड करू शकतो.",
          rating: 5
        },
        {
          name: "प्रिया देशमुख",
          role: "व्यवसायी",
          text: "संप्रेषण कौशल्ये आणि नेटवर्किंग खूप उपयुक्त ठरले.",
          rating: 5
        }
      ]
    }
  },
  foundation: {
    header: {
      logo: "/school-logo.png",
      courseName: "फाउंडेशन डेव्हलपमेंट कोर्स",
    },
    hero: {
      backgroundImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      title: "फाउंडेशन डेव्हलपमेंट कोर्स",
      subtitle: "आपल्या भविष्याची पायाभरणी करा",
    },
    about: {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      text: "हा कोर्स विद्यार्थ्यांच्या मूलभूत कौशल्यांवर लक्ष केंद्रित करतो. गणित, विज्ञान, इंग्रजी आणि तार्किक विचार या मूलभूत विषयांवर भर दिला जातो.",
      stats: {
        duration: "६ महिने",
        completionRate: "९५%",
      },
    },
    features: {
      title: "कोर्सची वैशिष्ट्ये",
      items: [
        {
          title: "गणित",
          description: "मूलभूत गणित आणि तर्कशक्ती",
          icon: "➕"
        },
        {
          title: "विज्ञान",
          description: "मूलभूत विज्ञान संकल्पना",
          icon: "🔬"
        },
        {
          title: "इंग्रजी",
          description: "मूलभूत इंग्रजी भाषा",
          icon: "📚"
        },
        {
          title: "तार्किक विचार",
          description: "तार्किक विचार आणि समस्या सोडवणे",
          icon: "🤔"
        }
      ]
    },
    curriculum: {
      title: "अभ्यासक्रम",
      modules: [
        {
          title: "मॉड्यूल १: गणित",
          topics: [
            "मूलभूत गणित",
            "बीजगणित",
            "भूमिती",
            "प्रैक्टिकल सराव"
          ]
        },
        {
          title: "मॉड्यूल २: विज्ञान",
          topics: [
            "भौतिकशास्त्र",
            "रसायनशास्त्र",
            "जीवशास्त्र",
            "प्रैक्टिकल प्रयोग"
          ]
        },
        {
          title: "मॉड्यूल ३: इंग्रजी आणि तर्कशक्ती",
          topics: [
            "मूलभूत इंग्रजी",
            "तार्किक विचार",
            "समस्या सोडवणे",
            "प्रैक्टिकल सराव"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "राहुल जोशी",
          role: "विद्यार्थी",
          text: "या कोर्समुळे माझी मूलभूत कौशल्ये खूप सुधारली. आता मी चांगल्या प्रकारे अभ्यास करू शकतो.",
          rating: 5
        },
        {
          name: "स्वाती पाटील",
          role: "विद्यार्थी",
          text: "गणित आणि विज्ञानाची मूलभूत संकल्पना समजली.",
          rating: 5
        }
      ]
    }
  },
  skill: {
    header: {
      logo: "/school-logo.png",
      courseName: "स्किल डेव्हलपमेंट कोर्स",
    },
    hero: {
      backgroundImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      title: "स्किल डेव्हलपमेंट कोर्स",
      subtitle: "आपली कौशल्ये विकसित करा",
    },
    about: {
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      text: "हा कोर्स विविध व्यावसायिक कौशल्यांवर लक्ष केंद्रित करतो. संप्रेषण कौशल्ये, टीम वर्क, समस्या सोडवणे आणि नवकल्पना यावर भर दिला जातो.",
      stats: {
        duration: "४ महिने",
        completionRate: "९३%",
      },
    },
    features: {
      title: "कोर्सची वैशिष्ट्ये",
      items: [
        {
          title: "संप्रेषण कौशल्ये",
          description: "प्रभावी संप्रेषण कौशल्ये",
          icon: "💬"
        },
        {
          title: "टीम वर्क",
          description: "टीममध्ये काम करणे",
          icon: "👥"
        },
        {
          title: "समस्या सोडवणे",
          description: "समस्या सोडवण्याची क्षमता",
          icon: "🔍"
        },
        {
          title: "नवकल्पना",
          description: "नवकल्पनात्मक विचार",
          icon: "💡"
        }
      ]
    },
    curriculum: {
      title: "अभ्यासक्रम",
      modules: [
        {
          title: "मॉड्यूल १: संप्रेषण कौशल्ये",
          topics: [
            "मौखिक संप्रेषण",
            "लिखित संप्रेषण",
            "प्रस्तुतीकरण कौशल्ये",
            "प्रैक्टिकल सराव"
          ]
        },
        {
          title: "मॉड्यूल २: टीम वर्क",
          topics: [
            "टीम बिल्डिंग",
            "संघर्ष व्यवस्थापन",
            "नेतृत्व कौशल्ये",
            "प्रैक्टिकल सराव"
          ]
        },
        {
          title: "मॉड्यूल ३: समस्या सोडवणे",
          topics: [
            "समस्या विश्लेषण",
            "निर्णय घेणे",
            "नवकल्पनात्मक विचार",
            "प्रैक्टिकल प्रोजेक्ट्स"
          ]
        }
      ]
    },
    testimonials: {
      title: "विद्यार्थ्यांचे अनुभव",
      reviews: [
        {
          name: "अजिंक्य पाटील",
          role: "नवीन पदवीधर",
          text: "या कोर्समुळे माझी संप्रेषण कौशल्ये आणि टीम वर्क क्षमता वाढली. आता मी आत्मविश्वासाने काम करू शकतो.",
          rating: 5
        },
        {
          name: "प्रिया देशमुख",
          role: "व्यवसायी",
          text: "समस्या सोडवण्याची क्षमता आणि नवकल्पनात्मक विचार खूप उपयुक्त ठरले.",
          rating: 5
        }
      ]
    }
  }
};

const ViewCourseLandingPage = () => {
  const [content, setContent] = useState(null);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId, courseId } = useParams();

  const getCourseType = (courseId) => {
    if (courseId.toLowerCase().includes("android")) {
      return "android";
    } else if (courseId.toLowerCase().includes("computer")) {
      return "computer";
    } else if (courseId.toLowerCase().includes("brain")) {
      return "brain";
    } else if (courseId.toLowerCase().includes("career2")) {
      return "career2";
    } else if (courseId.toLowerCase().includes("career1")) {
      return "career1";
    } else if (courseId.toLowerCase().includes("foundation")) {
      return "foundation";
    } else if (courseId.toLowerCase().includes("skill")) {
      return "skill";
    } else if (courseId.toLowerCase().includes("basic")) {
      return "basic";
    } else {
      return "english";
    }
  };

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
        // Set default template based on course type
        const courseType = getCourseType(courseId);
        setContent(courseTemplates[courseType] || courseTemplates.english);
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

export default ViewCourseLandingPage; 