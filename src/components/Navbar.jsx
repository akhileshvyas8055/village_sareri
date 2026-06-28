import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiShield, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const isHomePage = location.pathname === '/';
  const showSolidNav = !isHomePage || isScrolled;

  const navLinks = [
    { name: t('Home'), href: '/' },
    { name: t('Panchayat'), href: '/panchayat' },
    { name: t('About'), href: '/about' },
    { name: t('Gallery'), href: '/gallery' },
    { name: t('Community'), href: '/community' },
    { name: t('News'), href: '/news' },
    { name: t('Complaint'), href: '/complaint' },
    { name: t('Khel Utsav'), href: '/khel-registration' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${showSolidNav ? 'bg-white/90 dark:bg-darkCard/90 backdrop-blur-md shadow-md py-3 border-b border-gray-100 dark:border-gray-800' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/photos/About.jpeg" 
            alt="Sareri Logo" 
            className="w-10 h-10 rounded-full object-cover border-2 border-white/50 shadow-sm"
          />
          <span className={`font-heading font-bold text-xl md:text-2xl tracking-wide transition-colors notranslate ${showSolidNav ? 'text-gray-900 dark:text-white' : 'text-white drop-shadow-md'}`}>
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
                  className={`font-medium transition-colors hover:text-saffron ${showSolidNav ? 'text-gray-700 dark:text-gray-300' : 'text-white drop-shadow-md hover:text-gray-200'} ${link.name === 'Khel Utsav' || link.name === 'खेल उत्सव' ? 'notranslate' : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/settings"
              className={`p-2 rounded-full transition-colors ${showSolidNav ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'text-white hover:bg-white/20 backdrop-blur-sm'}`}
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
            className={`p-2 rounded-full transition-colors ${showSolidNav ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'text-white hover:bg-white/20'}`}
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-darkCard border-t border-gray-200 dark:border-gray-800"
          >
            <ul className="flex flex-col px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-saffron dark:hover:text-saffron ${link.name === 'Khel Utsav' || link.name === 'खेल उत्सव' ? 'notranslate' : ''}`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              
              {/* Extra Mobile Actions */}
              <li className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around">
                <Link 
                  to="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-saffron"
                >
                  <FiSettings className="w-6 h-6" />
                  <span className="text-xs font-medium">Settings</span>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
