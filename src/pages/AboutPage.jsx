import About from '../sections/About';
import SEO from '../components/SEO';

const AboutPage = () => {
  return (
    <div className="pt-20">
            <SEO 
        title="About Brahmano Ki Sareri | History, Culture & Temples"
        description="Discover the rich history, culture, traditions, and famous temples of Brahmano Ki Sareri village, Asind, Bhilwara, Rajasthan."
        url="https://villagesareri.in/about"
      />
      <About />
    </div>
  );
};

export default AboutPage;
