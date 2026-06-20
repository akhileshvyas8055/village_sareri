import { motion } from 'framer-motion';
import { FiUsers, FiMapPin, FiHome, FiBookOpen } from 'react-icons/fi';

const About = () => {
  const stats = [
    { id: 1, icon: <FiUsers className="w-8 h-8 text-saffron" />, title: 'Population', value: '4,576+' },
    { id: 2, icon: <FiMapPin className="w-8 h-8 text-green" />, title: 'Location', value: 'Asind, Bhilwara' },
    { id: 3, icon: <FiHome className="w-8 h-8 text-gold" />, title: 'Families', value: '922+' },
    { id: 4, icon: <FiBookOpen className="w-8 h-8 text-saffron" />, title: 'Literacy Rate', value: '67.6%' },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-earthy/50 dark:bg-earthyDark">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-4"
          >
            About <span className="text-saffron">Sareri</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-saffron mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-heading font-semibold text-gray-800 dark:text-gray-100">
              Brahmano Ki Sareri
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              ब्राह्मणों की सरेरी, राजस्थान के भीलवाड़ा जिले में स्थित एक समृद्ध और सांस्कृतिक रूप से संपन्न गाँव है। 
              यह ऐतिहासिक गाँव उदयपुर से लगभग 300 किलोमीटर की दूरी पर बसा है और अपनी 12,000 एकड़ की विशाल भूमि 
              के लिए जाना जाता है, जिसे उदयपुर दरबार द्वारा उपहार में दिया गया था।
            </p>
            
            <div className="pt-4 grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div key={stat.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-darkCard shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-800">
                    {stat.icon}
                  </div>
                  <div>
                    <h4 className="text-3xl font-bold font-heading text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </h4>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] mx-auto mt-8 lg:mt-0 rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.15)] ring-8 ring-white dark:ring-darkCard group flex-shrink-0"
          >
            <img 
              src="/photos/About.jpeg" 
              alt="About Sareri Village" 
              className="absolute inset-0 w-full h-full object-cover object-top scale-110 transition-transform duration-700 group-hover:scale-125"
            />
          </motion.div>
        </div>

        {/* Detailed Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Heritage & Culture */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-darkCard p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-saffron"
          >
            <h4 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-6">हमारी विरासत और संस्कृति</h4>
            <ul className="space-y-4 text-gray-600 dark:text-gray-300">
              <li className="leading-relaxed"><strong className="text-gray-800 dark:text-gray-100">धार्मिक और सांस्कृतिक धरोहर:</strong> हमारा गाँव अपनी 50 वर्षों से अधिक पुरानी पारंपरिक रामलीला के लिए प्रसिद्ध है, जिसमें स्थानीय निवासी स्वयं कलाकार के रूप में भाग लेते हैं।</li>
              <li className="leading-relaxed"><strong className="text-gray-800 dark:text-gray-100">समुदाय:</strong> यहाँ की अधिकांश आबादी सिखवाल ब्राह्मण समुदाय से है, जो अपनी अतिथि-सत्कार और एकता के लिए जानी जाती है। यह समुदाय हर साल 5,000 से अधिक लोगों के लिए महाभोज (महाप्रसाद) का आयोजन करता है।</li>
            </ul>
          </motion.div>

          {/* Card 2: Main Attractions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-darkCard p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-green"
          >
            <h4 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-6">मुख्य आकर्षण और संसाधन</h4>
            <ul className="space-y-4 text-gray-600 dark:text-gray-300">
              <li className="leading-relaxed"><strong className="text-gray-800 dark:text-gray-100">धार्मिक तालाब:</strong> यहाँ स्थित 'धार्मिक तालाब' गाँव का एक प्रमुख स्थान है, जहाँ एक सुंदर छतरी और पवित्र शिवलिंग स्थापित है। यहाँ प्रतिवर्ष अंतर्राष्ट्रीय योग दिवस भी मनाया जाता है।</li>
              <li className="leading-relaxed"><strong className="text-gray-800 dark:text-gray-100">नया तालाब:</strong> यह इस क्षेत्र का सबसे बड़ा तालाब है, जो न केवल प्राकृतिक सुंदरता का केंद्र है बल्कि कृषि सिंचाई का प्रमुख स्रोत भी है।</li>
              <li className="leading-relaxed"><strong className="text-gray-800 dark:text-gray-100">मंदिर:</strong> गाँव में भगवान चारभुजा नाथ के 7-8 मंदिर हैं, जिनमें से 'बड़ा चारभुजा नाथ मंदिर' विशेष रूप से प्रसिद्ध है।</li>
            </ul>
          </motion.div>

          {/* Card 3: Economy */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-darkCard p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-gold"
          >
            <h4 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-6">अर्थव्यवस्था और आजीविका</h4>
            <ul className="space-y-4 text-gray-600 dark:text-gray-300">
              <li className="leading-relaxed"><strong className="text-gray-800 dark:text-gray-100">कृषि और पशुपालन:</strong> हमारी अर्थव्यवस्था का मुख्य आधार खेती, पशुपालन और कपास की उन्नत खेती है।</li>
              <li className="leading-relaxed"><strong className="text-gray-800 dark:text-gray-100">खान-पान और शिक्षण:</strong> ब्राह्मणों की सरेरी न केवल अपने शिक्षण क्षेत्र के लिए जानी जाती है, बल्कि यहाँ का कैटरिंग (हलवाई) व्यवसाय पूरे भारत में प्रसिद्ध है।</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
