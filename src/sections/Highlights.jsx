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
      icon: <FiBookOpen className="w-5 h-5 md:w-6 md:h-6" />,
      image: schoolMedia.match(/\.(mp4|MOV|webm)$/i) ? '' : schoolMedia,
      video: schoolMedia.match(/\.(mp4|MOV|webm)$/i) ? schoolMedia : '',
      color: 'from-blue-500/80 to-blue-900/90'
    },
    {
      id: 2,
      title: 'Ramleela Tradition',
      desc: 'Over 50 years of rich cultural heritage where locals perform the epic of Ramayana.',
      icon: <FaVihara className="w-5 h-5 md:w-6 md:h-6" />,
      image: ramlilaMedia.match(/\.(mp4|MOV|webm)$/i) ? '' : ramlilaMedia,
      video: ramlilaMedia.match(/\.(mp4|MOV|webm)$/i) ? ramlilaMedia : '',
      color: 'from-orange-500/80 to-red-900/90'
    },
    {
      id: 3,
      title: 'Healthcare Center',
      desc: 'Primary health center ensuring wellness and medical support for the entire community.',
      icon: <FiActivity className="w-5 h-5 md:w-6 md:h-6" />,
      image: '',
      video: '/photos/hospital.mp4',
      color: 'from-emerald-500/80 to-teal-900/90'
    },
    {
      id: 4,
      title: 'Local Markets & Culture',
      desc: 'Vibrant village traditions, crafts, community gatherings, and daily village life.',
      icon: <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6" />,
      image: '/photos/village_hero_poster.png',
      video: '',
      color: 'from-purple-500/80 to-indigo-900/90'
    },
    {
      id: 5,
      title: 'Lush Farms',
      desc: 'Expansive agricultural lands that are the backbone of our economy and green ecosystem.',
      icon: <FaTractor className="w-5 h-5 md:w-6 md:h-6" />,
      image: '',
      video: '/photos/Cotton_Farm.mp4',
      color: 'from-green-500/80 to-emerald-900/90'
    },
    {
      id: 6,
      title: 'Lakes & Ponds',
      desc: 'Beautiful water bodies like Naya Talab that sustain life, agriculture, and offer serene viewpoints.',
      icon: <FiDroplet className="w-5 h-5 md:w-6 md:h-6" />,
      image: pondMedia.match(/\.(mp4|MOV|webm)$/i) ? '' : pondMedia,
      video: pondMedia.match(/\.(mp4|MOV|webm)$/i) ? pondMedia : '',
      color: 'from-cyan-500/80 to-blue-900/90'
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#1A1A1A] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-4">
            Village <span className="text-saffron">Highlights</span>
          </h2>
          <div className="w-20 h-1 bg-saffron mx-auto rounded-full mb-4" />
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-base md:text-lg px-2">
            Discover the key pillars that make <span className="notranslate font-semibold">Brahmano Ki Sareri</span> a self-sustaining, vibrant, and beautiful community.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {highlights.map((item) => (
            <div
              key={item.id}
              className="group relative h-[180px] sm:h-[220px] md:h-[350px] rounded-2xl md:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800"
            >
              {/* Background Image / Video */}
              <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-800">
                {item.video ? (
                  <video 
                    src={item.video} 
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                  />
                ) : item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${item.color} flex items-center justify-center opacity-80`}>
                     <span className="text-white/30 font-heading tracking-widest uppercase text-xs md:text-sm rotate-12 font-bold">Media Pending</span>
                  </div>
                )}
              </div>

              {/* Gradient Overlay for Readability (Always Visible) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Content (Always Visible for Mobile) */}
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-5 flex flex-col justify-end h-full">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 mb-1 md:mb-2 mt-auto">
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-md flex flex-shrink-0 items-center justify-center text-white border border-white/20 shadow-sm">
                    {/* Resizing icons slightly for mobile */}
                    <div className="scale-75 md:scale-100 flex items-center justify-center">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-2xl font-bold font-heading text-white leading-tight drop-shadow-md">
                    {item.title}
                  </h3>
                </div>
                
                <p className="text-gray-200 text-[10px] sm:text-xs md:text-base font-medium leading-snug drop-shadow-sm line-clamp-2 md:line-clamp-none md:ml-[60px]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
