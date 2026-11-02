import { useEffect } from 'react';
import ComplaintForm from '../sections/ComplaintForm';
import SEO from '../components/SEO';

const ComplaintPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-1 sm:pt-3">
      <SEO 
        title="Jan Sunwai & Grievance Redressal | Village Sareri Portal"
        description="गाँव की जनसमस्याएं, पानी, बिजली, सड़क व सफाई संबंधी शिकायतें सीधे ग्राम पंचायत तक पहुंचाएं एवं स्थिति ट्रैक करें।"
        url="https://villagesareri.in/complaint"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Jan Sunwai & Complaints', url: 'https://villagesareri.in/complaint' }
        ]}
      />
      <ComplaintForm />
    </div>
  );
};

export default ComplaintPage;
