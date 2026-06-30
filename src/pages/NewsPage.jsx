import NewsList from '../sections/NewsList';
import SEO from '../components/SEO';

const NewsPage = () => {
  return (
    <div className="pt-20">
      <SEO 
        title="News & Updates - Brahmano Ki Sareri"
        description="Brahmano Ki Sareri ke latest samachar aur updates. Gaon ki sabhi khabrein ek jagah."
        url="https://villagesareri.in/news"
      />
      <NewsList />
    </div>
  );
};

export default NewsPage;
