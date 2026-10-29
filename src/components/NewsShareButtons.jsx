import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiShare2, FiCheck, FiCopy } from 'react-icons/fi';

const NewsShareButtons = ({ item, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const getShareDetails = () => {
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://villagesareri.in';

    const newsUrl = `${origin}/news#news-${item.id || ''}`;

    let coverPhotoUrl = '';
    if (item.image) {
      coverPhotoUrl = item.image.startsWith('http')
        ? item.image
        : `${origin}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
    }

    const title = item.title || 'गाँव की ताज़ा खबर';
    const dateLine = item.date ? `\n📅 *दिनांक:* ${item.date}` : '';
    
    // Clean snippet
    let snippet = '';
    if (item.desc) {
      const cleanDesc = item.desc.replace(/\s+/g, ' ').trim();
      snippet = `\n\n📝 ${cleanDesc.length > 200 ? cleanDesc.slice(0, 197) + '...' : cleanDesc}`;
    }

    const photoLine = coverPhotoUrl ? `\n\n🖼️ *कवर फोटो:* ${coverPhotoUrl}` : '';

    const shareText = `📰 *${title}*${dateLine}${snippet}${photoLine}\n\n🔗 *पूरी खबर यहाँ पढ़ें:* ${newsUrl}\n\n— *ब्राह्मणों की सरेरी ग्राम पोर्टल*`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

    return { shareText, newsUrl, whatsappUrl, title, coverPhotoUrl };
  };

  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    const { whatsappUrl } = getShareDetails();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeOrCopyShare = async (e) => {
    e.stopPropagation();
    const { shareText, newsUrl, title } = getShareDetails();

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: newsUrl
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share error:', err);
        }
      }
    }

    // Fallback: Copy link with text
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20"
          title="WhatsApp पर शेयर करें (Cover Photo के साथ)"
        >
          <FaWhatsapp className="w-3.5 h-3.5 text-white" />
          <span>शेयर</span>
        </button>

        {/* Copy / Native Share */}
        <button
          onClick={handleNativeOrCopyShare}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 hover:bg-gray-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all active:scale-95"
          title="लिंक व खबर कॉपी/शेयर करें"
        >
          {copied ? (
            <>
              <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">कॉपी हुआ</span>
            </>
          ) : (
            <>
              <FiShare2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700/60">
      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1 flex items-center gap-1">
        <FiShare2 className="w-3.5 h-3.5" /> शेयर करें:
      </span>

      {/* WhatsApp Share Button */}
      <button
        onClick={handleWhatsAppShare}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
      >
        <FaWhatsapp className="w-4 h-4 text-white" />
        <span>WhatsApp पर भेजें (फोटो सहित)</span>
      </button>

      {/* Native Web Share / Copy Button */}
      <button
        onClick={handleNativeOrCopyShare}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-all active:scale-95"
      >
        {copied ? (
          <>
            <FiCheck className="w-4 h-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400 font-bold">लिंक कॉपी हो गया!</span>
          </>
        ) : (
          <>
            <FiCopy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>खबर कॉपी करें</span>
          </>
        )}
      </button>
    </div>
  );
};

export default NewsShareButtons;
