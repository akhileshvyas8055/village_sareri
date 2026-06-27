import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiBell, FiCamera, FiUpload, FiMic, FiClock, FiCheckCircle } from 'react-icons/fi';
import { ref, push, set, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const News = () => {
  const [newsUpdates, setNewsUpdates] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  
  const [myComplaintIds, setMyComplaintIds] = useState(() => {
    const saved = localStorage.getItem('sareri_myComplaints');
    return saved ? JSON.parse(saved) : [];
  });

  // Complaint Form State
  const [complaint, setComplaint] = useState({ name: '', contact: '', details: '', photo: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice recognition. Please type your complaint.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Default to Hindi
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
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
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
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
    try {
      const newComplaint = {
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        status: 'Pending',
        ...complaint
      };
      
      const complaintsRef = ref(rtdb, 'adminData/complaints');
      const newComplaintRef = push(complaintsRef);
      await set(newComplaintRef, { id: newComplaintRef.key, ...newComplaint });
      
      // Save ID to local storage
      const newIds = [newComplaintRef.key, ...myComplaintIds];
      setMyComplaintIds(newIds);
      localStorage.setItem('sareri_myComplaints', JSON.stringify(newIds));
      
      alert("Complaint registered successfully! It will be reviewed by the administration.");
      setComplaint({ name: '', contact: '', details: '', photo: null });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    // Real-time listener for news updates
    const newsRef = ref(rtdb, 'adminData/news');
    const unsubNews = onValue(newsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newsArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setNewsUpdates(newsArray);
      } else {
        setNewsUpdates([]);
      }
    });

    // Real-time listener for complaints (to show status of my complaints)
    const complaintsRef = ref(rtdb, 'adminData/complaints');
    const unsubComplaints = onValue(complaintsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const complaintsArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setAllComplaints(complaintsArray);
      } else {
        setAllComplaints([]);
      }
    });

    return () => {
      unsubNews();
      unsubComplaints();
    };
  }, []);

  const myComplaintsList = allComplaints.filter(c => myComplaintIds.includes(c.id));

  return (
    <section id="news" className="py-24 bg-white dark:bg-darkCard transition-colors">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* News & Updates */}
          <div>
            <div className="mb-10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4"
              >
                News & <span className="text-saffron">Updates</span>
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-16 h-1 bg-saffron rounded-full"
              />
            </div>

            <div className="space-y-6">
              {newsUpdates.length === 0 && (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No news updates available at the moment.</p>
                </div>
              )}
              {newsUpdates.map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 border-l-4 border-l-saffron hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-saffron/10 text-saffron text-xs font-bold uppercase rounded-full tracking-wider flex items-center gap-1">
                      {item.type === 'Notice' && <FiBell />}
                      {item.type === 'Event' && <FiCalendar />}
                      {item.type === 'Announcement' && <FiBell />}
                      {item.type}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.date}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Register Complaint & My Complaints */}
          <div className="space-y-16">
            
            {/* Register Complaint Form */}
            <div>
              <div className="mb-10">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4"
                >
                  Register <span className="text-red-600">Complaint</span> / शिकायत <span className="text-red-600">दर्ज करें</span>
                </motion.h2>
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="w-16 h-1 bg-red-600 rounded-full"
                />
                <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                  Submit any issues, suggestions or complaints directly to the village administration.<br />
                  अपनी समस्या, सुझाव या शिकायत सीधे ग्राम पंचायत तक पहुंचाएं।
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-darkCard p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800"
              >
                <form onSubmit={submitComplaint} className="space-y-5">
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
              </motion.div>
            </div>

            {/* My Complaints Section */}
            {myComplaintsList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-6 border-t-2 border-gray-100 dark:border-gray-800"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold font-heading text-gray-900 dark:text-white mb-2">
                    My <span className="text-blue-600">Complaints</span> / मेरी <span className="text-blue-600">शिकायतें</span>
                  </h2>
                  <div className="w-16 h-1 bg-blue-600 rounded-full" />
                </div>

                <div className="space-y-4">
                  {myComplaintsList.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-darkCard p-5 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                      {/* Status indicator line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.status === 'Resolved' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      
                      <div className="pl-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <FiCalendar className="w-4 h-4" /> {item.date}
                          </span>
                          <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full flex items-center gap-1 ${
                            item.status === 'Resolved' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {item.status === 'Resolved' ? <FiCheckCircle /> : <FiClock />}
                            {item.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 font-medium line-clamp-2 mt-2">{item.details}</p>
                        
                        {item.adminReply && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-blue-500">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">Admin Reply:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{item.adminReply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
};

export default News;
