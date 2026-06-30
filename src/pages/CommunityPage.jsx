import CommunityPages from '../sections/CommunityPages';
import SEO from '../components/SEO';

const CommunityPage = () => {
  return (
    <div className="pt-20">
            <SEO 
        title="Sareri Community Connect | Discussions & Polls"
        description="Join community discussions, participate in village polls, share opinions, and stay connected with Brahmano Ki Sareri."
        url="https://villagesareri.in/community"
      />
      <CommunityPages />
    </div>
  );
};

export default CommunityPage;
