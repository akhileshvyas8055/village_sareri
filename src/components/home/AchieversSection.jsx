import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import {
  LuAward,
  LuArrowRight,
  LuUser,
  LuSparkles,
  LuCalendar
} from 'react-icons/lu';

const AchieversSection = () => {
  const [achievers, setAchievers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const achRef = ref(rtdb, 'adminData/achievements');
    const unsubscribe = onValue(
      achRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          }));

          // Sort descending by timestamp or year
          list.sort((a, b) => {
            const timeA = a.timestamp || (a.year ? parseInt(a.year, 10) : 0) || 0;
            const timeB = b.timestamp || (b.year ? parseInt(b.year, 10) : 0) || 0;
            return timeB - timeA;
          });

          // Show up to 3 achievers
          setAchievers(list.slice(0, 3));
        } else {
          setAchievers([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching achievers:', error);
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
              Pride of Sareri <span className="text-slate-400 dark:text-slate-500 font-light">/</span> सरेरी के गौरव
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              शिक्षा, खेल, समाज सेवा एवं प्रशासन में गाँव का मान बढ़ाने वाले हमारे सम्मानित नागरिक
            </p>
          </div>

          <Link
            to="/pride"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 text-sm font-semibold transition-all shadow-sm hover:shadow shrink-0 min-h-[44px]"
            aria-label="View all achievers"
          >
            <span>सभी गौरव देखें (View All)</span>
            <LuArrowRight className="w-4 h-4 text-emerald-600" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-700/60 animate-pulse h-64"
              ></div>
            ))}
          </div>
        ) : achievers.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <LuAward className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              अभी कोई उपलब्धि दर्ज नहीं है।
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No achievement records available.
            </p>
          </div>
        ) : (
          /* Achievers Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievers.map((ach) => (
              <div
                key={ach.id}
                className="group flex flex-col justify-between bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <div>
                  {/* Photo or Avatar */}
                  <div className="flex items-center gap-4 mb-4">
                    {ach.image ? (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border-2 border-emerald-500/30 shadow-sm">
                        <img
                          src={ach.image}
                          alt={ach.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-300/40">
                        <LuUser className="w-8 h-8" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {ach.name}
                      </h3>
                      {ach.title && (
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                          {ach.title}
                        </p>
                      )}
                      {ach.category && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 mt-1">
                          {ach.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Year tag if present */}
                  {ach.year && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                      <LuCalendar className="w-3.5 h-3.5" />
                      <span>वर्ष: {ach.year}</span>
                    </div>
                  )}

                  {/* Description */}
                  {ach.desc && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {ach.desc}
                    </p>
                  )}
                </div>

                {/* Footer link to pride page */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <Link
                    to="/pride"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors min-h-[36px]"
                  >
                    <span>गौरव विवरण देखें</span>
                    <LuArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default AchieversSection;
