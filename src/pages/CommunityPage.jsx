import CommunityPages from '../sections/CommunityPages';
import SEO from '../components/SEO';

const CommunityPage = () => {
  return (
    <div className="pt-1 sm:pt-3">
      <SEO 
        title="Community & Spiritual Heritage | Brahmano Ki Sareri"
        description="सरेरी के प्राचीन मंदिर, चारभुजा मंदिर, भैरू खेड़ा, गौशाला, सामाजिक संस्थाएं एवं ग्रामीण एकता का परिचय।"
        url="https://villagesareri.in/community"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Community', url: 'https://villagesareri.in/community' }
        ]}
      />
      <CommunityPages />
    </div>
  );
};

export default CommunityPage;
