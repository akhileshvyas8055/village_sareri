import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { rtdb } from '../../firebase';
import { sendNotificationRequest } from '../../services/notificationApi';
import {
  FiTrash2,
  FiPlus,
  FiEdit2,
  FiUpload,
  FiImage,
  FiX,
  FiCalendar,
  FiFileText,
  FiDownload,
  FiBell,
  FiSearch,
  FiCheckCircle
} from 'react-icons/fi';

const NOTICE_CATEGORIES = [
  'आधिकारिक सूचना',
  'ग्राम सभा बैठक',
  'पेयजल व स्वच्छता',
  'विद्युत आपूर्ति',
  'सरकारी योजना व लाभ',
  'सड़क व विकास कार्य',
  'निविदा व नीलामी (Tender)',
  'स्वास्थ्य व चिकित्सा शिविर',
  'शिक्षा व छात्रवृत्ति'
];

// Helper to compress image to max 120KB DataURL
const compressNoticeImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith('image/')) {
      return reject(new Error('कृपया केवल फ़ोटो फ़ाइल चुनें (Please select an image file).'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const scaleSize = MAX_WIDTH / Math.max(img.width, MAX_WIDTH);
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(new Error('फ़ोटो लोड करने में विफल: ' + err.message));
    };
    reader.onerror = (err) => reject(new Error('फ़ाइल पढ़ने में विफल: ' + err.message));
  });
};

// Push notification trigger
const triggerNoticeNotification = async (title, body, type = 'Panchayat Notice', link = '/notices') => {
  try {
    return await sendNotificationRequest({ title, body, type, link, audience: 'all' });
  } catch (error) {
    console.error('Error triggering notice notification:', error);
    return { success: false, error: error.message };
  }
};

const notificationResultMessage = (result) => {
  if (!result || !result.totalTargetedDevices) return 'No active subscribers matched this audience.';
  return `FCM accepted ${result.fcmAcceptedCount || 0} of ${result.totalTargetedDevices} requests; ${result.failedCount || 0} failed. Device delivery is unconfirmed.`;
};

const ManageNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Helper for today's readable date
  const getTodayDateString = () => {
    try {
      return new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const initialFormState = {
    title: '',
    category: 'आधिकारिक सूचना',
    date: getTodayDateString(),
    description: '',
    imageUrl: '',
    pdfLink: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Listen to notices in RTDB
  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'panchayat/notices'), (snap) => {
      const data = snap.val();
      if (data) {
        let list = [];
        if (Array.isArray(data)) {
          list = data.filter(Boolean).map((item, idx) => ({ id: item.id || String(idx), ...item }));
        } else if (typeof data === 'object') {
          list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        }
        list.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
        setNotices(list);
      } else {
        setNotices([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressedDataUrl = await compressNoticeImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err) {
      alert('फ़ोटो अपलोड में त्रुटि: ' + err.message);
    }
    setCompressing(false);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  // Start Edit
  const handleStartEdit = (notice) => {
    setIsEditing(true);
    setEditingId(notice.id);
    setFormData({
      title: notice.title || '',
      category: notice.category || 'आधिकारिक सूचना',
      date: notice.date || '',
      description: notice.description || '',
      imageUrl: notice.imageUrl || notice.image || '',
      pdfLink: notice.pdfLink || ''
    });
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Save / Submit Notice
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('कृपया सूचना का शीर्षक दर्ज करें।');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category || 'आधिकारिक सूचना',
        date: formData.date.trim() || getTodayDateString(),
        description: formData.description?.trim() || '',
        imageUrl: formData.imageUrl || '',
        pdfLink: formData.pdfLink?.trim() || '',
        updatedAt: Date.now()
      };

      if (isEditing && editingId) {
        await update(ref(rtdb, `panchayat/notices/${editingId}`), payload);
        alert('सूचना सफलतापूर्वक अपडेट हो गई! (Notice updated successfully)');
      } else {
        const newRef = push(ref(rtdb, 'panchayat/notices'));
        await update(newRef, {
          ...payload,
          id: newRef.key,
          createdAt: Date.now()
        });

        // Trigger push notification for new notice
        const sendNotif = window.confirm(`क्या आप इस सूचना "${payload.title}" का अलर्ट सभी ग्रामीणों को भेजना चाहते हैं?`);
        let pushResult = null;
        if (sendNotif) {
          pushResult = await triggerNoticeNotification(
            `📢 पंचायत सूचना: ${payload.title}`,
            `${payload.category} • ${payload.date} - विस्तृत विवरण देखने के लिए क्लिक करें`,
            'Panchayat Notice',
            '/notices'
          );
        }

        alert(`नई सूचना सफलतापूर्वक जारी हो गई! (Notice published successfully)${pushResult ? `\n${notificationResultMessage(pushResult)}` : ''}`);
      }

      setFormData(initialFormState);
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      alert('Error saving notice: ' + err.message);
    }
    setSaving(false);
  };

  // Delete Notice
  const handleDelete = async (id, title) => {
    if (window.confirm(`क्या आप इस सूचना "${title || 'सूचना'}" को हटाना चाहते हैं?`)) {
      try {
        await remove(ref(rtdb, `panchayat/notices/${id}`));
      } catch (err) {
        alert('Error deleting notice: ' + err.message);
      }
    }
  };

  // Filtered notices
  const filteredNotices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notices;
    return notices.filter((n) =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.category || '').toLowerCase().includes(q) ||
      (n.description || '').toLowerCase().includes(q)
    );
  }, [notices, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Add / Edit Form Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center font-bold">
              {isEditing ? <FiEdit2 className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {isEditing ? 'सूचना संपादित करें (Edit Notice)' : 'नई पंचायत सूचना जारी करें (Publish Notice)'}
              </h3>
              <p className="text-xs text-slate-500">
                ग्राम पंचायत का आधिकारिक नोटिस बोर्ड, परिपत्र अथवा फोटो सूचना अपलोड करें।
              </p>
            </div>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
            >
              <FiX className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                सूचना का शीर्षक (Notice Title) *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="उदा. ग्राम सभा की आवश्यक बैठक बाबत / पेयजल आपूर्ति का नया समय"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                श्रेणी / विभाग (Category)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6B00] focus:outline-none bg-white"
              >
                {NOTICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                जारी दिनांक (Notice Date)
              </label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                placeholder="उदा. 29 Oct 2026"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                सूचना का विस्तृत विवरण (Description / Details)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="सूचना का पूरा ब्यौरा यहाँ लिखें, जैसे बैठक का समय, स्थान, आवश्यक निर्देश..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              ></textarea>
            </div>

            {/* PHOTO / IMAGE UPLOAD FIELD */}
            <div className="md:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5">
                <FiImage className="w-4 h-4 text-[#FF6B00]" />
                <span>सूचना फ़ोटो / परिपत्र की तस्वीर (Notice Photo / Circular Document Image)</span>
              </label>
              <p className="text-xs text-slate-500 mb-3">
                यदि सूचना की लिखित प्रति या आदेश पत्र की फ़ोटो है, तो उसे यहाँ अपलोड करें। यह स्वतः कंप्रेस होकर सुरक्षित हो जाएगी।
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Upload Button */}
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-[#FF6B00] border-2 border-dashed border-[#FF6B00]/40 text-xs font-bold transition-colors shadow-2xs">
                  <FiUpload className="w-4 h-4" />
                  <span>{compressing ? 'फ़ोटो प्रोसेस हो रही है...' : 'फ़ोटो चुनें या कैमरा से खींचे (Upload Photo)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={compressing}
                    className="hidden"
                  />
                </label>

                {/* Optional Direct URL */}
                <span className="text-xs text-slate-400">अथवा</span>

                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                  onChange={handleChange}
                  placeholder="फ़ोटो URL लिंक (Optional Image URL)"
                  className="flex-1 w-full sm:w-auto px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#FF6B00] focus:outline-none bg-white"
                />
              </div>

              {/* Photo Preview Thumbnail */}
              {formData.imageUrl && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center gap-4">
                  <div className="relative w-28 h-28 rounded-xl border-2 border-orange-200 overflow-hidden bg-white shadow-sm shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Notice Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      <FiCheckCircle className="w-3.5 h-3.5" /> फ़ोटो सफलतापूर्वक संलग्न
                    </span>
                    <p className="text-[11px] text-slate-400">
                      यह फ़ोटो सूचना पट्ट और मुख्य पृष्ठ पर ग्रामीणों को दिखाई देगी।
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 pt-1"
                    >
                      <FiX className="w-3.5 h-3.5" /> फ़ोटो हटाएं (Remove)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PDF / Document Link */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                दस्तावेज़ / PDF लिंक (Document Link - Optional)
              </label>
              <input
                type="url"
                name="pdfLink"
                value={formData.pdfLink}
                onChange={handleChange}
                placeholder="Google Drive, PDF अथवा सरकारी पोर्टल लिंक (e.g. https://...)"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
              />
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                रद्द करें (Cancel)
              </button>
            )}
            <button
              type="submit"
              disabled={saving || compressing}
              className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-orange-700 disabled:bg-slate-400 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              {isEditing ? <FiCheckCircle className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
              <span>{saving ? 'सुरक्षित हो रहा है...' : isEditing ? 'परिवर्तन सुरक्षित करें (Save Changes)' : 'सूचना प्रकाशित करें (Publish Notice)'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* List Existing Notices */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              प्रकाशित सूचनाएँ (Existing Notices)
            </h3>
            <p className="text-xs text-slate-500">
              डिजिटल सूचना पट्ट पर सक्रिय सभी आधिकारिक सूचनाओं की सूची।
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="सूचना खोजें..."
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] w-44 sm:w-56"
              />
            </div>
            <span className="text-xs bg-slate-100 px-3 py-1.5 rounded-xl text-slate-700 font-bold shrink-0">
              कुल: {notices.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl">
            <FiFileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">कोई सूचना नहीं मिली</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {searchQuery ? 'सर्च फ़िल्टर रीसेट करें।' : 'ऊपर दिए फॉर्म से पहली सूचना जोड़ें।'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotices.map((notice) => {
              const noticeImg = notice.imageUrl || notice.image;

              return (
                <div
                  key={notice.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-200/90 rounded-2xl hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Thumbnail Photo if exists */}
                    {noticeImg ? (
                      <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                        <img
                          src={noticeImg}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-orange-50 text-[#FF6B00] flex items-center justify-center shrink-0 border border-orange-100">
                        <FiFileText className="w-6 h-6" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#0D477A] border border-blue-200">
                          {notice.category || 'आधिकारिक'}
                        </span>
                        {notice.date && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <FiCalendar className="w-3 h-3 text-slate-400" />
                            {notice.date}
                          </span>
                        )}
                        {noticeImg && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <FiImage className="w-3 h-3" /> फ़ोटो संलग्न
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                        {notice.title}
                      </h4>

                      {notice.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {notice.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {notice.pdfLink && (
                      <a
                        href={notice.pdfLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-semibold"
                        title="दस्तावेज़ खोलें"
                      >
                        <FiDownload className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStartEdit(notice)}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors text-xs font-semibold flex items-center gap-1"
                      title="संपादित करें"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">संपादित करें</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(notice.id, notice.title)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors text-xs font-semibold flex items-center gap-1"
                      title="हटाएं"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">हटाएं</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageNotices;
