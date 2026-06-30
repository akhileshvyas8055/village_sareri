import About from '../sections/About';
import SEO from '../components/SEO';

const AboutPage = () => {
  return (
    <div className="pt-20">
      <SEO 
        title="About - Brahmano Ki Sareri Village"
        description="Brahmano Ki Sareri ki kahani, itihaas, sanskriti aur parampara. Bhilwara, Rajasthan ka ek virasati gaon."
        url="https://villagesareri.in/about"
      />
      <About />
    </div>
  );
};

export default AboutPage;
