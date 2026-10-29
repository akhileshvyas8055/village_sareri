import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import {
  LuNewspaper,
  LuCalendar,
  LuArrowRight,
  LuTag,
  LuImageOff
} from 'react-icons/lu';

const LatestNewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newsRef = ref(rtdb, 'adminData/news');
    const unsubscribe = onValue(
      newsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          }));

          // Sort descending by timestamp or date
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          // Take latest 3 authentic news items
          setNews(list.slice(0, 3));
        } else {
          setNews([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-[#0B1120] transition-colors border-t border-slate-200/60 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0D477A] dark:text-white font-heading tracking-tight">
              Latest Village News <span className="text-slate-400 dark:text-slate-500 font-light">/</span> गाँव की ताज़ा खबरें
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              सरेरी की विकास यात्रा, सामाजिक कार्यक्रम एवं जनहित समाचार
            </p>
          </div>

          <Link
            to="/news"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 text-sm font-semibold transition-all shadow-sm hover:shadow shrink-0 min-h-[44px]"
            aria-label="View all news"
          >
            <span>सभी समाचार देखें (View All)</span>
            <LuArrowRight className="w-4 h-4 text-[#0D9488]" />
          </Link>
        </div>

        {/* News Items Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-200/70 dark:border-slate-700/60 animate-pulse"
              >
                <div className="h-44 bg-slate-200 dark:bg-slate-700"></div>
                <div className="p-5">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <LuNewspaper className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              अभी कोई नया समाचार उपलब्ध नहीं है।
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No news items posted yet.
            </p>
          </div>
        ) : (
          /* News Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 notranslate" translate="no">
            {news.map((item) => (
              <article
                key={item.id}
                className="group flex flex-col justify-between bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#0D9488]/40 dark:hover:border-teal-400/40"
              >
                {/* Image if available */}
                {item.image ? (
                  <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60"></div>
                    {item.type && (
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-sm shadow-sm">
                        {item.type}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-24 bg-gradient-to-br from-[#0D477A]/10 to-[#0D9488]/15 dark:from-slate-700 dark:to-slate-800 flex items-center px-5 justify-between border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-[#0D9488] dark:text-teal-300 flex items-center justify-center">
                        <LuNewspaper className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {item.type || 'अपडेट'}
                      </span>
                    </div>
                    {item.date && (
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {item.date}
                      </span>
                    )}
                  </div>
                )}

                {/* Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date row when image is present */}
                    {item.image && (
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                        <LuCalendar className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>{item.date || 'हाल ही में'}</span>
                      </div>
                    )}

                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-snug group-hover:text-[#0D9488] dark:group-hover:text-teal-300 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {item.desc && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                        {item.desc}
                      </p>
                    )}
                  </div>

                  {/* Footer link to News */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <Link
                      to="/news"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0D9488] dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-200 transition-colors min-h-[36px]"
                    >
                      <span>पूरा समाचार पढ़ें</span>
                      <LuArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default LatestNewsSection;
