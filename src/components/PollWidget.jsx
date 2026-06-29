import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShare2, FiCheckCircle } from 'react-icons/fi';
import { ref, onValue, set } from 'firebase/database';
import { rtdb } from '../firebase';

const PollWidget = () => {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const pollRef = ref(rtdb, 'adminData/poll');
    const unsub = onValue(pollRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.isActive) {
        setPoll(data);
        // Check if user has already voted for THIS specific poll
        const voted = localStorage.getItem(`hasVoted_${data.id}`);
        if (voted) {
          setHasVoted(true);
        } else {
          setHasVoted(false);
        }
      } else {
        setPoll(null);
      }
    });
    return () => unsub();
  }, []);

  // Scroll to poll if URL contains #poll hash
  useEffect(() => {
    if (poll && window.location.hash === '#poll') {
      setTimeout(() => {
        const element = document.getElementById('poll');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [poll]);

  const handleVote = async () => {
    if (selectedOption === null || hasVoted || isSubmitting || !poll) return;
    
    setIsSubmitting(true);
    const optionRef = ref(rtdb, `adminData/poll/options/${selectedOption}/votes`);
    
    try {
      const currentVotes = poll.options[selectedOption].votes || 0;
      set(optionRef, currentVotes + 1).catch(e => console.error("Vote failed:", e));
      
      localStorage.setItem(`hasVoted_${poll.id}`, 'true');
      setHasVoted(true);
    } catch (error) {
      console.error('Error recording vote:', error);
      alert('Failed to record vote. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleShare = async () => {
    if (!poll) return;
    
    const shareText = `💬 Village Poll: ${poll.question}\n\nVote now at: ${window.location.origin}/#poll`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Village Poll',
          text: shareText,
          url: window.location.origin + '/#poll'
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Poll link copied to clipboard! You can paste and share it on WhatsApp.');
    }
  };

  if (!poll) return null;

  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

  return (
    <section id="poll" className="py-12 bg-white dark:bg-darkCard transition-colors notranslate">
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden"
        >
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-saffron/10 rounded-bl-full pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <span className="inline-block px-3 py-1 bg-saffron/10 text-saffron text-xs font-bold uppercase rounded-full tracking-wider mb-3">
                Live Poll / लाइव पोल
              </span>
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-white leading-tight">
                {poll.question}
              </h2>
            </div>
            <button 
              onClick={handleShare}
              className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full transition-colors flex-shrink-0"
              title="Share Poll"
            >
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            {!hasVoted ? (
              // Voting View
              <>
                {poll.options.map((opt, index) => (
                  <label 
                    key={index} 
                    className={`block w-full p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedOption === index 
                        ? 'border-saffron bg-orange-50 dark:bg-orange-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-saffron/50 bg-white dark:bg-darkCard'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === index ? 'border-saffron' : 'border-gray-400'
                      }`}>
                        {selectedOption === index && <div className="w-2.5 h-2.5 rounded-full bg-saffron" />}
                      </div>
                      <span className={`font-medium ${selectedOption === index ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        {opt.text}
                      </span>
                    </div>
                    <input 
                      type="radio" 
                      name="poll_option" 
                      className="hidden" 
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                    />
                  </label>
                ))}
                
                <button 
                  onClick={handleVote}
                  disabled={selectedOption === null || isSubmitting}
                  className="w-full mt-6 py-4 bg-saffron hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Vote / वोट करें'}
                </button>
              </>
            ) : (
              // Results View
              <div className="space-y-5 mt-2">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold mb-4">
                  <FiCheckCircle className="w-5 h-5" />
                  <span>Your vote has been recorded! / आपका वोट दर्ज हो गया है!</span>
                </div>
                
                {poll.options.map((opt, index) => {
                  const percentage = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                  return (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{opt.text}</span>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{percentage}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-saffron rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                  Total Votes: {totalVotes}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PollWidget;
