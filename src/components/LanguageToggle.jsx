import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageToggle = ({ className = '' }) => {
  const { lang, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
        lang === 'hi'
          ? 'bg-orange-50 text-saffron border-saffron/30 hover:bg-orange-100'
          : 'bg-blue-50 text-blue-600 border-blue-300/30 hover:bg-blue-100'
      } ${className}`}
      title={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
    >
      <span className={`transition-transform duration-300 ${lang === 'hi' ? 'scale-110' : 'scale-90 opacity-60'}`}>
        हिं
      </span>
      <span className="text-gray-400">/</span>
      <span className={`transition-transform duration-300 ${lang === 'en' ? 'scale-110' : 'scale-90 opacity-60'}`}>
        En
      </span>
    </button>
  );
};

export default LanguageToggle;
