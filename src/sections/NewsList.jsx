import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiBell } from 'react-icons/fi';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import NewsShareButtons from '../components/NewsShareButtons';

const NewsList = () => {
  const [newsUpdates, setNewsUpdates] = useState([]);

  useEffect(() => {
    const newsRef = ref(rtdb, 'adminData/news');
    const unsubNews = onValue(newsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newsArray = Object.entries(data).map(([id, val]) => ({
          id,
          ...val
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setNewsUpdates(newsArray);
      } else {
        setNewsUpdates([]);
      }
    });

    return () => {
      unsubNews();
    };
  }, []);

  useEffect(() => {
    if (newsUpdates.length > 0 && window.location.hash) {
      const targetId = window.location.hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [newsUpdates]);

  return (
    <section className="py-24 bg-white dark:bg-darkCard transition-colors min-h-screen notranslate">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="mb-10 text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4"
          >
            News & <span className="text-saffron">Updates</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-1 bg-saffron rounded-full mx-auto md:mx-0"
          />
        </div>

        <div className="space-y-6">
          {newsUpdates.length === 0 && (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No news updates available at the moment.</p>
            </div>
          )}
          {newsUpdates.map((item, index) => (
            <motion.div 
              key={item.id}
              id={`news-${item.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 scroll-mt-28"
            >
              {item.image && (
                <div className="w-full h-56 md:h-80 overflow-hidden relative group cursor-pointer">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              
              <div className="p-6 md:p-8 relative">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-4 py-1.5 bg-saffron/10 text-saffron text-xs font-bold uppercase rounded-full tracking-wider flex items-center gap-1.5 border border-saffron/20">
                    {item.type === 'Notice' && <FiBell />}
                    {item.type === 'Event' && <FiCalendar />}
                    {item.type === 'Announcement' && <FiBell />}
                    {item.type || 'News'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-bold bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full">{item.date}</span>
                </div>
                
                <h4 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight font-heading">{item.title}</h4>
                
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap">{item.desc}</p>

                {/* Share News with Cover Photo */}
                <NewsShareButtons item={item} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsList;
