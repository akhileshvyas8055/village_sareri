import { useState, useEffect, useRef } from 'react';
import { onMessage } from 'firebase/messaging';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, getFirebaseMessaging } from './firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingAudioButton from './components/FloatingAudioButton';
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import NotificationPopup from './components/NotificationPopup';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import MobileBottomNav from './components/MobileBottomNav';
import LanguagePromptPopup from './components/LanguagePromptPopup';
import PageLoadingSkeleton from './components/PageLoadingSkeleton';
import NotificationsPage from './pages/NotificationsPage';
import { FiBell, FiX } from 'react-icons/fi';
import { syncNotificationToken } from './services/pushNotifications';
import { syncAuthenticatedUser } from './services/userService';

// Lazy load pages for fast initial render
const Home = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PridePage = lazy(() => import('./pages/PridePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const PanchayatPage = lazy(() => import('./pages/Panchayat'));
const PanchayatKaryalayPage = lazy(() => import('./pages/PanchayatKaryalayPage'));
const GramSabhaPage = lazy(() => import('./pages/GramSabhaPage'));
const VikasKaryaPage = lazy(() => import('./pages/VikasKaryaPage'));
const ComplaintPage = lazy(() => import('./pages/ComplaintPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NoticeBoardPage = lazy(() => import('./pages/NoticeBoardPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const BusinessDirectoryPage = lazy(() => import('./pages/BusinessDirectoryPage'));
const BusinessRegisterPage = lazy(() => import('./pages/BusinessRegisterPage'));
const BusinessDetailPage = lazy(() => import('./pages/BusinessDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const Admin = lazy(() => import('./pages/Admin'));

import { AdminContext } from './dataStore';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  }, [pathname]);

  return null;
}

function ForegroundNotificationListener() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const seenMessages = useRef(new Set());

  useEffect(() => {
    let isActive = true;
    let unsubscribe;
    let dismissTimer;

    getFirebaseMessaging().then((messaging) => {
      if (!isActive || !messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || 'Village Alert';
        const body = payload.notification?.body || payload.data?.body || '';
        const rawLink = payload.data?.link || payload.data?.url || '/';
        const messageId = payload.messageId || `${title}|${body}|${rawLink}`;

        if (seenMessages.current.has(messageId)) return;
        seenMessages.current.add(messageId);
        if (seenMessages.current.size > 100) {
          seenMessages.current.delete(seenMessages.current.values().next().value);
        }

        let link = '/';
        try {
          const parsedUrl = new URL(rawLink, window.location.origin);
          if (parsedUrl.origin === window.location.origin) {
            link = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
          }
        } catch {
          // Keep the safe home-page fallback for malformed destinations.
        }

        setNotice({ title, body, link });
        window.clearTimeout(dismissTimer);
        dismissTimer = window.setTimeout(() => setNotice(null), 9000);
      });
    });

    return () => {
      isActive = false;
      unsubscribe?.();
      window.clearTimeout(dismissTimer);
    };
  }, []);

  useEffect(() => {
    const syncIfAllowed = () => {
      if (
        document.visibilityState === 'visible' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        syncNotificationToken().catch((error) => {
          console.warn('Unable to refresh notification registration.', error);
        });
      }
    };

    syncIfAllowed();
    window.addEventListener('focus', syncIfAllowed);
    document.addEventListener('visibilitychange', syncIfAllowed);
    return () => {
      window.removeEventListener('focus', syncIfAllowed);
      document.removeEventListener('visibilitychange', syncIfAllowed);
    };
  }, []);

  if (!notice) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[100]" role="status" aria-live="polite">
      <div className="bg-white dark:bg-darkCard rounded-2xl shadow-2xl border border-saffron/25 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-orange-400 via-saffron to-yellow-500" />
        <div className="p-4 flex items-start gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-full text-saffron shrink-0">
            <FiBell className="w-5 h-5" />
          </div>
          <button
            type="button"
            className="flex-1 text-left min-w-0"
            onClick={() => {
              setNotice(null);
              navigate(notice.link);
            }}
            aria-label={`${notice.title}. Open notification`}
          >
            <span className="block font-bold text-gray-900 dark:text-white">{notice.title}</span>
            {notice.body && <span className="block text-sm text-gray-600 dark:text-gray-300 mt-1">{notice.body}</span>}
            <span className="block text-xs font-semibold text-saffron mt-2">Open notice</span>
          </button>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Dismiss notification"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      syncAuthenticatedUser(user).catch((error) => {
        console.warn('Unable to sync the signed-in user profile.', error);
      });
    });

    return () => unsubscribe();
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
      <ForegroundNotificationListener />
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/admin" element={
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-saffron" /></div>}>
              <Admin />
            </Suspense>
          } />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/*" element={
            <>
              <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              <main className="flex-grow pb-16 md:pb-0">
                <Suspense fallback={<PageLoadingSkeleton />}>
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
                    <Route path="/panchayat/karyalay" element={<PanchayatKaryalayPage />} />
                    <Route path="/panchayat-karyalay" element={<PanchayatKaryalayPage />} />
                    <Route path="/gram-sabha" element={<GramSabhaPage />} />
                    <Route path="/vikas-karya" element={<VikasKaryaPage />} />
                    <Route path="/notices" element={<NoticeBoardPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/settings" element={<SettingsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/businesses" element={<BusinessDirectoryPage />} />
                    <Route path="/businesses/register" element={<BusinessRegisterPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms-of-service" element={<TermsPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/:slug" element={<BusinessDetailPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
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
      </div>
    </Router>
  );
}

export default App;
