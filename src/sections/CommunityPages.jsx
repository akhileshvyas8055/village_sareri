import { motion } from 'framer-motion';
import { FiInstagram, FiExternalLink, FiYoutube } from 'react-icons/fi';

const CommunityPages = () => {
  const pages = [
    {
      id: 0,
      title: 'Village Sareri',
      handle: '@village_sareri',
      url: 'https://www.instagram.com/village_sareri?igsh=cDVoYWNwZzlteGkw',
      desc: 'Official page of Brahmano Ki Sareri. Follow for latest updates, beauty, and news from our village.',
      color: 'from-pink-500 to-purple-600',
      image: '/photos/About.jpeg' 
    },
    {
      id: 1,
      title: 'Bajrang Gopal Gaushala',
      handle: '@bajrang_gopal_gaushala_sareri',
      url: 'https://www.instagram.com/bajrang_gopal_gaushala_sareri?igsh=Y3gyM2VpajN0Y2V2',
      desc: 'Official page of our village Gaushala. Follow for updates on cow welfare, service, and daily activities.',
      color: 'from-orange-400 to-red-500',
      image: '' // Add your photo path here, e.g., '/photos/gaushala.jpg'
    },
    {
      id: 2,
      title: 'Shree Sareri Shyam',
      handle: '@shree_sareri_shyam',
      url: 'https://www.instagram.com/shree_sareri_shyam?igsh=MW9qN2o2bmVwMHQ1cg==',
      desc: 'Divine glimpses, aarti timings, and regular updates from the sacred Shree Sareri Shyam Temple.',
      color: 'from-blue-400 to-indigo-600',
      image: '' // Add your photo path here, e.g., '/photos/shyam.jpg'
    },
    {
      id: 3,
      title: 'Bheru Kheda BK',
      handle: '@bheru_kheda_bk_sareri',
      url: 'https://www.instagram.com/bheru_kheda_bk_sareri?igsh=MWllaGtoN3Z0YWhlMw==',
      desc: 'Latest updates, traditions, and cultural highlights from Bheru Kheda, <span className="notranslate">Brahmano Ki Sareri</span>.',
      color: 'from-emerald-400 to-teal-600',
      image: '' // Add your photo path here, e.g., '/photos/bheru.jpg'
    },
    {
      id: 4,
      title: 'Shree Charbhuja Nath',
      handle: '@shree_.charbhujanath_',
      url: 'https://www.instagram.com/shree_.charbhujanath_?igsh=MTBwbGdkbjVyNnZsbg==',
      desc: 'Official page of Shree Charbhuja Nath Ji. Stay connected for daily darshan and temple updates.',
      color: 'from-yellow-400 to-orange-600',
      image: '' // Add your photo path here
    }
  ];

  const youtubeVideos = [
    { id: '1', videoId: 'HH7VrNOFn08', url: 'https://www.youtube.com/live/HH7VrNOFn08?si=ORgTyfwv9Epby4za' },
    { id: '2', videoId: 'vIIWiwYFEoM', url: 'https://youtu.be/vIIWiwYFEoM?si=CliZylBbotqq9I0t' },
    { id: '3', videoId: 'Otuek0-RNkE', url: 'https://youtu.be/Otuek0-RNkE?si=sI3ofOVKu90Oelcp' },
    { id: '4', videoId: 'JugXmMit-yk', url: 'https://youtu.be/JugXmMit-yk?si=b9VkmzdrWWlKFmQS' }
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-saffron/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-4"
          >
            Community <span className="text-saffron">Pages</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-saffron mx-auto rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg"
          >
            Follow our official community pages on Instagram to stay connected with the spiritual and cultural heart of our village.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {pages.map((page, index) => (
            <motion.a
              href={page.url}
              target="_blank"
              rel="noopener noreferrer"
              key={page.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group block relative bg-white dark:bg-darkCard rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden transform hover:-translate-y-2"
            >
              {/* Top Gradient Bar */}
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${page.color}`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 shadow-lg transform group-hover:scale-110 transition-transform duration-300 overflow-hidden border-2 border-saffron/20 p-1">
                  {page.image ? (
                    <img src={page.image} alt={page.title} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full text-gray-400">
                      <FiInstagram className="w-6 h-6 mb-1 text-pink-400" />
                    </div>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-saffron transition-colors">
                  <FiExternalLink className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">
                {page.title}
              </h3>
              
              <div className="flex items-center gap-2 text-pink-500 font-medium mb-4">
                <FiInstagram />
                <span>{page.handle}</span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {page.desc}
              </p>
            </motion.a>
          ))}
        </div>

        {/* YouTube Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-4"
            >
              Community Doing Well on <span className="text-red-600">YouTube</span>
            </motion.h3>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-20 h-1 bg-red-600 mx-auto rounded-full"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Watch highlight videos, vlogs, and special coverage from our village creators.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {youtubeVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-black rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-800 aspect-video flex items-center justify-center"
              >
                <iframe 
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.videoId}`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityPages;
