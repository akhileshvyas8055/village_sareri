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
        title="BRAHMANO KI SARERI - Official Smart Village Portal"
        description="Welcome to the official website of Brahmano Ki Sareri. Explore village citizen services, notices, news, panchayat updates, events, and community initiatives."
        url="https://villagesareri.in/"
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

      {/* SECTION 6 — COMPLAINT / JAN SUNWAI CTA */}
      <JanSunwaiBanner />

      {/* SECTION 7 — PUBLIC OPINION POLL (Rendered at the very bottom below Shikayat) */}
      <PollWidget />

      {/* SECTION 8 — EXISTING FOOTER (Rendered automatically by App.jsx) */}
    </div>
  );
};

export default Home;
