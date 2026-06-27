import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingAudioButton from './components/FloatingAudioButton';
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import CommunityPage from './pages/CommunityPage';
import NewsPage from './pages/NewsPage';
import RegistrationPage from './pages/RegistrationPage';
import NotificationPopup from './components/NotificationPopup';
import PanchayatPage from './pages/Panchayat';

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
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/khel-registration" element={<RegistrationPage />} />
                  <Route path="/panchayat" element={<PanchayatPage />} />
                </Routes>
              </main>
              <Footer />
              <NotificationPopup />
              <FloatingAudioButton />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
