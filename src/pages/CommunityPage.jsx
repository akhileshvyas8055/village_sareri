import CommunityPages from '../sections/CommunityPages';
import SEO from '../components/SEO';

const CommunityPage = () => {
  return (
    <div className="pt-20">
      <SEO 
        title="Community - Brahmano Ki Sareri"
        description="Brahmano Ki Sareri ke samudaayik pages. Gaon ke log, samaj aur sansthaon ki jankari."
        url="https://villagesareri.in/community"
      />
      <CommunityPages />
    </div>
  );
};

export default CommunityPage;
