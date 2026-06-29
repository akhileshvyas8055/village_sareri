import { useState, useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from './firebase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingAudioButton from './components/FloatingAudioButton';
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import CommunityPage from './pages/CommunityPage';
import PridePage from './pages/PridePage';
import NewsPage from './pages/NewsPage';
import RegistrationPage from './pages/RegistrationPage';
import NotificationPopup from './components/NotificationPopup';
import PanchayatPage from './pages/Panchayat';
import SEO from './components/SEO';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import MobileBottomNav from './components/MobileBottomNav';
import ComplaintPage from './pages/ComplaintPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import LanguagePromptPopup from './components/LanguagePromptPopup';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';

import { AdminContext } from './dataStore';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Foreground notification listener
    if (messaging) {
      const unsub = onMessage(messaging, (payload) => {
        if ('Notification' in window && Notification.permission === 'granted') {
          const title = payload.notification?.title || payload.data?.title || 'Village Alert';
          const options = {
            body: payload.notification?.body || payload.data?.body,
            icon: payload.notification?.icon || '/photos/About.jpeg',
            image: payload.notification?.image || '/photos/About.jpeg',
            requireInteraction: true,
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
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
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
                  <Route path="/settings" element={<SettingsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
                  <Route path="/profile" element={<ProfilePage />} />
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
      </div>
    </Router>
  );
}

export default App;
