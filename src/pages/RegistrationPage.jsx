import { useState } from 'react';
import { FiUser, FiPhone, FiMapPin, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    teamName: '',
    captainName: '',
    contact: '',
    sport: '',
    playerNames: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newRegistration = {
      id: Date.now(),
      ...formData,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    try {
      // Fetch existing registrations from Firestore
      const snap = await getDoc(doc(db, 'adminData', 'khelRegistrations'));
      const existing = snap.exists() ? (snap.data().items || []) : [];
      await setDoc(doc(db, 'adminData', 'khelRegistrations'), { items: [newRegistration, ...existing] });
    } catch (error) {
      console.error('Error saving registration:', error);
    }
    
    setIsSubmitted(true);
    setFormData({
      teamName: '',
      captainName: '',
      contact: '',
      sport: '',
      playerNames: ''
    });
    
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen relative overflow-hidden bg-black text-white">
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: 'url(/photos/khel_bg.png)', backgroundAttachment: 'fixed' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-saffron mb-4 tracking-wider drop-shadow-[0_4px_12px_rgba(249,115,22,0.5)] leading-normal py-2" style={{ fontFamily: '"Yatra One", cursive' }}>
            सरेरी श्याम खेल महोत्सव 2026
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium px-2">
            टूर्नामेंट में रजिस्टर करने के किए नीचे दिए गए फॉर्म को भरे
          </p>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-[0_0_40px_rgba(249,115,22,0.15)] border border-orange-500/30 overflow-hidden relative mx-2 sm:mx-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-saffron to-yellow-500" />
          
          <div className="p-6 sm:p-8 md:p-12">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 mb-2">
                  <FiCheckCircle className="w-12 h-12 text-green-400" />
                </div>
                <h3 className="text-3xl font-extrabold text-white tracking-wide uppercase">Registration Confirmed! / पंजीकरण सफल!</h3>
                <p className="text-gray-400 text-lg">You're officially part of the Khel Maha Utsav.<br/>आप आधिकारिक तौर पर खेल महा उत्सव का हिस्सा हैं।</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 bg-gradient-to-r from-orange-600 to-saffron hover:from-orange-500 hover:to-orange-400 text-white font-bold py-3 px-8 rounded-full uppercase tracking-wider transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                >
                  Register Another Team / दूसरी टीम रजिस्टर करें
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  {/* Team Name */}
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">
                      Team Name / टीम का नाम *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiUser className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleChange}
                        required
                        className="pl-12 w-full px-4 py-3 bg-black/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-white placeholder-gray-600 font-medium"
                        placeholder="e.g. Sareri Super Kings"
                      />
                    </div>
                  </div>

                  {/* Captain Name */}
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">
                      Captain Name / कप्तान का नाम *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiUser className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        name="captainName"
                        value={formData.captainName}
                        onChange={handleChange}
                        required
                        className="pl-12 w-full px-4 py-3 bg-black/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-white placeholder-gray-600 font-medium"
                        placeholder="e.g. Rahul Vyas"
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">
                      Captain Mobile Number / कप्तान का मोबाइल नंबर *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiPhone className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input 
                        type="tel" 
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                        className="pl-12 w-full px-4 py-3 bg-black/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-white placeholder-gray-600 font-medium"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>

                  {/* Player Names */}
                  <div className="group sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">
                      Player Names / खिलाड़ियों के नाम (Comma separated) *
                    </label>
                    <textarea 
                      name="playerNames"
                      value={formData.playerNames}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 bg-black/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-white placeholder-gray-600 font-medium"
                      placeholder="e.g. Rahul, Suresh, Amit, Vikram..."
                    />
                  </div>

                  {/* Sport */}
                  <div className="group sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">
                      Select Sport / खेल चुनें *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiActivity className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <select
                        name="sport"
                        value={formData.sport}
                        onChange={handleChange}
                        required
                        className="pl-12 w-full px-4 py-3 bg-black/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-white font-medium"
                      >
                        <option value="" className="bg-gray-900 text-gray-500">Choose your sport / अपना खेल चुनें</option>
                        <option value="Cricket" className="bg-gray-900">Cricket / क्रिकेट</option>
                        <option value="Volleyball" className="bg-gray-900">Volleyball / वॉलीबॉल</option>
                        <option value="Kabaddi" className="bg-gray-900">Kabaddi / कबड्डी</option>
                        <option value="Tug of War" className="bg-gray-900">Tug of War / रस्सा कशी</option>
                        <option value="Athletics" className="bg-gray-900">Athletics / एथलेटिक्स (दौड़/कूद)</option>
                        <option value="Badminton" className="bg-gray-900">Badminton / बैडमिंटन</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 md:pt-6">
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-600 via-saffron to-yellow-500 hover:from-orange-500 hover:to-yellow-400 text-white py-3 md:py-4 rounded-xl text-base md:text-lg font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-1 uppercase tracking-widest"
                  >
                    Enter the Tournament / टूर्नामेंट में भाग लें
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
