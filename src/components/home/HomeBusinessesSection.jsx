import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import {
  FiShoppingBag as LuStore,
  FiStar as LuStar,
  FiMapPin as LuMapPin,
  FiNavigation as LuNavigation,
  FiArrowRight as LuArrowRight,
  FiPlusCircle as LuPlusCircle
} from 'react-icons/fi';

const HomeBusinessesSection = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bizRef = ref(rtdb, 'businesses');
    const unsub = onValue(
      bizRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          // Filter only approved businesses
          const approved = Object.values(val).filter((b) => b && b.status === 'approved');
          // Sort: featured first, then highest rating, then latest
          approved.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            const rateDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
            if (rateDiff !== 0) return rateDiff;
            return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
          });
          setBusinesses(approved.slice(0, 4));
        } else {
          setBusinesses([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching home businesses:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <section id="businesses" className="py-12 md:py-16 bg-slate-50/70 dark:bg-[#080D1A] transition-colors relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0D477A] dark:text-sky-400 mb-2">
              <LuStore className="w-4 h-4" />
              <span>Village Marketplace • स्थानीय व्यापार</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              Discover Local Businesses in <span className="notranslate" translate="no">Sareri</span> <span className="text-slate-400 dark:text-slate-500 font-light">/</span> <span className="notranslate" translate="no">सरेरी</span> के स्थानीय व्यापार
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              गाँव की प्रामाणिक दुकानें, सेवाएँ एवं कारीगर। अपनी पसंद का प्रतिष्ठान खोजें और सीधे संपर्क करें।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/businesses/register"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              <LuPlusCircle className="w-4 h-4 text-[#FF9933]" />
              <span>दुकान जोड़ें</span>
            </Link>

            <Link
              to="/businesses"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D477A] hover:bg-[#09355C] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <span>Explore All</span>
              <LuArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Listings / Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 animate-pulse h-64"
              ></div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-slate-700 text-[#0D477A] dark:text-sky-300 flex items-center justify-center mx-auto mb-3">
              <LuStore className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
              Be the first to list your business in Sareri.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
              सरेरी में अपनी दुकान या सेवा को सबसे पहले पंजीकृत करें और डिजिटल गाँव पोर्टल पर अपनी पहचान बनाएं।
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/businesses/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D477A] hover:bg-[#09355C] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                <LuPlusCircle className="w-4 h-4" />
                <span>दुकान पंजीकरण करें (Register Your Shop)</span>
              </Link>
              <Link
                to="/businesses"
                className="text-xs text-[#0D477A] dark:text-sky-400 font-semibold hover:underline"
              >
                व्यापार निर्देशिका देखें →
              </Link>
            </div>
          </div>
        ) : (
          /* 4 Verified Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {businesses.map((biz) => {
              const shopUrl = `/${biz.slug}`;
              const mapUrl = biz.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.name + ' Brahmano Ki Sareri')}`;

              return (
                <div
                  key={biz.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      {biz.coverUrl || biz.logoUrl ? (
                        <img
                          src={biz.coverUrl || biz.logoUrl}
                          alt={biz.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-800">
                          <LuStore className="w-10 h-10 mb-1" />
                        </div>
                      )}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                          {biz.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <Link to={shopUrl}>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-[#0D477A] dark:group-hover:text-sky-300 transition-colors line-clamp-1 notranslate">
                          {biz.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1.5 mt-1.5 mb-2 text-xs">
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <LuStar className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{biz.rating ? Number(biz.rating).toFixed(1) : 'New'}</span>
                        </div>
                        {biz.reviewCount > 0 && (
                          <span className="text-slate-400 text-[11px]">({biz.reviewCount})</span>
                        )}
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate text-[11px]">
                          <LuMapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{biz.locality || 'Sareri'}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {biz.shortDescription || biz.description || 'सरेरी का विश्वसनीय स्थानीय प्रतिष्ठान।'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 pt-0 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                    <Link
                      to={shopUrl}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#0D477A] hover:bg-[#09355C] text-white font-bold text-xs transition-colors min-h-[38px]"
                    >
                      <span>View Shop</span>
                      <LuArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 min-h-[38px] min-w-[38px]"
                      title="Google Maps"
                    >
                      <LuNavigation className="w-4 h-4 text-[#FF9933]" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default HomeBusinessesSection;
