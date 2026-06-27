import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiImage, FiBell, FiEdit3, FiInfo } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

const MobileBottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { name: t('Home'), path: '/', icon: <FiHome className="w-[18px] h-[18px]" /> },
    { name: t('Panchayat'), path: '/panchayat', icon: <FiUsers className="w-[18px] h-[18px]" /> },
    { name: t('Gallery'), path: '/gallery', icon: <FiImage className="w-[18px] h-[18px]" /> },
    { name: t('News'), path: '/news', icon: <FiBell className="w-[18px] h-[18px]" /> },
    { name: t('Complaint'), path: '/news', icon: <FiEdit3 className="w-[18px] h-[18px]" /> },
    { name: t('About'), path: '/about', icon: <FiInfo className="w-[18px] h-[18px]" /> }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 relative ${
                isActive 
                  ? 'text-saffron font-bold' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] leading-none transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {item.name}
                </span>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-saffron animate-pulse" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default MobileBottomNav;
