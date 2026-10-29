import { useState, useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingAudioButton from './components/FloatingAudioButton';
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import NotificationPopup from './components/NotificationPopup';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import MobileBottomNav from './components/MobileBottomNav';
import LanguagePromptPopup from './components/LanguagePromptPopup';

// Lazy load pages for fast initial render
const Home = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PridePage = lazy(() => import('./pages/PridePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const PanchayatPage = lazy(() => import('./pages/Panchayat'));
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NoticeBoardPage = lazy(() => import('./pages/NoticeBoardPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const BusinessDirectoryPage = lazy(() => import('./pages/BusinessDirectoryPage'));
const BusinessRegisterPage = lazy(() => import('./pages/BusinessRegisterPage'));
const BusinessDetailPage = lazy(() => import('./pages/BusinessDetailPage'));
const Admin = lazy(() => import('./pages/Admin'));

import { AdminContext } from './dataStore';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('sareri_theme');
      return saved === 'dark'; // Default is always light (false)
    } catch {
      return false;
    }
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Foreground notification listener
    if (messaging) {
      const unsub = onMessage(messaging, (payload) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = payload.notification?.title || payload.data?.title || 'Village Alert';
          const options = {
            body: payload.notification?.body || payload.data?.body,
            icon: '/photos/About.jpeg',
            image: '/photos/About.jpeg',
            requireInteraction: true,
            tag: payload.messageId || title, // Deduplicate notifications across multiple tabs
            data: { url: payload.data?.link || '/' }
          };
          
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification(title, options);
            });
          } else {
            const notif = new Notification(title, options);
            notif.onclick = function() {
              window.open(payload.data?.link || '/', '_blank');
              notif.close();
            };
          }
        }
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('sareri_theme', 'dark');
      } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('sareri_theme', 'light');
      } catch (e) {}
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-saffron"></div></div>}>
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/*" element={
              <>
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                <main className="flex-grow pb-16 md:pb-0">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/community" element={<CommunityPage />} />
                    <Route path="/pride" element={<PridePage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/complaint" element={<ComplaintPage />} />
                    <Route path="/khel-registration" element={<RegistrationPage />} />
                    <Route path="/panchayat" element={<PanchayatPage />} />
                    <Route path="/notices" element={<NoticeBoardPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/settings" element={<SettingsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/businesses" element={<BusinessDirectoryPage />} />
                    <Route path="/businesses/register" element={<BusinessRegisterPage />} />
                    <Route path="/:slug" element={<BusinessDetailPage />} />
                  </Routes>
                </main>
                <Footer />
                <NotificationPopup />
                <FloatingAudioButton />
                <PWAInstallPrompt />
                <LanguagePromptPopup />
                <MobileBottomNav />
              </>
            } />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
