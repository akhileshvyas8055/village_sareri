import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import { FaGraduationCap, FaMedal, FaHandsHelping, FaLandmark, FaShieldAlt, FaStar } from 'react-icons/fa';

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
      case 'Education': return <FaGraduationCap className="text-blue-500" />;
      case 'Sports': return <FaMedal className="text-yellow-500" />;
      case 'Social Work': return <FaHandsHelping className="text-green-500" />;
      case 'Panchayat': return <FaLandmark className="text-indigo-500" />;
      case 'Military/Police': return <FaShieldAlt className="text-red-500" />;
      default: return <FaStar className="text-saffron" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <SEO 
        title="Pride of Sareri | Village Achievements"
        description="Wall of Fame of Brahmano Ki Sareri. Highlighting the incredible achievements of our youth and community members in education, sports, social work, and more."
      />

      {/* Hero Section with Custom Background */}
      <div className="relative pt-24 pb-32 flex items-center justify-center overflow-hidden min-h-[40vh]">
        <div className="absolute inset-0 z-0">
          <img 
            src="/photos/pride_bg.png" 
            alt="Pride of Sareri Background" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-yellow-500/20 text-yellow-300 backdrop-blur-sm border border-yellow-500/30 text-sm font-bold tracking-widest uppercase mb-4">
              Wall of Fame
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading drop-shadow-lg">
              Pride of <span className="text-saffron">Sareri</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow-md">
              सरेरी गाँव की शान — शिक्षा, खेलकूद, और समाज सेवा में हमारे गाँव का नाम रोशन करने वाले होनहार अचीवर्स।
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 container mx-auto px-4 py-16 -mt-10 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron"></div>
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
            <FaStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No achievements listed yet</h3>
            <p className="text-gray-500">Check back soon for updates on our village achievers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {achievements.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(255,153,51,0.1)] transition-all duration-300 border border-gray-100 overflow-hidden group"
              >
                <div className="h-48 overflow-hidden relative bg-gray-100">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                      {getCategoryIcon(item.category)}
                      <span className="text-sm mt-2 font-medium opacity-50">No Image</span>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                    {getCategoryIcon(item.category)}
                    <span className="text-gray-800">{item.category}</span>
                  </div>
                  
                  {/* Year Badge */}
                  {item.year && (
                    <div className="absolute top-4 right-4 bg-saffron text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {item.year}
                    </div>
                  )}
                </div>

                <div className="p-6 relative">
                  {/* Decorative quote mark */}
                  <div className="absolute -top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-saffron opacity-80">
                    <FaStar className="w-5 h-5" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.name}</h3>
                  <h4 className="text-sm font-bold text-saffron mb-4 uppercase tracking-wider">{item.title}</h4>
                  
                  {item.desc && (
                    <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      "{item.desc}"
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PridePage;
