/**
 * Helper utility to normalize and resolve news cover image URLs.
 * Strictly prevents prepending website domains to Base64 data strings.
 * Provides branded fallback images for news without photos.
 */

export const NEWS_FALLBACK_COVER = 'https://villagesareri.in/photos/news/news_fallback_cover.jpg';

export const getCleanNewsId = (id) => {
  if (!id) return '';
  return String(id).replace(/[^a-zA-Z0-9]/g, '');
};

/**
 * Returns a valid, public, absolute HTTPS URL for any news item cover photo.
 * Never returns a concatenated "https://villagesareri.in/data:image/..." string.
 */
export const getNewsCoverImageUrl = (item) => {
  if (!item || !item.image) {
    return NEWS_FALLBACK_COVER;
  }

  const raw = String(item.image).trim();

  // 1. If it's an existing absolute HTTP/HTTPS URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  // 2. If it's a legacy Base64 string, resolve to the static migrated file if ID is known
  if (raw.startsWith('data:image/')) {
    const cleanId = getCleanNewsId(item.id);
    if (cleanId) {
      return `https://villagesareri.in/photos/news/news_${cleanId}.jpg`;
    }
    return NEWS_FALLBACK_COVER;
  }

  // 3. If it starts with slash, prepend domain
  if (raw.startsWith('/')) {
    return `https://villagesareri.in${raw}`;
  }

  // 4. Fallback safe path
  return `https://villagesareri.in/${raw}`;
};

/**
 * For <img> rendering in browser:
 * Allows data:image/ for live preview during admin upload,
 * but resolves static/fallback for public display.
 */
export const getNewsDisplayImage = (item) => {
  if (!item || !item.image) {
    return '/photos/news/news_fallback_cover.jpg';
  }
  const raw = String(item.image).trim();
  if (raw.startsWith('data:image/')) {
    return raw; // Browser can render data: URI in <img> tag directly
  }
  return getNewsCoverImageUrl(item);
};
