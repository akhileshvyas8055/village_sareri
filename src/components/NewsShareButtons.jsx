import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiShare2, FiCheck, FiCopy, FiLoader } from 'react-icons/fi';

const NewsShareButtons = ({ item, compact = false }) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const getCleanShareData = () => {
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://villagesareri.in';

    // Direct link to this specific news article (supports both ?id= and #news-)
    const newsUrl = `${origin}/news?id=${item.id || ''}`;

    const title = item.title || 'गाँव की ताज़ा खबर';
    const dateLine = item.date ? `\n📅 *दिनांक:* ${item.date}` : '';

    let snippet = '';
    if (item.desc) {
      const cleanDesc = item.desc.replace(/\s+/g, ' ').trim();
      snippet = `\n\n📝 ${cleanDesc.length > 200 ? cleanDesc.slice(0, 197) + '...' : cleanDesc}`;
    }

    // Clean text caption WITHOUT the huge Firebase image URL
    const captionText = `📰 *${title}*${dateLine}${snippet}\n\n🔗 *पूरी खबर पढ़ने के लिए यहाँ क्लिक करें:*\n${newsUrl}\n\n— *ब्राह्मणों की सरेरी ग्राम पोर्टल*`;

    return { title, newsUrl, captionText, origin };
  };

  // Helper to fetch image as a File object for native photo sharing
  const fetchImageFile = async (imageUrl) => {
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      if (!res.ok) return null;
      const blob = await res.blob();
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      return new File([blob], `sareri-news-${item.id || 'photo'}.${ext}`, {
        type: blob.type || 'image/jpeg'
      });
    } catch {
      return null;
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    setIsSharing(true);

    const { title, newsUrl, captionText } = getCleanShareData();

    try {
      // 1. If native share is supported and news has a cover photo:
      // Try to share the ACTUAL photo with the caption text underneath
      if (item.image && typeof navigator !== 'undefined' && navigator.share) {
        const imageFile = await fetchImageFile(item.image);
        if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          await navigator.share({
            files: [imageFile],
            title: title,
            text: captionText,
          });
          setIsSharing(false);
          return;
        }
      }

      // 2. If file share isn't supported, try native text share
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: title,
          text: captionText,
          url: newsUrl
        });
        setIsSharing(false);
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setIsSharing(false);
        return; // User cancelled share sheet
      }
      console.warn('Native share fallback triggered:', err);
    }

    // 3. Fallback: Direct WhatsApp text with clean news link (No big image URL)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(captionText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsSharing(false);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    const { captionText } = getCleanShareData();
    try {
      await navigator.clipboard.writeText(captionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {/* WhatsApp / Photo Share Button */}
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-75"
          title="फोटो व लिंक के साथ शेयर करें"
        >
          {isSharing ? (
            <FiLoader className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <FaWhatsapp className="w-3.5 h-3.5 text-white" />
          )}
          <span>{isSharing ? 'तैयार...' : 'शेयर'}</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 hover:bg-gray-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-all active:scale-95"
          title="खबर व लिंक कॉपी करें"
        >
          {copied ? (
            <>
              <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">कॉपी</span>
            </>
          ) : (
            <FiCopy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700/60">
      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1 flex items-center gap-1">
        <FiShare2 className="w-3.5 h-3.5" /> शेयर:
      </span>

      {/* Main WhatsApp / Photo Share Button */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-75"
      >
        {isSharing ? (
          <FiLoader className="w-4 h-4 animate-spin text-white" />
        ) : (
          <FaWhatsapp className="w-4 h-4 text-white" />
        )}
        <span>{isSharing ? 'फोटो तैयार हो रही है...' : 'WhatsApp पर भेजें (फोटो सहित)'}</span>
      </button>

      {/* Copy News Link */}
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-all active:scale-95"
      >
        {copied ? (
          <>
            <FiCheck className="w-4 h-4 text-green-500" />
            <span className="text-green-600 dark:text-green-400 font-bold">खबर लिंक कॉपी हो गई!</span>
          </>
        ) : (
          <>
            <FiCopy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>खबर लिंक कॉपी करें</span>
          </>
        )}
      </button>
    </div>
  );
};

export default NewsShareButtons;
