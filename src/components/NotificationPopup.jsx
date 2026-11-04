import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { enableNotificationSubscription } from '../services/pushNotifications';

const NotificationPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if we already asked
    const hasAsked = localStorage.getItem('sareri_notification_asked');
    if (!hasAsked && 'Notification' in window && Notification.permission === 'default') {
      // Small delay before showing so it doesn't interrupt initial page load
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    setShow(false);
    localStorage.setItem('sareri_notification_asked', 'true');

    try {
      const result = await enableNotificationSubscription();
      if (result.status === 'registered') {
        console.info('Village notifications are enabled on this device.');
      } else if (result.status === 'denied') {
        console.info('Notification permission is blocked in this browser.');
      } else {
        console.info('Notifications are unavailable in this browser or device context.');
      }
    } catch (error) {
      console.error('Could not enable notifications.', error);
    }
  };

  const handleNotNow = () => {
    setShow(false);
    localStorage.setItem('sareri_notification_asked', 'true');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:bottom-10 md:right-10 z-[60] w-auto max-w-sm mx-auto md:mx-0"
        >
          <div className="bg-white dark:bg-darkCard rounded-2xl shadow-2xl p-6 border border-saffron/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-saffron to-yellow-500" />
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-saffron shrink-0">
                <FiBell className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">गाँव की हर खबर सबसे पहले!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  गाँव की ज़रूरी सूचनाएं, न्यूज़ और इवेंट्स सीधे अपने फोन पर पाने के लिए नोटिफिकेशन चालू करें।
                </p>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleAllow}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl text-base transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 animate-pulse hover:animate-none"
                  >
                    <FiBell className="w-5 h-5" />
                    चालू करें (Allow)
                  </button>
                  <button 
                    onClick={handleNotNow}
                    className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium py-2 rounded-xl text-xs transition-colors"
                  >
                    बाद में (Not Now)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopup;
