import { motion } from 'framer-motion';

const Gallery = ({ title = "Village Gallery", folder = "slideshow", description = "Beautiful moments from Brahmano Ki Sareri." }) => {
  const encodeMediaUrl = (rawPath) => {
    if (!rawPath) return '';
    const parts = rawPath.split('/');
    const filename = parts.pop();
    return parts.join('/') + '/' + encodeURIComponent(filename);
  };

  // Dynamically load all media files from all subdirectories, then filter by the provided folder
  const rawFiles = import.meta.glob('/public/photos/**/*.{jpg,jpeg,png,mp4,MOV,webm}', { eager: false });
  
  const images = Object.keys(rawFiles)
    .filter(path => path.includes(`/public/photos/${folder}/`))
    .map((path, index) => {
      const rawSrc = path.replace('/public', '');
      const src = encodeMediaUrl(rawSrc);
      const isVideo = src.match(/\.(mp4|MOV|webm)$/i);
      return {
        id: index + 1,
        src: src,
        isVideo: !!isVideo,
        title: isVideo ? `${title} (Video)` : title,
        desc: description
      };
    });

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-200 dark:border-gray-800 bg-black aspect-video flex items-center justify-center"
              >
                {item.isVideo ? (
                  <video 
                    src={item.src} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    controls
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <img 
                    src={item.src} 
                    alt={item.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12 bg-white dark:bg-darkCard rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">No media uploaded yet for this event.</p>
        )}
      </div>
    </section>
  );
};

export default Gallery;
