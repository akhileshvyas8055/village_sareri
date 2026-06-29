import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = ({ title = "Village Gallery", folder = "slideshow", description = "Beautiful moments from Brahmano Ki Sareri.", externalLinks = [] }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

  const encodeMediaUrl = (rawPath) => {
    if (!rawPath) return '';
    const parts = rawPath.split('/');
    const filename = parts.pop();
    return parts.join('/') + '/' + encodeURIComponent(filename);
  };

  // Dynamically load all media files from all subdirectories, then filter by the provided folder
  const rawFiles = import.meta.glob('/public/photos/**/*.{jpg,jpeg,png,mp4,MOV,webm}', { eager: false });
  
  const localImages = Object.keys(rawFiles)
    .filter(path => path.includes(`/public/photos/${folder}/`))
    .map((path, index) => {
      const rawSrc = path.replace('/public', '');
      const src = encodeMediaUrl(rawSrc);
      const isVideo = src.match(/\.(mp4|MOV|webm)$/i);
      return {
        id: `local-${index}`,
        src: src,
        isVideo: !!isVideo,
        title: isVideo ? `${title} (Video)` : title,
        desc: description
      };
    });

  // Map external links to the same format
  const formattedExternal = externalLinks.map((link, index) => ({
    id: `ext-${index}`,
    src: link.src,
    isVideo: link.isVideo || false,
    title: link.title || title,
    desc: link.desc || description
  }));

  const images = [...localImages, ...formattedExternal];

  const handlePrev = (e) => {
    e.stopPropagation();
    if (!selectedMedia) return;
    const currentIndex = images.findIndex(img => img.id === selectedMedia.id);
    if (currentIndex > 0) {
      setSelectedMedia(images[currentIndex - 1]);
    } else {
      setSelectedMedia(images[images.length - 1]);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (!selectedMedia) return;
    const currentIndex = images.findIndex(img => img.id === selectedMedia.id);
    if (currentIndex < images.length - 1) {
      setSelectedMedia(images[currentIndex + 1]);
    } else {
      setSelectedMedia(images[0]);
    }
  };

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-10 text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-2"
          >
            {title.split(' ')[0]} <span className="text-saffron">{title.split(' ').slice(1).join(' ')}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-300"
          >
            {description}
          </motion.p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-2 md:gap-6">
            {images.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => setSelectedMedia(item)}
                className="relative rounded-xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-gray-200/50 dark:border-gray-800/50 bg-gray-200 dark:bg-gray-800 flex items-center justify-center cursor-pointer"
              >
                {item.isVideo ? (
                  <video 
                    src={item.src} 
                    muted 
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-32 sm:h-48 md:h-80 object-cover md:object-contain transform transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                  />
                ) : (
                  <img 
                    src={item.src} 
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-32 sm:h-48 md:h-80 object-cover md:object-contain transform transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                {/* Stylish Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-6 pointer-events-none">
                  <h3 className="text-white font-bold text-sm md:text-xl drop-shadow-md">{item.title}</h3>
                  {item.isVideo && <p className="text-gray-300 text-[10px] md:text-xs mt-1 uppercase tracking-widest">Video</p>}
                </div>
                
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12 bg-white dark:bg-darkCard rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">No media uploaded yet for this event.</p>
        )}
      </div>

      {/* Modal for Zoomed View */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
            onClick={() => setSelectedMedia(null)}
          >
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white hover:text-saffron bg-black/50 hover:bg-black/80 rounded-full p-2 md:p-3 transition-all z-50"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white hover:text-saffron bg-black/50 hover:bg-black/80 rounded-full p-2 md:p-3 transition-all z-50"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-7xl max-h-[90vh] flex flex-col items-center justify-center border-2 md:border-4 border-saffron rounded-lg bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button on the border */}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-4 -right-4 md:-top-5 md:-right-5 text-white bg-saffron hover:bg-orange-600 border-2 border-white rounded-full p-1.5 md:p-2 transition-all z-50 shadow-xl"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              {selectedMedia.isVideo ? (
                <video 
                  src={selectedMedia.src} 
                  autoPlay 
                  controls 
                  className="w-full h-auto max-h-[85vh] object-contain rounded-sm"
                />
              ) : (
                <img 
                  src={selectedMedia.src} 
                  alt={selectedMedia.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-sm"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-center rounded-b-lg pointer-events-none">
                <h3 className="text-white text-lg md:text-2xl font-bold">{selectedMedia.title}</h3>
                <p className="text-gray-300 text-sm md:text-base mt-1">{selectedMedia.desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
