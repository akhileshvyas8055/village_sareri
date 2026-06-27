import Hero from '../sections/Hero';
import KhelBanner from '../sections/KhelBanner';
import Highlights from '../sections/Highlights';
import WeatherCard from '../components/WeatherCard';
import PollWidget from '../components/PollWidget';
import VirtualTourBanner from '../components/VirtualTourBanner';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <div className="flex flex-col">
      <SEO 
        title="Brahmano Ki Sareri — Connecting Village with Future"
        description="Brahmano Ki Sareri, Bhilwara, Rajasthan ki official website. Gaon ki culture, heritage, festivals, Panchayat aur community updates ek jagah."
        url="https://sareri.vercel.app/"
      />
      <Hero />
      
      {/* Weather Card - Sits below Hero on mobile, overlaps on desktop */}
      <div className="relative z-20 mt-6 md:-mt-24 mb-10 md:mb-12 container mx-auto px-4 flex justify-center md:justify-end">
        <WeatherCard />
      </div>

      <KhelBanner />
      <PollWidget />
      <Highlights />
      <VirtualTourBanner />
    </div>
  );
};

export default Home;
