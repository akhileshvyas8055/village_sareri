import { useState, useEffect } from 'react';
import { FiInstagram, FiMail, FiMapPin, FiPhoneCall } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [isMobilePWA, setIsMobilePWA] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const isMobile = window.innerWidth < 768;
    if (isStandalone && isMobile) {
      setIsMobilePWA(true);
    }
  }, []);

  if (isMobilePWA) {
    return (
      <footer className="bg-white dark:bg-darkCard pb-24 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} <span className="text-gray-900 dark:text-white font-semibold notranslate">Brahmano Ki Sareri</span>.<br />
          Built with <span className="text-red-500">❤️</span> by <span className="text-gray-900 dark:text-white font-bold tracking-wide">Akhilesh Vyas</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-gray-300 pt-20 pb-20 md:pb-10 border-t border-gray-800 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-orange-500 to-green-500" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-saffron/5 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-saffron rounded-full blur-md opacity-50" />
                <img 
                  src="/photos/About.jpeg" 
                  alt="Sareri Logo" 
                  className="relative w-14 h-14 rounded-full object-cover border-2 border-saffron shadow-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-2xl text-white tracking-wide leading-none notranslate">
                  Village Sareri
                </span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm mb-6">
              <span className="notranslate">Brahmano Ki Sareri</span> is not just a village; it's an emotion. A sacred land blessed with ancient temples, rich cultural heritage, and a forward-looking community united by devotion and brotherhood.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/village_sareri?igsh=cDVoYWNwZzlteGkw" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300 border border-gray-800 hover:border-pink-500 shadow-lg group">
                <FiInstagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white font-bold mb-6 font-heading tracking-wide text-lg relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-saffron rounded-full"></span>
            </h3>
            <ul className="space-y-3 w-full text-center md:text-left">
              <li><Link to="/" className="text-gray-400 hover:text-saffron transition-colors inline-block transform hover:translate-x-2 duration-300">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-saffron transition-colors inline-block transform hover:translate-x-2 duration-300">About Village</Link></li>
              <li><Link to="/gallery" className="text-gray-400 hover:text-saffron transition-colors inline-block transform hover:translate-x-2 duration-300">Photo Gallery</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-saffron transition-colors inline-block transform hover:translate-x-2 duration-300">Community</Link></li>
              <li><Link to="/news" className="text-gray-400 hover:text-saffron transition-colors inline-block transform hover:translate-x-2 duration-300">News & Complaints</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white font-bold mb-6 font-heading tracking-wide text-lg relative inline-block">
              Contact Info
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-saffron rounded-full"></span>
            </h3>
            <ul className="space-y-4 w-full text-center md:text-left">
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <FiMapPin className="w-5 h-5 text-saffron shrink-0 mt-1" />
                <span className="text-gray-400 text-sm"><span className="notranslate">Brahmano Ki Sareri</span>, <br/> Tehsil Asind, District Bhilwara <br/> Rajasthan - 311026</span>
              </li>
              <li className="flex flex-col md:flex-row items-center gap-3">
                <FiMail className="w-5 h-5 text-saffron shrink-0" />
                <a href="mailto:shreesarerishyam@gmail.com" className="text-gray-400 hover:text-white transition-colors text-sm">shreesarerishyam@gmail.com</a>
              </li>
              <li className="flex flex-col md:flex-row items-center gap-3">
                <FiPhoneCall className="w-5 h-5 text-saffron shrink-0" />
                <span className="text-gray-400 text-sm">Gram Panchayat Office</span>
              </li>
            </ul>
          </div>

          {/* Location Map */}
          <div className="flex flex-col items-center md:items-start lg:col-span-1 w-full">
            <h3 className="text-white font-bold mb-6 font-heading tracking-wide text-lg relative inline-block">
              Live Location
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-saffron rounded-full"></span>
            </h3>
            <div className="w-full h-48 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.1)] border border-gray-800 group relative">
              <iframe 
                src="https://maps.google.com/maps?q=Brahmano%20Ki%20Sareri,%20Bhilwara,%20Rajasthan&t=&z=12&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0"
                title="Sareri Village Map"
                className="filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              ></iframe>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-saffron/30 rounded-2xl pointer-events-none transition-colors duration-500" />
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="text-center md:text-left">
            &copy; {new Date().getFullYear()} <span className="text-white font-semibold notranslate">Brahmano Ki Sareri</span>. All rights reserved. <br className="md:hidden" />
            <span className="md:ml-2 mt-2 md:mt-0 inline-block">Built with <span className="text-red-500">❤️</span> by <span className="text-white font-semibold">Akhilesh Vyas</span></span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-saffron transition-colors relative group">
              Privacy Policy
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-saffron group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="hover:text-saffron transition-colors relative group">
              Terms of Service
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-saffron group-hover:w-full transition-all duration-300"></span>
            </a>
            <Link to="/admin" className="text-gray-800 hover:text-gray-600 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
