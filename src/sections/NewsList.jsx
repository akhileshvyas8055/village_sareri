import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiBell } from 'react-icons/fi';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import NewsShareButtons from '../components/NewsShareButtons';
import ImagePreview from '../components/ImagePreview';
import SEO from '../components/SEO';
import { getNewsDisplayImage, getNewsCoverImageUrl, NEWS_FALLBACK_COVER } from '../utils/newsImage';

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

  // Find active shared article for dynamic per-article SEO
  const activeArticle = useMemo(() => {
    if (!highlightedId || newsUpdates.length === 0) return null;
    return newsUpdates.find((item) => item.id === highlightedId) || null;
  }, [highlightedId, newsUpdates]);

  const seoTitle = activeArticle
    ? `${activeArticle.title} | Village Sareri News`
    : 'Village News & Updates | Latest Sareri Samachar';

  const seoDesc = activeArticle
    ? (activeArticle.desc ? activeArticle.desc.replace(/\s+/g, ' ').slice(0, 160) : 'ब्राह्मणों की सरेरी गांव के ताज़ा समाचार एवं महत्वपूर्ण अपडेट।')
    : 'ब्राह्मणों की सरेरी, भीलवाड़ा (राजस्थान) के ताज़ा समाचार, ग्राम पंचायत घोषणाएं, सरकारी योजनाएं, विकास कार्य एवं महत्वपूर्ण जनहित सूचनाएं।';

  const seoUrl = activeArticle
    ? `https://villagesareri.in/news?id=${encodeURIComponent(activeArticle.id)}`
    : 'https://villagesareri.in/news';

  const seoImage = activeArticle
    ? getNewsCoverImageUrl(activeArticle)
    : NEWS_FALLBACK_COVER;

  const breadcrumbs = activeArticle
    ? [
        { name: 'Home', url: 'https://villagesareri.in/' },
        { name: 'News & Updates', url: 'https://villagesareri.in/news' },
        { name: activeArticle.title, url: seoUrl }
      ]
    : [
        { name: 'Home', url: 'https://villagesareri.in/' },
        { name: 'News & Updates', url: 'https://villagesareri.in/news' }
      ];

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDesc}
        url={seoUrl}
        image={seoImage}
        type={activeArticle ? 'article' : 'website'}
        breadcrumbs={breadcrumbs}
      />
      <section className="py-24 bg-white dark:bg-darkCard transition-colors min-h-screen notranslate">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="mb-10 text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4"
            >
              News & <span className="text-saffron">Updates</span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-1 bg-saffron rounded-full mx-auto md:mx-0"
            />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              ब्राह्मणों की सरेरी — गाँव के ताज़ा समाचार, पंचायत आदेश व सार्वजनिक सूचनाएं
            </p>
          </div>

          <div className="space-y-6">
            {newsUpdates.length === 0 && (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No news updates available at the moment.</p>
              </div>
            )}
            {newsUpdates.map((item, index) => {
              const displayImg = getNewsDisplayImage(item);
              const hasCustomImg = Boolean(item.image);

              return (
                <motion.article 
                  key={item.id}
                  id={`news-${item.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.5) }}
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

                  {hasCustomImg && (
                    <ImagePreview
                      src={displayImg}
                      alt={item.title || 'Village Sareri Samachar'}
                      className="relative h-56 w-full cursor-zoom-in overflow-hidden bg-gray-100 dark:bg-gray-900 md:h-80 group"
                    >
                      <img
                        src={displayImg}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading={index < 2 ? 'eager' : 'lazy'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = NEWS_FALLBACK_COVER;
                        }}
                      />
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </ImagePreview>
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
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight font-heading">{item.title}</h2>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed whitespace-pre-wrap">{item.desc}</p>

                    {/* Share News with Clean Canonical URL & Cover Photo */}
                    <NewsShareButtons item={item} />
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default NewsList;
