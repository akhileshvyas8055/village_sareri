import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import { EVENT_CATEGORIES } from '../data/defaultEvents';
import {
  FiCalendar,
  FiMapPin,
  FiClock,
  FiShare2,
  FiSearch,
  FiChevronRight,
  FiX,
  FiUsers,
  FiNavigation,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus
} from 'react-icons/fi';
import { LuSparkles } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';

const EventsPage = () => {
  const [dbEvents, setDbEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'calendar' | 'past'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Listen to scheduled events in Firebase Realtime Database
  useEffect(() => {
    window.scrollTo(0, 0);
    const eventsRef = ref(rtdb, 'adminData/events');
    const unsubscribe = onValue(
      eventsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          }));
          setDbEvents(list);
        } else {
          setDbEvents([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching events from Firebase:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Only display events dynamically managed and scheduled by Admin in Firebase RTDB
  const allEvents = useMemo(() => {
    return [...dbEvents].sort((a, b) => new Date(a.date || '9999-12-31') - new Date(b.date || '9999-12-31'));
  }, [dbEvents]);

  // Next Major Featured Event for the Hero Countdown
  const featuredEvent = useMemo(() => {
    if (!allEvents.length) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = allEvents
      .filter((e) => e.date && e.date >= todayStr)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (upcoming.length > 0) return upcoming[0];
    return allEvents[0];
  }, [allEvents]);

  // Days remaining calculation
  const daysRemaining = useMemo(() => {
    if (!featuredEvent?.date) return null;
    const now = new Date();
    const evtDate = new Date(featuredEvent.date);
    const diffTime = evtDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [featuredEvent]);

  // Filtered list
  const filteredEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = searchQuery.trim().toLowerCase();

    return allEvents.filter((event) => {
      // Category filter
      if (selectedCategory !== 'ALL' && event.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (q) {
        const titleMatch = (event.title || '').toLowerCase().includes(q);
        const enTitleMatch = (event.englishTitle || '').toLowerCase().includes(q);
        const tithiMatch = (event.tithi || '').toLowerCase().includes(q);
        const locMatch = (event.location || '').toLowerCase().includes(q);
        const descMatch = (event.description || '').toLowerCase().includes(q);
        if (!titleMatch && !enTitleMatch && !tithiMatch && !locMatch && !descMatch) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === 'upcoming') {
        // Events today or in the future, or annual events marked upcoming
        return !event.date || event.date >= todayStr || event.isAnnual;
      } else if (activeTab === 'past') {
        return event.date && event.date < todayStr && !event.isAnnual;
      }
      // 'calendar' tab shows all annual & cultural events
      return true;
    });
  }, [allEvents, selectedCategory, searchQuery, activeTab]);

  // Create Google Calendar Link
  const getGoogleCalendarUrl = (evt) => {
    const title = encodeURIComponent(evt.title || 'सरेरी ग्राम आयोजन');
    const details = encodeURIComponent(`${evt.description || ''}\n\nस्थान: ${evt.location || 'सरेरी'}\nआयोजक: ${evt.organizer || 'समस्त ग्रामवासी'}`);
    const location = encodeURIComponent(evt.location || 'Brahmano Ki Sareri, Rajasthan');
    
    let datesParam = '';
    if (evt.date) {
      const cleanDate = evt.date.replace(/-/g, '');
      datesParam = `&dates=${cleanDate}T090000/${cleanDate}T180000`;
    }

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
  };

  // WhatsApp share
  const handleShareWhatsApp = (evt) => {
    const text = encodeURIComponent(
      `🚩 *${evt.title}*\n` +
      `📅 तिथि / दिनांक: ${evt.tithi ? evt.tithi + ' | ' : ''}${evt.date || 'वार्षिक उत्सव'}\n` +
      `⏰ समय: ${evt.time || 'पूरा दिन'}\n` +
      `📍 स्थान: ${evt.location || 'ब्राह्मणों की सरेरी'}\n\n` +
      `आप सभी सपरिवार इस पावन आयोजन में सादर आमंत्रित हैं।\n` +
      `🔗 विस्तृत विवरण देखें: https://villagesareri.in/events`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans transition-colors pt-24 pb-20">
      <SEO
        title="सरेरी प्रमुख मेले, त्योहार एवं आयोजन | Village Events & Festivals - Brahmano Ki Sareri"
        description="ब्राह्मणों की सरेरी के पारंपरिक मेले जैसे जलझूलनी एकादशी मेला, होली गेर महोत्सव, श्री चारभुजा पाटोत्सव, वार्षिक खेलकूद एवं सांस्कृतिक आयोजनों का आधिकारिक कैलेंडर।"
        url="https://villagesareri.in/events"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* HERO BANNER */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0D477A] via-[#09355C] to-[#041E34] text-white p-6 sm:p-10 md:p-12 mb-8 shadow-2xl overflow-hidden border border-blue-900/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF9933]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider mb-4">
                <LuSparkles className="w-4 h-4 text-amber-300" />
                <span>गाँव की पावन संस्कृति एवं उत्सव</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white mb-3 leading-tight">
                Village Festivals & Events
              </h1>
              
              <p className="text-lg sm:text-xl text-amber-200 font-semibold mb-3">
                सरेरी के पारंपरिक मेले, धार्मिक उत्सव एवं सांस्कृतिक आयोजन
              </p>
              
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                जलझूलनी एकादशी का भव्य मेला, ठाकुर जी की बेवाण यात्रा, होली पर पारंपरिक गेर नृत्य, खेल महोत्सव एवं गाँव के सभी सार्वजनिक कार्यक्रमों की संपूर्ण समय-सारणी।
              </p>
            </div>

            {/* Featured Event Countdown Card */}
            {featuredEvent ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl shrink-0">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold uppercase tracking-wide shadow-sm">
                    {featuredEvent.badge || 'आगामी प्रमुख उत्सव'}
                  </span>
                  {daysRemaining !== null && daysRemaining > 0 && (
                    <span className="text-xs font-bold text-amber-200 bg-black/30 px-2.5 py-1 rounded-lg border border-white/10">
                      {daysRemaining} दिन शेष
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold font-heading text-white mb-2 leading-snug notranslate" translate="no">
                  {featuredEvent.title}
                </h3>

                <div className="space-y-1.5 text-xs sm:text-sm text-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>{featuredEvent.tithi || featuredEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="truncate">{featuredEvent.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/15">
                  <button
                    onClick={() => setSelectedEvent(featuredEvent)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#E67E00] hover:from-[#E67E00] hover:to-[#CC6F00] text-white font-bold text-xs sm:text-sm transition-all shadow-md text-center"
                  >
                    विवरण देखें (Details)
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(featuredEvent)}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    title="WhatsApp पर शेयर करें"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/80 text-white text-[11px] font-extrabold uppercase tracking-wide mb-3">
                  <FiCalendar className="w-3.5 h-3.5" />
                  <span>आधिकारिक इवेंट पोर्टल</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-heading text-white mb-2 leading-snug">
                  गाँव के मेले व उत्सव
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                  सरेरी के पारंपरिक मेले, धार्मिक व सांस्कृतिक आयोजनों की समय-सारणी व्यवस्थापक द्वारा यहाँ प्रकाशित की जाती है।
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-200 bg-white/10 px-3.5 py-2.5 rounded-xl border border-white/15">
                  <FiCalendar className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>गाँव के सभी सार्वजनिक उत्सवों व मेलों की आधिकारिक जानकारी</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS BAR: TABS, SEARCH & FILTERS */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm mb-8 space-y-4">
          
          {/* Main Time Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'upcoming'
                  ? 'bg-[#0D477A] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FiCalendar className="w-4 h-4" />
              <span>आगामी आयोजन (Upcoming Events)</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'calendar'
                  ? 'bg-[#0D477A] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <LuSparkles className="w-4 h-4" />
              <span>वार्षिक मेला व उत्सव कैलेंडर (Annual Calendar)</span>
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'past'
                  ? 'bg-[#0D477A] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FiClock className="w-4 h-4" />
              <span>विगत आयोजन (Past Archive)</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="मेला, त्योहार, तिथि या स्थान खोजें... (Search events, festivals, tithi...)"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D477A] text-slate-900 dark:text-white placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Stat */}
            <div className="text-xs text-slate-500 dark:text-slate-400 self-center sm:self-auto shrink-0 font-medium">
              कुल <strong>{filteredEvents.length}</strong> आयोजन सूचीबद्ध
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.labelHi}
              </button>
            ))}
          </div>

        </div>

        {/* EVENTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse h-64"
              ></div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200/60 dark:border-amber-800/60 shadow-inner">
              <FiCalendar className="w-8 h-8" />
            </div>
            {allEvents.length === 0 ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-heading">
                  वर्तमान में कोई आयोजन निर्धारित नहीं है
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  गाँव के आगामी मेले, धार्मिक उत्सव, खेलकूद व सांस्कृतिक कार्यक्रम ग्राम व्यवस्थापक या सरपंच द्वारा जोड़े जाने पर यहाँ प्रदर्शित होंगे।
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 inline-block">
                  नवीनतम आयोजनों की घोषणा होते ही यहाँ पूरी समय-सारणी उपलब्ध कराई जाएगी।
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-heading">
                  कोई आयोजन नहीं मिला
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  आपके द्वारा खोजे गए शब्द या श्रेणी में कोई आयोजन नहीं है। कृपया फ़िल्टर रीसेट करें।
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                    setActiveTab('upcoming');
                  }}
                  className="px-5 py-2.5 bg-[#0D477A] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#09355C] transition-colors"
                >
                  सभी आयोजन देखें (View All)
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const isFeatured = evt.featured;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.location || 'Brahmano Ki Sareri')}`;

              return (
                <div
                  key={evt.id}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 hover:shadow-lg ${
                    isFeatured
                      ? 'border-amber-300/80 dark:border-amber-500/40 ring-1 ring-amber-400/20 shadow-md'
                      : 'border-slate-200/90 dark:border-slate-700/80 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header bar / Image / Badges */}
                    <div className="relative h-44 w-full bg-gradient-to-br from-[#0D477A] to-[#06243F] text-white p-5 flex flex-col justify-between overflow-hidden">
                      {/* Decorative backdrop glow */}
                      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>

                      <div className="relative z-10 flex items-start justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-amber-300 text-[11px] font-bold border border-white/20">
                          {evt.categoryHi || evt.category}
                        </span>

                        {evt.badge && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                            ★ {evt.badge}
                          </span>
                        )}
                      </div>

                      <div className="relative z-10">
                        <span className="text-[11px] text-amber-200 font-medium block">
                          {evt.tithi || evt.approximateMonth || 'सरेरी उत्सव'}
                        </span>
                        <h2 className="text-lg font-bold font-heading text-white leading-snug line-clamp-2 notranslate">
                          {evt.title}
                        </h2>
                      </div>
                    </div>

                    {/* Body Details */}
                    <div className="p-5 space-y-3">
                      {/* Meta information */}
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        {evt.date && (
                          <div className="flex items-center gap-2">
                            <FiCalendar className="w-3.5 h-3.5 text-[#0D477A] dark:text-sky-400 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {evt.date}
                            </span>
                            {evt.time && <span className="text-slate-400">• {evt.time}</span>}
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          <FiMapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{evt.location}</span>
                        </div>

                        {evt.organizer && (
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <FiUsers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.organizer}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Highlights Pill snippet */}
                      {evt.highlights && evt.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {evt.highlights.slice(0, 2).map((h, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                            >
                              <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                              <span className="truncate max-w-[170px]">{h}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0D477A] hover:bg-[#09355C] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm min-h-[40px]"
                    >
                      <span>संपूर्ण विवरण</span>
                      <FiChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(evt)}
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors min-h-[40px] min-w-[40px]"
                      title="WhatsApp पर शेयर करें"
                    >
                      <FaWhatsapp className="w-4 h-4" />
                    </button>

                    <a
                      href={getGoogleCalendarUrl(evt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors min-h-[40px] min-w-[40px]"
                      title="Google Calendar में रिमाइंडर जोड़ें"
                    >
                      <FiCalendar className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl border border-slate-200 dark:border-slate-700">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-[#0D477A] dark:text-sky-300 text-xs font-bold inline-block mb-1.5">
                  {selectedEvent.categoryHi || selectedEvent.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 dark:text-white leading-tight notranslate">
                  {selectedEvent.title}
                </h3>
                {selectedEvent.englishTitle && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {selectedEvent.englishTitle}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Event Key Schedule Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">तिथि व दिनांक</span>
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <FiCalendar className="w-4 h-4 text-amber-500" />
                  <span>{selectedEvent.tithi || selectedEvent.date || 'वार्षिक उत्सव'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">समय / मुहूर्त</span>
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <FiClock className="w-4 h-4 text-blue-500" />
                  <span>{selectedEvent.time || 'पूरा दिन'}</span>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">स्थान / आयोजन स्थल</span>
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <FiMapPin className="w-4 h-4 text-rose-500" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              {selectedEvent.organizer && (
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">आयोजक / प्रबंध समिति</span>
                  <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                    <FiUsers className="w-4 h-4 text-teal-500" />
                    <span>{selectedEvent.organizer}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                आयोजन का विवरण (About Festival & Event)
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {selectedEvent.description}
              </p>
            </div>

            {/* Highlights */}
            {selectedEvent.highlights && selectedEvent.highlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  प्रमुख आकर्षण व कार्यक्रम रूपरेखा (Key Highlights)
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {selectedEvent.highlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => handleShareWhatsApp(selectedEvent)}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>WhatsApp पर निमंत्रण भेजें</span>
              </button>

              <a
                href={getGoogleCalendarUrl(selectedEvent)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#0D477A] hover:bg-[#09355C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <FiCalendar className="w-4 h-4" />
                <span>कैलेंडर में जोड़ें (Add to Calendar)</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location || 'Brahmano Ki Sareri')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <FiNavigation className="w-4 h-4 text-amber-500" />
                <span>दिशा मार्ग (Directions)</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EventsPage;
