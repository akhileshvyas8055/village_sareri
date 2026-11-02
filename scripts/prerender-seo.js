// scripts/prerender-seo.js
// Post-build prerender script for Village Sareri
// Generates static HTML files for all indexable public routes in dist/
// to ensure Googlebot, WhatsApp, Facebook, Bing, and all crawlers receive
// 100% server-delivered SEO metadata and semantic content without needing client hydration.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const SITE_ORIGIN = 'https://villagesareri.in';
const SITE_NAME = 'Village Sareri';

const routes = [
  {
    path: '/about',
    title: 'सरेरी गाँव परिचय एवं इतिहास | Explore Village Sareri - History & Culture',
    description: 'ब्राह्मणों की सरेरी (आसींद, भीलवाड़ा, राजस्थान) का समृद्ध इतिहास, लोक संस्कृति, ऐतिहासिक मंदिर, तालाब, प्राकृतिक सौंदर्य और भौगोलिक परिचय।',
    h1: 'गाँव का इतिहास एवं संस्कृति - ब्राह्मणों की सरेरी',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'गाँव परिचय', url: `${SITE_ORIGIN}/about` }
    ]
  },
  {
    path: '/gallery',
    title: 'गाँव फोटो एवं वीडियो गैलरी | Village Photo Gallery - Village Sareri',
    description: 'ब्राह्मणों की सरेरी गाँव के सुंदर दृश्य, प्राचीन मंदिर, जलाशय, उत्सव, विकास कार्य एवं ग्राम जीवन की तस्वीरों और वीडियो का संग्रह।',
    h1: 'गाँव की फोटो एवं वीडियो गैलरी',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'फोटो गैलरी', url: `${SITE_ORIGIN}/gallery` }
    ]
  },
  {
    path: '/community',
    title: 'ग्राम चौपाल एवं सामुदायिक मंच | Community Forum - Village Sareri',
    description: 'ब्राह्मणों की सरेरी ग्राम चौपाल - प्रबुद्ध नागरिकों, युवाओं, प्रवासियों एवं ग्रामीणों के विचार-विमर्श, सुझाव व सामुदायिक सहभागिता का डिजिटल मंच।',
    h1: 'ग्राम चौपाल एवं सामुदायिक मंच',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'ग्राम चौपाल', url: `${SITE_ORIGIN}/community` }
    ]
  },
  {
    path: '/pride',
    title: 'सरेरी का गौरव | Pride of Sareri - Village Sareri Portal',
    description: 'ब्राह्मणों की सरेरी की गौरवशाली विभूतियां, स्वतंत्रता सेनानी, शहीद, प्रशासनिक अधिकारी, उत्कृष्ट खिलाड़ी, भामाशाह और प्रेरणास्रोत व्यक्तित्व।',
    h1: 'सरेरी का गौरव - हमारे प्रेरणास्रोत व्यक्तित्व',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'सरेरी का गौरव', url: `${SITE_ORIGIN}/pride` }
    ]
  },
  {
    path: '/news',
    title: 'गाँव समाचार एवं अपडेट्स | Village News & Updates - Village Sareri',
    description: 'ब्राह्मणों की सरेरी (भीलवाड़ा) के नवीनतम समाचार, विकास कार्य, सामाजिक कार्यक्रम, सरकारी योजनाओं की जानकारी और ग्राम गतिविधियां।',
    h1: 'गाँव के ताज़ा समाचार एवं सूचनाएं',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'गाँव समाचार', url: `${SITE_ORIGIN}/news` }
    ]
  },
  {
    path: '/complaint',
    title: 'जनसुनवाई एवं शिकायत पोर्टल | Jan Sunwai & Grievance Redressal - Village Sareri',
    description: 'ग्राम पंचायत ब्राह्मणों की सरेरी जनसुनवाई पोर्टल। सड़क, पानी, बिजली, सफाई व अन्य ग्राम समस्याओं की ऑनलाइन शिकायत दर्ज करें और स्थिति ट्रैक करें।',
    h1: 'जनसुनवाई एवं ऑनलाइन शिकायत समाधान पोर्टल',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'जनसुनवाई', url: `${SITE_ORIGIN}/complaint` }
    ]
  },
  {
    path: '/panchayat',
    title: 'ग्राम पंचायत सरेरी | Gram Panchayat Brahmano Ki Sareri, Bhilwara',
    description: 'ग्राम पंचायत ब्राह्मणों की सरेरी (आसींद, भीलवाड़ा) का आधिकारिक पोर्टल। सरपंच, उपसरपंच, ग्राम विकास अधिकारी, वार्ड पंच सूची, पंचायत सेवाएँ व विकास योजनाएं।',
    h1: 'ग्राम पंचायत ब्राह्मणों की सरेरी - आधिकारिक सेवा पोर्टल',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'ग्राम पंचायत', url: `${SITE_ORIGIN}/panchayat` }
    ]
  },
  {
    path: '/panchayat-karyalay',
    title: 'ग्राम पंचायत कार्यालय सरेरी | Gram Panchayat Office Brahmano Ki Sareri',
    description: 'ग्राम पंचायत कार्यालय ब्राह्मणों की सरेरी का संपर्क, कार्य समय, जनसुनवाई कक्ष, ई-मित्र केंद्र, पंचायत सचिव व ग्राम स्तरीय अधिकारियों की संपर्क निर्देशिका।',
    h1: 'ग्राम पंचायत कार्यालय ब्राह्मणों की सरेरी',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'ग्राम पंचायत', url: `${SITE_ORIGIN}/panchayat` },
      { name: 'पंचायत कार्यालय', url: `${SITE_ORIGIN}/panchayat-karyalay` }
    ]
  },
  {
    path: '/panchayat/karyalay',
    title: 'ग्राम पंचायत कार्यालय सरेरी | Gram Panchayat Office Brahmano Ki Sareri',
    description: 'ग्राम पंचायत कार्यालय ब्राह्मणों की सरेरी का संपर्क, कार्य समय, जनसुनवाई कक्ष, ई-मित्र केंद्र, पंचायत सचिव व ग्राम स्तरीय अधिकारियों की संपर्क निर्देशिका।',
    h1: 'ग्राम पंचायत कार्यालय ब्राह्मणों की सरेरी',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'ग्राम पंचायत', url: `${SITE_ORIGIN}/panchayat` },
      { name: 'पंचायत कार्यालय', url: `${SITE_ORIGIN}/panchayat-karyalay` }
    ]
  },
  {
    path: '/gram-sabha',
    title: 'ग्राम सभा एवं निर्णय | Gram Sabha Meetings & Resolutions - Village Sareri',
    description: 'ग्राम पंचायत सरेरी की ग्राम सभा बैठकों की समय-सारणी, प्रस्ताव, वार्षिक योजनाएं, जन-निर्णय और नागरिक सहभागिता की विस्तृत जानकारी।',
    h1: 'ग्राम सभा बैठकें, प्रस्ताव एवं निर्णय',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'ग्राम पंचायत', url: `${SITE_ORIGIN}/panchayat` },
      { name: 'ग्राम सभा', url: `${SITE_ORIGIN}/gram-sabha` }
    ]
  },
  {
    path: '/vikas-karya',
    title: 'गाँव के विकास कार्य | Village Development Projects - Village Sareri',
    description: 'ब्राह्मणों की सरेरी में स्वीकृत, प्रगतिरत व पूर्ण हुए विकास कार्यों (सड़क, जल, प्रकाश, विद्यालय, स्वास्थ्य केंद्र) का वित्तीय एवं भौतिक ब्योरा।',
    h1: 'ग्राम पंचायत सरेरी के विकास कार्य एवं परियोजनाएं',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'ग्राम पंचायत', url: `${SITE_ORIGIN}/panchayat` },
      { name: 'विकास कार्य', url: `${SITE_ORIGIN}/vikas-karya` }
    ]
  },
  {
    path: '/notices',
    title: 'डिजिटल सूचना पट्ट | Digital Notice Board - Village Sareri',
    description: 'ग्राम पंचायत ब्राह्मणों की सरेरी का आधिकारिक डिजिटल सूचना पट्ट। सरकारी आदेश, ग्राम सभा विज्ञप्ति, निविदाएं, राशन वितरण व जनसूचनाएं।',
    h1: 'डिजिटल सूचना पट्ट - ग्राम पंचायत सरेरी',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'सूचना पट्ट', url: `${SITE_ORIGIN}/notices` }
    ]
  },
  {
    path: '/events',
    title: 'गाँव के मेले एवं सांस्कृतिक उत्सव | Village Festivals & Events - Village Sareri',
    description: 'सरेरी गाँव के पारंपरिक मेले, जलझूलनी एकादशी, ठाकुर जी का बेवाण, होली-दिवाली उत्सव, खेलकूद प्रतियोगिताएं एवं सांस्कृतिक आयोजनों का कैलेंडर।',
    h1: 'गाँव की पावन संस्कृति, मेले एवं उत्सव',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'मेले एवं उत्सव', url: `${SITE_ORIGIN}/events` }
    ]
  },
  {
    path: '/businesses',
    title: 'स्थानीय व्यवसाय निर्देशिका | Local Business Directory - Village Sareri',
    description: 'सरेरी गाँव की स्थानीय दुकानें, कृषि केंद्र, सेवा प्रदाता, ई-मित्र, डॉक्टर, हस्तशिल्प और कारीगरों की संपूर्ण संपर्क निर्देशिका।',
    h1: 'सरेरी स्थानीय व्यवसाय एवं सेवा निर्देशिका',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'स्थानीय व्यवसाय', url: `${SITE_ORIGIN}/businesses` }
    ]
  },
  {
    path: '/businesses/register',
    title: 'व्यापार पंजीकरण | Register Your Local Business - Village Sareri',
    description: 'सरेरी गाँव के व्यवसायी एवं दुकानदार अपने व्यापार, दुकान या सेवा को ग्राम पोर्टल पर निःशुल्क पंजीकृत करें।',
    h1: 'सरेरी पोर्टल पर अपना व्यापार निःशुल्क पंजीकृत करें',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'स्थानीय व्यवसाय', url: `${SITE_ORIGIN}/businesses` },
      { name: 'व्यापार पंजीकरण', url: `${SITE_ORIGIN}/businesses/register` }
    ]
  },
  {
    path: '/privacy-policy',
    title: 'गोपनीयता नीति | Privacy Policy - Village Sareri Portal',
    description: 'विलेज सरेरी डिजिटल पोर्टल की गोपनीयता नीति। जानें कि पोर्टल पर नागरिक डेटा और सूचनाएं किस प्रकार सुरक्षित रखी जाती हैं।',
    h1: 'गोपनीयता नीति (Privacy Policy)',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'गोपनीयता नीति', url: `${SITE_ORIGIN}/privacy-policy` }
    ]
  },
  {
    path: '/terms',
    title: 'नियम एवं शर्तें | Terms of Service - Village Sareri Portal',
    description: 'विलेज सरेरी डिजिटल पोर्टल के उपयोग के नियम, शर्तें और नागरिक दिशानिर्देश। पोर्टल सेवाओं के सुरक्षित व निष्पक्ष उपयोग हेतु नियम।',
    h1: 'नियम एवं शर्तें (Terms of Service)',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_ORIGIN}/` },
      { name: 'नियम एवं शर्तें', url: `${SITE_ORIGIN}/terms` }
    ]
  }
];

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function runPrerender() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Dist directory not found at ${DIST_DIR}. Run 'vite build' first.`);
    process.exit(1);
  }

  const baseHtmlPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error(`Base index.html not found at ${baseHtmlPath}`);
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
  console.log(`[SEO Prerender] Starting prerender for ${routes.length} static routes...`);

  routes.forEach(route => {
    const routeUrl = `${SITE_ORIGIN}${route.path}`;
    const safeTitle = escapeHtml(route.title);
    const safeDesc = escapeHtml(route.description);
    const safeUrl = escapeHtml(routeUrl);

    // Build BreadcrumbList JSON-LD
    const breadcrumbSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': route.breadcrumbs.map((b, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': b.name,
        'item': b.url
      }))
    });

    let html = baseHtml;

    // 1. Replace Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

    // 2. Replace Meta Description
    if (html.includes('name="description"')) {
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${safeDesc}"`);
    } else {
      html = html.replace('</head>', `  <meta name="description" content="${safeDesc}">\n</head>`);
    }

    // 3. Replace Canonical
    if (html.includes('rel="canonical"')) {
      html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"/i, `<link rel="canonical" href="${safeUrl}"`);
    } else {
      html = html.replace('</head>', `  <link rel="canonical" href="${safeUrl}">\n</head>`);
    }

    // 4. Update Open Graph tags
    html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"/i, `<meta property="og:title" content="${safeTitle}"`);
    html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"/i, `<meta property="og:description" content="${safeDesc}"`);
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"/i, `<meta property="og:url" content="${safeUrl}"`);

    // 5. Update Twitter tags
    html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"/i, `<meta name="twitter:title" content="${safeTitle}"`);
    html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"/i, `<meta name="twitter:description" content="${safeDesc}"`);
    html = html.replace(/<meta\s+name="twitter:url"\s+content="[^"]*"/i, `<meta name="twitter:url" content="${safeUrl}"`);

    // 6. Inject BreadcrumbList JSON-LD
    const breadcrumbScript = `\n  <script type="application/ld+json" id="breadcrumb-schema">${breadcrumbSchema}</script>\n`;
    html = html.replace('</head>', `${breadcrumbScript}</head>`);

    // 7. Inject crawler-readable semantic content into <div id="root">
    const semanticContent = `
      <div style="padding: 2rem; max-width: 900px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
        <nav aria-label="Breadcrumb" style="font-size: 0.9rem; margin-bottom: 1rem; color: #64748b;">
          ${route.breadcrumbs.map(b => `<a href="${b.url}" style="color: #ea580c; text-decoration: none;">${escapeHtml(b.name)}</a>`).join(' &gt; ')}
        </nav>
        <h1 style="font-size: 2rem; color: #0f172a; margin-bottom: 1rem;">${escapeHtml(route.h1)}</h1>
        <p style="font-size: 1.15rem; color: #334155; line-height: 1.7; margin-bottom: 1.5rem;">${safeDesc}</p>
        <p style="font-size: 0.95rem; color: #64748b;">ग्राम पंचायत ब्राह्मणों की सरेरी, आसींद, भीलवाड़ा (राजस्थान) - 311026</p>
      </div>
    `;
    html = html.replace('<div id="root"></div>', `<div id="root">${semanticContent}</div>`);

    // Determine target directory and file
    const relSubDir = route.path.replace(/^\//, '');
    const targetDir = path.join(DIST_DIR, relSubDir);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetFile = path.join(targetDir, 'index.html');

    fs.writeFileSync(targetFile, html, 'utf-8');
    console.log(`[SEO Prerender] Wrote: ${targetFile.replace(DIST_DIR, 'dist')}`);
  });

  console.log('[SEO Prerender] Completed successfully!');
}

runPrerender();
