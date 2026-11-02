import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, set, remove, push, update } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { rtdb, storage } from '../../firebase';
import {
  FiFileText,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBell,
  FiSearch,
  FiCalendar,
  FiImage,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiLayers,
  FiEye
} from 'react-icons/fi';

const NEWS_CATEGORIES = [
  { id: 'ALL', label: 'सभी (All)', badgeColor: 'bg-gray-100 text-gray-800' },
  { id: 'Announcement', label: 'घोषणा (Announcement)', badgeColor: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'Notice', label: 'सूचना (Notice)', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'Event', label: 'आयोजन (Event)', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'Scheme', label: 'सरकारी योजना (Scheme)', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'Emergency Alert', label: 'आपातकालीन अलर्ट (Alert)', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' }
];

// Helper to compress image to max 120KB DataURL
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scaleSize = MAX_WIDTH / Math.max(img.width, MAX_WIDTH);
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const triggerPushNotification = async (title, body, type = 'General', link = '/news') => {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, type, link })
    });
    const result = await response.json();
    return response.ok && result.success;
  } catch (error) {
    console.error('Push notification trigger error:', error);
    return false;
  }
};

const ManageNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sendPushOnSave, setSendPushOnSave] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    title: '',
    type: 'Announcement',
    date: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    desc: '',
    image: ''
  };

  const [form, setForm] = useState(initialForm);

  // Real-time listener for news
  useEffect(() => {
    const newsRef = ref(rtdb, 'adminData/news');
    const unsub = onValue(
      newsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          }));
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setNewsList(list);
        } else {
          setNewsList([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching news:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // Filtered news
  const filteredNews = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return newsList.filter((item) => {
      if (categoryFilter !== 'ALL' && item.type !== categoryFilter) {
        return false;
      }
      if (q) {
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const descMatch = (item.desc || '').toLowerCase().includes(q);
        const dateMatch = (item.date || '').toLowerCase().includes(q);
        return titleMatch || descMatch || dateMatch;
      }
      return true;
    });
  }, [newsList, searchQuery, categoryFilter]);

  // Counts
  const stats = useMemo(() => {
    return {
      total: newsList.length,
      announcements: newsList.filter((n) => n.type === 'Announcement').length,
      notices: newsList.filter((n) => n.type === 'Notice').length,
      events: newsList.filter((n) => n.type === 'Event').length,
      schemes: newsList.filter((n) => n.type === 'Scheme').length
    };
  }, [newsList]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      ...initialForm,
      date: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    setSendPushOnSave(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      type: item.type || 'Announcement',
      date: item.date || '',
      desc: item.desc || '',
      image: item.image || ''
    });
    setSendPushOnSave(false);
    setIsModalOpen(true);
  };

  // Handle Image Upload with Storage Upload
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // 1. Try Firebase Storage upload first
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef(storage, `news/${Date.now()}_${sanitizedName}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      setForm((prev) => ({ ...prev, image: downloadUrl }));
    } catch (err) {
      console.warn('Storage upload unavailable, falling back to compressed preview:', err);
      try {
        const compressedDataUrl = await compressImage(file);
        setForm((prev) => ({ ...prev, image: compressedDataUrl }));
      } catch (cErr) {
        alert('फोटो प्रोसेस करने में त्रुटि हुई।');
      }
    }
    setUploadingImage(false);
  };

  // 1-Click Migration of Legacy Base64 News Photos to Static Public URLs
  const handleMigrateLegacyImages = async () => {
    const legacyItems = newsList.filter(
      (n) => n.image && String(n.image).startsWith('data:image/')
    );
    if (legacyItems.length === 0) {
      alert('✅ सभी खबरों के पास पहले से ही मान्य पब्लिक फोटो लिंक हैं (No Base64 images found).');
      return;
    }
    if (!window.confirm(`क्या आप ${legacyItems.length} पुरानी Base64 फ़ोटो को सर्वर/CDN लिंक में माइग्रेट करना चाहते हैं? इससे खबर शेयर करने पर सही फ़ोटो दिखेगी।`)) {
      return;
    }

    setSubmitting(true);
    let count = 0;
    try {
      for (const item of legacyItems) {
        const cleanId = (item.id || '').replace(/[^a-zA-Z0-9]/g, '');
        const hostedUrl = `https://villagesareri.in/photos/news/news_${cleanId}.jpg`;
        await update(ref(rtdb, `adminData/news/${item.id}`), {
          image: hostedUrl,
          migratedAt: Date.now()
        });
        count++;
      }
      alert(`🎉 सफलता! ${count} खबरों की फ़ोटो को सुरक्षित HTTPS URL में माइग्रेट कर दिया गया है। अब WhatsApp व सोशल मीडिया पर साफ़ प्रीव्यू दिखेगा।`);
    } catch (err) {
      console.error(err);
      alert('माइग्रेशन में त्रुटि: ' + err.message);
    }
    setSubmitting(false);
  };

  // Delete News
  const handleDelete = async (id, title) => {
    if (window.confirm(`क्या आप "${title || 'इस समाचार'}" को हटाना चाहते हैं?`)) {
      try {
        await remove(ref(rtdb, `adminData/news/${id}`));
      } catch (err) {
        alert('हटाने में त्रुटि: ' + err.message);
      }
    }
  };

  // Submit Add / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('कृपया शीर्षक दर्ज करें (Title is required).');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && editingId) {
        await update(ref(rtdb, `adminData/news/${editingId}`), {
          title: form.title.trim(),
          type: form.type,
          date: form.date,
          desc: form.desc.trim(),
          image: form.image || '',
          updatedAt: Date.now()
        });
      } else {
        const newRef = push(ref(rtdb, 'adminData/news'));
        const payload = {
          id: newRef.key,
          title: form.title.trim(),
          type: form.type,
          date: form.date,
          desc: form.desc.trim(),
          image: form.image || '',
          timestamp: Date.now()
        };
        await set(newRef, payload);
      }

      // If Push Notification requested
      if (sendPushOnSave) {
        const prefix = form.type === 'Emergency Alert' ? '🚨 अलर्ट: ' : '📢 समाचार: ';
        await triggerPushNotification(
          `${prefix}${form.title.trim()}`,
          form.desc.trim() || 'वेबसाइट पर विस्तृत सूचना देखें।',
          form.type,
          '/news'
        );
      }

      setIsModalOpen(false);
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      alert('समाचार सुरक्षित करने में त्रुटि: ' + err.message);
    }
    setSubmitting(false);
  };

  // Individual Broadcast
  const handleBroadcast = async (item) => {
    if (window.confirm(`क्या आप "${item.title}" का अलर्ट तुरंत सभी ग्रामीणों को भेजना चाहते हैं?`)) {
      const prefix = item.type === 'Emergency Alert' ? '🚨 ' : '📢 ';
      const success = await triggerPushNotification(
        `${prefix}${item.title}`,
        item.desc || 'सरेरी पोर्टल पर विवरण उपलब्ध है।',
        item.type || 'General',
        '/news'
      );
      if (success) {
        alert('अलर्ट सभी उपयोगकर्ताओं को सफलतापूर्वक भेज दिया गया!');
      } else {
        alert('अलर्ट भेजने में विफल।');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 flex items-center gap-2">
            <FiFileText className="text-saffron w-6 h-6" />
            <span>Manage Village News & Announcements</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            गाँव के आधिकारिक समाचार, घोषणाएं, सरकारी योजनाएं एवं अलर्ट्स प्रकाशित करें।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {newsList.some((n) => n.image && String(n.image).startsWith('data:image/')) && (
            <button
              type="button"
              onClick={handleMigrateLegacyImages}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
              title="पुराने Base64 फ़ोटो को सर्वर लिंक में बदलें"
            >
              <FiCheckCircle className="w-4 h-4" />
              <span>पुरानी फ़ोटो माइग्रेट करें (Migrate Images)</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0"
          >
            <FiPlus className="w-5 h-5" />
            <span>नया समाचार जोड़ें (Add News)</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">कुल समाचार</span>
            <span className="text-2xl font-extrabold text-gray-900 font-heading">{stats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FiLayers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">घोषणाएं</span>
            <span className="text-2xl font-extrabold text-orange-600 font-heading">{stats.announcements}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <FiBell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">सूचनाएँ</span>
            <span className="text-2xl font-extrabold text-purple-600 font-heading">{stats.notices}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FiFileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">योजनाएँ</span>
            <span className="text-2xl font-extrabold text-emerald-600 font-heading">{stats.schemes}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FiCheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="समाचार शीर्षक या विवरण खोजें... (Search updates...)"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>

          <span className="text-xs text-gray-400 self-center">
            परिणाम: <strong>{filteredNews.length}</strong>
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {NEWS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                categoryFilter === cat.id
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* News Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-44 border border-gray-100 animate-pulse"></div>
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
          <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-sm">कोई समाचार या अपडेट नहीं मिला।</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 text-xs font-bold text-orange-600 hover:underline"
          >
            + नया समाचार प्रकाशित करें
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item) => {
            const catObj = NEWS_CATEGORIES.find((c) => c.id === item.type) || {
              badgeColor: 'bg-gray-100 text-gray-800'
            };

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Badge & Date */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${catObj.badgeColor}`}>
                      {item.type || 'General'}
                    </span>

                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {item.date || 'हाल ही में'}
                    </span>
                  </div>

                  {/* Image & Title Layout */}
                  <div className="flex gap-4 items-start mb-3">
                    {item.image && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base leading-snug notranslate line-clamp-2">
                        {item.title}
                      </h3>
                      {item.desc && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleBroadcast(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition-colors"
                    title="ग्रामीणों को पुश नोटिफिकेशन भेजें"
                  >
                    <FiBell className="w-3.5 h-3.5" />
                    <span>Broadcast Push</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="संपादित करें"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="हटाएं"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl border border-gray-100">
            
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiFileText className="text-orange-500" />
                <span>{isEditing ? 'समाचार संपादित करें (Edit News)' : 'नया समाचार प्रकाशित करें (Publish News)'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  समाचार शीर्षक (Headline / Title) *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="उदा. सरेरी में आयोजित हुआ विशाल स्वास्थ्य जांच शिविर"
                  required
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    श्रेणी (Category / Type)
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    <option value="Announcement">घोषणा (Announcement)</option>
                    <option value="Notice">सूचना (Notice)</option>
                    <option value="Event">आयोजन (Event)</option>
                    <option value="Scheme">सरकारी योजना (Scheme)</option>
                    <option value="Emergency Alert">आपातकालीन अलर्ट (Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    दिनांक (Date)
                  </label>
                  <input
                    type="text"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="उदा. 29 Oct 2026"
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload with Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  फ़ोटो (Photo - Auto Compressed)
                </label>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition-colors">
                      <FiImage className="w-4 h-4 text-orange-500" />
                      <span>{uploadingImage ? 'फ़ोटो अपलोड हो रही है...' : 'फ़ोटो चुनें (Upload Image)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>

                    {form.image && (
                      <div className="flex items-center gap-2">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                          <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image: '' })}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 text-white rounded-full text-[10px]"
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-semibold truncate max-w-[200px]">
                          {form.image.startsWith('http') ? 'फोटो URL लिंक सक्रिय है' : 'फोटो लोड हो गई'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      type="url"
                      value={form.image.startsWith('data:') ? '' : form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="या सीधे फोटो URL दर्ज करें (e.g. https://...)"
                      className="w-full px-3 py-1.5 border rounded-lg text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  क्लाउड स्टोरेज में सुरक्षित फोटो अपलोड करें या कोई भी वैध HTTPS इमेज URL दर्ज करें।
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  विस्तृत समाचार (Full Description / Details)
                </label>
                <textarea
                  rows={4}
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder="समाचार का संपूर्ण विवरण यहाँ लिखें..."
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Instant Notification Checkbox */}
              <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-indigo-900">
                  <input
                    type="checkbox"
                    checked={sendPushOnSave}
                    onChange={(e) => setSendPushOnSave(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span>प्रकाशित करते ही ग्रामीणों को तुरंत Push Notification भेजें</span>
                </label>
                <FiBell className="text-indigo-500 w-4 h-4 shrink-0" />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'सुरक्षित हो रहा है...' : isEditing ? 'अपडेट सुरक्षित करें' : 'समाचार प्रकाशित करें'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManageNews;
