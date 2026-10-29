import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push, update } from 'firebase/database';
import { rtdb } from '../../firebase';
import { EVENT_CATEGORIES } from '../../data/defaultEvents';
import {
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiMapPin,
  FiUsers,
  FiBell,
  FiCheckCircle,
  FiX,
  FiStar
} from 'react-icons/fi';

const triggerPushNotification = async (title, body, type = 'Festival Announcement', link = '/events') => {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, type, link })
    });
    const result = await response.json();
    return response.ok && result.success;
  } catch (error) {
    console.error('Error triggering push notification:', error);
    return false;
  }
};

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    title: '',
    englishTitle: '',
    category: 'Mela & Religious',
    categoryHi: 'मेला व धार्मिक',
    date: '',
    time: 'प्रातः 09:00 बजे से',
    tithi: '',
    location: 'श्री चारभुजा नाथ मंदिर प्रांगण, सरेरी',
    organizer: 'समस्त ग्रामवासी सरेरी',
    description: '',
    highlights: '',
    badge: '',
    featured: false,
    isAnnual: false
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch events from Firebase RTDB
  useEffect(() => {
    const eventsRef = ref(rtdb, 'adminData/events');
    const unsub = onValue(
      eventsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          }));
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setEvents(list);
        } else {
          setEvents([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching admin events:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'category') {
        const catObj = EVENT_CATEGORIES.find((c) => c.id === value);
        if (catObj) next.categoryHi = catObj.labelHi;
      }
      return next;
    });
  };

  const handleEdit = (evt) => {
    setIsEditing(true);
    setEditingId(evt.id);
    setFormData({
      title: evt.title || '',
      englishTitle: evt.englishTitle || '',
      category: evt.category || 'Mela & Religious',
      categoryHi: evt.categoryHi || 'मेला व धार्मिक',
      date: evt.date || '',
      time: evt.time || '',
      tithi: evt.tithi || '',
      location: evt.location || '',
      organizer: evt.organizer || '',
      description: evt.description || '',
      highlights: Array.isArray(evt.highlights) ? evt.highlights.join('\n') : (evt.highlights || ''),
      badge: evt.badge || '',
      featured: !!evt.featured,
      isAnnual: !!evt.isAnnual
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('क्या आप इस आयोजन/त्योहार को हटाना चाहते हैं? (Delete this event?)')) {
      try {
        await remove(ref(rtdb, `adminData/events/${id}`));
        alert('आयोजन सफलतापूर्वक हटा दिया गया।');
      } catch (err) {
        alert('Error deleting event: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('कृपया आयोजन का नाम दर्ज करें (Event title is required).');
      return;
    }

    const highlightsArr = formData.highlights
      ? formData.highlights.split('\n').map((h) => h.trim()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      highlights: highlightsArr,
      updatedAt: Date.now()
    };

    try {
      if (isEditing && editingId) {
        await update(ref(rtdb, `adminData/events/${editingId}`), payload);
        alert('आयोजन विवरण सफलतापूर्वक अपडेट हो गया!');
      } else {
        const newRef = push(ref(rtdb, 'adminData/events'));
        await set(newRef, {
          ...payload,
          id: newRef.key,
          createdAt: Date.now()
        });
        alert('नया आयोजन/त्योहार सफलतापूर्वक शेड्यूल हो गया!');
      }

      // Reset form
      setFormData(initialFormState);
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('Error saving event: ' + err.message);
    }
  };

  // Push notification for event
  const handleNotifyEvent = async (evt) => {
    const confirmSend = window.confirm(`क्या आप "${evt.title}" की सूचना सभी ग्रामीणों को भेजना चाहते हैं?`);
    if (!confirmSend) return;

    try {
      const fullTitle = `🚩 सरेरी उत्सव: ${evt.title}`;
      const body = `${evt.tithi ? evt.tithi + ' | ' : ''}${evt.date || ''} - स्थान: ${evt.location || 'सरेरी'}`;
      const success = await triggerPushNotification(fullTitle, body, 'Festival Announcement', '/events');
      if (success) {
        alert('ग्रामीणों को नोटिफिकेशन सफलतापूर्वक भेज दिया गया!');
      } else {
        alert('Notification send failed. Check console.');
      }
    } catch (err) {
      alert('Notification error: ' + err.message);
    }
  };



  return (
    <div className="space-y-8">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
            <FiCalendar className="text-amber-500 w-6 h-6" />
            <span>Manage Village Events & Festivals</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            सरेरी के पारंपरिक मेले, धार्मिक त्योहार, खेलकूद व सांस्कृतिक आयोजनों को शेड्यूल व मैनेज करें।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
            कुल {events.length} कस्टम आयोजन
          </span>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FiPlus className="text-saffron w-5 h-5" />
            <span>{isEditing ? 'आयोजन संपादित करें (Edit Event)' : 'नया आयोजन / त्योहार जोड़ें (Schedule New Event)'}</span>
          </h3>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                setFormData(initialFormState);
              }}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 font-semibold"
            >
              <FiX className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>



        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title (Hindi) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                आयोजन का नाम (Hindi Title) *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="उदा. श्री जलझूलनी एकादशी मेला व बेवाण शोभायात्रा"
                required
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Title (English) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                English Title
              </label>
              <input
                type="text"
                name="englishTitle"
                value={formData.englishTitle}
                onChange={handleChange}
                placeholder="e.g. Jaljhulni Ekadashi Mela & Bevaan Yatra"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                श्रेणी (Category)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {EVENT_CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.labelHi} ({c.labelEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Tithi / Hindu Calendar */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                पारंपरिक तिथि / माह (Hindu Tithi / Month)
              </label>
              <input
                type="text"
                name="tithi"
                value={formData.tithi}
                onChange={handleChange}
                placeholder="उदा. भाद्रपद शुक्ल एकादशी (जलझूलनी ग्यारस)"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                तारीख (Event Date)
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                समय / मुहूर्त (Event Timing)
              </label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="उदा. प्रातः 09:00 बजे से सायं तक"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                स्थान / आयोजन स्थल (Location)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="उदा. श्री चारभुजा नाथ मंदिर प्रांगण, मुख्य बाज़ार, सरेरी"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                आयोजक समिति / नाम (Organizer)
              </label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="उदा. समस्त ग्रामवासी एवं श्री चारभुजा मंदिर ट्रस्ट"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Badge */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                विशेष बैज (Badge e.g. गाँव का सबसे बड़ा मेला)
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
                placeholder="उदा. प्रमुख वार्षिक मेला / युवा महोत्सव"
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                />
                <span>प्रमुख आयोजन (Featured on Top)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  name="isAnnual"
                  checked={formData.isAnnual}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                />
                <span>वार्षिक स्थायी उत्सव (Annual Recurring)</span>
              </label>
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              विस्तृत विवरण (Description)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="आयोजन का महत्व, इतिहास, परंपरा व ग्रामीणों के लिए दिशानिर्देश..."
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              प्रमुख आकर्षण व कार्यक्रम रूपरेखा (Key Highlights - प्रति लाइन 1 बिंदु)
            </label>
            <textarea
              name="highlights"
              value={formData.highlights}
              onChange={handleChange}
              rows={3}
              placeholder="ठाकुर जी के दिव्य बेवाण की भव्य शोभायात्रा&#10;पवित्र जलाशय पर जलविहार व महाआरती&#10;विशाल ग्रामीण मेला, खिलौने व झूले&#10;रात्रि में भजन संध्या"
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-sans"
            ></textarea>
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md transition-all"
            >
              {isEditing ? 'अपडेट सुरक्षित करें (Update Event)' : 'आयोजन शेड्यूल करें (Publish Event)'}
            </button>
          </div>
        </form>
      </div>

      {/* SCHEDULED EVENTS LIST */}
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800">
          शेड्यूल किए गए आयोजन सूची ({events.length})
        </h3>

        {loading ? (
          <p className="text-xs text-gray-400 py-4 animate-pulse">डेटा लोड हो रहा है...</p>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            अभी कोई कस्टम आयोजन शेड्यूल नहीं किया गया है। ऊपर दिए फ़ॉर्म से नया आयोजन जोड़ें।
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-xl border border-gray-200 hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {evt.categoryHi || evt.category}
                    </span>
                    {evt.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {evt.badge}
                      </span>
                    )}
                    {evt.featured && (
                      <span className="text-amber-500 text-xs font-bold flex items-center gap-0.5">
                        <FiStar className="fill-amber-400" /> Featured
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-gray-900 text-base leading-snug notranslate">
                    {evt.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>📅 {evt.tithi || evt.date || 'तारीख तय नहीं'}</span>
                    <span>⏰ {evt.time}</span>
                    <span>📍 {evt.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleNotifyEvent(evt)}
                    className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors text-xs font-semibold flex items-center gap-1"
                    title="ग्रामीणों को पुश नोटिफिकेशन भेजें"
                  >
                    <FiBell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notify</span>
                  </button>

                  <button
                    onClick={() => handleEdit(evt)}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors text-xs font-semibold flex items-center gap-1"
                    title="संपादित करें"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors text-xs font-semibold flex items-center gap-1"
                    title="हटाएं"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



    </div>
  );
};

export default ManageEvents;
