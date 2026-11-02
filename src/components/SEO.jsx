import React from 'react';
import { Helmet } from 'react-helmet-async';

const defaultMeta = {
  siteName: 'Village Sareri',
  siteUrl: 'https://villagesareri.in',
  image: 'https://villagesareri.in/photos/village_hero_poster.png',
  locale: 'hi_IN',
};

/**
 * Normalizes image input to ensure it is always an absolute HTTPS URL.
 * Strictly prevents prepending website domains to Base64 strings.
 */
const normalizeMetaImage = (img) => {
  if (!img) return defaultMeta.image;
  const raw = String(img).trim();
  if (raw.startsWith('data:image/') || raw.startsWith('blob:')) {
    return defaultMeta.image;
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  if (raw.startsWith('/')) {
    return `${defaultMeta.siteUrl}${raw}`;
  }
  return `${defaultMeta.siteUrl}/${raw}`;
};

const SEO = ({ 
  title = 'Village Sareri | Digital Smart Village Portal',
  description = 'ब्राह्मणों की सरेरी, भीलवाड़ा (राजस्थान) का डिजिटल ग्राम पोर्टल। ग्राम पंचायत जानकारी, सरकारी नोटिस, जनसुनवाई, ग्राम समाचार, स्थानीय व्यवसाय और गांव की उपलब्धियां एक ही स्थान पर।',
  keywords = 'Village Sareri, Brahmano Ki Sareri, Brahmano Ki Sareri Bhilwara, Brahmano ki Sareri Asind, Sareri Village Rajasthan, ब्राह्मणों की सरेरी, सरेरी गांव, Gram Panchayat Brahmano Ki Sareri, Sareri digital portal, Asind Bhilwara smart village, Sareri pin code 311026, Charbhuja Mandir Sareri, Sareri news, Sareri notice board, Sareri vikas karya',
  image,
  url,
  type = 'website',
  noindex = false,
  breadcrumbs = null,
  schema = null,
  publishedTime,
  modifiedTime
}) => {
  const metaImage = normalizeMetaImage(image);
  const metaUrl = url || defaultMeta.siteUrl;

  // Build BreadcrumbList Schema if breadcrumbs array is provided
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': crumb.name,
      'item': crumb.url.startsWith('http') ? crumb.url : `${defaultMeta.siteUrl}${crumb.url.startsWith('/') ? '' : '/'}${crumb.url}`
    }))
  } : null;

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={metaUrl} />
      
      {/* Robots Tag */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Language / Translation Handling */}
      <meta name="google" content="notranslate" />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:secure_url" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:locale" content={defaultMeta.locale} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={metaImage} />

      {/* Mobile Branding */}
      <meta name="theme-color" content="#FF6B00" />
      <meta name="apple-mobile-web-app-title" content="Village Sareri" />

      {/* Structured Data: Breadcrumbs */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* Structured Data: Page-Specific Custom Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
