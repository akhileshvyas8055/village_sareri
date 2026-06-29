import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const LanguagePromptPopup = () => {
  const [show, setShow] = useState(false);
  const { toggleLanguage, lang } = useLanguage();

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const notifAsked = localStorage.getItem('sareri_notification_asked');
      const langSeen = localStorage.getItem('sareri_language_prompt_seen');
      
      // If notification hasn't been asked yet, wait for it
      // Notification.permission might be 'default', meaning we still need to ask
      if (!notifAsked && Notification.permission === 'default') {
         return; // Keep waiting
      }
      
      if (!langSeen) {
        setShow(true);
      }
      
      clearInterval(checkInterval);
    }, 1000);
    
    return () => clearInterval(checkInterval);
  }, []);

  const handleSelectLanguage = (selectedLang) => {
    if (selectedLang !== lang) {
      toggleLanguage();
    }
    setShow(false);
    localStorage.setItem('sareri_language_prompt_seen', 'true');
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem('sareri_language_prompt_seen', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-6 md:bottom-10 md:left-10 z-50 w-[90%] max-w-sm"
        >
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-2xl p-6 border border-saffron/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
            
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div className="text-center">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">अपनी पसंदीदा भाषा चुनें</h3>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-4">Choose your preferred language</h4>
              
              <div className="flex gap-3 mb-3">
                <button 
                  onClick={() => handleSelectLanguage('hi')}
                  className={`flex-1 py-2 px-4 rounded-xl font-bold transition-all ${
                    lang === 'hi' 
                      ? 'bg-saffron text-white shadow-lg shadow-saffron/30' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  हिंदी
                </button>
                <button 
                  onClick={() => handleSelectLanguage('en')}
                  className={`flex-1 py-2 px-4 rounded-xl font-bold transition-all ${
                    lang === 'en' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  English
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                (You can change this later in Settings / आप इसे बाद में सेटिंग्स से बदल सकते हैं)
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguagePromptPopup;
