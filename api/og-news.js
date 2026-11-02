// Vercel Serverless Function: Dynamic Open Graph & Server-Delivered HTML for News Articles
// Generates rich preview cards for WhatsApp, Facebook, Twitter, Telegram, and Googlebot.

const https = require('https');

const FALLBACK_COVER = 'https://villagesareri.in/photos/news/news_fallback_cover.jpg';
const SITE_NAME = 'Village Sareri';
const SITE_ORIGIN = 'https://villagesareri.in';

function fetchNewsItem(id) {
  return new Promise((resolve) => {
    if (!id) return resolve(null);
    const cleanId = String(id).trim();
    const url = `https://sareri-website-default-rtdb.firebaseio.com/adminData/news/${cleanId}.json`;

    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const item = JSON.parse(rawData);
          if (item && typeof item === 'object') {
            resolve({ id: cleanId, ...item });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function resolveImageUrl(item, id) {
  if (!item || !item.image) return FALLBACK_COVER;
  const raw = String(item.image).trim();
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  if (raw.startsWith('data:image/')) {
    const cleanId = String(id || '').replace(/[^a-zA-Z0-9]/g, '');
    return `${SITE_ORIGIN}/photos/news/news_${cleanId}.jpg`;
  }
  if (raw.startsWith('/')) return `${SITE_ORIGIN}${raw}`;
  return `${SITE_ORIGIN}/${raw}`;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async (req, res) => {
  const id = req.query.id || req.query.newsId || '';
  const item = await fetchNewsItem(id);

  const title = item?.title ? `${item.title} | ${SITE_NAME}` : `Village News & Updates | ${SITE_NAME}`;
  const desc = item?.desc
    ? item.desc.replace(/\s+/g, ' ').slice(0, 180) + '...'
    : 'ब्राह्मणों की सरेरी, भीलवाड़ा (राजस्थान) के ताज़ा समाचार, पंचायत घोषणाएं, सरकारी योजनाएं एवं ग्राम अपडेट।';
  const imageUrl = resolveImageUrl(item, id);
  const canonicalUrl = id ? `${SITE_ORIGIN}/news?id=${encodeURIComponent(id)}` : `${SITE_ORIGIN}/news`;
  const destinationUrl = id ? `/news?id=${encodeURIComponent(id)}` : '/news';
  const pubDate = item?.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString();

  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(desc);
  const safeImage = escapeHtml(imageUrl);
  const safeUrl = escapeHtml(canonicalUrl);

  const articleSchema = item ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': item.title || 'Village News',
    'image': [imageUrl],
    'datePublished': pubDate,
    'dateModified': pubDate,
    'description': desc,
    'url': canonicalUrl,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    'author': {
      '@type': 'GovernmentOrganization',
      'name': 'Gram Panchayat Brahmano Ki Sareri',
      'url': SITE_ORIGIN
    },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_ORIGIN}/logo512.png`
      }
    }
  }) : '';

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${safeUrl}">
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="${item ? 'article' : 'website'}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:secure_url" content="${safeImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">
  <meta property="og:url" content="${safeUrl}">
  <meta property="og:locale" content="hi_IN">
  ${item ? `<meta property="article:published_time" content="${pubDate}">` : ''}

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">

  <!-- Favicon -->
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">

  <!-- Schema.org Structured Data -->
  ${articleSchema ? `<script type="application/ld+json">${articleSchema}</script>` : ''}

  <!-- Automatic Client Redirect to interactive SPA for human visitors -->
  <meta http-equiv="refresh" content="0;url=${destinationUrl}">
  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${destinationUrl}');
    }
  </script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 2rem; background: #fafafa; color: #1e293b; }
    .card { max-width: 680px; margin: 2rem auto; background: #fff; border-radius: 1.5rem; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    img { width: 100%; max-height: 400px; object-fit: cover; }
    .content { padding: 1.75rem; }
    h1 { font-size: 1.6rem; margin-top: 0; color: #0f172a; line-height: 1.3; }
    p { color: #475569; font-size: 1.05rem; line-height: 1.6; }
    .btn { display: inline-block; background: #ea580c; color: #fff; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <img src="${safeImage}" alt="${safeTitle}">
    <div class="content">
      <h1>${safeTitle}</h1>
      <p>${safeDesc}</p>
      <a class="btn" href="${destinationUrl}">वेबसाइट पर पूरी खबर पढ़ें &rarr;</a>
    </div>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
  res.status(200).send(html);
};
