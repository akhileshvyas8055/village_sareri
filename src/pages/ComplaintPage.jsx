import ComplaintForm from '../sections/ComplaintForm';
import SEO from '../components/SEO';

const ComplaintPage = () => {
  return (
    <div className="pt-20">
            <SEO 
        title="Jan Sunwai & Complaints | Sareri Gram Panchayat"
        description="Submit complaints, suggestions, and public feedback online to Sareri Gram Panchayat for better governance and transparency."
        url="https://villagesareri.in/complaint"
      />
      <ComplaintForm />
    </div>
  );
};

export default ComplaintPage;
