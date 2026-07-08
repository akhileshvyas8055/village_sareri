import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiUpload, FiMic, FiCalendar, FiCheckCircle, FiClock, FiSearch, FiFileText, FiUser, FiXCircle } from 'react-icons/fi';
import { ref, push, set, get, query, orderByChild, equalTo, update } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { rtdb, auth } from '../firebase';

const ComplaintForm = () => {
  const [activeTab, setActiveTab] = useState('register'); // 'register' or 'history'
  
  const [complaint, setComplaint] = useState({ name: '', contact: '', details: '', photo: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [successTrackingId, setSuccessTrackingId] = useState('');

  const [userComplaints, setUserComplaints] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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

  const fetchUserComplaints = async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const complaintsRef = ref(rtdb, 'adminData/complaints');
      const snapshot = await get(complaintsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const complaintsArray = Object.keys(data).map(key => ({
          firebaseId: key,
          ...data[key]
        })).filter(c => c.userId === user.uid);
        setUserComplaints(complaintsArray.reverse());
      } else {
        setUserComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchUserComplaints();
    }
  }, [activeTab, user]);

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
    if (!file) return;

    // Compress image to make submission faster and avoid white page/crash
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.6 quality for very fast upload
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setComplaint({ ...complaint, photo: compressedBase64 });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
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
        userId: user?.uid || null,
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

  const handleCancelComplaint = async (firebaseId) => {
    if (!window.confirm('Are you sure you want to cancel this complaint?')) return;
    
    try {
      const complaintRef = ref(rtdb, `adminData/complaints/${firebaseId}`);
      await update(complaintRef, { status: 'Cancelled' });
      // Update local state
      setUserComplaints(prev => prev.map(c => 
        c.firebaseId === firebaseId ? { ...c, status: 'Cancelled' } : c
      ));
    } catch (error) {
      console.error('Error cancelling complaint:', error);
      alert('Failed to cancel complaint. Please try again.');
    }
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
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'history' 
                ? 'bg-saffron text-white shadow-lg shadow-saffron/30' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <FiSearch className="inline-block mr-2" /> My Complaints
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
                      setActiveTab('history');
                    }}
                    className="bg-saffron hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors"
                  >
                    View My Complaints
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
                    Complete Your Profile
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

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-darkCard p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">My Complaints History</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">View and manage all your registered complaints.</p>
                
                {!user ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FiUser className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Login Required</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      Please login to view your complaints history.
                    </p>
                  </div>
                ) : isLoadingHistory ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron"></div>
                  </div>
                ) : userComplaints.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                    <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Complaints Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">You haven't registered any complaints yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userComplaints.map(complaint => (
                      <motion.div 
                        key={complaint.firebaseId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 relative overflow-hidden group transition-all hover:shadow-md"
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                          complaint.status === 'Resolved' ? 'bg-green-500' : 
                          complaint.status === 'Rejected' ? 'bg-red-500' :
                          complaint.status === 'Cancelled' ? 'bg-gray-400' :
                          complaint.status === 'In Progress' ? 'bg-blue-500' : 'bg-orange-500'
                        }`} />
                        
                        <div className="pl-4">
                          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tracking ID</p>
                              <div className="flex items-center gap-3">
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{complaint.trackingId}</p>
                                <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded font-medium">{complaint.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-4 py-1.5 text-sm font-bold uppercase rounded-full flex items-center gap-1.5 ${
                                complaint.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                complaint.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                complaint.status === 'Cancelled' ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                                complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              }`}>
                                {complaint.status === 'Resolved' ? <FiCheckCircle /> : 
                                 complaint.status === 'Cancelled' ? <FiXCircle /> : <FiClock />}
                                {complaint.status || 'Pending'}
                              </span>
                              {complaint.status === 'Pending' && (
                                <button
                                  onClick={() => handleCancelComplaint(complaint.firebaseId)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors tooltip"
                                  title="Cancel Complaint"
                                >
                                  <FiXCircle className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Complaint Details</p>
                            <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">{complaint.details}</p>
                          </div>
                          
                          {complaint.adminReply && (
                            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-l-4 border-indigo-500 shadow-sm">
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">Reply from Panchayat:</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{complaint.adminReply}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
