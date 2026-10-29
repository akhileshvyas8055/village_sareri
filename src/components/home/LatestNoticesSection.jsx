import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import {
  LuBell,
  LuCalendar,
  LuArrowRight,
  LuFileText,
  LuDownload,
  LuExternalLink,
  LuX,
  LuShieldAlert,
  LuChevronRight,
  LuImage
} from 'react-icons/lu';

const LatestNoticesSection = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    const panchayatRef = ref(rtdb, 'panchayat');
    const unsubscribe = onValue(
      panchayatRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const pVal = snapshot.val() || {};
          const raw = pVal.notices || {};
          let list = [];
          if (Array.isArray(raw)) {
            list = raw.filter(Boolean).map((item, idx) => ({ id: item.id || String(idx), ...item }));
          } else if (raw && typeof raw === 'object') {
            list = Object.entries(raw).map(([id, item]) => ({
              id,
              ...(typeof item === 'object' && item !== null ? item : { title: String(item) })
            }));
          }

          // Sort latest first using createdAt or date parsing
          list.sort((a, b) => {
            const timeA = Number(a.createdAt) || (a.date ? new Date(a.date).getTime() : 0) || 0;
            const timeB = Number(b.createdAt) || (b.date ? new Date(b.date).getTime() : 0) || 0;
            return timeB - timeA;
          });

          // Show latest 3 authentic notices
          setNotices(list.slice(0, 3));
        } else {
          setNotices([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching notices:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (item) => {
    if (item.date && typeof item.date === 'string' && item.date.trim()) {
      return item.date.trim();
    }
    if (item.createdAt) {
      try {
        const d = new Date(item.createdAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('hi-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        }
      } catch {
        // fallback
      }
    }
    return '';
  };

  return (
    <section className="py-12 md:py-16 bg-slate-50/70 dark:bg-slate-900/60 transition-colors border-t border-slate-200/60 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0D477A] dark:text-white font-heading tracking-tight">
              Latest Notices <span className="text-slate-400 dark:text-slate-500 font-light">/</span> नवीनतम सूचनाएँ
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              ग्राम पंचायत एवं प्रशासनिक स्तर से जारी दिशा-निर्देश एवं घोषणाएँ
            </p>
          </div>

          <Link
            to="/notices"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D477A] hover:bg-[#09355C] text-white text-sm font-semibold transition-all shadow-sm hover:shadow shrink-0 min-h-[44px]"
            aria-label="View all notices"
          >
            <span>सभी सूचनाएँ देखें (View All)</span>
            <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Notices Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200/70 dark:border-slate-700/60 animate-pulse h-48"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          /* Clean Empty State */
          <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-500">
              <LuBell className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              अभी कोई नई सूचना उपलब्ध नहीं है।
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No new notices available at this moment.
            </p>
          </div>
        ) : (
          /* Notice Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 notranslate" translate="no">
            {notices.map((notice) => {
              const dateStr = formatDate(notice);

              return (
                <div
                  key={notice.id}
                  className="group relative flex flex-col justify-between bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#0D477A]/40 dark:hover:border-blue-400/40"
                >
                  {/* Top line accent */}
                  <div className="absolute top-0 inset-x-6 h-1 bg-gradient-to-r from-[#0D477A] to-[#0D9488] rounded-t-full opacity-80"></div>

                  <div>
                    {/* Date and Category Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3 pt-1">
                      {dateStr ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <LuCalendar className="w-3.5 h-3.5 text-[#0D477A] dark:text-sky-400" />
                          <span>{dateStr}</span>
                        </span>
                      ) : (
                        <span></span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#0D477A] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
                        {notice.category || 'आधिकारिक'}
                      </span>
                    </div>

                    {/* Notice Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#0D477A] dark:group-hover:text-sky-300 transition-colors">
                      {notice.title}
                    </h3>

                    {/* Description preview */}
                    {notice.description && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                        {notice.description}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(notice)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0D477A] dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-300 transition-colors py-1 focus:outline-none min-h-[36px]"
                    >
                      <span>पूरा पढ़ें (Read More)</span>
                      <LuChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    {notice.pdfLink && (
                      <a
                        href={notice.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                        title="दस्तावेज़ देखें / View Document"
                      >
                        <LuExternalLink className="w-3.5 h-3.5 text-[#0D477A] dark:text-sky-300" />
                        <span className="text-[11px]">दस्तावेज़</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Notice Detail Quick View Modal */}
      {selectedNotice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 text-left max-h-[90vh] overflow-y-auto notranslate"
            translate="no"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close notice details"
            >
              <LuX className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#0D477A] dark:bg-blue-900/60 dark:text-blue-300">
                {selectedNotice.category || 'आधिकारिक सूचना'}
              </span>
              {formatDate(selectedNotice) && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <LuCalendar className="w-3.5 h-3.5" />
                  {formatDate(selectedNotice)}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 leading-snug">
              {selectedNotice.title}
            </h3>

            {/* Notice Photo */}
            {(selectedNotice.imageUrl || selectedNotice.image) && (
              <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <a
                  href={selectedNotice.imageUrl || selectedNotice.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  title="पूर्ण आकार में देखें"
                >
                  <img
                    src={selectedNotice.imageUrl || selectedNotice.image}
                    alt={selectedNotice.title}
                    className="w-full max-h-64 object-contain mx-auto"
                  />
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <LuImage className="w-3.5 h-3.5 text-[#0D477A]" /> संलग्न परिपत्र फ़ोटो
                    </span>
                    <span className="text-[#0D477A] font-bold hover:underline flex items-center gap-1">
                      <LuExternalLink className="w-3 h-3" /> पूर्ण आकार
                    </span>
                  </div>
                </a>
              </div>
            )}

            {selectedNotice.description ? (
              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 mb-6">
                {selectedNotice.description}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 italic">
                विस्तृत विवरण संलग्न दस्तावेज़ में उपलब्ध है।
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {selectedNotice.pdfLink && (
                <a
                  href={selectedNotice.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0D477A] hover:bg-[#09355C] text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
                >
                  <LuDownload className="w-4 h-4" />
                  <span>दस्तावेज़ / लिंक खोलें</span>
                </a>
              )}
              <Link
                to="/notices"
                onClick={() => setSelectedNotice(null)}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition-colors text-sm"
              >
                <span>सूचना पट्ट पर जाएँ</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LatestNoticesSection;
