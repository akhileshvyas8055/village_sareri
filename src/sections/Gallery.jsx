import { useState } from 'react';

const GalleryCard = ({ item, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div
      onClick={onClick}
      className="relative bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group h-48"
    >
      {/* SKELETON LOADER (Visible until video/image is loaded) */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse flex flex-col items-center justify-center p-4">
          {item.isVideo ? (
            <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-600 flex items-center justify-center shadow-inner">
              <svg className="w-6 h-6 fill-current animate-pulse" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-400">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
          )}
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-2">
            {item.isVideo ? 'वीडियो लोड हो रही है...' : 'लोड हो रहा है...'}
          </span>
        </div>
      )}

      {/* MEDIA CONTENT */}
      {item.isVideo ? (
        (item.isYouTube || item.youtubeId || item.src?.includes('youtube.com') || item.src?.includes('youtu.be')) ? (
          <div className="relative w-full h-48 bg-black overflow-hidden">
            <img 
              src={item.thumbnail || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : item.src)}
              alt={item.title}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => {
                // fallback to direct load if thumbnail errors
                setIsLoaded(true);
              }}
              className={`w-full h-48 object-cover group-hover:scale-105 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        ) : item.src.includes('drive.google.com') ? (
          <iframe
            src={item.src.replace('uc?export=view&id=', 'file/d/') + '/preview'}
            className={`w-full h-48 border-0 pointer-events-none object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            allow="autoplay"
            title={item.title}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        ) : (
          <video 
            src={item.src} 
            muted 
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => setIsLoaded(true)}
            onCanPlay={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-48 object-cover pointer-events-none group-hover:scale-105 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )
      ) : (
        <img 
          src={item.src} 
          alt={item.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-48 object-cover group-hover:scale-105 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Video Indicator Badge */}
      {item.isVideo && isLoaded && (
        <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm border border-white/20">
          <svg className="w-2.5 h-2.5 fill-current text-orange-400" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          <span>वीडियो</span>
        </div>
      )}
      
      {/* Title Label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-6 z-10">
        <h3 className="text-white text-xs sm:text-sm font-semibold truncate drop-shadow-sm">{item.title}</h3>
      </div>
    </div>
  );
};

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

  // Combine and strictly exclude ramlila_media_3.mp4
  const images = [...localImages, ...formattedExternal].filter(item => {
    const src = (item.src || '').toLowerCase();
    const itemTitle = (item.title || '').toLowerCase();
    return !src.includes('ramlila_media_3') && !itemTitle.includes('ramlila_media_3');
  });

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
    <section className="py-12 bg-white dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8 border-b-2 border-saffron pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-heading">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
            {description}
          </p>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onClick={() => setSelectedMedia(item)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 py-8 italic">No media available in this section.</p>
        )}
      </div>

      {/* Modal for Zoomed View */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 md:p-8 backdrop-blur-sm"
          onClick={() => setSelectedMedia(null)}
        >
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrev} 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/60 hover:bg-black/90 p-3 rounded-full border border-white/20 transition-all z-20"
                aria-label="Previous media"
              >
                &larr; Prev
              </button>
              <button 
                onClick={handleNext} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/60 hover:bg-black/90 p-3 rounded-full border border-white/20 transition-all z-20"
                aria-label="Next media"
              >
                Next &rarr;
              </button>
            </>
          )}

          <div 
            className="relative max-w-5xl w-full bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-2xl shadow-2xl flex flex-col items-center overflow-hidden border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full w-9 h-9 font-bold shadow-lg flex items-center justify-center z-20 transition-all"
              aria-label="Close media preview"
            >
              &times;
            </button>

            {selectedMedia.isVideo ? (
              (selectedMedia.isYouTube || selectedMedia.youtubeId || selectedMedia.src?.includes('youtube.com') || selectedMedia.src?.includes('youtu.be')) ? (
                <iframe
                  src={selectedMedia.embedUrl || `https://www.youtube-nocookie.com/embed/${selectedMedia.youtubeId || (selectedMedia.src?.includes('v=') ? selectedMedia.src.split('v=')[1]?.split('&')[0] : selectedMedia.src?.split('/').pop())}?autoplay=1&rel=0`}
                  className="w-full h-[60vh] rounded-xl border-0 shadow-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedMedia.title}
                />
              ) : selectedMedia.src.includes('drive.google.com') ? (
                <iframe
                  src={selectedMedia.src.replace('uc?export=view&id=', 'file/d/') + '/preview'}
                  className="w-full h-[60vh] rounded-xl"
                  allow="autoplay"
                  title={selectedMedia.title}
                />
              ) : (
                <video src={selectedMedia.src} autoPlay controls className="max-h-[70vh] w-auto rounded-xl shadow-md" />
              )
            ) : (
              <img src={selectedMedia.src} alt={selectedMedia.title} className="max-h-[70vh] w-auto rounded-xl shadow-md object-contain" />
            )}
            
            <div className="w-full p-4 text-center border-t border-gray-100 dark:border-gray-800 mt-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedMedia.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">{selectedMedia.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
