import About from '../sections/About';
import SEO from '../components/SEO';

const AboutPage = () => {
  return (
    <div className="pt-1 sm:pt-3">
      <SEO 
        title="About Brahmano Ki Sareri | History, Temples & Village Heritage"
        description="ब्राह्मणों की सरेरी का प्राचीन इतिहास, चारभुजा बड़ा मंदिर, संस्कृति, भौगोलिक स्थिति एवं आसींद भीलवाड़ा में सरेरी का महत्व।"
        url="https://villagesareri.in/about"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'About Village', url: 'https://villagesareri.in/about' }
        ]}
      />
      <About />
    </div>
  );
};

export default AboutPage;
