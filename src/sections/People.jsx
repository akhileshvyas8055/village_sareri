import { motion } from 'framer-motion';

const People = () => {
  const people = [
    { id: 1, name: 'Shri Ramdev Singh', role: 'Village Sarpanch', image: '', desc: 'Leading the village towards modernization while preserving our rich heritage.' },
    { id: 2, name: 'Capt. Vikram Rathore', role: 'Army Officer', image: '', desc: 'Serving the nation with pride and inspiring the youth of Sareri.' },
    { id: 3, name: 'Smt. Anita Devi', role: 'Head Teacher', image: '', desc: 'Dedicated to illuminating young minds and fostering education.' },
    { id: 4, name: 'Dr. Ashok Kumar', role: 'Social Worker', image: '', desc: 'Tirelessly working for the healthcare and betterment of the villagers.' },
  ];

  return (
    <section id="people" className="py-24 bg-earthy/50 dark:bg-earthyDark relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-white mb-4"
          >
            Important <span className="text-saffron">People</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-saffron mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {people.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                {person.image ? (
                  <img 
                    src={person.image} 
                    alt={person.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-gray-700 dark:to-gray-800 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
                    <span className="text-indigo-400 dark:text-gray-500 font-heading tracking-widest uppercase text-sm">Portrait</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6 text-center relative z-10 bg-white dark:bg-darkCard -mt-6 mx-4 rounded-xl shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white">{person.name}</h3>
                <p className="text-saffron font-medium mb-3">{person.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {person.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default People;
