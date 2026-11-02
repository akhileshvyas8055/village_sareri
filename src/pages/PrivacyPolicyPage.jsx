import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShield, FiLock, FiDatabase, FiUserCheck, 
  FiMapPin, FiArrowLeft, FiClock, FiCheck
} from 'react-icons/fi';
import SEO from '../components/SEO';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const policyPoints = [
    {
      icon: <FiDatabase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'डेटा संग्रह (Data We Collect)',
      points: [
        'शिकायत दर्ज करते समय केवल नाम, मोबाइल नंबर, Google लॉगिन और समस्या का विवरण लिया जाता है।',
        'फोटो साक्ष्य जोड़ना पूरी तरह स्वैच्छिक (Optional) है।',
        'खेल महोत्सव या व्यापार डायरेक्टरी में केवल आवश्यक संपर्क विवरण लिया जाता है।'
      ]
    },
    {
      icon: <FiLock className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'शिकायत गोपनीयता (Strict Privacy)',
      points: [
        'आपकी शिकायत केवल आपके लॉगिन और अधिकृत पंचायत प्रशासन (सरपंच/सचिव) को ही दिखाई देती है।',
        'गाँव का कोई भी अन्य नागरिक आपकी शिकायत, विवरण या मोबाइल नंबर नहीं देख सकता।',
        'बिना Google लॉगिन के फर्जी शिकायत दर्ज करना पूरी तरह प्रतिबंधित है।'
      ]
    },
    {
      icon: <FiUserCheck className="w-5 h-5 text-[#0D477A] dark:text-sky-400" />,
      title: 'डेटा का उपयोग (Use of Data)',
      points: [
        'समस्याओं की जमीनी जांच और समयबद्ध समाधान हेतु।',
        'नागरिक को शिकायत की लाइव स्थिति (Pending, In Progress, Resolved) दिखाने हेतु।',
        'ग्राम पंचायत के आवश्यक अलर्ट व सूचनाएं पहुंचाने हेतु।'
      ]
    },
    {
      icon: <FiShield className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      title: 'शून्य डेटा बिक्री (No Data Selling)',
      points: [
        'नागरिकों का कोई भी डेटा किसी निजी कंपनी या विज्ञापनदाता को न तो बेचा जाता है और न ही साझा किया जाता है।',
        'डेटा केवल सार्वजनिक पंचायत सेवाओं के निष्पादन हेतु सुरक्षित रखा जाता है।'
      ]
    },
    {
      icon: <FiCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'नागरिक अधिकार (Citizen Rights)',
      points: [
        'नागरिक अपनी लंबित शिकायत को कभी भी "रद्द (Cancel)" कर सकते हैं।',
        'आप कभी भी पोर्टल से लॉगआउट कर सकते हैं।',
        'डार्क मोड या लाइट मोड की सेटिंग आपके स्थानीय डिवाइस पर ही सुरक्षित रहती है।'
      ]
    },
    {
      icon: <FiMapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'संपर्क कार्यालय (Office Contact)',
      points: [
        'स्थान: ग्राम पंचायत भवन, ब्राह्मणों की सरेरी, तहसील आसींद, जिला भीलवाड़ा (राज.) - 311026',
        'कार्यालय समय: सोमवार से शनिवार, प्रातः 10:00 बजे से सायं 05:00 बजे तक (राजकीय अवकाश को छोड़कर)।'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pt-3 sm:pt-6 pb-16">
      <SEO 
        title="Privacy Policy | Village Sareri Digital Portal"
        description="Privacy policy, resident data protection, and terms regarding information security on the official Brahmano Ki Sareri digital village portal."
        url="https://villagesareri.in/privacy-policy"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Privacy Policy', url: 'https://villagesareri.in/privacy-policy' }
        ]}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        
        {/* Back Link */}
        <div className="mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#135334] dark:hover:text-emerald-400 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>मुख्य पृष्ठ (Home)</span>
          </Link>
        </div>

        {/* Compact Hero Header */}
        <div className="bg-gradient-to-br from-[#135334] to-[#0A2E1C] rounded-2xl p-5 sm:p-7 text-white shadow-lg mb-6 border border-emerald-800/40">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <FiShield className="w-3.5 h-3.5" />
            <span>डेटा सुरक्षा एवं गोपनीयता</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading text-white">
            गोपनीयता नीति (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            ग्राम पंचायत ब्राह्मणों की सरेरी • नागरिकों की सुरक्षा व डेटा गोपनीयता हमारी प्राथमिकता है।
          </p>
        </div>

        {/* Short Point Cards */}
        <div className="space-y-3.5 sm:space-y-4">
          {policyPoints.map((item, idx) => (
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
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">•</span>
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
          <Link to="/terms-of-service" className="font-bold text-[#135334] dark:text-emerald-400 hover:underline">
            सेवा की शर्तें (Terms) →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
