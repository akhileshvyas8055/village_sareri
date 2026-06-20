import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { globalAudio } from '../components/FloatingAudioButton';

const Hero = () => {
  const playAudio = () => {
    globalAudio.currentTime = 0;
    globalAudio.play().catch((err) => console.log('Audio playback failed:', err));
  };

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-earthyDark">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105 filter blur-[2px] brightness-110 contrast-125"
      >
        <source src="/video/bgvideo.mp4" type="video/mp4" />
        {/* Fallback gradient if video is missing */}
      </video>

      {/* Cinematic Vignette Overlay & Blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-earthyDark/90" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading text-white mb-6 drop-shadow-2xl"
        >
          Welcome to <br className="md:hidden" />
          <span className="text-saffron">Village Sareri</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-3xl text-gray-200 mb-10 drop-shadow-md font-medium"
        >
          Bhilwara, Rajasthan
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/about" className="btn-primary" onClick={playAudio}>
            Discover Our Village
          </Link>
        </motion.div>
      </div>

      {/* Animated Down Arrow */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-white/70 text-sm tracking-widest uppercase mb-3 font-medium">Scroll</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1"
        >
          <motion.div className="w-1.5 h-2 bg-saffron rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
