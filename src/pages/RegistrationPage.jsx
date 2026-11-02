import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiActivity, FiUser, FiPhone, FiMapPin, FiCheckCircle, 
  FiShare2, FiCalendar, FiAward, FiCopy, FiCheck, FiUsers, FiAlertCircle 
} from 'react-icons/fi';
import { ref, onValue, push, set } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';

const SPORTS_LIST = [
  { id: 'Cricket', name: 'क्रिकेट (Cricket)', icon: '🏏', badge: '11+ खिलाड़ी' },
  { id: 'Volleyball', name: 'वॉलीबॉल (Volleyball)', icon: '🏐', badge: '6 खिलाड़ी' },
  { id: 'Kabaddi', name: 'कबड्डी (Kabaddi)', icon: '🤼', badge: '7 खिलाड़ी' },
  { id: 'Tug of War', name: 'रस्साकशी (Tug of War)', icon: '🪢', badge: '8 खिलाड़ी' },
  { id: 'Athletics', name: '100m दौड़ / एथलेटिक्स (Athletics)', icon: '🏃‍♂️', badge: 'व्यक्तिगत' },
  { id: 'Badminton', name: 'बैडमिंटन (Badminton)', icon: '🏸', badge: 'सिंगल / डबल्स' },
  { id: 'Kho-Kho', name: 'खो-खो (Kho-Kho)', icon: '🤾‍♂️', badge: '9 खिलाड़ी' }
];

