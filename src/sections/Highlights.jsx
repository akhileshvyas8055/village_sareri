import { motion } from 'framer-motion';
import { FiBookOpen, FiActivity, FiShoppingCart, FiDroplet } from 'react-icons/fi';
import { FaVihara, FaTractor } from 'react-icons/fa';

const Highlights = () => {
  const encodeMediaUrl = (rawPath) => {
    if (!rawPath) return '';
    const parts = rawPath.split('/');
    const filename = parts.pop();
    return parts.join('/') + '/' + encodeURIComponent(filename);
  };

  // Dynamically grab the first media file from each folder to use as a highlight
  const rawSchoolFiles = import.meta.glob('/public/photos/school/*.{jpg,jpeg,png,mp4,MOV,webm}', { eager: false });
  const rawSchoolPath = Object.keys(rawSchoolFiles)[0]?.replace('/public', '') || '';
  const schoolMedia = encodeMediaUrl(rawSchoolPath);

  const rawPondFiles = import.meta.glob('/public/photos/pond/*.{jpg,jpeg,png,mp4,MOV,webm}', { eager: false });
  const rawPondPath = Object.keys(rawPondFiles)[0]?.replace('/public', '') || '';
  const pondMedia = encodeMediaUrl(rawPondPath);

  const rawRamlilaFiles = import.meta.glob('/public/photos/ramlila/*.{jpg,jpeg,png,mp4,MOV,webm}', { eager: false });
  const rawRamlilaPath = Object.keys(rawRamlilaFiles)[0]?.replace('/public', '') || '';
  const ramlilaMedia = encodeMediaUrl(rawRamlilaPath);

  const rawMandirFiles = import.meta.glob('/public/photos/mandir/*.{jpg,jpeg,png,mp4,MOV,webm}', { eager: false });
  const rawMandirPath = Object.keys(rawMandirFiles)[0]?.replace('/public', '') || '';
  const mandirMedia = encodeMediaUrl(rawMandirPath);

  const highlights = [
    {
      id: 1,
      title: 'Schools & Education',
      desc: 'Providing quality education with modern facilities to shape the future of our village children.',
      icon: <FiBookOpen className="w-6 h-6" />,
      image: schoolMedia.match(/\.(mp4|MOV|webm)$/i) ? '' : schoolMedia,
      video: schoolMedia.match(/\.(mp4|MOV|webm)$/i) ? schoolMedia : '',
      color: 'from-blue-500/80 to-blue-900/90'
    },
    {
      id: 2,
      title: 'Ramleela Tradition',
      desc: 'Over 50 years of rich cultural heritage where locals perform the epic of Ramayana.',
      icon: <FaVihara className="w-6 h-6" />,
      image: ramlilaMedia.match(/\.(mp4|MOV|webm)$/i) ? '' : ramlilaMedia,
      video: ramlilaMedia.match(/\.(mp4|MOV|webm)$/i) ? ramlilaMedia : '',
      color: 'from-orange-500/80 to-red-900/90'
    },
    {
      id: 3,
      title: 'Healthcare Center',
      desc: 'Primary health center ensuring wellness and medical support for the entire community.',
      icon: <FiActivity className="w-6 h-6" />,
      image: '',
      video: '/photos/hospital.mp4',
      color: 'from-emerald-500/80 to-teal-900/90'
    },
    {
      id: 4,
      title: 'Local Markets',
      desc: 'Vibrant local markets offering fresh produce, traditional crafts, and daily essentials.',
      icon: <FiShoppingCart className="w-6 h-6" />,
      image: '/photos/local_market.jpg',
      video: '',
      color: 'from-purple-500/80 to-indigo-900/90'
    },
    {
      id: 5,
      title: 'Lush Farms',
      desc: 'Expansive agricultural lands that are the backbone of our economy and green ecosystem.',
      icon: <FaTractor className="w-6 h-6" />,
      image: '',
      video: '/photos/Cotton_Farm.mp4',
      color: 'from-green-500/80 to-emerald-900/90'
    },
    {
      id: 6,
      title: 'Lakes & Ponds',
      desc: 'Beautiful water bodies like Naya Talab that sustain life, agriculture, and offer serene viewpoints.',
      icon: <FiDroplet className="w-6 h-6" />,
      image: pondMedia.match(/\.(mp4|MOV|webm)$/i) ? '' : pondMedia,
      video: pondMedia.match(/\.(mp4|MOV|webm)$/i) ? pondMedia : '',
      color: 'from-cyan-500/80 to-blue-900/90'
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-darkCard relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-4"
          >
            Village <span className="text-saffron">Highlights</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-saffron mx-auto rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg"
          >
            Discover the key pillars that make Brahmano Ki Sareri a self-sustaining, vibrant, and beautiful community.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {highlights.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative h-[350px] sm:h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                {item.video ? (
                  <video 
                    src={item.video} 
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${item.color} transition-transform duration-700 group-hover:scale-110 flex items-center justify-center opacity-80`}>
                     <span className="text-white/30 font-heading tracking-widest uppercase text-lg rotate-12 font-bold">Add Image</span>
                  </div>
                )}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end h-full">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-6 border border-white/30 shadow-lg transform group-hover:-translate-y-2 transition-transform duration-500">
                  {item.icon}
                </div>
                
                <h3 className="text-2xl font-bold font-heading text-white mb-3 transform group-hover:-translate-y-2 transition-transform duration-500 delay-75">
                  {item.title}
                </h3>
                
                <p className="text-gray-300 font-medium leading-relaxed transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                  {item.desc}
                </p>
                
                {/* Decorative Line that expands on hover */}
                <div className="w-0 h-1 bg-saffron mt-4 rounded-full group-hover:w-16 transition-all duration-500 delay-200" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
