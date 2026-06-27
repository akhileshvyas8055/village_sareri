import ComplaintForm from '../sections/ComplaintForm';
import SEO from '../components/SEO';

const ComplaintPage = () => {
  return (
    <div className="pt-20">
      <SEO 
        title="Register Complaint - Brahmano Ki Sareri"
        description="Brahmano Ki Sareri gram panchayat shikayat portal. Apni samasya ya suzhav darj karein."
        url="https://sareri.vercel.app/complaint"
      />
      <ComplaintForm />
    </div>
  );
};

export default ComplaintPage;
