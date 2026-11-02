import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFileText, FiCheckSquare, FiAlertTriangle, FiUserCheck, 
  FiClock, FiMapPin, FiArrowLeft, FiShield
} from 'react-icons/fi';
import SEO from '../components/SEO';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const termsPoints = [
    {
      icon: <FiCheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'शर्तों की स्वीकृति (Acceptance of Terms)',
      points: [
        'इस पोर्टल या ग्राम पंचायत की ऑनलाइन सेवाओं का उपयोग करने पर आप इन नियमों से सहमत होते हैं।',
        'यह पोर्टल गाँव के विकास, जनसुनवाई और नागरिक संवाद हेतु समर्पित एक सार्वजनिक मंच है।'
      ]
    },
    {
      icon: <FiAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      title: 'जनसुनवाई एवं शिकायत नियम (Grievance Rules)',
      points: [
        'केवल वास्तविक, सही और गाँव के जनहित से जुड़ी समस्याएं (पानी, सड़क, लाइट, सफाई आदि) ही दर्ज करें।',
        'किसी व्यक्ति के विरुद्ध व्यक्तिगत द्वेष, अभद्र भाषा, अश्लील टिप्पणी या मानहानिकारक शिकायत दर्ज करना सख्त वर्जित है।',
        'फर्जी या भ्रामक शिकायत पाए जाने पर उसे निरस्त किया जाएगा तथा नियमानुसार आवश्यक कार्रवाई की जा सकती है।'
      ]
    },
    {
      icon: <FiUserCheck className="w-5 h-5 text-[#0D477A] dark:text-sky-400" />,
      title: 'खाता एवं सुरक्षा (Account & Security)',
      points: [
        'शिकायत दर्ज करने के लिए Google से लॉगिन और 10 अंकों का सक्रिय मोबाइल नंबर अनिवार्य है।',
        'अपने लॉगिन खाते की सुरक्षा बनाए रखने के जिम्मेदार नागरिक स्वयं होंगे।',
        'किसी अन्य व्यक्ति के नाम या पहचान से फर्जी शिकायत दर्ज करना प्रतिबंधित है।'
      ]
    },
    {
      icon: <FiClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'समाधान प्रक्रिया (Resolution Process)',
      points: [
        'ग्राम पंचायत प्रशासन शिकायतों की त्वरित जांच कर समयबद्ध समाधान का प्रयास करता है।',
        'समाधान का समय समस्या की प्रकृति, तकनीकी स्वीकृति और सरकारी बजट आवंटन पर निर्भर करता है।'
      ]
    },
    {
      icon: <FiShield className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'व्यापार व खेल महोत्सव (Directory & Events)',
      points: [
        'व्यापार डायरेक्टरी में दी गई जानकारी व सेवाओं की गुणवत्ता की जिम्मेदारी संबंधित प्रतिष्ठान की है।',
        'सरेरी खेल महोत्सव में भाग लेने वाली सभी टीमों को खेल भावना व पंचायत समिति के नियमों का पालन करना अनिवार्य है।'
      ]
    },
    {
      icon: <FiMapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'कार्यालय संपर्क व क्षेत्राधिकार (Contact & Jurisdiction)',
      points: [
        'संपर्क कार्यालय: ग्राम पंचायत भवन, ब्राह्मणों की सरेरी, आसींद, भीलवाड़ा (राजस्थान) - 311026',
        'कार्य दिवसों में प्रातः 10:00 से सायं 05:00 बजे तक कार्यालय में संपर्क कर सकते हैं।',
        'किसी भी विवाद की स्थिति में न्यायिक क्षेत्राधिकार न्यायालय आसींद / भीलवाड़ा होगा।'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pt-3 sm:pt-6 pb-16">
      <SEO 
        title="Terms of Service | Village Sareri Digital Portal"
        description="Official terms and conditions governing the use of the Brahmano Ki Sareri digital village portal and public services."
        url="https://villagesareri.in/terms-of-service"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Terms of Service', url: 'https://villagesareri.in/terms-of-service' }
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        
        {/* Back Link */}
        <div className="mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#0D477A] dark:hover:text-sky-400 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>मुख्य पृष्ठ (Home)</span>
          </Link>
        </div>

        {/* Compact Hero Header */}
        <div className="bg-gradient-to-br from-[#0D477A] to-[#0A2540] rounded-2xl p-5 sm:p-7 text-white shadow-lg mb-6 border border-blue-900/40">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-sky-200 text-xs font-bold uppercase tracking-wider mb-2">
            <FiFileText className="w-3.5 h-3.5" />
            <span>नियम एवं उपयोग शर्तें</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading text-white">
            सेवा की शर्तें (Terms of Service)
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            ग्राम पंचायत ब्राह्मणों की सरेरी • सेवाओं का पारदर्शी, मर्यादित व जनहितकारी उपयोग करें।
          </p>
        </div>

        {/* Short Point Cards */}
        <div className="space-y-3.5 sm:space-y-4">
          {termsPoints.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 shrink-0">
                  {item.icon}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h2>
              </div>

              <ul className="space-y-1.5 pl-2">
                {item.points.map((pt, pIdx) => (
                  <li key={pIdx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 leading-relaxed">
                    <span className="text-sky-600 dark:text-sky-400 font-bold mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500">
          <span>&copy; {new Date().getFullYear()} ग्राम पंचायत सरेरी</span>
          <Link to="/privacy-policy" className="font-bold text-[#0D477A] dark:text-sky-400 hover:underline">
            गोपनीयता नीति (Privacy) →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TermsPage;
