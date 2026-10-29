import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, googleProvider, rtdb } from '../firebase';
import SEO from '../components/SEO';
import {
  isSlugAvailable,
  sanitizeSlug,
  registerBusiness,
  updateBusinessDetails,
  compressImageToDataUrl,
  DEFAULT_BUSINESS_CATEGORIES
} from '../services/businessService';
import {
  FiShoppingBag as LuStore,
  FiCheckCircle as LuCheckCircle,
  FiAlertCircle as LuAlertCircle,
  FiArrowLeft as LuArrowLeft,
  FiUpload as LuUpload,
  FiLogIn as LuLogIn,
  FiClock as LuClock,
  FiExternalLink as LuExternalLink,
  FiPhone as LuPhone,
  FiMapPin as LuMapPin
} from 'react-icons/fi';

const BusinessRegisterPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Grocery & Kirana',
    ownerName: '',
    phone: '',
    whatsapp: '',
    description: '',
    products: '',
    services: '',
    keywords: '',
    locality: 'सरेरी',
    address: '',
    mapLink: '',
    openingHours: '08:00 AM - 08:00 PM',
    logoUrl: '',
    coverUrl: '',
    slug: ''
  });

  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null, message: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // User's existing applications
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'my-listings'
  const [editingBizId, setEditingBizId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setFormData((prev) => ({
          ...prev,
          ownerName: prev.ownerName || currentUser.displayName || ''
        }));
      }
    });
    return () => unsub();
  }, []);

  // Fetch logged in user's businesses
  useEffect(() => {
    if (!user) {
      setMyBusinesses([]);
      return;
    }
    const bizRef = ref(rtdb, 'businesses');
    const unsubBiz = onValue(bizRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const mine = Object.values(val).filter((b) => b && b.ownerUid === user.uid);
        setMyBusinesses(mine);
      } else {
        setMyBusinesses([]);
      }
    });
    return () => unsubBiz();
  }, [user]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If shop name changes and slug is untouched or matches previous name, auto-suggest slug
    if (name === 'name' && value.trim()) {
      const suggested = sanitizeSlug(value);
      setFormData((prev) => ({ ...prev, slug: suggested }));
      checkSlug(suggested);
    }
  };

  // Check Slug Availability
  const checkSlug = async (slugCandidate) => {
    const clean = sanitizeSlug(slugCandidate);
    if (!clean || clean.length < 3) {
      setSlugStatus({ checking: false, available: false, message: 'कम से कम 3 अक्षर आवश्यक हैं (Min 3 characters)' });
      return;
    }

    setSlugStatus({ checking: true, available: null, message: 'Checking...' });
    const result = await isSlugAvailable(clean);
    if (result.available) {
      setSlugStatus({ checking: false, available: true, message: `villagesareri.in/${clean} उपलब्ध है (Available!)` });
    } else {
      setSlugStatus({ checking: false, available: false, message: result.error });
    }
  };

  const handleSlugChange = (e) => {
    const clean = sanitizeSlug(e.target.value);
    setFormData((prev) => ({ ...prev, slug: clean }));
    checkSlug(clean);
  };

  // Handle Image Upload
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('कृपया 5MB से छोटी फ़ोटो चुनें (Max 5MB file).');
      return;
    }

    try {
      const dataUrl = await compressImageToDataUrl(file, 800, 0.75);
      setImageFile(file);
      setImagePreview(dataUrl);
      setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
    } catch (err) {
      console.error(err);
      alert('Image upload error: ' + err.message);
    }
  };

  // Handle Cover Photo Upload
  const handleCoverSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 1200, 600, 0.82);
      setCoverPreview(dataUrl);
      setFormData((prev) => ({ ...prev, coverUrl: dataUrl }));
    } catch (err) {
      console.error(err);
      alert('Cover upload error: ' + err.message);
    }
  };

  // Google Login helper
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      alert('Login Error: ' + err.message);
    }
  };

  // Start Editing Existing Shop
  const handleStartEdit = (biz) => {
    setEditingBizId(biz.id);
    setFormData({
      name: biz.name || '',
      category: biz.category || 'Grocery & Kirana',
      ownerName: biz.ownerName || '',
      phone: biz.phone || '',
      whatsapp: biz.whatsapp || '',
      description: biz.description || '',
      products: biz.products || '',
      services: biz.services || '',
      keywords: biz.keywords || '',
      locality: biz.locality || 'सरेरी',
      address: biz.address || '',
      mapLink: biz.mapLink || '',
      openingHours: biz.openingHours || '08:00 AM - 08:00 PM',
      logoUrl: biz.logoUrl || '',
      coverUrl: biz.coverUrl || '',
      slug: biz.slug || ''
    });
    setSlugStatus({ checking: false, available: true, message: 'Current Shop URL' });
    setImagePreview(biz.logoUrl || '');
    setCoverPreview(biz.coverUrl || '');
    setActiveTab('form');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingBizId(null);
    setFormData({
      name: '',
      category: 'Grocery & Kirana',
      ownerName: user?.displayName || '',
      phone: '',
      whatsapp: '',
      description: '',
      products: '',
      services: '',
      keywords: '',
      locality: 'सरेरी',
      address: '',
      mapLink: '',
      openingHours: '08:00 AM - 08:00 PM',
      logoUrl: '',
      coverUrl: '',
      slug: ''
    });
    setImagePreview('');
    setCoverPreview('');
    setSlugStatus({ checking: false, available: null, message: '' });
  };

  // Submit Handler (Registration or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      setErrorMessage('पंजीकरण के लिए कृपया पहले लॉगिन करें (Please login first).');
      return;
    }

    if (!formData.name.trim()) {
      setErrorMessage('दुकान का नाम आवश्यक है (Shop name is required).');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setErrorMessage('वैध 10 अंकों का मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile number).');
      return;
    }

    if (!editingBizId && !slugStatus.available) {
      setErrorMessage('कृपया एक वैध और उपलब्ध URL Slug चुनें।');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBizId) {
        await updateBusinessDetails(editingBizId, formData, user);
        setSubmittedSuccess({ slug: formData.slug, name: formData.name, isEdit: true });
        setEditingBizId(null);
      } else {
        const res = await registerBusiness(formData, user);
        setSubmittedSuccess(res);
      }
      // Reset form
      setFormData({
        name: '',
        category: 'Grocery & Kirana',
        ownerName: user.displayName || '',
        phone: '',
        whatsapp: '',
        description: '',
        products: '',
        services: '',
        keywords: '',
        locality: 'सरेरी',
        address: '',
        mapLink: '',
        openingHours: '08:00 AM - 08:00 PM',
        logoUrl: '',
        slug: ''
      });
      setImagePreview('');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'पंजीकरण सबमिट करने में त्रुटि हुई।');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans transition-colors pt-24 pb-20">
      <SEO
        title="दुकान पंजीकरण | Register Your Business - Brahmano Ki Sareri"
        description="Brahmano Ki Sareri me apni dukan ya vyapar ko official digital business directory me shamil karein. Muft panjikaran."
        url="https://villagesareri.in/businesses/register"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Back link */}
        <div className="mb-6">
          <Link
            to="/businesses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0D477A] dark:text-sky-300 hover:underline py-1.5 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>व्यापार निर्देशिका पर लौटें (Back to Directory)</span>
          </Link>
        </div>

        {/* Tab switch (Form vs My Applications) */}
        {user && myBusinesses.length > 0 && (
          <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-[#0D477A] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              नई दुकान जोड़ें (New Registration)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my-listings')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'my-listings'
                  ? 'bg-[#0D477A] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <span>मेरे पंजीकृत व्यापार</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-white font-extrabold">
                {myBusinesses.length}
              </span>
            </button>
          </div>
        )}

        {/* View My Existing Listings */}
        {activeTab === 'my-listings' && user ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-4">
              आपके द्वारा सबमिट किए गए व्यापार (My Submissions)
            </h2>
            {myBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white notranslate">
                      {biz.name}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        biz.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300'
                          : biz.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300'
                      }`}
                    >
                      {biz.status === 'approved' ? '✓ Approved' : biz.status === 'rejected' ? '✗ Rejected' : '⏳ Pending Approval'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Category: <strong>{biz.category}</strong> • URL: <code className="text-blue-600 dark:text-sky-300">/{biz.slug}</code>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    सबमिट दिनांक: {new Date(biz.createdAt).toLocaleDateString('hi-IN')}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(biz)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors border border-indigo-200 dark:border-indigo-800"
                  >
                    ✏️ संपादित करें (Edit)
                  </button>
                  {biz.status === 'approved' ? (
                    <Link
                      to={`/${biz.slug}`}
                      className="px-4 py-2 rounded-xl bg-[#0D477A] text-white text-xs font-bold hover:bg-[#09355C] transition-colors"
                    >
                      दुकान देखें (View)
                    </Link>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      प्रशासनिक समीक्षाधीन (Under Review)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Registration Form Box */
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 dark:border-slate-700 shadow-md">
            
            {/* Edit Mode Notification Banner */}
            {editingBizId && (
              <div className="mb-6 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-100">
                    ✏️ दुकान संपादन मोड: {formData.name}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-300">
                    दुकान का बैनर, समय, संपर्क या विवरण बदलें और नीचे "परिवर्तन सुरक्षित करें" बटन पर क्लिक करें।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-bold text-rose-600 hover:text-rose-700 shadow-sm shrink-0"
                >
                  रद्द करें (Cancel)
                </button>
              </div>
            )}

            <div className="border-b border-slate-100 dark:border-slate-700/60 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-[#0D477A] dark:text-sky-300">
                  <LuStore className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">
                    Register Your Business
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    गाँव की आधिकारिक व्यापार निर्देशिका में अपनी दुकान निःशुल्क पंजीकृत करें
                  </p>
                </div>
              </div>
            </div>

            {/* Success State */}
            {submittedSuccess ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
                  <LuCheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  आपकी दुकान का पंजीकरण सबमिट हो चुका है!
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-4 leading-relaxed">
                  Your business registration has been submitted for admin approval. ग्राम पंचायत एडमिन द्वारा विवरण सत्यापित होने के बाद आपकी दुकान सार्वजनिक रूप से दिखने लगेगी।
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 max-w-md mx-auto mb-6 text-sm text-slate-700 dark:text-slate-200">
                  <span>प्रस्तावित दुकान लिंक: </span>
                  <strong className="text-[#0D477A] dark:text-sky-300 font-mono">villagesareri.in/{submittedSuccess.slug}</strong>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/businesses"
                    className="px-6 py-3 bg-[#0D477A] text-white font-bold text-sm rounded-xl hover:bg-[#09355C] transition-colors"
                  >
                    व्यापार निर्देशिका देखें (View Directory)
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedSuccess(null);
                      setActiveTab('my-listings');
                    }}
                    className="px-5 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    आवेदन स्थिति देखें (Track Status)
                  </button>
                </div>
              </div>
            ) : !user ? (
              /* Require Login Banner */
              <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#0D477A] dark:text-sky-300 flex items-center justify-center mx-auto mb-4">
                  <LuLogIn className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  पंजीकरण के लिए लॉगिन आवश्यक है
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  फर्जी व स्पैम प्रविष्टियों से बचने और दुकान के स्वामित्व की पुष्टि के लिए Google लॉगिन आवश्यक है।
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm hover:shadow text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span>Google से साइन इन करें (Sign In with Google)</span>
                </button>
              </div>
            ) : (
              /* Active Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
                    <LuAlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Section 1: Basic Information */}
                <div>
                  <h2 className="text-base font-bold text-[#0D477A] dark:text-sky-300 uppercase tracking-wide text-xs mb-4">
                    1. सामान्य विवरण (Basic Information)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        दुकान / व्यापार का नाम (Business Name) *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="जैसे: श्री चारभुजा स्वीट्स, सरेरी"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        व्यापार श्रेणी (Business Category) *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      >
                        {DEFAULT_BUSINESS_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Vanity URL Slug */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        दुकान का निजी वेब लिंक (Preferred URL Slug) *
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden focus-within:ring-2 focus-within:ring-[#0D477A]">
                        <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono border-r border-slate-200 dark:border-slate-700 shrink-0">
                          villagesareri.in/
                        </span>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleSlugChange}
                          required
                          placeholder="charbhujasweets"
                          className="flex-1 px-3 py-2 text-sm bg-transparent outline-none font-mono"
                        />
                      </div>
                      <div className="mt-1 text-xs">
                        {slugStatus.checking ? (
                          <span className="text-slate-400">जाँच रहे हैं...</span>
                        ) : slugStatus.available === true ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <LuCheckCircle className="w-3.5 h-3.5 inline" /> {slugStatus.message}
                          </span>
                        ) : slugStatus.available === false ? (
                          <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <LuAlertCircle className="w-3.5 h-3.5 inline" /> {slugStatus.message}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Owner & Contact */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <h2 className="text-base font-bold text-[#0D477A] dark:text-sky-300 uppercase tracking-wide text-xs mb-4">
                    2. संचालक व संपर्क विवरण (Owner & Contact)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        मालिक / संचालक का नाम (Owner Name) *
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleChange}
                        required
                        placeholder="मालिक का नाम"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        कॉल नंबर (Mobile Number) *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="10 अंकों का मोबाइल नंबर"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        व्हाट्सएप नंबर (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="वैकल्पिक"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Description, Products & Keywords */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <h2 className="text-base font-bold text-[#0D477A] dark:text-sky-300 uppercase tracking-wide text-xs mb-4">
                    3. सेवाएँ व उत्पाद (Products, Services & Keywords)
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        दुकान / व्यापार का विवरण (Description) *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="3"
                        placeholder="दुकान के बारे में विस्तार से लिखें, जैसे क्या सामान मिलता है, कब से खुली है..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          प्रमुख सामान / उत्पाद (Products - Comma separated)
                        </label>
                        <input
                          type="text"
                          name="products"
                          value={formData.products}
                          onChange={handleChange}
                          placeholder="जैसे: मिठाई, नमकीन, मावा, घेवर"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          विशेष सेवाएँ (Services - Comma separated)
                        </label>
                        <input
                          type="text"
                          name="services"
                          value={formData.services}
                          onChange={handleChange}
                          placeholder="जैसे: शादी-ब्याह कैटरिंग, होम डिलीवरी"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        खोज शब्द (Search Keywords - Comma separated)
                      </label>
                      <input
                        type="text"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleChange}
                        placeholder="जैसे: mithai, catering, sweets, namkeen, sareri"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        ये शब्द उपयोगकर्ताओं को सर्च बार में आपकी दुकान खोजने में मदद करेंगे।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Location & Timings */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <h2 className="text-base font-bold text-[#0D477A] dark:text-sky-300 uppercase tracking-wide text-xs mb-4">
                    4. पता व खुलने का समय (Location & Hours)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        मोहल्ला / स्थान (Locality) *
                      </label>
                      <input
                        type="text"
                        name="locality"
                        value={formData.locality}
                        onChange={handleChange}
                        required
                        placeholder="जैसे: बड़ा मंदिर के पास, बस स्टैंड रोड"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        दुकान खुलने का समय (Opening Hours)
                      </label>
                      <input
                        type="text"
                        name="openingHours"
                        value={formData.openingHours}
                        onChange={handleChange}
                        placeholder="जैसे: सुबह 8:00 से रात 8:00 (प्रतिदिन)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        पूरा पता (Full Address)
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="दुकान संख्या, मार्ग, ब्राह्मणों की सरेरी, आसींद, भीलवाड़ा - 311026"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        गूगल मैप्स लिंक (Google Maps Link - Optional)
                      </label>
                      <input
                        type="url"
                        name="mapLink"
                        value={formData.mapLink}
                        onChange={handleChange}
                        placeholder="https://maps.app.goo.gl/... (वैकल्पिक)"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Cover Photo & Logo */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-[#0D477A] dark:text-sky-300 uppercase tracking-wide text-xs mb-1">
                      5. दुकान का बैनर / कवर फ़ोटो (Cover Photo / Banner - Optional)
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      आपकी दुकान की प्रोफ़ाइल के शीर्ष पर दिखने वाला सुंदर बैनर (दुकान का सामने का दृश्य)।
                    </p>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700">
                      {coverPreview ? (
                        <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-slate-300 shadow-sm">
                          <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setCoverPreview('');
                              setFormData((p) => ({ ...p, coverUrl: '' }));
                            }}
                            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1.5 text-xs shadow-md"
                          >
                            ✕
                          </button>
                        </div>
                      ) : null}

                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shadow-sm">
                        <LuUpload className="w-4 h-4 text-[#0D477A]" />
                        <span>{coverPreview ? 'कवर फ़ोटो बदलें' : 'कवर फ़ोटो चुनें (Upload Banner)'}</span>
                        <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[#0D477A] dark:text-sky-300 uppercase tracking-wide text-xs mb-1">
                      6. दुकान का लोगो / मुख्य फ़ोटो (Store Logo / Main Photo)
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700">
                      {imagePreview ? (
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 border border-slate-300 shadow-sm">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                              setFormData((p) => ({ ...p, logoUrl: '' }));
                            }}
                            className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <LuStore className="w-10 h-10" />
                        </div>
                      )}

                      <div className="flex-1 text-center sm:text-left">
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer shadow-sm">
                          <LuUpload className="w-4 h-4 text-[#0D477A]" />
                          <span>{imagePreview ? 'फ़ोटो बदलें' : 'फ़ोटो चुनें (Select Image)'}</span>
                          <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                          दुकान के बोर्ड या काउंटर की साफ फ़ोटो अपलोड करें। यह फ़ोटो स्वचालित रूप से कंप्रेस होकर सुरक्षित रूप से सेव होगी।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit CTA */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                    {editingBizId
                      ? 'परिवर्तन तुरंत आपकी दुकान पर अपडेट हो जाएंगे।'
                      : 'सबमिट करने के बाद व्यवस्थापक (Admin) द्वारा जाँच उपरांत दुकान लाइव होगी।'}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0D477A] hover:bg-[#09355C] disabled:bg-slate-400 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all min-h-[48px]"
                  >
                    {editingBizId
                      ? (submitting ? 'अपडेट किया जा रहा है...' : 'दुकान विवरण अपडेट करें (Save Changes)')
                      : (submitting ? 'सबमिट किया जा रहा है...' : 'पंजीकरण सबमिट करें (Submit Registration)')}
                  </button>
                </div>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default BusinessRegisterPage;
