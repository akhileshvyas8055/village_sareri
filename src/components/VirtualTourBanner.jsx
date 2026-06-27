import React, { useState } from 'react';
import { FiMap, FiX } from 'react-icons/fi';

const VirtualTourBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <div className="container mx-auto px-4 my-16">
      <div 
        className="relative w-full overflow-hidden rounded-3xl shadow-2xl group cursor-pointer border border-[#FF6B00]/30 hover:border-[#FF6B00]/70 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(255,107,0,0.3)]"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Background Image with Zoom Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms] ease-out group-hover:scale-110"
          style={{ 
            backgroundImage: "url('/photos/About.jpeg')", 
            backgroundPosition: 'center 40%'
          }}
        ></div>
        
        {/* Elegant Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A5C2A] via-[#1A5C2A]/80 to-transparent mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        {/* Decorative Blurred Circles */}
        <div className="absolute -right-20 -top-20 w-64 h-64 border-[30px] border-white/5 rounded-full blur-xl group-hover:border-saffron/20 transition-all duration-700"></div>
        <div className="absolute right-40 bottom-10 w-32 h-32 bg-saffron/20 rounded-full blur-2xl group-hover:bg-saffron/40 transition-all duration-700"></div>

        <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="text-white max-w-2xl relative">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 group-hover:bg-saffron/20 transition-colors">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-saffron"></span>
              </span>
              <span className="text-xs font-bold tracking-wider text-saffron uppercase">Street View Added</span>
            </div>

            {/* Typography */}
            <h2 className="text-4xl md:text-6xl font-heading font-extrabold mb-4 drop-shadow-xl flex flex-col md:flex-row items-start md:items-center gap-3 text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-saffron to-yellow-300">
                Gaon Ghumao
              </span>
              <span className="hidden md:inline text-gray-300 font-light">|</span>
              <span className="text-2xl md:text-4xl font-light text-gray-200">Virtual Tour</span>
            </h2>
            <p className="text-lg md:text-2xl font-medium text-gray-200 drop-shadow-md border-l-4 border-saffron pl-5 py-1">
              Brahmano Ki Sareri ka <span className="font-bold text-white">360° nazar</span> se darshan karo, kahin se bhi.
            </p>
          </div>
          
          {/* Glowing CTA Button */}
          <div className="relative mt-6 md:mt-0 shrink-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-saffron via-orange-500 to-yellow-400 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse"></div>
            <button 
              className="relative px-8 py-5 md:px-10 md:py-5 bg-gradient-to-r from-orange-600 to-saffron text-white font-extrabold rounded-full text-xl shadow-2xl transition-all transform group-hover:scale-105 flex items-center gap-3 border border-orange-400/50"
            >
              <FiMap className="w-6 h-6 animate-bounce" />
              Abhi Dekho ✨
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-6xl h-[85vh] sm:h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border-2 border-saffron">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#1A5C2A] to-green-800 text-white shadow-md z-10">
              <h3 className="font-heading font-bold text-lg sm:text-xl flex items-center gap-2">
                <FiMap className="text-saffron" /> 
                <span className="truncate">Brahmano Ki Sareri - 360° Street View</span>
              </h3>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
                className="p-2 hover:bg-red-500 rounded-full transition-colors flex-shrink-0"
                title="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Map iframe */}
            <div className="flex-1 w-full bg-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin"></div>
              </div>
              <iframe 
                src="https://maps.google.com/maps?q=Brahmano%20Ki%20Sareri,%20Bhilwara,%20Rajasthan&layer=c&cbll=25.777,74.453&output=svembed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full relative z-10"
                title="Sareri Village Street View"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VirtualTourBanner;
