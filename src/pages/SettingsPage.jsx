import React, { useState, useEffect } from 'react';
import { FiBell, FiDownload, FiSettings, FiCheckCircle, FiInfo, FiUser, FiChevronRight } from 'react-icons/fi';
import { getToken } from 'firebase/messaging';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { messaging, db } from '../firebase';
import LanguageToggle from '../components/LanguageToggle';
import { FiGlobe, FiMoon, FiSun } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { isAppInstalled, promptPWAInstall } from '../utils/pwa';
import InstallGuideModal from '../components/InstallGuideModal';
import SEO from '../components/SEO';

const VAPID_KEY = "BGJGryvnAKIvBHBdvq644OaBhX37nZ9JsDboA_6IbJErrYhu3qfLwhAiLWrTTlZz6HEU3TMc6gZ69pIyRiGFoTU"; 

const SettingsPage = ({ darkMode, toggleDarkMode }) => {
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [isStandalone, setIsStandalone] = useState(isAppInstalled);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    // Check Notification status
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    setIsStandalone(isAppInstalled());

    const handleInstalled = () => setIsStandalone(true);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      
      if (permission === 'granted' && messaging) {
        const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (currentToken) {
          const tokensRef = collection(db, 'fcmTokens');
          const q = query(tokensRef, where("token", "==", currentToken));
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            await addDoc(tokensRef, {
              token: currentToken,
              createdAt: new Date().toISOString()
            });
            alert('Notifications enabled successfully!');
          } else {
            alert('Notifications are already active on this device.');
          }
        }
      } else if (permission === 'denied') {
        alert('You have blocked notifications. Please unblock them from your browser site settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Could not enable notifications. Check your browser settings.');
    }
  };

  const handleInstallApp = async () => {
    const res = await promptPWAInstall();
    if (res.status === 'accepted' || res.status === 'already-installed') {
      setIsStandalone(true);
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg pt-3 sm:pt-6 pb-12 px-4 transition-colors">
      <SEO title="Settings | Village Sareri" noindex={true} />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-saffron text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <FiSettings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your application preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Profile Section Link */}
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-saffron rounded-xl">
                <FiUser className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Manage your personal account, verification, and logout options.
                </p>
                <Link 
                  to="/profile"
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-saffron dark:hover:border-saffron transition-all group"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-saffron transition-colors">Open Profile Settings</span>
                  <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-saffron transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Language Preference Section */}
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                <FiGlobe className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Language / भाषा</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Select your preferred language for the application interface.
                </p>
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Language</span>
                  </div>
                  <LanguageToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Theme Preference Section */}
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
                {darkMode ? <FiMoon className="w-6 h-6" /> : <FiSun className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Theme / थीम</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Switch between Light and Dark mode.
                </p>
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Theme</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {darkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white transition-colors"
                  >
                    {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                <FiBell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Push Notifications</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Receive important alerts, event updates, and village news directly on your device.
                </p>
                
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Status</span>
                    <span className={`text-sm font-bold ${notificationStatus === 'granted' ? 'text-green-600' : notificationStatus === 'denied' ? 'text-red-500' : 'text-orange-500'}`}>
                      {notificationStatus === 'granted' ? 'Enabled' : notificationStatus === 'denied' ? 'Blocked' : 'Not Configured'}
                    </span>
                  </div>
                  
                  {notificationStatus !== 'granted' ? (
                    <button 
                      onClick={handleEnableNotifications}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-md transition-colors"
                    >
                      Enable
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                      <FiCheckCircle className="w-4 h-4" /> Active
                    </div>
                  )}
                </div>
                {notificationStatus === 'denied' && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <FiInfo className="w-4 h-4" /> Please enable notifications from your browser's site settings (usually the lock icon in the address bar).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* App Installation Section - Only visible in Web browser mode */}
          {!isStandalone && !isAppInstalled() && (
            <div className="pwa-install-btn bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl">
                  <FiDownload className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Install Mobile App</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Install the Sareri app on your phone for a faster, full-screen experience without opening the browser.
                  </p>
                  
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">App Status</span>
                      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                        Browser Mode
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleInstallApp}
                      className="flex items-center gap-2 px-4 py-2 bg-saffron hover:bg-orange-600 text-white text-sm font-bold rounded-lg shadow-md transition-colors"
                    >
                      <FiDownload className="w-4 h-4" /> Install App
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <InstallGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
      />
    </div>
  );
};

export default SettingsPage;
