import NewsList from '../sections/NewsList';
import SEO from '../components/SEO';

const NewsPage = () => {
  return (
    <div className="pt-20">
            <SEO 
        title="Sareri News & Updates | Latest Announcements"
        description="Stay updated with the latest village news, announcements, notices, and important updates from Brahmano Ki Sareri community."
        url="https://villagesareri.in/news"
      />
      <NewsList />
    </div>
  );
};

export default NewsPage;
