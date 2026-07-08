import React from 'react';
import { Helmet } from 'react-helmet-async';

const defaultMeta = {
  siteName: 'Brahmano Ki Sareri',
  siteUrl: 'https://villagesareri.in',
  image: 'https://villagesareri.in/photos/About.jpeg',
  locale: 'hi_IN',
};

const SEO = ({ 
  title = 'Brahmano Ki Sareri — Connecting Village with Future',
  description = 'Welcome to the digital identity of Brahmano Ki Sareri Village, Bhilwara, Rajasthan. Explore our rich culture, heritage, temples, festivals, and community updates.',
  keywords = 'Brahmano Ki Sareri, Brahmano Ki Sareri Bhilwara, Brahmano ki Sareri Asind, Village Sareri, Sareri Village Rajasthan, ब्राह्मणों की सरेरी, सरेरी गांव, Charbhuja Mandir Brahmano ki Sareri, Bada Mandir Sareri, Ramleela Brahmano Ki Sareri, Jaljhulni Ekadashi Sareri, Naya Talab Sareri, Sareri Shyam Khel Mahotsav 2026, Brahmano ki Sareri sports registration, Sareri village cricket tournament, Brahmano ki Sareri live poll, Gram Panchayat Brahmano Ki Sareri, Asind Bhilwara villages list, Smart village in Bhilwara, Sareri pin code 311026, Brahmano ki Sareri news, Sareri village 360 view, Brahmano ki Sareri me Khel Mahotsav kab hai, How to reach Brahmano Ki Sareri Bhilwara, History of Ramleela in Brahmano ki Sareri, Brahmano ki Sareri gram panchayat details',
  image,
  url,
  type = 'website',
}) => {
  const metaImage = image || defaultMeta.image;
  const metaUrl = url || defaultMeta.siteUrl;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:locale" content={defaultMeta.locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={metaImage} />

      {/* Extra */}
      <meta name="theme-color" content="#FF6B00" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Sareri" />
    </Helmet>
  );
};

export default SEO;
