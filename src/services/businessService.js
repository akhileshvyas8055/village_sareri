import { ref, get, set, push, update, remove, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

// Reserved website slugs that businesses cannot claim
export const RESERVED_SLUGS = new Set([
  '',
  'admin',
  'about',
  'gallery',
  'community',
  'pride',
  'news',
  'complaint',
  'khel-registration',
  'panchayat',
  'notices',
  'settings',
  'profile',
  'businesses',
  'register',
  'login',
  'privacy',
  'terms',
  'home',
  'api'
]);

// Default Categories for Brahmano Ki Sareri
export const DEFAULT_BUSINESS_CATEGORIES = [
  'Grocery & Kirana',
  'Sweets & Catering',
  'Agriculture & Farming',
  'Dairy & Milk Products',
  'Medical & Healthcare',
  'Electronics & Mobile',
  'Clothing & Fashion',
  'Hardware & Construction',
  'Transport & Vehicles',
  'Education & Coaching',
  'Repair & Services',
  'Other Local Businesses'
];

/**
 * Format a string into a clean lowercase slug (e.g., "Charbhuja Sweets" -> "charbhujasweets")
 */
export const sanitizeSlug = (raw) => {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special chars
    .replace(/[\s_-]+/g, '')   // remove spaces/hyphens for clean vanity URL like /charbhujasweets
    .slice(0, 30);
};

/**
 * Check whether a slug is available (not reserved and not taken)
 */
export const isSlugAvailable = async (slug, currentBusinessId = null) => {
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug || cleanSlug.length < 3) {
    return { available: false, error: 'Slug must be at least 3 characters long.' };
  }
  if (RESERVED_SLUGS.has(cleanSlug)) {
    return { available: false, error: 'This name is reserved for official village pages.' };
  }

  try {
    const slugRef = ref(rtdb, `businessSlugs/${cleanSlug}`);
    const snapshot = await get(slugRef);
    if (snapshot.exists()) {
      const existingId = snapshot.val();
      if (currentBusinessId && existingId === currentBusinessId) {
        return { available: true, cleanSlug };
      }
      return { available: false, error: 'This shop URL is already taken.' };
    }
    return { available: true, cleanSlug };
  } catch (err) {
    console.error('Error checking slug:', err);
    return { available: false, error: 'Could not verify URL slug availability.' };
  }
};

/**
 * Generate an available slug suggestion based on business name
 */
export const generateSlugSuggestion = async (name) => {
  const base = sanitizeSlug(name) || 'shop';
  let candidate = base;
  let counter = 1;

  while (true) {
    const check = await isSlugAvailable(candidate);
    if (check.available) {
      return candidate;
    }
    candidate = `${base}${counter}`;
    counter++;
    if (counter > 20) return `${base}${Date.now().toString().slice(-4)}`;
  }
};

/**
 * Compress an image file to a lightweight data URL under 120KB for Free Firebase tier
 */
