import { useState } from 'react';
import { FiMenu, FiX, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { name: t('Home'), href: '/' },
    { name: t('Panchayat'), href: '/panchayat' },
    { name: t('Events'), href: '/events' },
    { name: t('Businesses'), href: '/businesses' },
    { name: t('About'), href: '/about' },
    { name: t('Gallery'), href: '/gallery' },
    { name: t('Community'), href: '/community' },
    { name: t('Pride of Sareri'), href: '/pride' },
    { name: t('News'), href: '/news' },
    { name: t('Complaint'), href: '/complaint' },
    { name: t('Khel Utsav'), href: '/khel-registration' },
  ];

  return (
    <header className="sticky top-0 w-full z-50 bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/photos/About.jpeg" 
            alt="Sareri Logo" 
            className="w-10 h-10 rounded-full object-cover border-2 border-saffron shadow-sm"
          />
          <span className="font-heading font-bold text-xl md:text-2xl tracking-wide text-gray-900 notranslate">
            Brahmano Ki Sareri
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex space-x-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.href} 
                  className="font-medium text-gray-700 hover:text-saffron transition-colors"
                >
                  <span className="notranslate" translate="no">{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/settings"
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </Link>
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <ul className="flex flex-col px-4 py-2 space-y-2 shadow-inner">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-2 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 hover:text-saffron rounded-md"
                >
                  <span className="notranslate" translate="no">{link.name}</span>
                </Link>
              </li>
            ))}
            
            <li className="pt-2 pb-2 mt-2 border-t border-gray-100">
              <Link 
                to="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-2 text-gray-700 hover:bg-gray-50 hover:text-saffron rounded-md"
              >
                <FiSettings className="w-5 h-5" />
                <span className="text-base font-medium">Settings</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
