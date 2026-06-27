import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const KhelBanner = () => {
  return (
    <section className="py-12 bg-white dark:bg-darkCard relative overflow-hidden notranslate">
      <div className="container mx-auto px-4 md:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Background Image / Gradient */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/photos/khel_bg.png)' }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 via-black/70 to-orange-900/80" />

          {/* Content */}
          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left max-w-2xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-saffron mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] py-2 leading-normal" style={{ fontFamily: '"Yatra One", cursive' }}>
                सरेरी श्याम खेल महोत्सव 2026
              </h2>
              <p className="text-lg md:text-xl text-gray-200 font-medium leading-relaxed">
                सरेरी के सबसे बड़े खेल महा उत्सव में अपनी टीम के साथ भाग लें। टूर्नामेंट के लिए रजिस्ट्रेशन शुरू हो चुके हैं!
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <Link 
                to="/khel-registration"
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-saffron hover:from-orange-500 hover:to-orange-400 text-white font-bold text-lg py-4 px-8 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all transform hover:scale-105"
              >
                <span>Register Now / रजिस्टर करें</span>
                <FiArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KhelBanner;
