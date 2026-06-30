import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import { FaGraduationCap, FaMedal, FaHandsHelping, FaLandmark, FaShieldAlt, FaStar, FaTrophy } from 'react-icons/fa';

const PridePage = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const achRef = ref(rtdb, 'adminData/achievements');
    const unsub = onValue(achRef, (snap) => {
      const data = snap.val();
      if (data) {
        setAchievements(Object.values(data).sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setAchievements([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Education': return <FaGraduationCap />;
      case 'Sports': return <FaMedal />;
      case 'Social Work': return <FaHandsHelping />;
      case 'Panchayat': return <FaLandmark />;
      case 'Military/Police': return <FaShieldAlt />;
      case 'Sareri Shyam Khel Mahotsav': return <FaTrophy />;
      default: return <FaStar />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('/photos/pride_bg.png')" }}>
            <SEO 
        title="Pride of Sareri | Achievements & Khel Mahotsav"
        description="Celebrating the achievements of Brahmano Ki Sareri and showcasing the grand Sareri Shyam Khel Mahotsav."
        url="https://villagesareri.in/pride"
      />

      {/* Overlay — softer than pure black */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 z-0"></div>

      {/* Hero Section */}
      <div className="relative pt-28 pb-10 sm:pt-32 sm:pb-14 flex items-center justify-center overflow-hidden z-10">
        <div className="relative text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent to-yellow-500"></div>
              <FaTrophy className="text-yellow-400 text-2xl sm:text-3xl drop-shadow-[0_0_10px_rgba(255,200,0,0.5)]" />
              <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent to-yellow-500"></div>
            </div>
            <span className="inline-block py-1.5 px-4 rounded-full bg-gradient-to-r from-yellow-500/20 to-saffron/20 text-yellow-400 backdrop-blur-md border border-yellow-500/30 text-xs font-bold tracking-[0.3em] uppercase mb-5 shadow-[0_0_15px_rgba(255,165,0,0.2)]">
              Wall of Honor
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-5 font-heading notranslate drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">Pride of </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-saffron">Sareri</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto font-medium italic leading-relaxed">
              "सरेरी के अनमोल रत्न — जिन्होंने अपनी प्रतिभा, संघर्ष और समर्पण से गाँव का नाम स्वर्णिम अक्षरों में लिखा है।"
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 container mx-auto px-3 sm:px-4 pb-20 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron"></div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 max-w-md mx-auto">
            <FaTrophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/60 mb-2">No achievements listed yet</h3>
            <p className="text-gray-400 text-sm">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 pt-10 sm:pt-14">
            {achievements.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Card */}
                <div className="relative w-full rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-yellow-500/40 p-4 sm:p-5 flex flex-col items-center overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,165,0,0.15)]">
                  
                  {/* Ribbon at top-right corner */}
                  <div className="absolute -top-1 -right-1 z-30">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-yellow-500 to-saffron text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-wider py-1 px-3 sm:px-4 rounded-bl-lg rounded-tr-xl shadow-lg">
                        🏆 Achiever
                      </div>
                      {/* Ribbon fold */}
                      <div className="absolute top-full right-0 w-0 h-0 border-l-[8px] border-l-transparent border-t-[6px] border-t-orange-700"></div>
                    </div>
                  </div>

                  {/* Top glowing line */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent group-hover:via-yellow-400 transition-all duration-500"></div>

                  {/* Profile Photo with golden ring and medal ribbon */}
                  <div className="relative z-10 mb-4 mt-2">
                    {/* Medal ribbon behind the photo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] z-0">
                      <div className="flex gap-0">
                        <div className="w-5 h-14 sm:w-6 sm:h-16 bg-gradient-to-b from-red-500 to-red-700 -skew-x-[15deg] rounded-b-sm opacity-60"></div>
                        <div className="w-5 h-14 sm:w-6 sm:h-16 bg-gradient-to-b from-blue-500 to-blue-700 skew-x-[15deg] rounded-b-sm opacity-60"></div>
                      </div>
                    </div>

                    {/* Photo circle */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full relative z-10 transition-transform duration-500 group-hover:scale-105">
                      {/* Gold ring */}
                      <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-saffron shadow-[0_0_15px_rgba(255,165,0,0.4)]"></div>
                      {/* Photo container */}
                      <div className="absolute inset-[2px] rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border-2 border-black">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="text-2xl opacity-30 text-yellow-400">{getCategoryIcon(item.category)}</div>
                        )}
                      </div>
                    </div>

                    {/* Category medal badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-b from-yellow-400 to-saffron w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white/30">
                        <span className="text-[10px] sm:text-xs drop-shadow-md">{getCategoryIcon(item.category)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="relative z-10 w-full flex flex-col flex-1 items-center mt-3">
                    <h3 className="text-sm sm:text-base font-bold text-white font-heading tracking-wide line-clamp-1 mb-1 drop-shadow-lg">{item.name}</h3>
                    <h4 className="text-[9px] sm:text-[10px] font-bold text-yellow-400 uppercase tracking-[0.15em] line-clamp-2 leading-snug mb-3 min-h-[20px] sm:min-h-[24px] flex items-center">{item.title}</h4>
                    
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-3 mt-auto w-full">
                      {item.year && (
                        <span className="inline-block bg-saffron/20 text-yellow-300 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold border border-saffron/30 backdrop-blur-md">
                          {item.year}
                        </span>
                      )}
                      <span 
                        className={`inline-block bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold border border-white/15 backdrop-blur-md ${item.category === 'Sareri Shyam Khel Mahotsav' ? 'notranslate' : ''}`}
                        translate={item.category === 'Sareri Shyam Khel Mahotsav' ? 'no' : undefined}
                      >
                        {item.category}
                      </span>
                    </div>

                    {item.desc && (
                      <div className="relative mt-2 pt-2 border-t border-white/10 w-full">
                        <p className="text-gray-400 text-[9px] sm:text-[10px] leading-relaxed italic font-medium line-clamp-3 group-hover:text-gray-200 transition-colors duration-300">
                          "{item.desc}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-2 border-t border-white/10 w-full">
                    <p className="text-[7px] sm:text-[8px] text-yellow-500/40 uppercase tracking-[0.2em] font-bold notranslate">Village Sareri Official</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Page footer ornament */}
      <div className="relative z-10 pb-8 flex items-center justify-center gap-3 px-4">
        <div className="h-[1px] flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-yellow-600/30"></div>
        <FaStar className="text-yellow-600/30 text-xs" />
        <div className="h-[1px] flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-yellow-600/30"></div>
      </div>
    </div>
  );
};

export default PridePage;
