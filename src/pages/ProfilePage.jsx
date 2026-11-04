import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiShield, FiLogOut, FiHome, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      alert('Login Failed: ' + error.message);
    }
  };

  return (
    <div className="pt-3 sm:pt-6 pb-12 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <SEO title="My Profile | Village Sareri" noindex={true} />
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 md:p-12 text-center transition-colors"
        >
          {user ? (
            <div>
              <div className="relative inline-block mb-6">
                <img 
                  src={user.photoURL || 'https://via.placeholder.com/100'} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-saffron object-cover shadow-xl mx-auto"
                />
                <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" title="Verified Account"></div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.displayName}</h2>
              <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-8">
                <FiMail />
                <span>{user.email}</span>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 mb-8 text-left border border-orange-100 dark:border-orange-800/30">
                <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
                  <FiShield className="text-saffron" /> Account Status: Verified
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  You are a verified user. You can now use all features of the website, including registering complaints directly with the Panchayat.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Link 
                  to="/settings"
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Back to Settings
                </Link>
                <Link 
                  to="/complaint"
                  className="flex-1 flex items-center justify-center gap-2 bg-saffron text-white font-bold py-3 px-4 rounded-xl hover:bg-orange-600 transition-colors"
                >
                  <FiFileText /> Complaint
                </Link>
              </div>

              <button 
                onClick={() => signOut(auth)}
                className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 w-full py-4 rounded-xl font-bold transition-colors"
              >
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="py-8">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUser className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to Sareri</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Please create your profile by signing in with your Google account. This verifies your identity and helps us maintain a secure community.
              </p>
              <button 
                onClick={handleLogin}
                className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-4 px-8 rounded-xl shadow-sm hover:border-saffron hover:text-saffron flex items-center justify-center gap-3 mx-auto transition-all w-full sm:w-auto"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                Continue with Google
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
