const fs = require('fs');
const path = require('path');

console.log('--- Starting Production SEO & Bugfix Validation ---');

// 1. Verify Favicon suite
const faviconFiles = [
  'public/favicon-48x48.png',
  'public/favicon-96x96.png',
  'public/favicon-192x192.png',
  'public/apple-touch-icon.png',
  'public/favicon.ico'
];
faviconFiles.forEach(f => {
  const p = path.resolve(__dirname, f);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing favicon file: ${f}`);
  }
  const stat = fs.statSync(p);
  console.log(`[PASS] Favicon exists: ${f} (${stat.size} bytes)`);
});

// 2. Verify robots.txt
const robotsTxt = fs.readFileSync(path.resolve(__dirname, 'public/robots.txt'), 'utf8');
if (!robotsTxt.includes('Sitemap: https://villagesareri.in/sitemap.xml')) {
  throw new Error('robots.txt missing sitemap declaration');
}
if (!robotsTxt.includes('Disallow: /admin')) {
  throw new Error('robots.txt missing /admin disallow');
}
console.log('[PASS] robots.txt validated');

// 3. Verify sitemap.xml
const sitemapXml = fs.readFileSync(path.resolve(__dirname, 'public/sitemap.xml'), 'utf8');
const expectedUrls = [
  'https://villagesareri.in/',
  'https://villagesareri.in/panchayat',
  'https://villagesareri.in/panchayat/karyalay',
  'https://villagesareri.in/notices',
  'https://villagesareri.in/news',
  'https://villagesareri.in/complaint',
  'https://villagesareri.in/businesses',
  'https://villagesareri.in/businesses/register',
  'https://villagesareri.in/pride',
  'https://villagesareri.in/about',
  'https://villagesareri.in/events',
  'https://villagesareri.in/gallery',
  'https://villagesareri.in/community',
  'https://villagesareri.in/gram-sabha',
  'https://villagesareri.in/vikas-karya',
  'https://villagesareri.in/privacy-policy',
  'https://villagesareri.in/terms-of-service'
];
expectedUrls.forEach(url => {
  if (!sitemapXml.includes(`<loc>${url}</loc>`)) {
    throw new Error(`Sitemap missing URL: ${url}`);
  }
});
console.log(`[PASS] sitemap.xml validated (${expectedUrls.length} canonical URLs present)`);

// 4. Verify index.html Structured Data (JSON-LD)
const indexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
const jsonLdMatches = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
if (!jsonLdMatches || jsonLdMatches.length === 0) {
  throw new Error('No JSON-LD structured data found in index.html');
}
jsonLdMatches.forEach((block, idx) => {
  const content = block.replace(/<script type="application\/ld\+json">/i, '').replace(/<\/script>/i, '').trim();
  try {
    const parsed = JSON.parse(content);
    console.log(`[PASS] index.html JSON-LD #${idx + 1} is valid JSON (${parsed['@type'] || (parsed['@graph'] && parsed['@graph'].map(g => g['@type']).join(', '))})`);
  } catch (err) {
    throw new Error(`JSON-LD #${idx + 1} in index.html has syntax error: ${err.message}`);
  }
});

// 5. Verify News images and fallback cover
const fallbackCover = path.resolve(__dirname, 'public/photos/news/news_fallback_cover.jpg');
if (!fs.existsSync(fallbackCover) || fs.statSync(fallbackCover).size === 0) {
  throw new Error('Missing or empty news_fallback_cover.jpg');
}
console.log(`[PASS] news_fallback_cover.jpg exists (${fs.statSync(fallbackCover).size} bytes)`);

// Check extracted news images
const newsImgs = fs.readdirSync(path.resolve(__dirname, 'public/photos/news')).filter(f => f.startsWith('news_') && f.endsWith('.jpg'));
console.log(`[PASS] Extracted news photos count: ${newsImgs.length}`);

// 6. Verify api/og-news.js
const ogNewsJs = fs.readFileSync(path.resolve(__dirname, 'api/og-news.js'), 'utf8');
if (!ogNewsJs.includes('FALLBACK_COVER') || !ogNewsJs.includes('resolveImageUrl')) {
  throw new Error('api/og-news.js missing key helper methods');
}
console.log('[PASS] api/og-news.js validated');

console.log('--- All validation checks passed successfully! ---');
