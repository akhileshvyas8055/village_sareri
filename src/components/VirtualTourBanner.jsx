import React, { useState } from 'react';
import { FiMap, FiX, FiMapPin } from 'react-icons/fi';

const VirtualTourBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Default to Main Village
  const defaultSrc = "https://www.google.com/maps/embed?pb=!4v1782711561627!6m8!1m7!1ssYXpQiOgY9DPDkHfSY5RYg!2m2!1d25.62409714012885!2d74.44149223641581!3f27.6283532161044!4f-5.916395113283301!5f0.4000000000000002";
  const [currentEmbedSrc, setCurrentEmbedSrc] = useState(defaultSrc);
  const [currentLocationName, setCurrentLocationName] = useState("Main Village");

  const mainVillage = {
    name: "Main Village",
    icon: "🏘️",
    src: "https://www.google.com/maps/embed?pb=!4v1782711561627!6m8!1m7!1ssYXpQiOgY9DPDkHfSY5RYg!2m2!1d25.62409714012885!2d74.44149223641581!3f27.6283532161044!4f-5.916395113283301!5f0.4000000000000002"
  };

  const charbhujaMandir = {
    name: "Charbhuja Mandir (Bada Mandir)",
    icon: "🕉️",
    src: "https://www.google.com/maps/embed?pb=!4v1782711810307!6m8!1m7!1s-ZD6OETEtNmlSn9uny_nSg!2m2!1d25.6209912854777!2d74.44209540525893!3f115.47569655507692!4f9.925000980193957!5f0.7820865974627469"
  };

  const tourLocations = [mainVillage, charbhujaMandir];

  const openTour = (location) => {
    setCurrentEmbedSrc(location.src);
    setCurrentLocationName(location.name);
    setIsModalOpen(true);
  };

  return (
    <>
    <div className="container mx-auto px-4 my-20">
      <div 
        className="relative w-full overflow-hidden rounded-[2rem] shadow-2xl group cursor-pointer border border-white/20 hover:border-saffron/50 transition-all duration-700 hover:shadow-[0_20px_60px_rgba(255,107,0,0.25)]"
        onClick={() => openTour(tourLocations[0])}
      >
        {/* Background Image with Zoom Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[4000ms] ease-out group-hover:scale-110"
          style={{ 
            backgroundImage: "url('/photos/local_market.jpg')", 
            backgroundPosition: 'center 60%'
          }}
        ></div>
        
        {/* Elegant Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#1A5C2A]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

        <div className="relative z-10 p-6 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 h-full min-h-[400px]">
          
          {/* Glassmorphic Content Card */}
          <div className="text-white max-w-2xl relative bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-3xl shadow-xl transform transition-transform duration-500 group-hover:translate-x-2">
            
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-saffron/30 mb-6 shadow-inner">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-saffron"></span>
              </span>
              <span className="text-xs font-bold tracking-wider text-saffron uppercase">360° Street View</span>
            </div>

            {/* Typography */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold mb-4 drop-shadow-2xl text-white leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron via-yellow-400 to-orange-500">
                Gaon Ghumao
              </span>
              <br className="hidden md:block" />
              <span className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-200 mt-2 block">Virtual Tour</span>
            </h2>
            <p className="text-lg md:text-xl font-medium text-gray-300 border-l-4 border-saffron pl-5 py-2 bg-gradient-to-r from-black/20 to-transparent rounded-r-lg">
              <span className="notranslate">Brahmano Ki Sareri</span> ki sadkon ka <span className="font-bold text-white">live 360° nazar</span> se darshan karo, bilkul real-time experience!
            </p>
          </div>
          
          {/* Glowing CTA Button */}
          <div className="relative mt-8 md:mt-0 shrink-0 transform transition-transform duration-500 group-hover:-translate-x-2">
            <div className="absolute -inset-4 bg-gradient-to-r from-saffron via-orange-600 to-yellow-500 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition duration-700 animate-pulse"></div>
            <button 
              className="relative px-8 py-5 md:px-10 md:py-6 bg-gradient-to-r from-orange-600 to-saffron text-white font-extrabold rounded-full text-xl shadow-2xl transition-all transform hover:scale-110 flex items-center gap-3 border-2 border-white/20 hover:border-white/50 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                openTour(tourLocations[0]);
              }}
            >
              <FiMap className="w-7 h-7 animate-bounce" />
              <span className="tracking-wide">Abhi Dekho ✨</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Jump Buttons */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {[charbhujaMandir].map((loc, idx) => (
          <button
            key={idx}
            onClick={() => openTour(loc)}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-saffron/20 hover:border-saffron hover:bg-orange-50 dark:hover:bg-orange-900/20 text-gray-800 dark:text-gray-200 font-bold rounded-xl shadow-md transition-all transform hover:-translate-y-1"
          >
            <span className="text-2xl">{loc.icon}</span>
            <span>{loc.name}</span>
          </button>
        ))}
      </div>
    </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl h-[85vh] sm:h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-saffron">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#1A5C2A] to-green-800 text-white shadow-md z-10">
              <div className="flex items-center gap-3">
                <FiMap className="w-5 h-5 text-saffron animate-pulse" />
                <span className="truncate notranslate">Brahmano Ki Sareri - {currentLocationName}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="p-2 hover:bg-red-500 rounded-full transition-colors flex-shrink-0"
                title="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Quick Select (Optional, but good for switching while inside) */}
            <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex overflow-x-auto">
              {tourLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => openTour(loc)}
                  className={`flex-shrink-0 px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
                    currentLocationName === loc.name 
                      ? 'bg-saffron text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{loc.icon}</span>
                  <span>{loc.name}</span>
                </button>
              ))}
            </div>

            {/* Map iframe */}
            <div className="flex-1 w-full bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
              </div>
              <iframe 
                key={currentEmbedSrc} // Force iframe reload when src changes
                src={currentEmbedSrc} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full relative z-10"
                title={`Sareri Village 360° Street View - ${currentLocationName}`}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualTourBanner;

