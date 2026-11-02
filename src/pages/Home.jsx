import React from 'react';
import Hero from '../sections/Hero';
import SEO from '../components/SEO';
import CitizenServices from '../components/home/CitizenServices';
import HomeKhelMahotsavSection from '../components/home/HomeKhelMahotsavSection';
import LatestNoticesSection from '../components/home/LatestNoticesSection';
import LatestNewsSection from '../components/home/LatestNewsSection';
import EventsCultureSection from '../components/home/EventsCultureSection';
import JanSunwaiBanner from '../components/home/JanSunwaiBanner';
import HomeBusinessesSection from '../components/home/HomeBusinessesSection';
import PollWidget from '../components/PollWidget';

const Home = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 min-h-screen">
      <SEO 
        title="Village Sareri | Digital Smart Village Portal"
        description="ब्राह्मणों की सरेरी, भीलवाड़ा (राजस्थान) का डिजिटल ग्राम पोर्टल। ग्राम पंचायत जानकारी, सरकारी नोटिस, जनसुनवाई, ग्राम समाचार, स्थानीय व्यवसाय और गांव की उपलब्धियां एक ही स्थान पर।"
        url="https://villagesareri.in/"
        image="https://villagesareri.in/photos/village_hero_poster.png"
      />

      {/* SECTION 1 — HERO */}
      <Hero />

      {/* SECTION 2 — QUICK ACCESS / CITIZEN SERVICES (Includes direct link to /pride) */}
      <CitizenServices />

      {/* SECTION — KHEL MAHOTSAV REGISTRATION (Controlled by Admin Toggle: only visible when started from admin) */}
      <HomeKhelMahotsavSection />

      {/* SECTION 3 — LATEST PANCHAYAT NOTICES */}
      <LatestNoticesSection />

      {/* SECTION — LOCAL BUSINESS DIRECTORY */}
      <HomeBusinessesSection />

      {/* SECTION 4 — LATEST VILLAGE NEWS */}
      <LatestNewsSection />

      {/* SECTION 5 — UPCOMING EVENTS & CULTURE */}
      <EventsCultureSection />

      {/* SECTION 6 — COMPLAINT / JAN SUNWAI BANNER (Placed towards bottom as requested) */}
      <JanSunwaiBanner />

      {/* SECTION 7 — PUBLIC OPINION POLL */}
      <PollWidget />

      {/* SECTION 8 — EXISTING FOOTER (Rendered automatically by App.jsx) */}
    </div>
  );
};

export default Home;
