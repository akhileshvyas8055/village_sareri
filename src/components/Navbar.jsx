import { useState, useEffect, useRef } from 'react';
import { FiMenu, FiX, FiSettings, FiDownload, FiChevronDown, FiAlertCircle } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { isAppInstalled, promptPWAInstall } from '../utils/pwa';
import InstallGuideModal from './InstallGuideModal';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isAppInstalled);
  const [desktopPanchayatOpen, setDesktopPanchayatOpen] = useState(false);
  const [desktopExploreOpen, setDesktopExploreOpen] = useState(false);
  const panchayatDropdownRef = useRef(null);
  const exploreDropdownRef = useRef(null);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const checkInstalled = () => setIsInstalled(isAppInstalled());
    checkInstalled();

    const onInstalled = () => setIsInstalled(true);
    window.addEventListener('pwa-installed', onInstalled);

    // Real-time media query listener for standalone / installed mode
    const mq = window.matchMedia('(display-mode: standalone)');
    const handleMq = (e) => {
      if (e.matches) setIsInstalled(true);
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handleMq);
    } else if (mq.addListener) {
      mq.addListener(handleMq);
    }

    return () => {
      window.removeEventListener('pwa-installed', onInstalled);
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handleMq);
      } else if (mq.removeListener) {
        mq.removeListener(handleMq);
      }
    };
  }, []);

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panchayatDropdownRef.current && !panchayatDropdownRef.current.contains(event.target)) {
        setDesktopPanchayatOpen(false);
      }
      if (exploreDropdownRef.current && !exploreDropdownRef.current.contains(event.target)) {
        setDesktopExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setDesktopPanchayatOpen(false);
    setDesktopExploreOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleInstallApp = async () => {
    const res = await promptPWAInstall();
    if (res.status === 'already-installed' || res.status === 'accepted') {
      setIsInstalled(true);
    } else if (res.status === 'dismissed') {
      // User cancelled native prompt
    } else {
      setShowInstallModal(true);
    }
  };

  const panchayatSubLinks = [
    { name: 'ग्राम पंचायत मुख्य पोर्टल', href: '/panchayat', icon: '🧭', desc: 'तीनों प्रभागों का मुख्य दिशा पोर्टल' },
    { name: 'ग्राम पंचायत कार्यालय', href: '/panchayat/karyalay', icon: '🏛️', desc: 'सरपंच, सचिव व वार्ड पंच विवरण' },
    { name: 'ग्राम सभा (Gram Sabha)', href: '/gram-sabha', icon: '👥', desc: 'बैठकें, एजेंडा व जन निर्णय' },
    { name: 'विकास कार्य (Vikas Karya)', href: '/vikas-karya', icon: '🏗️', desc: 'स्वीकृत व प्रगतिरत कार्य' }
  ];

  const exploreSubLinks = [
    { name: t('About'), href: '/about', icon: '📜', desc: 'गाँव का इतिहास, भूगोल व संस्कृति' },
    { name: t('Gallery'), href: '/gallery', icon: '📸', desc: 'सरेरी की धरोहर व उत्सव तस्वीरें' },
    { name: t('Community'), href: '/community', icon: '🤝', desc: 'ग्राम चौपाल, विचार व संवाद' },
    { name: t('Pride of Sareri'), href: '/pride', icon: '⭐', desc: 'शिक्षा, खेल व समाज के सितारे' },
    { name: t('News'), href: '/news', icon: '📰', desc: 'गाँव के ताज़ा समाचार व घटनाक्रम' },
    { name: t('Khel Utsav'), href: '/khel-registration', icon: '🏆', desc: 'सरेरी खेल महोत्सव पंजीकरण' }
  ];

  const isPanchayatActive = ['/panchayat', '/panchayat/karyalay', '/panchayat-karyalay', '/gram-sabha', '/vikas-karya'].includes(location.pathname);
  const isExploreActive = ['/about', '/gallery', '/community', '/pride', '/news', '/khel-registration'].includes(location.pathname);

  return (
    <header className="sticky top-0 w-full z-50 bg-white shadow-md border-b border-gray-200">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex justify-between items-center py-2.5 flex-nowrap">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img 
            src="/photos/About.jpeg" 
            alt="Sareri Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-saffron shadow-sm shrink-0"
          />
          <span className="font-heading font-bold text-lg sm:text-xl lg:text-2xl tracking-wide text-gray-900 notranslate whitespace-nowrap">
            Brahmano Ki Sareri
          </span>
        </Link>

        {/* Desktop Nav - Strict 1-Line Flex Layout */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2.5 flex-nowrap shrink-0">
          <ul className="flex items-center flex-nowrap gap-0.5 xl:gap-1.5 whitespace-nowrap">
            {/* 1. Home */}
            <li>
              <Link 
                to="/" 
                className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-colors ${
                  location.pathname === '/' ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-700 hover:text-saffron hover:bg-gray-50'
                }`}
              >
                <span className="notranslate" translate="no">{t('Home')}</span>
              </Link>
            </li>

            {/* 2. Panchayat Dropdown */}
            <li 
              className="relative"
              ref={panchayatDropdownRef}
              onMouseEnter={() => setDesktopPanchayatOpen(true)}
              onMouseLeave={() => setDesktopPanchayatOpen(false)}
            >
              <button
                onClick={() => setDesktopPanchayatOpen(!desktopPanchayatOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-colors ${
                  isPanchayatActive ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-700 hover:text-saffron hover:bg-gray-50'
                }`}
              >
                <span className="notranslate" translate="no">{t('Panchayat')}</span>
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopPanchayatOpen ? 'rotate-180 text-[#135334]' : ''}`} />
              </button>

              {desktopPanchayatOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-1.5 border-b border-gray-100 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      पंचायत प्रभाग (Panchayat Sections)
                    </span>
                  </div>
                  {panchayatSubLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      to={sub.href}
                      onClick={() => setDesktopPanchayatOpen(false)}
                      className={`flex items-start gap-2.5 px-3.5 py-2 hover:bg-emerald-50/70 transition-colors ${
                        location.pathname === sub.href ? 'bg-emerald-50 text-[#135334] font-bold' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{sub.icon}</span>
                      <div>
                        <div className="text-xs font-semibold leading-tight text-gray-900 notranslate" translate="no">
                          {sub.name}
                        </div>
                        <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                          {sub.desc}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {/* 3. Notice Board */}
            <li>
              <Link 
                to="/notices" 
                className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-colors ${
                  location.pathname === '/notices' ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-700 hover:text-saffron hover:bg-gray-50'
                }`}
              >
                <span className="notranslate" translate="no">सूचना पट्ट</span>
              </Link>
            </li>

            {/* 4. Businesses */}
            <li>
              <Link 
                to="/businesses" 
                className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-colors ${
                  location.pathname === '/businesses' ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-700 hover:text-saffron hover:bg-gray-50'
                }`}
              >
                <span className="notranslate" translate="no">{t('Businesses')}</span>
              </Link>
            </li>

            {/* 5. Events */}
            <li>
              <Link 
                to="/events" 
                className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-colors ${
                  location.pathname === '/events' ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-700 hover:text-saffron hover:bg-gray-50'
                }`}
              >
                <span className="notranslate" translate="no">{t('Events')}</span>
              </Link>
            </li>

            {/* 6. Explore Sareri (सरेरी दर्शन Dropdown) */}
            <li 
              className="relative"
              ref={exploreDropdownRef}
              onMouseEnter={() => setDesktopExploreOpen(true)}
              onMouseLeave={() => setDesktopExploreOpen(false)}
            >
              <button
                onClick={() => setDesktopExploreOpen(!desktopExploreOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-colors ${
                  isExploreActive ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-700 hover:text-saffron hover:bg-gray-50'
                }`}
              >
                <span className="notranslate" translate="no">सरेरी दर्शन</span>
                <FiChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopExploreOpen ? 'rotate-180 text-[#135334]' : ''}`} />
              </button>

              {desktopExploreOpen && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-1.5 border-b border-gray-100 mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      गाँव अन्वेषण (Explore Village)
                    </span>
                  </div>
                  {exploreSubLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      to={sub.href}
                      onClick={() => setDesktopExploreOpen(false)}
                      className={`flex items-start gap-2.5 px-3.5 py-2 hover:bg-orange-50/70 transition-colors ${
                        location.pathname === sub.href ? 'bg-orange-50 text-saffron font-bold' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{sub.icon}</span>
                      <div>
                        <div className="text-xs font-semibold leading-tight text-gray-900 notranslate" translate="no">
                          {sub.name}
                        </div>
                        <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                          {sub.desc}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {/* 7. Complaint / Jan Sunwai Button - Highlighted for instant resident access */}
            <li>
              <Link 
                to="/complaint" 
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all shadow-xs ${
                  location.pathname === '/complaint'
                    ? 'bg-rose-600 text-white shadow-rose-600/30'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <FiAlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="notranslate" translate="no">शिकायत निवारण</span>
              </Link>
            </li>
          </ul>
          
          {/* Action Icons */}
          <div className="flex items-center gap-1.5 xl:gap-2 ml-1">
            <NotificationCenter />
            {!isInstalled && !isAppInstalled() && (
              <button
                onClick={handleInstallApp}
                className="pwa-install-btn flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 text-saffron border border-orange-200 text-xs font-bold transition-all shadow-xs whitespace-nowrap"
                title="Install Sareri App"
              >
                <FiDownload className="w-3.5 h-3.5" />
                <span>App</span>
              </button>
            )}
            <Link 
              to="/settings"
              className="p-1.5 xl:p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
              title="Settings"
            >
              <FiSettings className="w-4 h-4 xl:w-5 xl:h-5" />
            </Link>
          </div>
        </nav>

        {/* Mobile / Tablet Toggle - Clean and Minimal */}
        <div className="flex items-center gap-1 lg:hidden shrink-0">
          <NotificationCenter />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 max-h-[85vh] overflow-y-auto">
          <ul className="flex flex-col px-4 py-2 space-y-1 shadow-inner">
            {/* Home */}
            <li>
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-semibold rounded-xl ${
                  location.pathname === '/' ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="notranslate" translate="no">🏠 {t('Home')}</span>
              </Link>
            </li>

            {/* Panchayat Section */}
            <li className="border-t border-b border-gray-100 py-2 my-1">
              <div className="px-3 py-1 text-xs font-bold text-[#135334] uppercase tracking-wider">
                🏛️ पंचायत प्रभाग (Panchayat Sections)
              </div>
              <div className="pl-2 space-y-1 mt-1">
                {panchayatSubLinks.map((sub) => (
                  <Link
                    key={sub.href}
                    to={sub.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === sub.href
                        ? 'bg-emerald-50 text-[#135334] font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{sub.icon}</span>
                    <span className="notranslate" translate="no">{sub.name}</span>
                  </Link>
                ))}
              </div>
            </li>

            {/* Direct Links */}
            <li>
              <Link 
                to="/complaint" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 text-base font-bold rounded-xl ${
                  location.pathname === '/complaint'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <span>✍️ जनसुनवाई व शिकायत (Complaints)</span>
                <span className="text-xs bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">New</span>
              </Link>
            </li>

            <li>
              <Link 
                to="/notices" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-xl ${
                  location.pathname === '/notices' ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>📢 डिजिटल सूचना पट्ट (Notices)</span>
              </Link>
            </li>

            <li>
              <Link 
                to="/businesses" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-xl ${
                  location.pathname === '/businesses' ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>🏪 स्थानीय व्यापार निर्देशिका (Businesses)</span>
              </Link>
            </li>

            <li>
              <Link 
                to="/events" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium rounded-xl ${
                  location.pathname === '/events' ? 'text-[#135334] font-bold bg-emerald-50' : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span>🎪 मेले, उत्सव व संस्कृति (Events)</span>
              </Link>
            </li>

            {/* Explore Village Group */}
            <li className="border-t border-gray-100 pt-2 mt-1">
              <div className="px-3 py-1 text-xs font-bold text-saffron uppercase tracking-wider">
                🧭 सरेरी दर्शन (Explore Village)
              </div>
              <div className="pl-2 space-y-1 mt-1">
                {exploreSubLinks.map((sub) => (
                  <Link
                    key={sub.href}
                    to={sub.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === sub.href
                        ? 'bg-orange-50 text-saffron font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{sub.icon}</span>
                    <span className="notranslate" translate="no">{sub.name}</span>
                  </Link>
                ))}
              </div>
            </li>
            
            <li className="pt-3 pb-2 mt-2 border-t border-gray-100 flex flex-col gap-1.5">
              {!isInstalled && !isAppInstalled() && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleInstallApp();
                  }}
                  className="pwa-install-btn flex items-center gap-2 px-3 py-2 text-saffron font-bold hover:bg-orange-50 rounded-xl w-full text-left"
                >
                  <FiDownload className="w-5 h-5" />
                  <span className="text-sm font-bold">Install Mobile App (ऐप इंस्टॉल करें)</span>
                </button>
              )}
              <Link 
                to="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold"
              >
                <FiSettings className="w-5 h-5" />
                <span>Settings (सेटिंग्स)</span>
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Install Guide Modal */}
      <InstallGuideModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)} 
      />
    </header>
  );
};

export default Navbar;
