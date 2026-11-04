import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import { DEFAULT_BUSINESS_CATEGORIES } from '../services/businessService';
import { rankAndFilterBusinesses } from '../services/businessSearch';
import {
  FiSearch as LuSearch,
  FiShoppingBag as LuStore,
  FiMapPin as LuMapPin,
  FiStar as LuStar,
  FiNavigation as LuNavigation,
  FiPlusCircle as LuPlusCircle,
  FiSliders as LuSlidersHorizontal,
  FiClock as LuClock,
  FiCheckCircle as LuCheckCircle,
  FiArrowRight as LuArrowRight,
  FiLayers as LuLayers
} from 'react-icons/fi';

const BusinessDirectoryPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_BUSINESS_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    // 1. Listen to businesses
    const businessesRef = ref(rtdb, 'businesses');
    const unsubBiz = onValue(
      businessesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list = Object.values(val).filter((b) => b && b.status === 'approved');
          setBusinesses(list);
        } else {
          setBusinesses([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching businesses:', err);
        setLoading(false);
      }
    );

    // 2. Listen to custom categories if configured
    const catRef = ref(rtdb, 'businessCategories');
    const unsubCat = onValue(catRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const customCats = Object.values(val)
          .filter((c) => c && c.active !== false)
          .map((c) => (typeof c === 'string' ? c : c.name));
        if (customCats.length > 0) {
          setCategories(customCats);
        }
      }
    });

    return () => {
      unsubBiz();
      unsubCat();
    };
  }, []);

  // Filter and rank businesses
  const filteredList = useMemo(() => {
    return rankAndFilterBusinesses(businesses, {
      query: searchQuery,
      category: selectedCategory,
      sortBy
    });
  }, [businesses, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans transition-colors pt-3 sm:pt-6 pb-20">
      <SEO
        title="Local Business Directory | Shop & Services in Sareri"
        description="सरेरी के स्थानीय व्यापारियों, दुकानों, कृषि उत्पादों, स्वास्थ्य व कारीगर सेवाओं की सत्यापित डायरेक्टरी। सरेरी से खरीदें, सरेरी को बढ़ाएं।"
        url="https://villagesareri.in/businesses"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Local Businesses', url: 'https://villagesareri.in/businesses' }
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0D477A] via-[#09355C] to-[#041E34] text-white p-6 sm:p-10 md:p-12 mb-8 shadow-xl overflow-hidden border border-blue-900/50">
          <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/2 -top-24 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-3">
                <LuStore className="w-3.5 h-3.5 text-sky-300" />
                <span>गाँव की अपनी डिजिटल बाज़ार निर्देशिका</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white mb-2 leading-tight">
                Discover Local Businesses in <span className="notranslate" translate="no">Sareri</span>
              </h1>
              <p className="text-lg sm:text-xl text-sky-200 font-semibold mb-3">
                <span className="notranslate" translate="no">सरेरी</span> के स्थानीय व्यापार और सेवाएँ
              </p>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                गाँव की दुकानें, कारीगर, चिकित्सा सेवाएँ, कृषि उपकरण, खान-पान व दैनिक आवश्यकताओं के विश्वसनीय स्थानीय प्रतिष्ठानों की सूची।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <Link
                to="/businesses/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#E67E00] hover:from-[#E67E00] hover:to-[#CC6F00] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-center min-h-[48px]"
              >
                <LuPlusCircle className="w-5 h-5" />
                <span>अपनी दुकान जोड़ें (Register Shop)</span>
              </Link>
              
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-sky-200">
                <span className="font-bold text-white text-base font-heading">{businesses.length}</span>
                <span>सत्यापित व्यापार सूची</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Controls Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm mb-8 space-y-4">
          
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="दुकान, सेवा या सामान खोजें... / Search shops, services, products..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D477A] dark:focus:ring-sky-400 text-slate-900 dark:text-white placeholder-slate-400 min-h-[48px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <LuSlidersHorizontal className="w-4 h-4 text-slate-500 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0D477A] min-h-[48px]"
              >
                <option value="relevance">Most Relevant / सर्वाधिक उपयुक्त</option>
                <option value="top-rated">Top Rated ★ / उच्चतम रेटिंग</option>
                <option value="most-reviewed">Most Reviewed / सर्वाधिक समीक्षा</option>
                <option value="name">Name A-Z / नाम अनुसार</option>
                <option value="recent">Recently Added / नवीनतम</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills (Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#0D477A] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              सभी श्रेणियाँ (All)
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0D477A] text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active Filter Info & Count */}
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50">
            <span>
              कुल <strong>{filteredList.length}</strong> दुकानें उपलब्ध हैं
            </span>
            {(searchQuery || selectedCategory !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="text-[#0D477A] dark:text-sky-400 hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Listings Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse h-64"
              ></div>
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 px-4 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-700/80 flex items-center justify-center mx-auto mb-4 text-[#0D477A] dark:text-sky-300">
              <LuStore className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-heading">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'कोई व्यापार या दुकान नहीं मिली'
                : 'सरेरी में अपनी दुकान सबसे पहले जोड़ें'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'आपके द्वारा खोजे गए शब्द या श्रेणी में अभी कोई दुकान पंजीकृत नहीं है। कृपया कोई अन्य शब्द खोजें।'
                : 'Be the first to list your business in Sareri. अपने स्थानीय व्यापार को डिजिटल बनाएं और सीधे गाँववासियों तक पहुँचें।'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/businesses/register"
                className="px-6 py-3 bg-[#0D477A] hover:bg-[#09355C] text-white font-bold text-sm rounded-xl transition-all shadow-md"
              >
                दुकान पंजीकरण करें (Register Your Shop)
              </Link>
              {(searchQuery || selectedCategory !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="px-5 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  सभी दुकानें देखें (View All)
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Business Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((biz) => {
              const shopUrl = biz.slug ? `/${biz.slug}` : null;
              const mapUrl = biz.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.name + ' Brahmano Ki Sareri')}`;

              return (
                <div
                  key={biz.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  <div>
                    {/* Cover / Logo Area */}
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      {biz.coverUrl || biz.logoUrl ? (
                        <img
                          src={biz.coverUrl || biz.logoUrl}
                          alt={biz.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400">
                          <LuStore className="w-12 h-12 mb-1 text-slate-300 dark:text-slate-600" />
                          <span className="text-xs font-semibold">{biz.category}</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-bold tracking-wide border border-white/20">
                          {biz.category}
                        </span>
                      </div>

                      {/* Featured Badge */}
                      {biz.featured && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                            ★ Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        {shopUrl ? <Link to={shopUrl} className="group-hover:text-[#0D477A] dark:group-hover:text-sky-300 transition-colors">
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight notranslate">
                            {biz.name}
                          </h2>
                        </Link> : (
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight notranslate">
                            {biz.name}
                          </h2>
                        )}
                      </div>

                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-amber-500">
                          <LuStar className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {biz.rating ? Number(biz.rating).toFixed(1) : 'New'}
                          </span>
                        </div>
                        {biz.reviewCount > 0 ? (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({biz.reviewCount} {biz.reviewCount === 1 ? 'review' : 'reviews'})
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">कोई समीक्षा नहीं</span>
                        )}
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                          <LuMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate notranslate" translate="no">{biz.locality || 'सरेरी'}</span>
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                        {biz.shortDescription || biz.description || 'सरेरी का प्रमुख स्थानीय व्यावसायिक प्रतिष्ठान।'}
                      </p>

                      {/* Opening Hours status (only if verified) */}
                      {biz.openingHours && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                          <LuClock className="w-3.5 h-3.5" />
                          <span>{biz.openingHours}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                    {shopUrl ? (
                      <Link
                        to={shopUrl}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#0D477A] hover:bg-[#09355C] text-white font-bold text-xs sm:text-sm transition-colors shadow-sm min-h-[44px]"
                      >
                        <span>View Shop</span>
                        <LuArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs sm:text-sm min-h-[44px] cursor-not-allowed" aria-disabled="true">
                        दुकान पेज उपलब्ध नहीं
                      </span>
                    )}

                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
                      title="Google Maps Directions"
                    >
                      <LuNavigation className="w-4 h-4 text-[#FF9933]" />
                      <span className="hidden sm:inline">Directions</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default BusinessDirectoryPage;
