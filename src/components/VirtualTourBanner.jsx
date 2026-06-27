import React, { useState } from 'react';
import { FiMap, FiX } from 'react-icons/fi';

const VirtualTourBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className="relative w-full overflow-hidden my-12 group cursor-pointer border-y-4 border-[#1A5C2A]/20" 
        onClick={() => setIsModalOpen(true)}
      >
        {/* Background Image with Zoom/Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out group-hover:scale-110"
          style={{ 
            backgroundImage: "url('/photos/About.jpeg')", 
            backgroundPosition: 'center 40%'
          }}
        ></div>
        
        {/* Earthy Gradient Overlay (Green, Orange, Mitti color) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A5C2A]/90 via-[#8B4513]/80 to-[#FF6B00]/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <div className="relative z-10 container mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="text-white max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4 drop-shadow-xl flex flex-col md:flex-row items-center gap-3">
              <FiMap className="text-saffron w-10 h-10 md:w-12 md:h-12 animate-bounce" /> 
              <span>Gaon Ghumao - Virtual Tour</span>
            </h2>
            <p className="text-lg md:text-2xl font-medium text-orange-100 drop-shadow-md border-l-4 border-saffron pl-4 inline-block">
              Brahmano Ki Sareri ka 360° nazar se darshan karo
            </p>
          </div>
          
          {/* Glowing Button */}
          <div className="relative mt-4 md:mt-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-saffron to-yellow-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <button 
              className="relative px-8 py-4 bg-gradient-to-r from-orange-600 to-saffron text-white font-bold rounded-full text-lg shadow-2xl transition-transform transform hover:scale-105 flex items-center gap-2"
            >
              Abhi Dekho <span>✨</span>
            </button>
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
