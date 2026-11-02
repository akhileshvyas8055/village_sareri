import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import {
  LuBell,
  LuCalendar,
  LuSearch,
  LuFilter,
  LuDownload,
  LuExternalLink,
  LuArrowLeft,
  LuX,
  LuFileText,
  LuClock,
  LuImage
} from 'react-icons/lu';

const NoticeBoardPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
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

          // Sort latest first
          list.sort((a, b) => {
            const timeA = Number(a.createdAt) || (a.date ? new Date(a.date).getTime() : 0) || 0;
            const timeB = Number(b.createdAt) || (b.date ? new Date(b.date).getTime() : 0) || 0;
            return timeB - timeA;
          });

          setNotices(list);
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

  // Keyboard accessibility: ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNotice(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format date helper
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
            month: 'long',
            year: 'numeric'
          });
        }
      } catch {
        // fallback
      }
    }
    return '';
  };

  // Distinct categories available in notices
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set();
    notices.forEach((n) => {
      if (n.category && typeof n.category === 'string' && n.category.trim()) {
        categoriesSet.add(n.category.trim());
      }
    });
    return Array.from(categoriesSet);
  }, [notices]);

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (notice.title || '').toLowerCase().includes(q);
      const descMatch = (notice.description || '').toLowerCase().includes(q);
      const matchesSearch = !q || titleMatch || descMatch;

      const matchesCat =
        selectedCategory === 'ALL' ||
        (notice.category && notice.category.trim() === selectedCategory);

      return matchesSearch && matchesCat;
    });
  }, [notices, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans transition-colors pt-3 sm:pt-6 pb-16">
      <SEO
        title="Digital Notice Board | Gram Panchayat Sareri Announcements"
        description="सरेरी ग्राम पंचायत के आधिकारिक आदेश, सरकारी निविदाएं, शिविर सूचनाएं एवं प्रशासनिक घोषणाओं का लाइव डिजिटल सूचना पट्ट।"
        url="https://villagesareri.in/notices"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Notice Board', url: 'https://villagesareri.in/notices' }
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Navigation Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D477A] dark:text-sky-300 hover:text-blue-900 dark:hover:text-sky-200 transition-colors py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm w-fit min-h-[40px]"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>होमपेज पर लौटें (Back to Home)</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-slate-50 dark:bg-slate-800/90 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 dark:border-slate-700 shadow-sm mb-8 text-center sm:text-left relative overflow-hidden">
          {/* Subtle Accent Stripe */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0D477A] via-[#0D9488] to-[#F97316]"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#0D477A] dark:text-white font-heading tracking-tight">
                Digital Notice Board <br className="sm:hidden" />
                <span className="text-slate-400 dark:text-slate-500 font-light hidden sm:inline"> / </span>
                <span className="text-[#0D477A] dark:text-sky-400">डिजिटल सूचना पट्ट</span>
              </h1>

              <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                ग्राम पंचायत सरेरी द्वारा जारी सभी आधिकारिक दिशा-निर्देश, बैठक सूचनाएँ, जनहित घोषणाएँ एवं विकास कार्यों से जुड़े परिपत्र यहाँ उपलब्ध हैं।
              </p>
            </div>

            {/* Quick Stat Counter */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 min-w-[130px] shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#0D477A] dark:text-sky-300 font-heading">
                {notices.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                कुल सूचनाएँ
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-700 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="सूचना का शीर्षक या विवरण खोजें... / Search notices..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D477A] dark:focus:ring-sky-400 transition-all min-h-[44px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search query"
              >
                <LuX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills (if categories exist) */}
          {availableCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 shrink-0">
                <LuFilter className="w-3.5 h-3.5" />
                वर्ग:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[38px] ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#0D477A] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                सभी (All)
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors min-h-[38px] ${
                    selectedCategory === cat
                      ? 'bg-[#0D477A] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notices Listing */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse h-36"
              ></div>
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <LuBell className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {searchQuery ? 'कोई सूचना नहीं मिली' : 'अभी कोई नई सूचना उपलब्ध नहीं है।'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery
                ? 'कृपया कोई अन्य खोज शब्द आज़माएँ अथवा फ़िल्टर हटाएं।'
                : 'जैसे ही ग्राम पंचायत द्वारा कोई सूचना जारी की जाएगी, वह यहाँ दिखाई देगी।'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-4 px-4 py-2 bg-[#0D477A] text-white text-xs font-semibold rounded-xl hover:bg-[#09355C] transition-colors"
              >
                सभी सूचनाएँ देखें (Reset Filter)
              </button>
            )}
          </div>
        ) : (
          /* Notice Cards Stack */
          <div className="space-y-4 sm:space-y-5 notranslate" translate="no">
            {filteredNotices.map((notice, index) => {
              const dateStr = formatDate(notice);

              return (
                <div
                  key={notice.id || index}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#0D477A]/50 dark:hover:border-blue-400/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Thumbnail if exists */}
                    {(notice.imageUrl || notice.image) && (
                      <div
                        onClick={() => setSelectedNotice(notice)}
                        className="w-full sm:w-28 h-40 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 cursor-pointer border border-slate-200 dark:border-slate-700 relative group/img shadow-2xs"
                      >
                        <img
                          src={notice.imageUrl || notice.image}
                          alt={notice.title}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                          <LuImage className="w-3.5 h-3.5" />
                          <span>देखें</span>
                        </div>
                      </div>
                    )}

                    {/* Left: Content */}
                    <div className="flex-1 min-w-0">
                      
                      {/* Badge & Date */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#0D477A] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
                          {notice.category || 'आधिकारिक सूचना'}
                        </span>

                        {dateStr && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <LuCalendar className="w-3.5 h-3.5 text-[#0D477A] dark:text-sky-400" />
                            <span>{dateStr}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#0D477A] dark:group-hover:text-sky-300 transition-colors">
                        {notice.title}
                      </h2>

                      {/* Description */}
                      {notice.description && (
                        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line line-clamp-3 sm:line-clamp-4">
                          {notice.description}
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => setSelectedNotice(notice)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-[#0D477A] hover:text-white dark:bg-slate-700 dark:hover:bg-sky-500 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold transition-all min-h-[40px]"
                        aria-label={`Read full notice: ${notice.title}`}
                      >
                        <LuFileText className="w-4 h-4" />
                        <span>पूर्ण विवरण देखें</span>
                      </button>

                      {notice.pdfLink && (
                        <a
                          href={notice.pdfLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[#0D477A] dark:text-sky-300 text-xs font-medium border border-blue-200/80 dark:border-blue-800/80 transition-colors min-h-[40px]"
                          title="संलग्न दस्तावेज़ खोलें"
                        >
                          <LuDownload className="w-3.5 h-3.5" />
                          <span>दस्तावेज़ / PDF</span>
                        </a>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Full Notice Details Modal */}
      {selectedNotice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 text-left max-h-[90vh] overflow-y-auto notranslate"
            translate="no"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close dialog"
            >
              <LuX className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#0D477A] dark:bg-blue-900/60 dark:text-blue-300">
                {selectedNotice.category || 'आधिकारिक सूचना'}
              </span>
              {formatDate(selectedNotice) && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <LuCalendar className="w-3.5 h-3.5" />
                  जारी दिनांक: {formatDate(selectedNotice)}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-snug">
              {selectedNotice.title}
            </h2>

            {/* Notice Photo if attached */}
            {(selectedNotice.imageUrl || selectedNotice.image) && (
              <div className="mb-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-sm relative group">
                <a
                  href={selectedNotice.imageUrl || selectedNotice.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-zoom-in"
                  title="फ़ोटो को पूरे आकार में देखने के लिए क्लिक करें"
                >
                  <img
                    src={selectedNotice.imageUrl || selectedNotice.image}
                    alt={selectedNotice.title}
                    className="w-full max-h-80 sm:max-h-96 object-contain mx-auto"
                  />
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1 font-medium">
                      <LuImage className="w-3.5 h-3.5 text-[#0D477A] dark:text-sky-400" />
                      संलग्न आधिकारिक आदेश / परिपत्र फ़ोटो
                    </span>
                    <span className="text-[#0D477A] dark:text-sky-300 font-bold flex items-center gap-1 hover:underline">
                      <LuExternalLink className="w-3 h-3" /> पूर्ण आकार में देखें
                    </span>
                  </div>
                </a>
              </div>
            )}

            {/* Full text content */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 mb-6">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                सूचना का पूर्ण विवरण / Full Notice Description
              </h3>
              {selectedNotice.description ? (
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {selectedNotice.description}
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  इस सूचना का विस्तृत विवरण नीचे दिए गए दस्तावेज़ में संलग्न है।
                </p>
              )}
            </div>

            {/* Attachments / Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {selectedNotice.pdfLink && (
                <a
                  href={selectedNotice.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#0D477A] hover:bg-[#09355C] text-white font-semibold rounded-xl transition-all shadow-md text-sm min-h-[44px]"
                >
                  <LuDownload className="w-4 h-4" />
                  <span>संलग्न आधिकारिक दस्तावेज़ खोलें (Open Attachment)</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition-colors text-sm min-h-[44px]"
              >
                <span>बंद करें (Close)</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoardPage;
