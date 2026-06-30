import Hero from '../sections/Hero';
import KhelBanner from '../sections/KhelBanner';
import Highlights from '../sections/Highlights';
import WeatherCard from '../components/WeatherCard';
import PollWidget from '../components/PollWidget';
import VirtualTourBanner from '../components/VirtualTourBanner';
import SEO from '../components/SEO';
import CountdownWidget from '../components/CountdownWidget';

const Home = () => {
  return (
    <div className="flex flex-col">
            <SEO 
        title="Brahmano Ki Sareri | Smart Village in Asind, Bhilwara Rajasthan"
        description="Welcome to the official website of Brahmano Ki Sareri. Explore village culture, news, panchayat updates, events, and community activities. ब्राह्मणों की सरेरी की डिजिटल दुनिया में आपका स्वागत है।"
        url="https://villagesareri.in/"
      />
      <Hero />
      
      {/* Weather Card - Sits below Hero on mobile, overlaps on desktop */}
      <div className="relative z-20 mt-6 md:-mt-24 mb-10 md:mb-12 container mx-auto px-4 flex justify-center md:justify-end">
        <WeatherCard />
      </div>

      <CountdownWidget />
      <KhelBanner />
      <PollWidget />
      <Highlights />
      <VirtualTourBanner />
    </div>
  );
};

export default Home;
