import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiBell } from 'react-icons/fi';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import NewsShareButtons from '../components/NewsShareButtons';

const NewsList = () => {
  const [newsUpdates, setNewsUpdates] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);

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
    if (newsUpdates.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('id');
      const hashId = window.location.hash
        ? window.location.hash.replace('#news-', '').replace('#', '')
        : null;
      const targetId = queryId || hashId;

      if (targetId) {
        setHighlightedId(targetId);
        setTimeout(() => {
          const el = document.getElementById(`news-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 350);

        const timer = setTimeout(() => {
          setHighlightedId(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
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
              className={`bg-white dark:bg-gray-800 rounded-3xl overflow-hidden transition-all duration-500 transform hover:-translate-y-1 scroll-mt-28 ${
                item.id === highlightedId
                  ? 'ring-4 ring-saffron shadow-2xl shadow-orange-500/30 scale-[1.01] border-2 border-saffron'
                  : 'border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl'
              }`}
            >
              {item.id === highlightedId && (
                <div className="bg-gradient-to-r from-saffron to-orange-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between animate-pulse">
                  <span>🎯 यह खबर लिंक से खोली गई है (Shared Article)</span>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-black/20 px-2 py-0.5 rounded-full">Active</span>
                </div>
              )}
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
