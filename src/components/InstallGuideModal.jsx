import React, { useState } from 'react';
import { FiDownload, FiX, FiShare, FiPlusSquare, FiMoreVertical, FiSmartphone, FiCheckCircle } from 'react-icons/fi';
import { getDevicePlatform, isAppInstalled, promptPWAInstall } from '../utils/pwa';

const InstallGuideModal = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState(() => {
    const detected = getDevicePlatform();
    return detected === 'ios' ? 'ios' : 'android';
  });
  const [installed, setInstalled] = useState(isAppInstalled);

  if (!isOpen) return null;

  const handleDirectInstall = async () => {
    const res = await promptPWAInstall();
    if (res.status === 'accepted' || res.status === 'already-installed') {
      setInstalled(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const hasNativePrompt = typeof window !== 'undefined' && Boolean(window.deferredPWAInstallPrompt);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-orange-500/20 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Saffron gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-saffron via-orange-500 to-emerald-600"></div>

        {/* Header */}
        <div className="p-5 pb-3 flex items-start justify-between border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron to-orange-600 p-0.5 shadow-md shadow-orange-500/20 flex-shrink-0 flex items-center justify-center">
              <img 
                src="/photos/About.jpeg" 
                alt="Sareri Logo" 
                className="w-full h-full rounded-2xl object-cover" 
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                ऐप इंस्टॉल करें
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-saffron dark:bg-orange-950/50">
                  Sareri App
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Home Screen पर Add करें और बिना browser खोले चलाएं
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="px-5 pt-4">
          <div className="flex rounded-xl bg-gray-100 dark:bg-slate-800/80 p-1">
            <button
              onClick={() => setPlatform('android')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                platform === 'android'
                  ? 'bg-white dark:bg-slate-700 text-saffron shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <FiSmartphone className="w-4 h-4" />
              Android (Chrome)
            </button>
            <button
              onClick={() => setPlatform('ios')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                platform === 'ios'
                  ? 'bg-white dark:bg-slate-700 text-saffron shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <FiSmartphone className="w-4 h-4" />
              iPhone / iPad (Safari)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {installed ? (
            <div className="py-6 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">ऐप पहले से इंस्टॉल है!</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Sareri ऐप आपकी होम स्क्रीन पर उपलब्ध है।
              </p>
            </div>
          ) : platform === 'android' ? (
            <div>
              {hasNativePrompt && (
                <button
                  onClick={handleDirectInstall}
                  className="w-full mb-4 py-3 px-4 rounded-xl bg-gradient-to-r from-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <FiDownload className="w-5 h-5 animate-bounce" />
                  1-Click Direct Install (यहाँ टैप करें)
                </button>
              )}

              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                {hasNativePrompt ? 'या ब्राउज़र मेनू से 3 आसान स्टेप्स में इंस्टॉल करें:' : 'Chrome ब्राउज़र में 3 आसान स्टेप्स में इंस्टॉल करें:'}
              </p>

              <ol className="space-y-3">
                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-saffron font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    ऊपर दाएँ कोने में <strong>तीन बिंदु <FiMoreVertical className="inline w-3.5 h-3.5" /> (Menu)</strong> पर टैप करें।
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-saffron font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    मेनू में <strong>"Install app"</strong> या <strong>"Add to Home screen"</strong> (होम स्क्रीन में जोड़ें) चुनें।
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 text-saffron font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>"Install"</strong> या <strong>"Add"</strong> पर क्लिक करें। ऐप तुरंत आपके फोन में सेव हो जाएगी!
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Safari ब्राउज़र में 3 आसान स्टेप्स में इंस्टॉल करें:
              </p>

              <ol className="space-y-3">
                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    नीचे Safari टूलबार में <strong>Share बटन <FiShare className="inline w-3.5 h-3.5" /></strong> पर टैप करें।
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    नीचे स्क्रॉल करें और <strong>"Add to Home Screen" <FiPlusSquare className="inline w-3.5 h-3.5" /></strong> पर टैप करें।
                  </div>
                </li>

                <li className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    ऊपर दाएँ कोने में <strong>"Add"</strong> दबाएं। ऐप आपकी होम स्क्रीन पर आ जाएगी!
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white font-semibold text-xs hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            समझ गया (Understood)
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuideModal;
