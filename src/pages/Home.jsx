import Hero from '../sections/Hero';
import KhelBanner from '../sections/KhelBanner';
import Highlights from '../sections/Highlights';
import WeatherCard from '../components/WeatherCard';

const Home = () => {
  return (
    <div className="flex flex-col">
      <Hero />
      
      {/* Weather Card - Sits below Hero on mobile, overlaps on desktop */}
      <div className="relative z-20 mt-6 md:-mt-24 mb-10 md:mb-12 container mx-auto px-4 flex justify-center md:justify-end">
        <WeatherCard />
      </div>

      <KhelBanner />
      <Highlights />
    </div>
  );
};

export default Home;
