import { Link } from 'react-router-dom';
import { LuArrowDown, LuBell, LuBuilding2 } from 'react-icons/lu';

const Hero = () => {
  const scrollToServices = () => {
    const el = document.getElementById('services');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative w-full min-h-[70vh] md:min-h-[78vh] flex flex-col justify-center pb-20 pt-28 md:pt-36 overflow-hidden">
      
      {/* Video Background with Professional Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover"
        >
          <source src="/video/bgvideo.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-900/50 to-slate-950/85 backdrop-blur-[1px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col items-center justify-center text-center notranslate" translate="no">
        {/* Main Majestic Title */}
        <div className="max-w-4xl mx-auto mb-8">
          <span className="block text-lg sm:text-2xl md:text-3xl text-sky-200 font-medium mb-2 drop-shadow-md">
            Welcome to
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-heading text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            Village Sareri
          </h1>
        </div>

        {/* Clean Direct Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto px-2 sm:px-0">
          <button
            type="button"
            onClick={scrollToServices}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#0D477A] to-[#09355C] hover:from-[#09355C] hover:to-[#062440] text-white font-bold border border-blue-400/40 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 min-h-[50px]"
          >
            <LuBuilding2 className="w-5 h-5 text-sky-300 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight text-center sm:text-left">
              <span className="text-sm sm:text-base">नागरिक सेवाएँ देखें</span>
              <span className="text-xs sm:text-sm font-normal text-sky-200">(Explore Services)</span>
            </div>
            <LuArrowDown className="w-4 h-4 text-sky-300 animate-bounce shrink-0 ml-0.5" />
          </button>

          <Link
            to="/notices"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 sm:py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold border border-white/30 backdrop-blur-md shadow-lg transition-all duration-300 min-h-[50px]"
          >
            <LuBell className="w-4 h-4 text-[#FF9933] shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight text-center sm:text-left">
              <span className="text-sm sm:text-base">डिजिटल सूचना पट्ट</span>
              <span className="text-xs sm:text-sm font-normal text-white/80">(Notice Board)</span>
            </div>
          </Link>
        </div>

      </div>
      
      {/* Seamless Transition to White Theme */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[1px]">
        <svg 
          className="relative block w-full h-[45px] sm:h-[60px] md:h-[80px]" 
          viewBox="0 0 1440 320" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="none"
        >
          <path 
            className="fill-white dark:fill-[#0B1120]" 
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,240C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
