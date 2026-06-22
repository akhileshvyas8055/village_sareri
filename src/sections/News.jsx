import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiBell, FiInstagram, FiVideo, FiCamera, FiUpload } from 'react-icons/fi';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const News = () => {
  const [currentInstaIndex, setCurrentInstaIndex] = useState(0);

  const [newsUpdates, setNewsUpdates] = useState([]);

  // Complaint Form State
  const [complaint, setComplaint] = useState({ name: '', contact: '', details: '', photo: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Fetch existing complaints from Firestore
      const snap = await getDoc(doc(db, 'adminData', 'complaints'));
      const existing = snap.exists() ? (snap.data().items || []) : [];
      const newComplaint = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        ...complaint
      };
      await setDoc(doc(db, 'adminData', 'complaints'), { items: [newComplaint, ...existing] });
      
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
    const unsub = onSnapshot(doc(db, 'adminData', 'news'), (snap) => {
      if (snap.exists()) {
        setNewsUpdates(snap.data().items || []);
      }
    });
    return () => unsub();
  }, []);



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

          {/* Register Complaint */}
          <div>
            <div className="mb-10">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4"
              >
                Register <span className="text-red-600">Complaint</span>
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-16 h-1 bg-red-600 rounded-full"
              />
              <p className="text-gray-600 dark:text-gray-400 mt-4">
                Submit any issues, suggestions or complaints directly to the village administration.
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={complaint.name}
                    onChange={(e) => setComplaint({...complaint, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-saffron transition-all text-gray-900 dark:text-white"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    value={complaint.contact}
                    onChange={(e) => setComplaint({...complaint, contact: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-saffron transition-all text-gray-900 dark:text-white"
                    placeholder="Enter your mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complaint Details</label>
                  <textarea 
                    required
                    rows="4"
                    value={complaint.details}
                    onChange={(e) => setComplaint({...complaint, details: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-saffron transition-all text-gray-900 dark:text-white"
                    placeholder="Describe your issue or suggestion..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attach Evidence (Optional)</label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl cursor-pointer transition-colors border border-dashed border-gray-300 dark:border-gray-600">
                      <FiCamera className="text-gray-500 dark:text-gray-400 text-lg" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click Photo</span>
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
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Photo</span>
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
                  className="w-full py-4 bg-saffron hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl mt-4"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </form>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default News;
