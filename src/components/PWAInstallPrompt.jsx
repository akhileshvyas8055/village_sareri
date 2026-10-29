import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import { isAppInstalled, promptPWAInstall } from '../utils/pwa';
import InstallGuideModal from './InstallGuideModal';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // If already installed or running in standalone PWA, never show prompt
    if (isAppInstalled()) return;

    // Check if dismissed recently (within 12 hours)
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (lastDismissed && Date.now() - parseInt(lastDismissed, 10) < 12 * 60 * 60 * 1000) {
      setDismissed(true);
      return;
    }

    // Trigger after a reasonable delay (4 seconds) so initial page loads smoothly
    const timer = setTimeout(() => {
      if (!isAppInstalled()) {
        setShowPrompt(true);
      }
    }, 4000);

    const handlePromptReady = () => {
      if (!isAppInstalled() && !dismissed) {
        setShowPrompt(true);
      }
    };

    const handleInstalled = () => {
      setShowPrompt(false);
      setShowGuide(false);
    };

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, [dismissed]);

  const handleInstallClick = async () => {
    const result = await promptPWAInstall();
    if (result.status === 'accepted' || result.status === 'already-installed') {
      setShowPrompt(false);
    } else {
      // Automatic prompt didn't fire (iOS Safari or browser menu required) -> show clear guide
      setShowGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  return (
    <>
      {showPrompt && !dismissed && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-[70] animate-in slide-in-from-bottom duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-orange-500/25 overflow-hidden">
            {/* Saffron accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-saffron via-orange-500 to-[#1A5C2A]"></div>
            
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
                  <img 
                    src="/photos/About.jpeg" 
                    alt="Sareri" 
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                    Sareri App Install करें!
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-snug">
                    Home Screen पर Add करें — बिना browser खोले, fast और direct app अनुभव!
                  </p>
                </div>
                <button 
                  onClick={handleDismiss}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0"
                  title="बंद करें"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex gap-2.5 mt-3.5">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2 px-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  बाद में
                </button>
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <FiDownload className="w-4 h-4 animate-bounce" /> Install करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Step-by-Step Guide Modal */}
      <InstallGuideModal 
        isOpen={showGuide} 
        onClose={() => setShowGuide(false)} 
      />
    </>
  );
};

export default PWAInstallPrompt;
