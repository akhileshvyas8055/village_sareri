import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently (24 hours)
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (lastDismissed && Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000) {
      setDismissed(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait for notification and language popups to be handled before showing PWA prompt
      if (!dismissed) {
        const checkInterval = setInterval(() => {
          const notifAsked = localStorage.getItem('sareri_notification_asked');
          const langSeen = localStorage.getItem('sareri_language_prompt_seen');
          
          if ((!notifAsked && 'Notification' in window && Notification.permission === 'default') || !langSeen) {
            return; // Keep waiting for previous popups
          }
          
          setShowPrompt(true);
          clearInterval(checkInterval);
        }, 1000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-[90] animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Saffron accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-saffron via-orange-500 to-[#1A5C2A]"></div>
        
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-saffron to-orange-600 flex items-center justify-center shadow-lg shrink-0">
              <img 
                src="/photos/About.jpeg" 
                alt="Sareri" 
                className="w-12 h-12 rounded-xl object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-base">Sareri App Install करें!</h3>
              <p className="text-sm text-gray-500 mt-1 leading-snug">
                Home Screen पर Add करो — बिना browser खोले, direct app जैसा अनुभव!
              </p>
            </div>
            <button 
              onClick={handleDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              बाद में
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-saffron to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all flex items-center justify-center gap-2"
            >
              <FiDownload className="w-4 h-4" /> Install करें
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
