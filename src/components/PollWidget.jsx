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

  const handleWhatsAppShare = () => {
    if (!poll) return;
    const shareText = `📊 *Brahmano Ki Sareri - Live Poll!*\n\n🤔 *Sawal:* ${poll.question}\n\n👇 *Gaon ke vikas me apna yogdan dein aur abhi vote karein:*\nhttps://villagesareri.in/#poll`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleShare = async () => {
    if (!poll) return;
    
    const shareText = `📊 Brahmano Ki Sareri - Live Poll!\n\n${poll.question}\n\nApna vote zaroor dein!`;
    const url = 'https://villagesareri.in/#poll';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Village Sareri Poll',
          text: shareText,
          url: url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${url}`);
      alert('Poll link copied! Paste anywhere to share.');
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
              className="p-2.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-full transition-transform hover:scale-110 shadow-md flex-shrink-0"
              title="Share on Insta/WhatsApp"
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
            
            {/* Highly Visible Share Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 tracking-wide">
                Gaon walo ke sath share karein! 🚀
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-3 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  <FiShare2 className="w-5 h-5" />
                  Insta Story / More
                </button>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PollWidget;