export const compressImageToDataUrl = (file, maxDimension = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to read image file.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

/**
 * Register a new business (Status: PENDING)
 */
export const registerBusiness = async (formData, currentUser) => {
  if (!currentUser?.uid) {
    throw new Error('You must be logged in to register a business.');
  }

  const cleanSlug = sanitizeSlug(formData.slug || formData.name);
  const slugCheck = await isSlugAvailable(cleanSlug);
  if (!slugCheck.available) {
    throw new Error(slugCheck.error || 'The requested URL slug is not available.');
  }

  const businessesRef = ref(rtdb, 'businesses');
  const newBusinessRef = push(businessesRef);
  const businessId = newBusinessRef.key;

  const newBusiness = {
    id: businessId,
    name: formData.name.trim(),
    slug: cleanSlug,
    category: formData.category || 'Other Local Businesses',
    description: formData.description?.trim() || '',
    shortDescription: formData.shortDescription?.trim() || formData.description?.trim().slice(0, 150) || '',
    ownerName: formData.ownerName?.trim() || currentUser.displayName || 'Shop Owner',
    ownerEmail: currentUser.email || '',
    ownerUid: currentUser.uid,
    phone: formData.phone?.trim() || '',
    whatsapp: formData.whatsapp?.trim() || formData.phone?.trim() || '',
    locality: formData.locality?.trim() || 'सरेरी',
    address: formData.address?.trim() || 'सरेरी, भीलवाड़ा, राजस्थान',
    mapLink: formData.mapLink?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.name + ' Brahmano Ki Sareri')}`,
    products: formData.products ? String(formData.products).split(',').map(s => s.trim()).filter(Boolean) : [],
    services: formData.services ? String(formData.services).split(',').map(s => s.trim()).filter(Boolean) : [],
    keywords: formData.keywords ? String(formData.keywords).split(',').map(s => s.trim()).filter(Boolean) : [],
    openingHours: formData.openingHours?.trim() || '',
    logoUrl: formData.logoUrl || '',
    coverUrl: formData.coverUrl || '',
    status: 'pending', // Must be approved by admin
    featured: false,
    rating: 0,
    reviewCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await set(newBusinessRef, newBusiness);
  // Reserve slug mapping tentatively
  await set(ref(rtdb, `businessSlugs/${cleanSlug}`), businessId);

  return { id: businessId, slug: cleanSlug };
};

/**
 * Update business details by Owner or Admin
 */
export const updateBusinessDetails = async (businessId, updates, currentUser) => {
  if (!businessId) throw new Error('Business ID is required');
  const bizRef = ref(rtdb, `businesses/${businessId}`);
  const snap = await get(bizRef);
  if (!snap.exists()) throw new Error('Business not found');

  const biz = snap.val();
  if (currentUser && biz.ownerUid && biz.ownerUid !== currentUser.uid) {
    console.warn('Authorized as admin or delegate');
  }

  const payload = {
    ...updates,
    updatedAt: Date.now()
  };
  if (typeof payload.products === 'string') {
    payload.products = payload.products.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (typeof payload.services === 'string') {
    payload.services = payload.services.split(',').map((s) => s.trim()).filter(Boolean);
  }
  // Prevent changing core critical fields inadvertently
  delete payload.id;
  delete payload.createdAt;
  delete payload.ownerUid;

  await update(bizRef, payload);
  return payload;
};

/**
 * Fetch approved businesses (for directory and search)
 */
export const getApprovedBusinesses = async () => {
  try {
    const snapshot = await get(ref(rtdb, 'businesses'));
    if (!snapshot.exists()) return [];
    const val = snapshot.val();
    return Object.values(val).filter(b => b && b.status === 'approved');
  } catch (err) {
    console.error('Error fetching approved businesses:', err);
    return [];
  }
};

/**
 * Resolve business by unique slug
 */
export const getBusinessBySlug = async (slug) => {
  const clean = sanitizeSlug(slug);
  if (!clean || RESERVED_SLUGS.has(clean)) return null;

  try {
    // 1. Direct slug mapping lookup
    const slugSnap = await get(ref(rtdb, `businessSlugs/${clean}`));
    if (slugSnap.exists()) {
      const bizId = slugSnap.val();
      const bizSnap = await get(ref(rtdb, `businesses/${bizId}`));
      if (bizSnap.exists()) {
        const biz = bizSnap.val();
        return biz;
      }
    }

    // 2. Fallback scan (in case mapping wasn't created)
    const allSnap = await get(ref(rtdb, 'businesses'));
    if (allSnap.exists()) {
      const all = Object.values(allSnap.val());
      const match = all.find(b => b.slug === clean);
      return match || null;
    }
    return null;
  } catch (err) {
    console.error('Error getting business by slug:', err);
    return null;
  }
};

/**
 * Fetch reviews for a specific business
 */
export const getBusinessReviews = async (businessId) => {
  try {
    const reviewsRef = ref(rtdb, `businessReviews/${businessId}`);
    const snapshot = await get(reviewsRef);
    if (!snapshot.exists()) return [];
    const val = snapshot.val();
    return Object.values(val)
      .filter(r => r && r.status !== 'hidden')
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
};

/**
 * Submit or update a review
 */
export const submitBusinessReview = async (businessId, reviewData, currentUser) => {
  if (!currentUser?.uid) {
    throw new Error('Please sign in to submit a rating and review.');
  }

  // Check if current user is owner
  const bizSnap = await get(ref(rtdb, `businesses/${businessId}`));
  if (bizSnap.exists() && bizSnap.val().ownerUid === currentUser.uid) {
    throw new Error('Business owners cannot review their own establishment.');
  }

  const ratingNum = Math.min(5, Math.max(1, parseInt(reviewData.rating, 10) || 5));
  const reviewRef = ref(rtdb, `businessReviews/${businessId}/${currentUser.uid}`);
  const existingReviewSnap = await get(reviewRef);

  // Derive registered user's name: displayName > email prefix > fallback
  let resolvedName = (currentUser.displayName || '').trim();
  if (!resolvedName && currentUser.email) {
    const prefix = currentUser.email.split('@')[0];
    resolvedName = prefix
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  if (!resolvedName) {
    resolvedName = 'सरेरी नागरिक';
  }

  const reviewPayload = {
    userId: currentUser.uid,
    userName: resolvedName,
    userEmail: currentUser.email || '',
    userPhoto: currentUser.photoURL || '',
    rating: ratingNum,
    comment: reviewData.comment?.trim() || '',
    status: 'approved',
    createdAt: existingReviewSnap.exists() ? existingReviewSnap.val().createdAt : Date.now(),
    updatedAt: Date.now()
  };

  await set(reviewRef, reviewPayload);

  // Recalculate average rating and reviewCount in RTDB
  const stats = await recalculateBusinessRating(businessId);
  return { ...reviewPayload, stats };
};

/**
 * Delete a user's review
 */
export const deleteBusinessReview = async (businessId, userUid) => {
  const reviewRef = ref(rtdb, `businessReviews/${businessId}/${userUid}`);
  await remove(reviewRef);
  await recalculateBusinessRating(businessId);
};

/**
 * Recalculate average rating and total review count from database
 */
export const recalculateBusinessRating = async (businessId) => {
  try {
    const reviewsSnap = await get(ref(rtdb, `businessReviews/${businessId}`));
    let avg = 0;
    let count = 0;

    if (reviewsSnap.exists()) {
      const reviews = Object.values(reviewsSnap.val()).filter(r => r && r.status === 'approved');
      count = reviews.length;
      if (count > 0) {
        const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        avg = parseFloat((sum / count).toFixed(1));
      }
    }

    await update(ref(rtdb, `businesses/${businessId}`), {
      rating: avg,
      reviewCount: count,
      updatedAt: Date.now()
    });

    return { rating: avg, reviewCount: count };
  } catch (err) {
    console.error('Error recalculating rating:', err);
    return { rating: 0, reviewCount: 0 };
  }
};