const RegistrationPage = () => {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  const [formData, setFormData] = useState({
    teamName: '',
    captainName: '',
    contact: '',
    sport: 'Cricket',
    village: 'सरेरी (Sareri)',
    playerNames: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Real-time listener for Khel Mahotsav settings configured by Admin
  useEffect(() => {
    const settingsRef = ref(rtdb, 'adminData/khelSettings');
    const unsub = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      } else {
        setSettings({
          isOpen: true,
          title: 'सरेरी श्याम खेल महोत्सव',
          subtitle: 'गाँव ब्राह्मणों की सरेरी (भीलवाड़ा) • खेलकूद महाकुंभ',
          dates: '',
          venue: '',
          instructions: 'पंजीकरण पूरी तरह निःशुल्क है। सभी खिलाड़ी एवं टीमें नीचे दिए गए फॉर्म से तुरंत रजिस्ट्रेशन करें।'
        });
      }
      setLoadingSettings(false);
    }, (err) => {
      console.error('Error fetching khel settings:', err);
      setSettings(null);
      setLoadingSettings(false);
    });

    return () => unsub();
  }, []);

  const title = settings?.title?.trim() || 'सरेरी श्याम खेल महोत्सव';
  const subtitle = settings?.subtitle?.trim() || 'गाँव ब्राह्मणों की सरेरी (भीलवाड़ा) • खेलकूद महाकुंभ';
  const dates = settings?.dates?.trim() || '';
  const venue = settings?.venue?.trim() || '';
  const instructions = settings?.instructions?.trim() || 'पंजीकरण पूरी तरह निःशुल्क है। सभी खिलाड़ी एवं टीमें नीचे दिए गए फॉर्म से तुरंत रजिस्ट्रेशन करें।';
  const isOpen = settings?.isOpen ?? true;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamName.trim() || !formData.captainName.trim() || !formData.contact.trim()) {
      alert('कृपया टीम का नाम, कप्तान का नाम एवं संपर्क नंबर अवश्य भरें!');
      return;
    }

    if (!/^\d{10}$/.test(formData.contact.replace(/\D/g, ''))) {
      alert('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें!');
      return;
    }

    setIsSubmitting(true);
    const regId = `SRR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRegistration = {
      regId,
      ...formData,
      status: 'Confirmed',
      date: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Date.now()
    };

    try {
      const regRef = push(ref(rtdb, 'adminData/khelRegistrations'));
      await set(regRef, { id: regRef.key, ...newRegistration });
      setSubmittedData({ ...newRegistration, key: regRef.key });
      setFormData({
        teamName: '',
        captainName: '',
        contact: '',
        sport: 'Cricket',
        village: 'सरेरी (Sareri)',
        playerNames: ''
      });
    } catch (error) {
      console.error('Error saving khel registration:', error);
      alert('पंजीकरण सबमिट करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Share with Dynamic Info (NO hardcoded dates or venue)
  const handleWhatsAppShare = () => {
    const shareUrl = window.location.href;
    let shareMessage = `🏆 *${title} - ऑनलाइन पंजीकरण शुरू!* 🏏🏐🤼\n\n` +
      `गाँव सरेरी में आयोजित होने वाले भव्य खेल महोत्सव में अपनी टीम या खिलाड़ी का निःशुल्क ऑनलाइन रजिस्ट्रेशन करें!\n\n`;

    if (dates) {
      shareMessage += `📅 *तारीख:* ${dates}\n`;
    }
    if (venue) {
      shareMessage += `📍 *स्थान:* ${venue}\n`;
    }
    shareMessage += `⚡ *प्रतियोगिता:* क्रिकेट • वॉलीबॉल • कबड्डी • रस्साकशी • एथलेटिक्स\n\n` +
      `👉 *टीम का पंजीकरण करने के लिए लिंक खोलें:*\n${shareUrl}\n\n` +
      `गाँव के सभी युवा साथियों व WhatsApp ग्रुप्स में तुरंत शेयर करें! 🚀`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  // Native Web Share with Clipboard Fallback
  const handleNativeShare = async () => {
    const shareUrl = window.location.href;
    let shareText = `🏆 ${title} में अपनी टीम का मुफ़्त ऑनलाइन रजिस्ट्रेशन करें!`;
    if (dates) shareText += ` तारीख: ${dates}`;
    if (venue) shareText += ` स्थान: ${venue}`;

    const shareData = {
      title: `${title} - रजिस्ट्रेशन शुरू`,
      text: shareText,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyLinkFallback(shareUrl);
        }
      }
    } else {
      copyLinkFallback(shareUrl);
    }
  };

  const copyLinkFallback = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Share Receipt on WhatsApp after successful registration
  const handleShareReceipt = () => {
    if (!submittedData) return;
    let msg = `✅ *${title} - पंजीकरण रसीद* 🏆\n\n` +
      `📌 *पंजीकरण क्रमांक:* ${submittedData.regId}\n` +
      `🛡️ *टीम का नाम:* ${submittedData.teamName}\n` +
      `🏏 *खेल:* ${submittedData.sport}\n` +
      `👤 *कप्तान:* ${submittedData.captainName} (${submittedData.contact})\n`;
    if (venue) msg += `📍 *स्थान:* ${venue}\n`;
    if (dates) msg += `📅 *तारीख:* ${dates}\n`;
    msg += `\nहमारी टीम का खेल महोत्सव में रजिस्ट्रेशन कन्फर्म हो गया है! 🔥`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="pt-3 sm:pt-6 pb-16 min-h-screen bg-gradient-to-b from-slate-950 via-[#0B1528] to-slate-950 text-white relative overflow-hidden notranslate" translate="no">
      <SEO 
        title={`${title} - ऑनलाइन पंजीकरण पोर्टल`}
        description={`गाँव सरेरी खेल महोत्सव में अपनी टीम या खिलाड़ी का निःशुल्क ऑनलाइन रजिस्ट्रेशन करें।`}
        noindex={true}
      />

      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-orange-500/40 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md">
            <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-400 animate-ping' : 'bg-red-400'}`} />
            <span>{isOpen ? '🏆 आधिकारिक खेल महोत्सव • पंजीकरण चालू है' : '🛑 पंजीकरण वर्तमान में बंद है'}</span>
          </div>

          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-amber-100 font-heading tracking-tight leading-tight max-w-4xl"
            style={{ fontFamily: '"Yatra One", cursive, sans-serif' }}
          >
            {title}
          </h1>

          <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
            {subtitle}
          </p>

          {/* HIGHLIGHTS BAR (DYNAMIC) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm">
              <FiCalendar className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-medium">आयोजन तारीख</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate">
                {dates || 'शीघ्र घोषित की जाएगी'}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm">
              <FiMapPin className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-medium">खेल मैदान</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate" title={venue}>
                {venue || 'सरेरी खेल मैदान'}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm">
              <FiAward className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-medium">पंजीकरण शुल्क</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-300 mt-0.5">100% निःशुल्क</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm">
              <FiActivity className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400 font-medium">खेल श्रेणियां</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-0.5">7+ खेल प्रतियोगिताएं</div>
            </div>
          </div>

          {/* SHARE ACTION BUTTONS */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#25D366]/20 transform hover:-translate-y-0.5 active:translate-y-0"
              title="WhatsApp पर प्रतियोगिता शेयर करें"
            >
              <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp पर शेयर करें</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all"
            >
              <FiShare2 className="w-4 h-4 text-amber-300" />
              <span>प्रतियोगिता लिंक शेयर करें</span>
            </button>

            {copiedLink && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <FiCheck className="w-3.5 h-3.5" /> लिंक कॉपी हो गया!
              </span>
            )}
          </div>
        </div>

        {/* REGISTRATION CLOSED NOTICE */}
        {!isOpen && (
          <div className="bg-red-950/60 border border-red-500/40 rounded-3xl p-8 text-center max-w-2xl mx-auto backdrop-blur-xl mb-10 shadow-2xl">
            <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white font-heading">
              पंजीकरण वर्तमान में बंद है
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              खेल महोत्सव के लिए ऑनलाइन रजिस्ट्रेशन विंडो वर्तमान में खुली नहीं है। नवीनतम जानकारी के लिए ग्राम पंचायत अथवा खेल समिति से संपर्क करें।
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link 
                to="/" 
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
              >
                ← मुख्य पृष्ठ पर लौटें (Home)
              </Link>
            </div>
          </div>
        )}

        {/* MAIN REGISTRATION CARD */}
        {isOpen && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500" />

            {/* SUCCESS / RECEIPT SCREEN */}
            <AnimatePresence mode="wait">
              {submittedData ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8 text-center max-w-xl mx-auto space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <FiCheckCircle className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                      पंजीकरण सफल! (Registration Confirmed)
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                      आपकी टीम का पंजीकरण <span className="text-amber-400 font-semibold">{title}</span> में सफलतापूर्वक दर्ज कर लिया गया है।
                    </p>
                  </div>

                  {/* RECEIPT BOX */}
                  <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 text-left space-y-3 font-sans shadow-inner">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-xs text-slate-400 font-semibold uppercase">पंजीकरण संख्या (Reg ID)</span>
                      <span className="text-sm font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20">
                        {submittedData.regId}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-slate-400 block text-[11px]">टीम का नाम:</span>
                        <strong className="text-white">{submittedData.teamName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">खेल श्रेणी:</span>
                        <strong className="text-orange-400">{submittedData.sport}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">कप्तान का नाम:</span>
                        <strong className="text-white">{submittedData.captainName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">संपर्क नंबर:</span>
                        <strong className="text-white">{submittedData.contact}</strong>
                      </div>
                      {submittedData.village && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[11px]">गाँव / मोहल्ला:</span>
                          <strong className="text-slate-200">{submittedData.village}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleShareReceipt}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-lg shadow-[#25D366]/20 transition-all"
                    >
                      <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>टीम को WhatsApp पर रसीद भेजें</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubmittedData(null)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700"
                    >
                      <span>दूसरी टीम रजिस्टर करें</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/80 gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                        टीम / खिलाड़ी पंजीकरण फॉर्म
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        {instructions}
                      </p>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20 self-start sm:self-auto">
                      * आवश्यक फ़ील्ड्स
                    </span>
                  </div>

                  {/* SPORT SELECTOR TILES */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                      1. खेल चुनें (Select Sport) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                      {SPORTS_LIST.map((sp) => {
                        const isSelected = formData.sport === sp.id;
                        return (
                          <button
                            key={sp.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, sport: sp.id }))}
                            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-gradient-to-b from-orange-500/30 to-amber-500/20 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-950'
                            }`}
                          >
                            <span className="text-2xl">{sp.icon}</span>
                            <span className="text-xs font-bold leading-tight line-clamp-1">{sp.name.split(' ')[0]}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{sp.badge}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* FORM FIELDS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Team Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        टीम का नाम (Team / Club Name) *
                      </label>
                      <div className="relative">
                        <FiUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="teamName"
                          value={formData.teamName}
                          onChange={handleChange}
                          required
                          placeholder="उदा. सरेरी स्ट्राइकर्स / Shyam Warriors"
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Captain Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        कप्तान / मुख्य खिलाड़ी का नाम *
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="captainName"
                          value={formData.captainName}
                          onChange={handleChange}
                          required
                          placeholder="उदा. राहुल व्यास / कप्तान का नाम"
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        WhatsApp मोबाइल नंबर *
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          name="contact"
                          value={formData.contact}
                          onChange={handleChange}
                          required
                          maxLength={10}
                          placeholder="10 अंकों का मोबाइल नंबर"
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Village / Locality */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        गाँव / मोहल्ला (Village / Ward)
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          name="village"
                          value={formData.village}
                          onChange={handleChange}
                          placeholder="सरेरी / आसपास का गाँव"
                          className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium"
                        />
                      </div>
                    </div>

                    {/* Player Names / Squad */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        खिलाड़ियों के नाम (Player Names / Comma Separated)
                      </label>
                      <textarea
                        name="playerNames"
                        value={formData.playerNames}
                        onChange={handleChange}
                        rows={2}
                        placeholder="उदा. राहुल, सुरेश, विकास, अनिल, राकेश... (या कुल खिलाड़ियों की संख्या)"
                        className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 text-center sm:text-left">
                      🔒 आपका डेटा ग्राम खेल समिति के पास सुरक्षित रहेगा। पंजीकरण निःशुल्क है।
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-orange-600/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {isSubmitting ? 'पंजीकरण हो रहा है...' : 'पंजीकरण सबमिट करें 🚀'}
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};

export default RegistrationPage;
