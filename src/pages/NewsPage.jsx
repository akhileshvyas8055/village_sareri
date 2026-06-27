import News from '../sections/News';
import SEO from '../components/SEO';

const NewsPage = () => {
  return (
    <div className="pt-20">
      <SEO 
        title="News & Complaints - Brahmano Ki Sareri"
        description="Brahmano Ki Sareri ke latest samachar, updates aur shikayat portal. Gaon ki sabhi khabrein ek jagah."
        url="https://sareri.vercel.app/news"
      />
      <News />
    </div>
  );
};

export default NewsPage;
