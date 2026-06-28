import React, { useState, useEffect } from 'react';
import { FiBell, FiDownload, FiSettings, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { getToken } from 'firebase/messaging';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { messaging, db, auth, googleProvider } from '../firebase';
import LanguageToggle from '../components/LanguageToggle';
import { FiGlobe, FiMoon, FiSun } from 'react-icons/fi';

const VAPID_KEY = "BGJGryvnAKIvBHBdvq644OaBhX37nZ9JsDboA_6IbJErrYhu3qfLwhAiLWrTTlZz6HEU3TMc6gZ69pIyRiGFoTU"; 

const SettingsPage = ({ darkMode, toggleDarkMode }) => {
  const [notificationStatus, setNotificationStatus] = useState('default');
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Check Notification status
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    // Check PWA Standalone status
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(isStandaloneMode);

    // Grab deferred prompt from window if it was saved, or listen for it
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e;
    };

    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      unsub();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      alert('Login Failed: ' + error.message);
    }
  };

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
    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (!promptEvent) {
      alert("App is either already installed or your browser doesn't support automatic installation. You can manually install it via your browser's 'Add to Home Screen' option.");
      return;
    }
    
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
      window.deferredPrompt = null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg pt-24 pb-12 px-4 transition-colors">
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
          {/* User Profile Section */}
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">My Profile</h2>
            {user ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={user.photoURL || 'https://via.placeholder.com/60'} alt="Profile" className="w-16 h-16 rounded-full border-2 border-saffron" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.displayName}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full mt-1"><FiCheckCircle /> Verified</span>
                  </div>
                </div>
                <button 
                  onClick={() => signOut(auth)}
                  className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors w-full sm:w-auto"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">You are not logged in.</p>
                  <p className="text-xs text-gray-500">Login to submit genuine complaints and verify your identity.</p>
                </div>
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-bold rounded-xl shadow-sm hover:border-saffron transition-colors w-full sm:w-auto"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
              </div>
            )}
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

          {/* App Installation Section */}
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
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
                    <span className={`text-sm font-bold ${isStandalone ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                      {isStandalone ? 'Installed (Standalone)' : 'Browser Mode'}
                    </span>
                  </div>
                  
                  {!isStandalone ? (
                    <button 
                      onClick={handleInstallApp}
                      className="flex items-center gap-2 px-4 py-2 bg-saffron hover:bg-orange-600 text-white text-sm font-bold rounded-lg shadow-md transition-colors"
                    >
                      <FiDownload className="w-4 h-4" /> Install App
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                      <FiCheckCircle className="w-4 h-4" /> Installed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
