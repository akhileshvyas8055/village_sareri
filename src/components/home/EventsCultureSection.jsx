import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import {
  LuCalendar,
  LuSparkles,
  LuArrowRight,
  LuMapPin,
  LuCalendarDays
} from 'react-icons/lu';

const EventsCultureSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch strictly from adminData/events
    const eventsRef = ref(rtdb, 'adminData/events');
    const unsubscribe = onValue(
      eventsRef,
      (snapshot) => {
        let list = [];
        if (snapshot.exists()) {
          const data = snapshot.val();
          list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          }));
        }

        // Filter & prioritize upcoming / featured
        list.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        // Show top 2 major events added by admin
        setEvents(list.slice(0, 2));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching events:', error);
        setEvents([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // If no events are scheduled by Admin, do not render this section on Home
  if (!loading && events.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-slate-50/70 dark:bg-slate-900/60 transition-colors border-t border-slate-200/60 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0D477A] dark:text-white font-heading tracking-tight">
              Events & Culture <span className="text-slate-400 dark:text-slate-500 font-light">/</span> आयोजन और संस्कृति
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              गाँव के वार्षिक धार्मिक उत्सव, जलझूलनी एकादशी मेला, खेलकूद व सांस्कृतिक कार्यक्रम
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 text-sm font-semibold transition-all shadow-sm hover:shadow shrink-0 min-h-[44px]"
            aria-label="View all village events"
          >
            <span>सभी मेले व आयोजन देखें (View All)</span>
            <LuArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl h-56 border border-slate-200/70 dark:border-slate-700/60 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          /* Event Cards (Top 2) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 notranslate" translate="no">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group flex flex-col sm:flex-row bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/50"
              >
                {/* Image / Graphic */}
                {evt.image ? (
                  <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 relative">
                    <img
                      src={evt.image}
                      alt={evt.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold uppercase backdrop-blur-sm">
                      {evt.badge || 'प्रमुख मेला'}
                    </div>
                  </div>
                ) : (
                  <div className="sm:w-1/3 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-white p-6 flex flex-col justify-center items-center text-center shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-2 shadow-inner">
                      <LuSparkles className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                      {evt.badge || 'सरेरी उत्सव'}
                    </span>
                  </div>
                )}

                {/* Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                        <LuCalendar className="w-3.5 h-3.5" />
                        <span>{evt.tithi || evt.date || 'वार्षिक उत्सव'}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {evt.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <LuMapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>

                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {evt.description || evt.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                    >
                      <span>पूरा कार्यक्रम व समय-सारणी देखें</span>
                      <LuArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default EventsCultureSection;
