import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translation dictionary
const translations = {
  // Navbar
  'Home': { hi: 'मुख्य पृष्ठ', en: 'Home' },
  'Panchayat': { hi: 'पंचायत', en: 'Panchayat' },
  'About': { hi: 'हमारे बारे में', en: 'About' },
  'Gallery': { hi: 'गैलरी', en: 'Gallery' },
  'Community': { hi: 'समुदाय', en: 'Community' },
  'News & Complaints': { hi: 'समाचार और शिकायत', en: 'News & Complaints' },
  'News': { hi: 'समाचार', en: 'News' },
  'Khel Utsav': { hi: 'खेल उत्सव', en: 'Khel Utsav' },

  // Footer
  'Quick Links': { hi: 'त्वरित लिंक', en: 'Quick Links' },
  'Contact Info': { hi: 'संपर्क जानकारी', en: 'Contact Info' },
  'Live Location': { hi: 'लाइव स्थान', en: 'Live Location' },
  'Privacy Policy': { hi: 'गोपनीयता नीति', en: 'Privacy Policy' },
  'Terms of Service': { hi: 'सेवा की शर्तें', en: 'Terms of Service' },
  'Heritage Village': { hi: 'विरासत गाँव', en: 'Heritage Village' },
  'About Village': { hi: 'गाँव के बारे में', en: 'About Village' },
  'Photo Gallery': { hi: 'फोटो गैलरी', en: 'Photo Gallery' },

  // Common
  'All rights reserved.': { hi: 'सर्वाधिकार सुरक्षित।', en: 'All rights reserved.' },
  'Built with': { hi: 'बनाया गया', en: 'Built with' },
  'Loading...': { hi: 'लोड हो रहा है...', en: 'Loading...' },
  'Contact Now': { hi: 'संपर्क करें', en: 'Contact Now' },
  'Read More': { hi: 'और पढ़ें', en: 'Read More' },
  'Submit': { hi: 'जमा करें', en: 'Submit' },
  'Cancel': { hi: 'रद्द करें', en: 'Cancel' },
  'Save': { hi: 'सहेजें', en: 'Save' },
  'Delete': { hi: 'हटाएं', en: 'Delete' },
  'Search': { hi: 'खोजें', en: 'Search' },

  // Virtual Tour Banner
  'Abhi Dekho': { hi: 'अभी देखो', en: 'Watch Now' },
  'Street View': { hi: 'स्ट्रीट व्यू', en: 'Street View' },

  // Highlights
  'Village Highlights': { hi: 'गाँव की विशेषताएं', en: 'Village Highlights' },
  'Explore our rich heritage': { hi: 'हमारी समृद्ध विरासत का अन्वेषण करें', en: 'Explore our rich heritage' },

  // Panchayat
  'Gram Panchayat Office': { hi: 'ग्राम पंचायत कार्यालय', en: 'Gram Panchayat Office' },
  'Ward Panches': { hi: 'वार्ड पंच', en: 'Ward Panches' },
  'Sarpanch': { hi: 'सरपंच', en: 'Sarpanch' },
  'Notice Board': { hi: 'सूचना पट्ट', en: 'Notice Board' },
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sareri_lang') || 'hi';
  });

  useEffect(() => {
    localStorage.setItem('sareri_lang', lang);
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';

    // Trigger Google Translate
    try {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.value = lang === 'hi' ? 'hi' : 'en';
        selectElement.dispatchEvent(new Event('change'));
      }
    } catch (error) {
      console.log('Google Translate not ready yet');
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'hi' ? 'en' : 'hi');
  };

  const t = (key) => {
    if (translations[key] && translations[key][lang]) {
      return translations[key][lang];
    }
    return key; // fallback to key itself
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
