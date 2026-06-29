import { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { rtdb } from '../../firebase';
import { FiClock, FiSave, FiPower } from 'react-icons/fi';

const ManageCountdown = () => {
  const [countdown, setCountdown] = useState({
    title: '',
    targetDate: '',
    theme: 'saffron',
    isActive: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const countdownRef = ref(rtdb, 'adminData/countdown');
    const unsub = onValue(countdownRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCountdown(data);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      await set(ref(rtdb, 'adminData/countdown'), countdown);
      setMessage('Countdown timer updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error saving countdown:", error);
      setMessage('Error saving countdown.');
    }
    
    setIsSaving(false);
  };

  const handleToggle = async () => {
    const newState = !countdown.isActive;
    setCountdown(prev => ({ ...prev, isActive: newState }));
    try {
      await set(ref(rtdb, 'adminData/countdown/isActive'), newState);
    } catch (error) {
      console.error("Error toggling countdown:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-darkCard rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiClock className="text-saffron" />
          Manage Event Countdown
        </h2>
        
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
            countdown.isActive 
              ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          <FiPower />
          {countdown.isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
          <input
            type="text"
            required
            value={countdown.title}
            onChange={(e) => setCountdown({...countdown, title: e.target.value})}
            placeholder="e.g. Sareri Shyam Khel Mahotsav 2026"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date & Time</label>
          <input
            type="datetime-local"
            required
            value={countdown.targetDate}
            onChange={(e) => setCountdown({...countdown, targetDate: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Theme</label>
          <select
            value={countdown.theme || 'saffron'}
            onChange={(e) => setCountdown({...countdown, theme: e.target.value})}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-saffron focus:border-transparent outline-none transition-all"
          >
            <option value="saffron">Festival / Religious (Saffron)</option>
            <option value="blue">Krishna Janmashtami (Blue)</option>
            <option value="green">Gram Sabha / Panchayat (Green)</option>
            <option value="dark">General Meeting (Dark/Professional)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Changes the background color of the widget to match the event type.</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-saffron hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          <FiSave />
          {isSaving ? 'Saving...' : 'Save Countdown Settings'}
        </button>

        {message && (
          <p className="text-center text-sm font-medium text-green-600 dark:text-green-400 mt-2">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ManageCountdown;
