import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCamera, FiUpload, FiMic, FiCheckCircle, FiClock, FiSearch, 
  FiFileText, FiUser, FiXCircle, FiCopy, FiCheck, FiRefreshCw, 
  FiShare2, FiPhone, FiMapPin, FiSend, FiLock, FiShield
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { ref, push, set, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { useSearchParams, Link } from 'react-router-dom';
import { rtdb, auth, googleProvider } from '../firebase';
import React from 'react';

// Quick Category Options
const CATEGORIES = [
  { id: 'water', label: 'पेयजल', icon: '🚰' },
  { id: 'light', label: 'स्ट्रीट लाइट', icon: '💡' },
  { id: 'sanitation', label: 'सफाई व नाली', icon: '🧹' },
  { id: 'road', label: 'सड़क व खड़ंजा', icon: '🛣️' },
  { id: 'agriculture', label: 'कृषि सहायता', icon: '🌾' },
  { id: 'scheme', label: 'सरकारी योजना', icon: '📋' },
  { id: 'other', label: 'अन्य सुझाव', icon: '💬' },
];

const WARDS = [
  'वार्ड 1', 'वार्ड 2', 'वार्ड 3', 'वार्ड 4', 'वार्ड 5', 
  'वार्ड 6', 'वार्ड 7', 'वार्ड 8', 'वार्ड 9', 'वार्ड 10', 'वार्ड 11',
  'सामान्य सरेरी (पूरा गाँव)'
];

const ComplaintForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'history' ? 'history' : 'register';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form State
  const [complaint, setComplaint] = useState({
    name: '',
    contact: '',
    category: 'पेयजल',
    ward: 'सामान्य सरेरी (पूरा गाँव)',
    details: '',
    photo: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [successComplaint, setSuccessComplaint] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Complaints History & Search State
  const [userComplaints, setUserComplaints] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tab with URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'history') {
      setActiveTab('history');
    }
  }, [searchParams]);

  // Track Auth & Pre-fill
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setComplaint(prev => ({
          ...prev,
          name: prev.name || currentUser.displayName || '',
          contact: prev.contact || currentUser.phoneNumber || ''
        }));
      }
    });
    return () => unsub();
  }, []);

  // 1-Click Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      alert('लॉगिन विफल रहा। कृपया पुनः प्रयास करें।');
    }
  };

  // Fetch Complaints from Firebase - STRICT PRIVACY: Query ONLY this user's complaints!
  const fetchComplaints = async () => {
    if (!user) {
      setUserComplaints([]);
      return;
    }

    setIsLoadingHistory(true);
    try {
      // Direct database-level query matching security rules
      const userComplaintsQuery = query(
        ref(rtdb, 'adminData/complaints'),
        orderByChild('userId'),
        equalTo(user.uid)
      );
      const snapshot = await get(userComplaintsQuery);
      
      let userList = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        userList = Object.keys(data).map(key => ({
          firebaseId: key,
          ...data[key]
        }));
      }

      userList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setUserComplaints(userList);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setUserComplaints([]);
    }
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchComplaints();
    }
  }, [activeTab, user]);

  // Speech-to-Text (Voice Typing in Hindi)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("आपके ब्राउज़र में बोलकर लिखने की सुविधा समर्थित नहीं है। कृपया लिखकर शिकायत दर्ज करें।");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setComplaint(prev => ({
          ...prev,
          details: prev.details ? `${prev.details} ${transcript}` : transcript
        }));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Image Upload with Canvas Compression
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
        setComplaint(prev => ({ ...prev, photo: compressedBase64 }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // Submit Complaint (Requires Logged In User with Verified Email)
  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!navigator.onLine) {
      alert('⚠️ इंटरनेट कनेक्शन उपलब्ध नहीं है। कृपया अपना नेटवर्क कनेक्शन जांचें।');
      return;
    }
    if (!user || !user.email) {
      alert('शिकायत दर्ज करने के लिए ईमेल आईडी होना अनिवार्य है। कृपया पहले अपने Google खाते से लॉगिन करें।');
      return;
    }

    // Rate Limiting & Spam Prevention (3-minute cooldown)
    const lastComplaintTs = localStorage.getItem(`sareri_last_comp_${user.uid}`);
    if (lastComplaintTs) {
      const elapsed = Date.now() - parseInt(lastComplaintTs, 10);
      const COOLDOWN_MS = 3 * 60 * 1000;
      if (elapsed < COOLDOWN_MS) {
        const remainingMinutes = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
        alert(`⏳ स्पैम रोकथाम: आप अगली शिकायत ${remainingMinutes} मिनट बाद दर्ज कर सकते हैं। कृपया थोड़ा इंतज़ार करें।`);
        return;
      }
    }

    if (!complaint.name.trim()) {
      alert('कृपया अपना नाम लिखें');
      return;
    }
    if (!complaint.contact || complaint.contact.length !== 10) {
      alert('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें');
      return;
    }
    if (!complaint.details.trim()) {
      alert('कृपया समस्या का विवरण लिखें');
      return;
    }

    setIsSubmitting(true);
    setSuccessComplaint(null);

    try {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const trackingId = `CMP-${randomDigits}`;
      const now = new Date();
      const dateFormatted = now.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const newComplaintData = {
        trackingId,
        date: dateFormatted,
        timestamp: Date.now(),
        status: 'Pending',
        name: complaint.name.trim(),
        contact: complaint.contact.trim(),
        ward: complaint.ward,
        category: complaint.category,
        details: complaint.details.trim(),
        photo: complaint.photo || null,
        userId: user.uid,
        userEmail: user.email || '',
        adminReply: ''
      };

      // Push to Firebase RTDB
      const complaintsRef = ref(rtdb, 'adminData/complaints');
      const newRef = push(complaintsRef);
      const fullRecord = { id: newRef.key, ...newComplaintData };
      await set(newRef, fullRecord);

      // Record timestamp for rate limiting
      localStorage.setItem(`sareri_last_comp_${user.uid}`, Date.now().toString());

      // Set Success State
      setSuccessComplaint(fullRecord);
      setComplaint({
        name: user.displayName || '',
        contact: '',
        category: 'पेयजल',
        ward: 'सामान्य सरेरी (पूरा गाँव)',
        details: '',
        photo: null
      });

      setUserComplaints(prev => [fullRecord, ...prev]);
    } catch (error) {
      console.error(error);
      alert('शिकायत दर्ज करने में समस्या आई। पुनः प्रयास करें।');
    }
    setIsSubmitting(false);
  };

  // Cancel Complaint
  const handleCancelComplaint = async (firebaseId, trackingId) => {
    if (!window.confirm('क्या आप अपनी यह शिकायत रद्द करना चाहते हैं?')) return;

    try {
      if (firebaseId) {
        const compRef = ref(rtdb, `adminData/complaints/${firebaseId}`);
        await update(compRef, { status: 'Cancelled' });
      }

      setUserComplaints(prev => prev.map(c => 
        (c.firebaseId === firebaseId || c.trackingId === trackingId)
          ? { ...c, status: 'Cancelled' }
          : c
      ));
    } catch (error) {
      alert('शिकायत रद्द नहीं हो सकी।');
    }
  };

  // Search filter
  const filteredComplaints = userComplaints.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (c.trackingId && c.trackingId.toLowerCase().includes(q)) ||
      (c.contact && c.contact.includes(q)) ||
      (c.ward && c.ward.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.details && c.details.toLowerCase().includes(q))
    );
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 pt-1 pb-10 sm:pt-3 sm:pb-14 font-sans">
      <div className="container mx-auto px-3.5 sm:px-6 max-w-2xl">
        
        {/* Compact, Clean Top Header */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#135334] dark:text-emerald-300 text-xs font-bold uppercase tracking-wide border border-emerald-200 mb-1">
            <span>🏛️ ग्राम पंचायत सरेरी</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading text-gray-900 dark:text-white leading-tight">
            जनसुनवाई एवं शिकायत पोर्टल
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            समस्या सीधे पंचायत तक पहुँचाएँ एवं लाइव स्टेटस ट्रैक करें
          </p>
        </div>

        {/* Clean Segmented Control Tabs */}
        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl flex items-center mb-4 sm:mb-5 shadow-inner">
          <button 
            onClick={() => {
              setActiveTab('register');
              setSearchParams({});
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register' 
                ? 'bg-white dark:bg-slate-700 text-[#135334] dark:text-emerald-300 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <FiFileText className="w-4 h-4" />
            <span>शिकायत दर्ज करें</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('history');
              setSearchParams({ tab: 'history' });
            }}
            className={`flex-1 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history' 
                ? 'bg-white dark:bg-slate-700 text-[#0D477A] dark:text-sky-300 shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <FiSearch className="w-4 h-4" />
            <span>मेरी शिकायतें</span>
            {userComplaints.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0D477A] text-white text-[10px] font-bold">
                {userComplaints.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: REGISTER COMPLAINT */}
        <AnimatePresence mode="wait">
          {activeTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 shadow-md border border-slate-200/80 dark:border-slate-700"
            >
              {authLoading ? (
                <div className="space-y-4 py-4 animate-pulse" role="status" aria-label="शिकायत फॉर्म लोड हो रहा है">
                  <span className="sr-only">शिकायत फॉर्म लोड हो रहा है…</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[0, 1, 2, 3].map((item) => (
                      <div key={item} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-700" />
                    ))}
                  </div>
                  <div className="h-28 rounded-xl bg-slate-100 dark:bg-slate-700" />
                  <div className="h-11 w-36 rounded-xl bg-slate-200 dark:bg-slate-600" />
                </div>
              ) : successComplaint ? (
                /* Celebratory Success Card */
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <FiCheckCircle className="w-9 h-9" />
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    शिकायत दर्ज हो गई!
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4">
                    आपकी समस्या ग्राम पंचायत रिकॉर्ड में ईमेल <span className="font-bold text-gray-800 dark:text-gray-200">{user?.email}</span> के साथ सुरक्षित कर दी गई है।
                  </p>

                  {/* Tracking ID Badge */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-2xl p-4 max-w-sm mx-auto mb-5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">आपकी ट्रैकिंग आईडी</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-mono font-black text-[#135334] dark:text-emerald-300">
                        {successComplaint.trackingId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(successComplaint.trackingId)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 text-[#135334] hover:bg-emerald-50"
                        title="Copy ID"
                      >
                        {copiedId ? <FiCheck className="w-4 h-4 text-emerald-600" /> : <FiCopy className="w-4 h-4" />}
                      </button>
                    </div>
                    {copiedId && (
                      <span className="text-[11px] text-emerald-700 font-bold block mt-1 animate-pulse">
                        ✓ ट्रैकिंग आईडी कॉपी हो गई!
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-xs mx-auto">
                    <button 
                      onClick={() => {
                        setSuccessComplaint(null);
                        setActiveTab('history');
                        setSearchParams({ tab: 'history' });
                      }}
                      className="w-full py-2.5 bg-[#0D477A] text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FiSearch className="w-4 h-4" />
                      <span>स्थिति ट्रैक करें (Track)</span>
                    </button>
                    <button 
                      onClick={() => setSuccessComplaint(null)}
                      className="w-full py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl text-xs"
                    >
                      अन्य शिकायत लिखें
                    </button>
                  </div>
                </div>
              ) : !user ? (
                /* AUTHENTICATION REQUIRED CARD (Security Policy: Verified Email & Privacy) */
                <div className="text-center py-6 sm:py-8">
                  <div className="w-14 h-14 bg-emerald-50 text-[#135334] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                    <FiShield className="w-7 h-7 text-[#135334]" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5">
                    नागरिक लॉगिन अनिवार्य है (Login Required)
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-5 leading-relaxed">
                    सुरक्षा, गोपनीयता एवं फर्जी शिकायतों की रोकथाम हेतु शिकायत के साथ ईमेल आईडी जुड़ना अनिवार्य है। केवल आप ही अपनी शिकायत की प्रगति व उत्तर देख सकेंगे।
                  </p>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-700 hover:bg-gray-50 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-xs sm:text-sm text-gray-800 dark:text-white shadow-sm flex items-center justify-center gap-3 mx-auto transition-all active:scale-98"
                  >
                    <FcGoogle className="w-5 h-5" />
                    <span>Google से 1-क्लिक में लॉगिन करें</span>
                  </button>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-gray-400">
                    पारंपरिक पासवर्ड से लॉगिन हेतु <Link to="/profile" className="text-[#135334] font-bold hover:underline">यहाँ क्लिक करें</Link>
                  </div>
                </div>
              ) : (
                /* Main Complaint Form for Logged-In User */
                <form onSubmit={submitComplaint} className="space-y-3.5">
                  
                  {/* Verified User Strip */}
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                    <div className="truncate flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <div className="truncate flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300">
                          {user.displayName || 'नागरिक'}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono text-[11px]">
                          ✉️ {user.email}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          ✓ प्रमाणित
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => signOut(auth)} 
                      className="text-red-500 font-bold hover:underline shrink-0 ml-2 text-[11px]"
                    >
                      लॉगआउट
                    </button>
                  </div>

                  {/* 1. Category Chips */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      समस्या का विषय चुनें *
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map(cat => {
                        const isSelected = complaint.category === cat.label;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setComplaint({ ...complaint, category: cat.label })}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border active:scale-95 ${
                              isSelected
                                ? 'bg-[#135334] text-white border-[#135334] shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-slate-100'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Ward Selector / Location */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      📍 वार्ड संख्या / स्थान चुनें (Ward / Location) *
                    </label>
                    <select
                      value={complaint.ward}
                      onChange={(e) => setComplaint({ ...complaint, ward: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135334] text-gray-900 dark:text-white text-xs sm:text-sm font-medium"
                    >
                      {WARDS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        आपका नाम *
                      </label>
                      <input 
                        type="text" 
                        required
                        value={complaint.name}
                        onChange={(e) => setComplaint({...complaint, name: e.target.value})}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135334] text-gray-900 dark:text-white text-xs sm:text-sm"
                        placeholder="उदा. रमेश शर्मा"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        मोबाइल नंबर (10 अंक) *
                      </label>
                      <input 
                        type="tel" 
                        required
                        pattern="[0-9]{10}"
                        minLength="10"
                        maxLength="10"
                        value={complaint.contact}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setComplaint({...complaint, contact: val});
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135334] text-gray-900 dark:text-white text-xs sm:text-sm font-mono"
                        placeholder="10 अंकों का मोबाइल नंबर"
                      />
                    </div>
                  </div>

                  {/* 4. Details with Integrated Voice Button */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        समस्या का पूरा विवरण *
                      </label>
                      <button 
                        type="button" 
                        onClick={startListening}
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                          isListening 
                            ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                            : 'bg-orange-50 border-orange-200 text-[#FF6B00] hover:bg-orange-100'
                        }`}
                      >
                        <FiMic className={isListening ? "animate-bounce" : ""} />
                        <span>{isListening ? 'सुन रहा हूँ...' : '🎤 बोलकर लिखें'}</span>
                      </button>
                    </div>

                    <textarea 
                      required
                      rows="3"
                      value={complaint.details}
                      onChange={(e) => setComplaint({...complaint, details: e.target.value})}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135334] text-gray-900 dark:text-white text-xs sm:text-sm leading-relaxed"
                      placeholder="समस्या का स्थान, क्या दिक्कत है, कब से है... विस्तार से लिखें"
                    ></textarea>
                  </div>

                  {/* 5. Photo Attachment */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      फोटो साक्ष्य जोड़ें (वैकल्पिक)
                    </label>

                    <div className="flex gap-2">
                      <label className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-slate-600">
                        <FiCamera className="text-base text-[#135334]" />
                        <span>फोटो खींचें</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>

                      <label className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-slate-600">
                        <FiUpload className="text-base text-[#0D477A]" />
                        <span>गैलरी</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {complaint.photo && (
                      <div className="mt-2 relative inline-block">
                        <img 
                          src={complaint.photo} 
                          alt="Evidence" 
                          className="h-20 w-20 rounded-xl object-cover border-2 border-emerald-500 shadow-xs" 
                        />
                        <button
                          type="button"
                          onClick={() => setComplaint({ ...complaint, photo: null })}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"
                        >
                          <FiXCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-[#135334] to-[#0E4228] hover:from-[#0E4228] hover:to-[#135334] text-white font-extrabold rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>दर्ज किया जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4 text-amber-300" />
                        <span>शिकायत दर्ज करें (Submit)</span>
                      </>
                    )}
                  </button>

                  <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/70 dark:border-blue-800/50 flex items-start gap-2 text-[11px] text-blue-900 dark:text-blue-200">
                    <FiShield className="w-4 h-4 text-[#0D477A] dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>सुरक्षा व गोपनीयता:</strong> यह शिकायत आपकी प्रमाणित ईमेल (<span className="font-mono font-bold">{user.email}</span>) से लिंक रहेगी। पंचायत व सरपंच के अलावा कोई अन्य नागरिक आपकी शिकायत नहीं देख सकता।
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* TAB 2: MY COMPLAINTS & TRACKING */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 shadow-md border border-slate-200/80 dark:border-slate-700"
            >
              {authLoading ? (
                <div className="space-y-3 py-4 animate-pulse" role="status" aria-label="शिकायत इतिहास लोड हो रहा है">
                  <span className="sr-only">शिकायत इतिहास लोड हो रहा है…</span>
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-700" />
                  ))}
                </div>
              ) : !user ? (
                /* Auth prompt for history tab */
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-blue-50 text-[#0D477A] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-200">
                    <FiLock className="w-7 h-7 text-[#0D477A]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                    अपनी शिकायतें देखने के लिए लॉगिन करें
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                    नागरिक गोपनीयता सुरक्षा के तहत केवल पंजीकृत ईमेल धारक ही अपनी शिकायतों का इतिहास व समाधान स्थिति देख सकते हैं।
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white dark:bg-slate-700 hover:bg-gray-50 border border-gray-300 dark:border-gray-600 rounded-xl font-bold text-xs sm:text-sm text-gray-800 dark:text-white shadow-sm flex items-center justify-center gap-3 mx-auto transition-all"
                  >
                    <FcGoogle className="w-5 h-5" />
                    <span>Google से 1-क्लिक में लॉगिन करें</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Header & Refresh */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      मेरी दर्ज शिकायतें ({filteredComplaints.length})
                    </span>
                    <button
                      onClick={fetchComplaints}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-slate-200"
                    >
                      <FiRefreshCw className={`w-3 h-3 ${isLoadingHistory ? 'animate-spin text-[#135334]' : ''}`} />
                      <span>अपडेट करें</span>
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative mb-3.5">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ID (उदा. CMP-123456) या वार्ड से खोजें..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D477A] text-xs sm:text-sm text-gray-900 dark:text-white"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        <FiXCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <div className="w-8 h-8 border-2 border-[#135334] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-500">शिकायत विवरण लोड हो रहा है...</p>
                    </div>
                  ) : filteredComplaints.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <FiFileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                        {searchQuery ? 'कोई परिणाम नहीं मिला' : 'आपके खाते से कोई शिकायत दर्ज नहीं है'}
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        {searchQuery ? 'कृपया सही आईडी या शब्द दर्ज करें।' : 'गाँव की समस्या की सूचना देने के लिए "शिकायत दर्ज करें" पर जाएँ।'}
                      </p>
                      <button
                        onClick={() => setActiveTab('register')}
                        className="px-4 py-2 rounded-xl bg-[#135334] text-white font-bold text-xs"
                      >
                        नई शिकायत दर्ज करें
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredComplaints.map(item => {
                        const isResolved = item.status === 'Resolved';
                        const isRejected = item.status === 'Rejected';
                        const isCancelled = item.status === 'Cancelled';
                        const isInProgress = item.status === 'In Progress';
                        const isPending = !item.status || item.status === 'Pending';

                        return (
                          <div 
                            key={item.firebaseId || item.trackingId}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-4 shadow-2xs relative overflow-hidden"
                          >
                            {/* Left status color bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                              isResolved ? 'bg-emerald-500' :
                              isRejected ? 'bg-red-500' :
                              isCancelled ? 'bg-gray-400' :
                              isInProgress ? 'bg-blue-600' : 'bg-[#FF6B00]'
                            }`} />

                            <div className="pl-2">
                              {/* Top Row: Tracking ID & Status */}
                              <div className="flex items-center justify-between gap-1 mb-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">
                                    {item.trackingId}
                                  </span>
                                  {item.category && (
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#135334]">
                                      {item.category}
                                    </span>
                                  )}
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                    📍 {item.ward || 'सामान्य सरेरी'}
                                  </span>
                                </div>

                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isResolved ? 'bg-emerald-100 text-emerald-800' :
                                  isRejected ? 'bg-red-100 text-red-800' :
                                  isCancelled ? 'bg-gray-200 text-gray-800' :
                                  isInProgress ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-[#FF6B00]'
                                }`}>
                                  {isResolved ? '✓ समाधान' :
                                   isRejected ? '✕ निरस्त' :
                                   isCancelled ? 'रद्द' :
                                   isInProgress ? '🔄 प्रगति पर' : '⏳ लंबित'}
                                </span>
                              </div>

                              {/* Details */}
                              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 leading-relaxed whitespace-pre-wrap">
                                {item.details}
                              </p>

                              {/* Photo Preview */}
                              {item.photo && (
                                <img 
                                  src={item.photo} 
                                  alt="Attached" 
                                  className="h-16 w-16 rounded-lg object-cover border mb-2 cursor-pointer hover:opacity-95"
                                  onClick={() => window.open(item.photo, '_blank')}
                                />
                              )}

                              {/* Admin Reply */}
                              {item.adminReply && (
                                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-2.5 rounded-xl border-l-3 border-[#135334] mb-2 text-xs">
                                  <span className="font-bold text-[#135334] dark:text-emerald-300 block mb-0.5">
                                    🏛️ पंचायत प्रशासन उत्तर:
                                  </span>
                                  <span className="text-gray-800 dark:text-gray-200">
                                    {item.adminReply}
                                  </span>
                                </div>
                              )}

                              {/* Footer Meta */}
                              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                                <span>{item.date}</span>
                                {isPending && (
                                  <button
                                    onClick={() => handleCancelComplaint(item.firebaseId, item.trackingId)}
                                    className="text-red-500 font-bold hover:underline"
                                  >
                                    रद्द करें
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ComplaintForm;
