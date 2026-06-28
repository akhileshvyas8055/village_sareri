import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiUpload, FiMic, FiCalendar, FiCheckCircle, FiClock, FiSearch, FiFileText, FiUser } from 'react-icons/fi';
import { ref, push, set, get, query, orderByChild, equalTo } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { rtdb, auth } from '../firebase';

const ComplaintForm = () => {
  const [activeTab, setActiveTab] = useState('register'); // 'register' or 'track'
  
  const [complaint, setComplaint] = useState({ name: '', contact: '', details: '', photo: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [successTrackingId, setSuccessTrackingId] = useState('');

  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !complaint.name) {
        setComplaint(prev => ({ 
          ...prev, 
          name: currentUser.displayName || prev.name
        }));
      }
    });
    return () => unsub();
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice recognition. Please type your complaint.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setComplaint(prev => ({ 
        ...prev, 
        details: prev.details ? prev.details + ' ' + transcript : transcript 
      }));
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      alert('Could not hear properly. Please try again.');
      setIsListening(false);
    };
    
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setComplaint({ ...complaint, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessTrackingId('');
    try {
      const trackingId = 'CMP-' + Math.floor(100000 + Math.random() * 900000);
      const newComplaint = {
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        status: 'Pending',
        trackingId,
        ...complaint
      };
      
      const complaintsRef = ref(rtdb, 'adminData/complaints');
      const newComplaintRef = push(complaintsRef);
      await set(newComplaintRef, { id: newComplaintRef.key, ...newComplaint });
      
      setSuccessTrackingId(trackingId);
      setComplaint({ name: '', contact: '', details: '', photo: null });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackIdInput.trim()) return;
    
    setIsTracking(true);
    setTrackError('');
    setTrackedComplaint(null);
    
    try {
      const searchId = trackIdInput.trim().toUpperCase();
      const complaintsRef = ref(rtdb, 'adminData/complaints');
      const snapshot = await get(complaintsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const complaintsArray = Object.values(data);
        const complaintData = complaintsArray.find(c => c.trackingId === searchId);
        
        if (complaintData) {
          setTrackedComplaint(complaintData);
        } else {
          setTrackError('No complaint found with this Tracking ID. Please check and try again.');
        }
      } else {
        setTrackError('No complaints found in the system.');
      }
    } catch (error) {
      console.error('Error tracking complaint:', error);
      setTrackError('Something went wrong. Please try again.');
    }
    setIsTracking(false);
  };

  return (
    <section className="py-24 bg-white dark:bg-darkCard transition-colors min-h-screen">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        <div className="mb-10 text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4"
          >
            Panchayat <span className="text-red-600">Complaint Portal</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-1 bg-red-600 rounded-full mx-auto md:mx-0"
          />
          <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
            Submit any issues or suggestions directly to the village administration, and track their status in real-time.<br />
            अपनी समस्या या सुझाव सीधे ग्राम पंचायत तक पहुंचाएं, और उसका स्टेटस चेक करें।
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-4 mb-8 justify-center md:justify-start">
          <button 
            onClick={() => setActiveTab('register')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'register' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <FiFileText className="inline-block mr-2" /> Register Complaint
          </button>
          <button 
            onClick={() => setActiveTab('track')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'track' 
                ? 'bg-saffron text-white shadow-lg shadow-saffron/30' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <FiSearch className="inline-block mr-2" /> Track Status
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-darkCard p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800"
            >
              {successTrackingId ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiCheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complaint Registered!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Your complaint has been successfully submitted to the Panchayat.</p>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 rounded-2xl max-w-sm mx-auto mb-8">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Your Tracking ID</p>
                    <p className="text-3xl font-bold text-saffron tracking-wider">{successTrackingId}</p>
                    <p className="text-xs text-red-500 mt-3 font-medium">⚠️ Please save this ID to track your complaint status.</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSuccessTrackingId('');
                      setActiveTab('track');
                      setTrackIdInput(successTrackingId);
                    }}
                    className="bg-saffron hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                  >
                    Track Status Now
                  </button>
                </div>
              ) : !user ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiUser className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Profile Required</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    To prevent spam and ensure genuine complaints, please create or log into your verified village profile.
                  </p>
                  <Link 
                    to="/profile"
                    className="bg-saffron text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-orange-600 flex items-center justify-center gap-2 mx-auto transition-all w-full max-w-xs"
                  >
                    Go to Profile Page
                  </Link>
                </div>
              ) : (
            <form onSubmit={submitComplaint} className="space-y-5">
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 mb-2">
                <div className="flex items-center gap-3">
                  <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="Profile" className="w-10 h-10 rounded-full border border-gray-300" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button type="button" onClick={() => signOut(auth)} className="text-sm text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors">
                  Logout
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name / पूरा नाम</label>
                <input 
                  type="text" 
                  required
                  value={complaint.name}
                  onChange={(e) => setComplaint({...complaint, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-saffron transition-all text-gray-900 dark:text-white"
                  placeholder="Enter your name / अपना नाम लिखें"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number / मोबाइल नंबर</label>
                <input 
                  type="tel" 
                  required
                  value={complaint.contact}
                  onChange={(e) => setComplaint({...complaint, contact: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-saffron transition-all text-gray-900 dark:text-white"
                  placeholder="Enter your mobile number / अपना मोबाइल नंबर लिखें"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complaint Details / शिकायत का विवरण</label>
                  <button 
                    type="button" 
                    onClick={startListening}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all border ${
                      isListening 
                        ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 animate-pulse' 
                        : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800/50'
                    }`}
                  >
                    <FiMic className={`text-sm ${isListening ? "text-red-600" : ""}`} />
                    {isListening ? 'Listening...' : 'बोलकर लिखें'}
                  </button>
                </div>
                <textarea 
                  required
                  rows="4"
                  value={complaint.details}
                  onChange={(e) => setComplaint({...complaint, details: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-saffron transition-all text-gray-900 dark:text-white"
                  placeholder="Describe your issue or suggestion... / अपनी समस्या या सुझाव यहाँ लिखें..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attach Evidence (Optional) / फोटो जोड़ें (वैकल्पिक)</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl cursor-pointer transition-colors border border-dashed border-gray-300 dark:border-gray-600">
                    <FiCamera className="text-gray-500 dark:text-gray-400 text-lg" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click Photo / फोटो खींचें</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <label className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl cursor-pointer transition-colors border border-dashed border-gray-300 dark:border-gray-600">
                    <FiUpload className="text-gray-500 dark:text-gray-400 text-lg" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Photo / अपलोड करें</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {complaint.photo && (
                  <div className="mt-3">
                    <img src={complaint.photo} alt="Preview" className="h-24 rounded-lg object-cover border border-gray-200" />
                  </div>
                )}
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-saffron hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl mt-4 tracking-wide uppercase"
              >
                {isSubmitting ? 'Submitting... / भेजा जा रहा है...' : 'Submit Complaint / शिकायत दर्ज करें'}
              </button>
            </form>
              )}
            </motion.div>
          )}

          {activeTab === 'track' && (
            <motion.div
              key="track"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-darkCard p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="max-w-xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Track Your Complaint</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">Enter the Tracking ID provided to you when you registered the complaint.</p>
                
                <form onSubmit={handleTrack} className="mb-10">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={trackIdInput}
                      onChange={(e) => setTrackIdInput(e.target.value.toUpperCase())}
                      placeholder="e.g. CMP-123456"
                      className="flex-1 px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-saffron text-lg font-bold tracking-widest text-center sm:text-left text-gray-900 dark:text-white uppercase"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={isTracking}
                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-saffron dark:hover:bg-saffron px-8 py-4 rounded-xl font-bold transition-colors disabled:opacity-70 whitespace-nowrap"
                    >
                      {isTracking ? 'Searching...' : 'Track Status'}
                    </button>
                  </div>
                  {trackError && <p className="text-red-500 text-sm mt-3 text-center sm:text-left font-medium">{trackError}</p>}
                </form>

                {trackedComplaint && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                      trackedComplaint.status === 'Resolved' ? 'bg-green-500' : 
                      trackedComplaint.status === 'Rejected' ? 'bg-red-500' :
                      trackedComplaint.status === 'In Progress' ? 'bg-blue-500' : 'bg-orange-500'
                    }`} />
                    
                    <div className="pl-4">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tracking ID</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{trackedComplaint.trackingId}</p>
                        </div>
                        <span className={`px-4 py-1.5 text-sm font-bold uppercase rounded-full flex items-center gap-1.5 ${
                          trackedComplaint.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          trackedComplaint.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          trackedComplaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {trackedComplaint.status === 'Resolved' ? <FiCheckCircle /> : <FiClock />}
                          {trackedComplaint.status || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date Submitted</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{trackedComplaint.date}</p>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Complaint Details</p>
                        <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">{trackedComplaint.details}</p>
                      </div>
                      
                      {trackedComplaint.adminReply && (
                        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-2">Reply from Panchayat:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{trackedComplaint.adminReply}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};

export default ComplaintForm;
