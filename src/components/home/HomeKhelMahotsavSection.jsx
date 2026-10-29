import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShare2, FiCheck } from 'react-icons/fi';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';

const HomeKhelMahotsavSection = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Real-time listener for Khel Mahotsav settings controlled by Admin toggle
  useEffect(() => {
    const settingsRef = ref(rtdb, 'adminData/khelSettings');
    const unsub = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      } else {
        setSettings(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching khel settings:', err);
      setSettings(null);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // If Admin has NOT turned the toggle ON, do not render this widget on Home page
  if (loading || !settings || !settings.isOpen) {
    return null;
  }

  const title = settings.title?.trim() || 'सरेरी खेल महोत्सव';
  const dates = settings.dates?.trim() || '';
  const venue = settings.venue?.trim() || '';

  // WhatsApp Share with dynamic data (no hardcoded dates/venue)
  const handleWhatsAppShare = () => {
    const shareUrl = `${window.location.origin}/khel-registration`;
    let shareMessage = `🏆 *${title} - ऑनलाइन पंजीकरण शुरू!* 🏏🏐🤼\n\n` +
      `गाँव सरेरी में आयोजित होने वाले भव्य खेल महोत्सव में अपनी टीम या खिलाड़ी का निःशुल्क ऑनलाइन रजिस्ट्रेशन करें!\n\n`;

    if (dates) {
      shareMessage += `📅 *तारीख:* ${dates}\n`;
    }
    if (venue) {
      shareMessage += `📍 *स्थान:* ${venue}\n`;
    }
    shareMessage += `👉 *टीम रजिस्टर करने के लिए लिंक खोलें:*\n${shareUrl}\n\n` +
      `गाँव के सभी युवा साथियों व WhatsApp ग्रुप्स में तुरंत शेयर करें! 🚀`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/khel-registration`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <section className="py-2.5 sm:py-4 bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-[#0B1120] dark:via-slate-900/60 dark:to-[#0B1120] notranslate" translate="no">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* COMPACT & LIGHTWEIGHT DIRECTIONAL WIDGET */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-[#11192b] to-slate-900 border border-amber-500/30 shadow-lg p-3 sm:p-4 md:p-5 text-white">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* LEFT: Icon + Title + Dynamic Date/Venue Info */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-md shadow-orange-500/20">
                🏆
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-ping shrink-0" />
                  <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wide truncate">
                    खेल महोत्सव • रजिस्ट्रेशन चालू
                  </span>
                  {dates && (
                    <span className="hidden md:inline-block text-[11px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full truncate">
                      📅 {dates}
                    </span>
                  )}
                </div>

                <h3 className="text-xs sm:text-base md:text-lg font-extrabold text-white truncate font-heading tracking-tight">
                  {title}
                </h3>

                {dates && (
                  <p className="text-[10px] sm:text-xs text-amber-200/90 md:hidden truncate">
                    📅 {dates} {venue ? `• 📍 ${venue}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT: COMPACT ACTIONS ROW */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto w-full sm:w-auto">
              
              {/* PRIMARY CTA: Navigate to Registration Page */}
              <Link
                to="/khel-registration"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 text-center whitespace-nowrap"
              >
                <span>रजिस्टर करें</span>
                <FiArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>

              {/* WHATSAPP SHARE */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 whitespace-nowrap"
                title="WhatsApp पर शेयर करें"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>शेयर</span>
              </button>

              {/* COPY LINK */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all"
                title="लिंक कॉपी करें"
              >
                {copiedLink ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiShare2 className="w-3.5 h-3.5" />}
              </button>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HomeKhelMahotsavSection;
