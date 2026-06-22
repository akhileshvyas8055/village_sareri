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
              
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Village Alerts</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Stay updated with village news, events, announcements and important alerts. Allow notifications?
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleAllow}
                    className="flex-1 bg-saffron hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors shadow-md shadow-saffron/30"
                  >
                    Allow
                  </button>
                  <button 
                    onClick={handleNotNow}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
                  >
                    Not Now
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
