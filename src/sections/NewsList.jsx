import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiBell } from 'react-icons/fi';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const NewsList = () => {
  const [newsUpdates, setNewsUpdates] = useState([]);

  useEffect(() => {
    const newsRef = ref(rtdb, 'adminData/news');
    const unsubNews = onValue(newsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newsArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setNewsUpdates(newsArray);
      } else {
        setNewsUpdates([]);
      }
    });

    return () => {
      unsubNews();
    };
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-darkCard transition-colors min-h-screen">
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
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 border-l-4 border-l-saffron hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="px-3 py-1 bg-saffron/10 text-saffron text-xs font-bold uppercase rounded-full tracking-wider flex items-center gap-1">
                  {item.type === 'Notice' && <FiBell />}
                  {item.type === 'Event' && <FiCalendar />}
                  {item.type === 'Announcement' && <FiBell />}
                  {item.type}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.date}</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsList;
