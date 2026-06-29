import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { getToken } from 'firebase/messaging';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { messaging, db } from '../firebase';

// NOTE: To make this fully work in production, you must generate a Web Push Certificate (VAPID key)
// from Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration
const VAPID_KEY = "BGJGryvnAKIvBHBdvq644OaBhX37nZ9JsDboA_6IbJErrYhu3qfLwhAiLWrTTlZz6HEU3TMc6gZ69pIyRiGFoTU"; 

const NotificationPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if we already asked
    const hasAsked = localStorage.getItem('sareri_notification_asked');
    if (!hasAsked && Notification.permission === 'default') {
      // Small delay before showing so it doesn't interrupt initial page load
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    setShow(false);
    localStorage.setItem('sareri_notification_asked', 'true');

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && messaging) {
        // We attempt to get the token. 
        // If VAPID_KEY is not set correctly, this might throw an error.
        try {
          const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (currentToken) {
            // Save token to Firestore if it doesn't already exist
            const tokensRef = collection(db, 'fcmTokens');
            const q = query(tokensRef, where("token", "==", currentToken));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
              await addDoc(tokensRef, {
                token: currentToken,
                createdAt: new Date().toISOString()
              });
              console.log('Successfully subscribed to village notifications!');
            }
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } catch (tokenErr) {
          console.warn('Failed to get FCM token. (You may need to set the VAPID_KEY in code)', tokenErr);
        }
      }
    } catch (error) {
      console.error('An error occurred while requesting permission ', error);
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
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 w-[90%] max-w-sm"
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
