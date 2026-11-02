import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, googleProvider, rtdb } from '../firebase';
import SEO from '../components/SEO';
import {
  RESERVED_SLUGS,
  getBusinessBySlug,
  submitBusinessReview,
  deleteBusinessReview,
  updateBusinessDetails,
  compressImageToDataUrl,
  DEFAULT_BUSINESS_CATEGORIES
} from '../services/businessService';
import {
  FiShoppingBag as LuStore,
  FiPhone as LuPhone,
  FiMapPin as LuMapPin,
  FiNavigation as LuNavigation,
  FiShare2 as LuShare2,
  FiStar as LuStar,
  FiClock as LuClock,
  FiCheckCircle as LuCheckCircle,
  FiArrowLeft as LuArrowLeft,
  FiMessageSquare as LuMessageSquare,
  FiTrash2 as LuTrash2,
  FiEdit3 as LuEdit3,
  FiEdit as LuEdit,
  FiUpload as LuUpload,
  FiImage as LuImage,
  FiCamera as LuCamera,
  FiX as LuX,
  FiExternalLink as LuExternalLink
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const BusinessDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [similarBusinesses, setSimilarBusinesses] = useState([]);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Store Owner Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // 1. Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // 2. Fetch Business by Slug
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setNotFound(false);

    const cleanSlug = (slug || '').toLowerCase().trim();
    if (!cleanSlug || RESERVED_SLUGS.has(cleanSlug)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    getBusinessBySlug(cleanSlug).then((biz) => {
      if (!biz || biz.status !== 'approved') {
        setNotFound(true);
        setBusiness(null);
      } else {
        setBusiness(biz);
        setNotFound(false);

        // Fetch similar businesses in same category
        const bizRef = ref(rtdb, 'businesses');
        onValue(bizRef, (snap) => {
          if (snap.exists()) {
            const all = Object.values(snap.val()).filter(
              (b) => b && b.status === 'approved' && b.id !== biz.id && b.category === biz.category
            );
            setSimilarBusinesses(all.slice(0, 3));
          }
        }, { onlyOnce: true });
      }
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setNotFound(true);
      setLoading(false);
    });
  }, [slug]);

  // 3a. Real-time updates for this specific business (syncs rating/count/details immediately)
  useEffect(() => {
    if (!business?.id) return;
    const bizDetailRef = ref(rtdb, `businesses/${business.id}`);
    const unsub = onValue(bizDetailRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setBusiness((prev) => (prev ? { ...prev, ...val } : val));
      }
    });
    return () => unsub();
  }, [business?.id]);

  // 3b. Pre-populate owner edit form
  useEffect(() => {
    if (business && editModalOpen) {
      setEditFormData({
        name: business.name || '',
        category: business.category || 'Grocery & Kirana',
        ownerName: business.ownerName || '',
        phone: business.phone || '',
        whatsapp: business.whatsapp || '',
        openingHours: business.openingHours || '08:00 AM - 08:00 PM',
        locality: business.locality || 'सरेरी',
        address: business.address || '',
        description: business.description || '',
        products: business.products || '',
        services: business.services || '',
        mapLink: business.mapLink || '',
        logoUrl: business.logoUrl || '',
        coverUrl: business.coverUrl || ''
      });
      setEditError('');
      setEditSuccess('');
    }
  }, [business, editModalOpen]);

  // 4. Listen to real-time reviews for this business
  useEffect(() => {
    if (!business?.id) return;
    const reviewsRef = ref(rtdb, `businessReviews/${business.id}`);
    const unsub = onValue(reviewsRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list = Object.values(val)
          .filter((r) => r && r.status !== 'hidden')
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setReviews(list);

        // If current user already reviewed, pre-fill review form
        if (user && val[user.uid]) {
          setUserRating(val[user.uid].rating || 5);
          setUserComment(val[user.uid].comment || '');
        }
      } else {
        setReviews([]);
      }
      setReviewsLoading(false);
    });
    return () => unsub();
  }, [business?.id, user]);

  // Check if current user already submitted a review
  const myExistingReview = useMemo(() => {
    if (!user || !reviews.length) return null;
    return reviews.find((r) => r.userId === user.uid) || null;
  }, [user, reviews]);

  // Check if current user is the registered owner of this shop (by UID, Email, or Admin session)
  const isAdminSession = typeof window !== 'undefined' && (
    sessionStorage.getItem('sareriAdminAuth') === 'true' || 
    sessionStorage.getItem('sareriAdminAuth') === 'admin'
  );
  const isOwner = Boolean(
    (user && business && (
      (business.ownerUid && user.uid === business.ownerUid) ||
      (business.ownerEmail && user.email && business.ownerEmail.toLowerCase() === user.email.toLowerCase())
    )) || isAdminSession
  );

  // Rating breakdown stats
  const ratingStats = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, parseInt(r.rating, 10) || 5));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Live Stats computed directly from reviews array for immediate zero-delay feedback
  const liveStats = useMemo(() => {
    const validReviews = reviews.filter((r) => r && r.status !== 'hidden');
    const count = validReviews.length;
    if (count === 0) {
      const fallbackRating = business?.rating ? Number(business.rating) : 0;
      return {
        count: Number(business?.reviewCount) || 0,
        rating: fallbackRating ? fallbackRating.toFixed(1) : 'New',
        numericRating: fallbackRating
      };
    }
    const sum = validReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const avg = parseFloat((sum / count).toFixed(1));
    return {
      count,
      rating: avg.toFixed(1),
      numericRating: avg
    };
  }, [reviews, business?.rating, business?.reviewCount]);

  // Share Handler
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `${business?.name} - Brahmano Ki Sareri`;
    const shareText = `Check out ${business?.name} on Sareri Digital Business Directory:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Google Maps Directions Link
  const directionsUrl = useMemo(() => {
    if (business?.mapLink) return business.mapLink;
    const query = encodeURIComponent(`${business?.name || ''} Brahmano Ki Sareri Rajasthan`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }, [business]);

  // Submit Review Handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!user) {
      try {
        await signInWithPopup(auth, googleProvider);
        return;
      } catch (err) {
        setReviewError('Login failed: ' + err.message);
        return;
      }
    }

    if (business?.ownerUid === user.uid) {
      setReviewError('आप अपनी स्वयं की दुकान की समीक्षा नहीं लिख सकते। (Owners cannot review their own shop)');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await submitBusinessReview(business.id, { rating: userRating, comment: userComment }, user);
      if (res?.stats) {
        setBusiness((prev) => ({
          ...prev,
          rating: res.stats.rating,
          reviewCount: res.stats.reviewCount
        }));
      }
      setReviewModalOpen(false);
      setUserComment('');
    } catch (err) {
      console.error(err);
      setReviewError(err.message || 'समीक्षा सबमिट करने में विफल।');
    }
    setSubmittingReview(false);
  };

  // Owner Edit Handlers
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 400, 0.85);
      setEditFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
    } catch (err) {
      setEditError('Photo compression error: ' + err.message);
    }
  };

  const handleEditCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 1200, 0.82);
      setEditFormData((prev) => ({ ...prev, coverUrl: dataUrl }));
    } catch (err) {
      setEditError('Cover photo compression error: ' + err.message);
    }
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    if (!business?.id) return;
    const authUser = user || (isAdminSession ? { uid: 'admin', email: 'admin@sareri' } : null);
    if (!authUser) {
      setEditError('दुकान संपादित करने के लिए कृपया लॉगिन करें। (Please login to edit)');
      return;
    }
    setEditSaving(true);
    setEditError('');
    setEditSuccess('');

    try {
      await updateBusinessDetails(business.id, editFormData, authUser);
      setBusiness((prev) => ({ ...prev, ...editFormData }));
      setEditSuccess('दुकान की जानकारी सफलतापूर्वक अपडेट हो गई! (Store updated successfully!)');
      setTimeout(() => {
        setEditModalOpen(false);
        setEditSuccess('');
      }, 1400);
    } catch (err) {
      console.error(err);
      setEditError(err.message || 'दुकान अपडेट करने में विफल।');
    }
    setEditSaving(false);
  };

  // Delete own review
  const handleDeleteMyReview = async () => {
    if (!user || !myExistingReview) return;
    if (window.confirm('क्या आप अपनी समीक्षा हटाना चाहते हैं? (Delete your review?)')) {
      try {
        await deleteBusinessReview(business.id, user.uid);
      } catch (err) {
        alert('Could not delete review: ' + err.message);
      }
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <div className="w-14 h-14 border-4 border-[#0D477A] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold text-sm animate-pulse">
          दुकान विवरण लोड हो रहा है...
        </p>
      </div>
    );
  }

  // 404 / Business Not Found State
  if (notFound || !business) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 px-4">
        <SEO
          title="दुकान नहीं मिली | Business Not Found - Brahmano Ki Sareri"
          description="यह दुकान या व्यापार उपलब्ध नहीं है या व्यवस्थापक द्वारा अभी स्वीकृत नहीं किया गया है।"
          url={`https://villagesareri.in/${slug}`}
        />
        <div className="text-center max-w-md mx-auto p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <LuStore className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-heading mb-2">व्यापार उपलब्ध नहीं है</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            आपके द्वारा खोजा गया वेब पता (<code className="text-rose-500 font-mono">/{slug}</code>) मान्य नहीं है या यह दुकान अभी स्वीकृत नहीं हुई है।
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/businesses"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0D477A] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#09355C] transition-colors"
            >
              सभी दुकानें देखें (Browse Directory)
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              होमपेज पर जाएँ (Home)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans transition-colors pt-3 sm:pt-6 pb-20">
      <SEO
        title={`${business.name} | ${business.category} in Village Sareri`}
        description={`${business.name} in Brahmano Ki Sareri. ${business.shortDescription || business.description || 'Verified local business in Sareri'}. Phone: ${business.phone || 'Available online'}. Directions & Reviews.`}
        url={`https://villagesareri.in/${business.slug}`}
        image={business.coverUrl || business.logoUrl}
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Local Businesses', url: 'https://villagesareri.in/businesses' },
          { name: business.name, url: `https://villagesareri.in/${business.slug}` }
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': business.name,
          'image': business.coverUrl || business.logoUrl || 'https://villagesareri.in/photos/village_hero_poster.png',
          'telephone': business.phone || '',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': business.address || 'Brahmano Ki Sareri',
            'addressLocality': 'Asind',
            'addressRegion': 'Rajasthan',
            'postalCode': '311026',
            'addressCountry': 'IN'
          },
          'url': `https://villagesareri.in/${business.slug}`
        }}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl flex items-center justify-between">
          <Link
            to="/businesses"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0D477A] dark:text-sky-300 hover:underline"
          >
            <LuArrowLeft className="w-4 h-4" />
            <span>व्यापार निर्देशिका (Directory)</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            villagesareri.in/{business.slug}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-8">
        
        {/* Store Owner Control Bar */}
        {isOwner && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-100 dark:from-indigo-950/70 dark:via-slate-850 dark:to-indigo-900/60 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-1 sm:mt-0"></span>
              <div>
                <p className="text-sm font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-2">
                  <span>नमस्ते! आप इस दुकान के पंजीकृत स्वामी हैं (Store Owner Mode)</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 font-extrabold">Verified Owner</span>
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5">
                  अपनी दुकान का समय, फ़ोन, पता, सेवाएँ व फ़ोटो अपडेट करें ताकि ग्राहक सीधे आपसे संपर्क कर सकें।
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shrink-0"
            >
              <LuEdit className="w-4 h-4" />
              <span>दुकान संपादित करें (Manage Store)</span>
            </button>
          </div>
        )}

        {/* Main Shop Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/90 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Cover Area */}
          <div className="relative h-48 sm:h-64 md:h-80 w-full bg-slate-800 overflow-hidden">
            {business.coverUrl ? (
              <img src={business.coverUrl} alt={business.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#0D477A] to-[#041E34] flex items-center justify-center text-white/20">
                <LuStore className="w-24 h-24" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            {/* Category Badge on Cover */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {business.category}
              </span>
            </div>

            {/* Share button on Cover */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-all shadow-md"
                title="Share this business"
              >
                <LuShare2 className="w-5 h-5" />
              </button>
              {copiedLink && (
                <div className="absolute right-0 top-12 px-3 py-1 bg-black text-white text-xs rounded-lg whitespace-nowrap shadow-lg">
                  Link Copied!
                </div>
              )}
            </div>

            {/* Change Cover Button for Store Owner */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all shadow-md z-10"
              >
                <LuCamera className="w-3.5 h-3.5 text-sky-400" />
                <span>कवर फ़ोटो बदलें (Cover Photo)</span>
              </button>
            )}
          </div>

          {/* Profile Header Details */}
          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
              {/* Logo & Name */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden shrink-0 flex items-center justify-center text-[#0D477A] relative group">
                  {business.logoUrl ? (
                    <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                  ) : (
                    <LuStore className="w-12 h-12 text-[#0D477A] dark:text-sky-300" />
                  )}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setEditModalOpen(true)}
                      className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                    >
                      <LuCamera className="w-4 h-4 mb-0.5" />
                      <span>Edit Logo</span>
                    </button>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading text-slate-900 dark:text-white notranslate leading-tight">
                      {business.name}
                    </h1>
                    <span title="सत्यापित स्थानीय व्यापार (Verified Local Business)">
                      <LuCheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-2 notranslate" translate="no">
                    <span>संचालक: {business.ownerName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <LuMapPin className="w-3.5 h-3.5 text-slate-400" />
                      {business.locality}
                    </span>
                  </p>
                </div>
              </div>

              {/* Rating Pill - Live Realtime */}
              <div className="flex flex-col items-center sm:items-end shrink-0">
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-4 py-2 rounded-2xl">
                  <div className="flex items-center gap-1 text-amber-500">
                    <LuStar className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {liveStats.rating}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ({liveStats.count} {liveStats.count === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons - Perfectly Equal Sized on Mobile (2x2 Grid) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
              {/* 1. Call Button */}
              {business.phone ? (
                <a
                  href={`tel:${business.phone}`}
                  className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 px-3 sm:px-5 rounded-2xl bg-gradient-to-r from-[#0D477A] to-[#09355C] hover:from-[#09355C] hover:to-[#062440] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                  title={`Call ${business.phone}`}
                >
                  <LuPhone className="w-4 h-4 shrink-0" />
                  <span>Call</span>
                </a>
              ) : (
                <div className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 px-3 sm:px-5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-400 font-bold text-xs sm:text-sm cursor-not-allowed">
                  <LuPhone className="w-4 h-4 shrink-0" />
                  <span>Call</span>
                </div>
              )}

              {/* 2. WhatsApp Button */}
              <a
                href={`https://wa.me/91${(business.whatsapp || business.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते, मैंने आपकी दुकान ${business.name} को Sareri Digital Portal पर देखा।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 px-3 sm:px-5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                <FaWhatsapp className="w-4 h-4 shrink-0" />
                <span>WhatsApp</span>
              </a>

              {/* 3. Directions Button */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 px-3 sm:px-5 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
              >
                <LuNavigation className="w-4 h-4 text-[#FF9933] shrink-0" />
                <span className="truncate">Directions</span>
              </a>

              {/* 4. Rate & Review Button */}
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 px-3 sm:px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
              >
                <LuStar className="w-4 h-4 shrink-0" />
                <span className="truncate">{myExistingReview ? 'Edit Review' : 'Rate & Review'}</span>
              </button>

              {/* 5. Owner Action Button (Spans full width on mobile) */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="col-span-2 sm:col-span-1 w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 px-4 sm:px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  <LuEdit className="w-4 h-4 shrink-0" />
                  <span>दुकान प्रबंधित करें (Manage Store)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Main Content & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Columns: About, Products, Services, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About This Business */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <LuStore className="w-5 h-5 text-[#0D477A] dark:text-sky-300" />
                <span>About This Business (व्यापार विवरण)</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {business.description || 'सरेरी का प्रमुख स्थानीय व्यावसायिक प्रतिष्ठान।'}
              </p>
            </div>

            {/* Products & Services */}
            {((business.products && business.products.length > 0) || (business.services && business.services.length > 0)) && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700 shadow-sm space-y-6">
                {business.products && business.products.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      उपलब्ध सामान व उत्पाद (Products)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {business.products.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0D477A] dark:text-sky-300 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-semibold"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {business.services && business.services.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      विशेष सेवाएँ (Services Offered)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {business.services.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#0D9488] dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs sm:text-sm font-semibold"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Customer Reviews Section */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                    <LuMessageSquare className="w-5 h-5 text-amber-500" />
                    <span>Customer Reviews (ग्राहक समीक्षाएँ)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    गाँववासियों की वास्तविक रेटिंग एवं अनुभव
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  {myExistingReview ? 'Edit Review' : 'Rate & Review'}
                </button>
              </div>

              {/* Rating Summary Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 mb-6">
                <div className="text-center sm:border-r border-slate-200 dark:border-slate-700">
                  <div className="text-4xl font-extrabold font-heading text-slate-900 dark:text-white">
                    {liveStats.rating}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-amber-500 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <LuStar
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(liveStats.numericRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {liveStats.count} {liveStats.count === 1 ? 'Rating' : 'Ratings'}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5 text-xs">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingStats[star] || 0;
                    const pct = liveStats.count > 0 ? (count / liveStats.count) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="w-6 font-bold text-slate-600 dark:text-slate-400">{star} ★</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="w-6 text-right text-slate-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="py-8 text-center text-slate-400 text-xs">लोड हो रहा है...</div>
              ) : reviews.length === 0 ? (
                <div className="py-10 text-center text-slate-500 dark:text-slate-400">
                  <LuStar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold">अभी तक कोई समीक्षा नहीं है।</p>
                  <p className="text-xs text-slate-400 mt-1">
                    इस दुकान की पहली समीक्षा लिखकर गाँववासियों की मदद करें!
                  </p>
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#0D477A] text-white text-xs font-bold hover:bg-[#09355C]"
                  >
                    समीक्षा लिखें (Write First Review)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev, index) => {
                    // Extract registered name or clean name from registered email
                    const reviewerName = (rev.userName && rev.userName !== 'Sareri Citizen')
                      ? rev.userName
                      : (rev.userEmail
                          ? rev.userEmail.split('@')[0].split(/[._-]/).filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
                          : (rev.userName || 'सरेरी नागरिक'));

                    return (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-700 text-[#0D477A] dark:text-sky-300 font-bold flex items-center justify-center text-xs overflow-hidden">
                            {rev.userPhoto ? (
                              <img src={rev.userPhoto} alt={reviewerName} className="w-full h-full object-cover" />
                            ) : (
                              (reviewerName || 'U')[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight block notranslate">
                              {reviewerName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString('hi-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <span>{rev.rating}</span>
                          <LuStar className="w-3.5 h-3.5 fill-amber-400" />
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                          {rev.comment}
                        </p>
                      )}

                      {/* Delete action for current user */}
                      {user && rev.userId === user.uid && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleDeleteMyReview}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                            <span>Delete My Review</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Contact, Hours, Map, Similar Businesses */}
          <div className="space-y-6">
            
            {/* Contact & Address Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm space-y-4">
              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
                संपर्क व स्थान (Contact & Location)
              </h2>

              <div className="space-y-3 text-sm">
                {business.phone && (
                  <div className="flex items-start gap-3">
                    <LuPhone className="w-5 h-5 text-[#0D477A] dark:text-sky-300 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs text-slate-400">फ़ोन नंबर</span>
                      <a href={`tel:${business.phone}`} className="font-bold text-[#0D477A] dark:text-sky-300 hover:underline">
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {business.whatsapp && (
                  <div className="flex items-start gap-3">
                    <FaWhatsapp className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs text-slate-400">व्हाट्सएप</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{business.whatsapp}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <LuMapPin className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs text-slate-400">स्थान / पता</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {business.address || business.locality}
                    </span>
                  </div>
                </div>

                {business.openingHours && (
                  <div className="flex items-start gap-3">
                    <LuClock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs text-slate-400">खुलने का समय</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {business.openingHours}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Google Maps Link */}
              <div className="pt-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs transition-colors"
                >
                  <LuNavigation className="w-4 h-4 text-[#FF9933]" />
                  <span>गूगल मैप्स पर रास्ता देखें (Open in Maps)</span>
                  <LuExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </a>
              </div>
            </div>

            {/* Similar Businesses */}
            {similarBusinesses.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-700 shadow-sm space-y-4">
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
                  समान व्यापार (Similar in {business.category})
                </h3>
                <div className="space-y-3">
                  {similarBusinesses.map((sBiz) => (
                    <Link
                      key={sBiz.id}
                      to={`/${sBiz.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                        {sBiz.logoUrl ? (
                          <img src={sBiz.logoUrl} alt={sBiz.name} className="w-full h-full object-cover" />
                        ) : (
                          <LuStore className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#0D477A] dark:group-hover:text-sky-300">
                          {sBiz.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                          <LuStar className="w-3 h-3 fill-amber-400" />
                          <span>{sBiz.rating ? Number(sBiz.rating).toFixed(1) : 'New'}</span>
                          <span className="text-slate-400 font-normal">({sBiz.reviewCount || 0})</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Register Shop Promo Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 border border-blue-200/80 dark:border-slate-700 text-center notranslate" translate="no">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 notranslate" translate="no">
                क्या आप भी <span className="notranslate" translate="no">सरेरी</span> में व्यापार करते हैं?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed notranslate" translate="no">
                अपनी दुकान को डिजिटल बनाएं और गाँव के ग्राहकों तक सीधे पहुँचें।
              </p>
              <Link
                to="/businesses/register"
                className="inline-block px-4 py-2 bg-[#0D477A] text-white text-xs font-bold rounded-xl hover:bg-[#09355C] transition-all shadow-sm notranslate"
                translate="no"
              >
                दुकान जोड़ें (Free Listing)
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Review Modal Dialog */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <LuX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-1">
              {myExistingReview ? 'अपनी समीक्षा संशोधित करें' : `${business.name} को रेटिंग दें`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              आपके वास्तविक अनुभव से अन्य गाँववासियों को सही दुकान चुनने में मदद मिलेगी।
            </p>

            {reviewError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {reviewError}
              </div>
            )}

            {!user ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 font-medium">
                  समीक्षा लिखने के लिए Google लॉगिन आवश्यक है।
                </p>
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  <span>Google से साइन इन करें</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    रेटिंग चुनें (Select Rating) *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setUserRating(s)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125"
                      >
                        <LuStar
                          className={`w-8 h-8 ${
                            s <= userRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-amber-600">
                      {userRating === 5
                        ? 'उत्कृष्ट (5/5)'
                        : userRating === 4
                        ? 'बहुत अच्छा (4/5)'
                        : userRating === 3
                        ? 'औसत (3/5)'
                        : userRating === 2
                        ? 'सुधार आवश्यक (2/5)'
                        : 'खराब (1/5)'}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    आपकी समीक्षा (Your Review / Experience)
                  </label>
                  <textarea
                    rows="3"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="दुकान के सामान की गुणवत्ता, व्यवहार और सेवा के बारे में लिखें..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-[#0D477A] outline-none"
                  ></textarea>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    रद्द करें (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md"
                  >
                    {submittingReview ? 'सबमिट हो रहा है...' : 'समीक्षा पोस्ट करें (Post Review)'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Store Owner Edit Modal Dialog */}
      {editModalOpen && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <LuX className="w-5 h-5" />
            </button>

            <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                Store Owner Dashboard
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                दुकान जानकारी संपादित करें (Edit Store)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                आपकी दुकान <strong>/{business.slug}</strong> के विवरण में परिवर्तन करें।
              </p>
            </div>

            {editError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <LuCheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveStore} className="space-y-4">
              {/* Shop Name & Owner Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    दुकान का नाम (Shop Name) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    संचालक का नाम (Owner Name) *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={editFormData.ownerName || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Contact numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    फ़ोन नंबर (Phone) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editFormData.phone || ''}
                    onChange={handleEditChange}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp नंबर
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={editFormData.whatsapp || ''}
                    onChange={handleEditChange}
                    placeholder="Same as phone or custom"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Hours & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    खुलने का समय (Opening Hours)
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    value={editFormData.openingHours || ''}
                    onChange={handleEditChange}
                    placeholder="08:00 AM - 08:00 PM"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    गाँव का क्षेत्र / मोहल्ला (Locality)
                  </label>
                  <input
                    type="text"
                    name="locality"
                    value={editFormData.locality || ''}
                    onChange={handleEditChange}
                    placeholder="उदा. बस स्टैंड, बड़ा मंदिर चौक"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पूरा पता (Full Address)
                </label>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address || ''}
                  onChange={handleEditChange}
                  placeholder="दुकान नंबर, सड़क, लैंडमार्क..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  दुकान विवरण (Description)
                </label>
                <textarea
                  rows="3"
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditChange}
                  placeholder="आपकी दुकान क्या बेचती है, विशेषताएँ..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                ></textarea>
              </div>

              {/* Products & Services */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    प्रमुख उत्पाद (Products / Items)
                  </label>
                  <input
                    type="text"
                    name="products"
                    value={editFormData.products || ''}
                    onChange={handleEditChange}
                    placeholder="कोमा से अलग करें (e.g. दाल, चावल, तेल)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    सुविधाएँ (Services Offered)
                  </label>
                  <input
                    type="text"
                    name="services"
                    value={editFormData.services || ''}
                    onChange={handleEditChange}
                    placeholder="Home Delivery, UPI Accepted..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Google Map Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Map Link (दिशा-निर्देश लिंक)
                </label>
                <input
                  type="url"
                  name="mapLink"
                  value={editFormData.mapLink || ''}
                  onChange={handleEditChange}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  व्यापार श्रेणी (Business Category) *
                </label>
                <select
                  name="category"
                  value={editFormData.category || 'Grocery & Kirana'}
                  onChange={handleEditChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {DEFAULT_BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Cover Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  दुकान का बैनर / कवर फ़ोटो (Cover Photo / Banner)
                </label>
                <div className="space-y-2">
                  <div className="w-full h-32 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                    {editFormData.coverUrl ? (
                      <img src={editFormData.coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <LuImage className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[11px]">कोई कवर फ़ोटो नहीं (No cover photo)</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                      <LuUpload className="w-4 h-4 text-indigo-500" />
                      <span>कवर फ़ोटो चुनें (Upload Cover)</span>
                      <input type="file" accept="image/*" onChange={handleEditCover} className="hidden" />
                    </label>
                    {editFormData.coverUrl && (
                      <button
                        type="button"
                        onClick={() => setEditFormData((prev) => ({ ...prev, coverUrl: '' }))}
                        className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                      >
                        हटाएं (Remove)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo / Logo upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  दुकान फ़ोटो या लोगो (Store Photo / Logo)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0">
                    {editFormData.logoUrl ? (
                      <img src={editFormData.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <LuStore className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                    <LuUpload className="w-4 h-4 text-indigo-500" />
                    <span>लोगो / फ़ोटो चुनें</span>
                    <input type="file" accept="image/*" onChange={handleEditLogo} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md"
                >
                  {editSaving ? 'सुरक्षित हो रहा है...' : 'परिवर्तन सुरक्षित करें (Save Changes)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BusinessDetailPage;
