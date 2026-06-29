import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const CountdownWidget = () => {
  const [countdownData, setCountdownData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const countdownRef = ref(rtdb, 'adminData/countdown');
    const unsub = onValue(countdownRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.isActive && data.targetDate) {
        setCountdownData(data);
      } else {
        setCountdownData(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!countdownData || !countdownData.targetDate) return;

    const timer = setInterval(() => {
      const targetTime = new Date(countdownData.targetDate).getTime();
      const currentTime = new Date().getTime();
      const difference = targetTime - currentTime;

      if (difference <= 0) {
        clearInterval(timer);
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsExpired(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownData]);

  if (!countdownData) return null;

  return (
    <section className="py-6 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto max-w-4xl bg-gradient-to-r from-orange-500 via-saffron to-red-500 rounded-3xl p-6 md:p-10 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-300/20 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold font-heading text-white mb-8 drop-shadow-md">
            {countdownData.title}
          </h2>

          {!isExpired && (
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Seconds', value: timeLeft.seconds }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/20 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] mb-2">
                    <span className="text-2xl md:text-4xl font-bold text-white font-mono">
                      {item.value.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm text-white/90 font-bold uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default CountdownWidget;
