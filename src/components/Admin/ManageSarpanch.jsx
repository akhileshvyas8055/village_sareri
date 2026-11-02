import React, { useState, useEffect, useRef } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import {
  FiSave,
  FiUpload,
  FiImage,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiPhone,
  FiCalendar,
  FiBookOpen,
  FiMapPin
} from 'react-icons/fi';

const ManageSarpanch = () => {
  const [data, setData] = useState({
    name: '',
    gender: 'Male',
    mobile: '',
    ward: '0',
    termStart: '',
    education: '',
    address: '',
    photo: ''
  });
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'panchayat/sarpanch'), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setData((prev) => ({
          ...prev,
          ...val,
          // ensure string fields
          photo: val.photo || '',
          name: val.name || '',
          gender: val.gender || 'Male',
          mobile: val.mobile || '',
          ward: val.ward || '0',
          termStart: val.termStart || '',
          education: val.education || '',
          address: val.address || ''
        }));
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setStatusMessage({ type: '', text: '' });
  };

  // Process and compress image file while preserving PNG transparency
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'कृपया केवल इमेज फाइल (PNG, JPG, WEBP) चुनें।' });
      return;
    }

    setProcessingImage(true);
    setStatusMessage({ type: '', text: '' });

    const isPng = file.type === 'image/png';
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // For PNG, use image/png to retain transparency for cutouts
        let dataUrl;
        if (isPng) {
          dataUrl = canvas.toDataURL('image/png');
        } else {
          dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        }

        setData((prev) => ({ ...prev, photo: dataUrl }));
        setProcessingImage(false);
        setStatusMessage({
          type: 'success',
          text: `फोटो सफलतापूर्वक लोड हुई (${isPng ? 'पारदर्शी PNG कटआउट' : 'JPG/इमेज'})। सुरक्षित करने के लिए नीचे 'विवरण सुरक्षित करें' पर क्लिक करें।`
        });
      };
      img.onerror = () => {
        setProcessingImage(false);
        setStatusMessage({ type: 'error', text: 'इमेज लोड करने में त्रुटि हुई।' });
      };
    };

    reader.onerror = () => {
      setProcessingImage(false);
      setStatusMessage({ type: 'error', text: 'फाइल पढ़ने में त्रुटि हुई।' });
    };

    reader.readAsDataURL(file);
  };

  const handleResetToDefaultPhoto = () => {
    setData((prev) => ({ ...prev, photo: '/sarpanch.png' }));
    setStatusMessage({
      type: 'info',
      text: "फोटो को डिफ़ॉल्ट कटआउट (/sarpanch.png) पर सेट किया गया है। सेव करने के लिए 'विवरण सुरक्षित करें' पर क्लिक करें।"
    });
  };

  const handleClearPhoto = () => {
    setData((prev) => ({ ...prev, photo: '' }));
    setStatusMessage({
      type: 'info',
      text: "फोटो खाली कर दी गई है। वेबसाइट पर डिफ़ॉल्ट कटआउट स्वतः उपयोग होगा।"
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: '', text: '' });

    try {
      await update(ref(rtdb, 'panchayat/sarpanch'), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      setStatusMessage({
        type: 'success',
        text: 'सरपंच विवरण व फोटो सफलतापूर्वक सुरक्षित किए गए!'
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'डाटा सुरक्षित करने में त्रुटि: ' + err.message
      });
    }
    setSaving(false);
  };

  // Determine current active photo for preview
  const currentPhoto = data.photo?.trim() || '/sarpanch.png';

  return (
    <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-gray-200/90">
      <div className="mb-6 pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[#135334] flex items-center gap-2">
            <span>👑</span>
            <span>सरपंच प्रोफाइल एवं फोटो प्रबंधन</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            ग्राम पंचायत सरपंच का नाम, संपर्क, फोटो / कटआउट एवं अन्य विवरण अपडेट करें।
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#135334] border border-emerald-200 self-start sm:self-auto">
          Gram Panchayat Sarpanch Admin
        </span>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage.text && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-[#135334] border border-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <FiCheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* TOP SECTION: SARPANCH PHOTO & CUTOUT MANAGEMENT */}
        <div className="bg-[#FAF9F5] p-4 sm:p-5 rounded-2xl border-2 border-emerald-900/15">
          <div className="flex items-center gap-2 mb-3">
            <FiImage className="w-4 h-4 text-[#135334]" />
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
              सरपंच फोटो / कटआउट प्रबंधन (Sarpanch Photo / Cutout)
            </h4>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Live Cutout Preview on Card Background */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-44 h-56 sm:w-48 sm:h-64 rounded-2xl bg-gradient-to-b from-[#FCFBF7] to-[#F2F7F2] border-2 border-[#135334]/30 shadow-md p-2 flex items-center justify-center relative overflow-hidden group">
                <img
                  src={currentPhoto}
                  alt="Sarpanch Preview"
                  className="w-full h-full object-contain object-bottom drop-shadow-lg transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/sarpanch.png';
                  }}
                />

                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#135334] text-white shadow-xs">
                  लाइव प्रीव्यू
                </span>
              </div>

              <span className="text-[11px] text-gray-500 font-medium mt-2 text-center block">
                वेबसाइट पर दिखने वाला कटआउट
              </span>
            </div>

            {/* Upload Controls & URL */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  1. कंप्यूटर / मोबाइल से फोटो अपलोड करें
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processingImage}
                    className="px-4 py-2.5 rounded-xl bg-[#135334] hover:bg-[#0C3822] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50"
                  >
                    <FiUpload className="w-4 h-4" />
                    <span>{processingImage ? 'प्रोसेसिंग...' : 'नई फोटो / कटआउट चुनें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToDefaultPhoto}
                    className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 border border-gray-300 transition-colors shadow-2xs"
                    title="मूल डिफ़ॉल्ट कटआउट (/sarpanch.png) पर सेट करें"
                  >
                    <FiRefreshCw className="w-3.5 h-3.5 text-gray-500" />
                    <span>डिफ़ॉल्ट कटआउट रीसेट करें</span>
                  </button>

                  {data.photo && data.photo !== '/sarpanch.png' && (
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 border border-rose-200 transition-colors"
                      title="फोटो खाली करें"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      <span>हटाएं</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                  💡 <strong>टिप:</strong> पारदर्शी बैकग्राउंड वाली PNG फोटो (Transparent Cutout) पोर्टल पर सबसे भव्य और प्रभावशाली दिखती है।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  2. या सीधे इमेज URL / पाथ दर्ज करें (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="photo"
                    value={data.photo || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#135334] text-xs font-mono text-gray-800"
                    placeholder="उदा. /sarpanch.png या https://example.com/photo.png"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  यदि यह खाली छोड़ दिया जाता है, तो डिफ़ॉल्ट कटआउट <code>/sarpanch.png</code> उपयोग होगा।
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-[#135334]" />
              <span>सरपंच का पूरा नाम (Full Name) *</span>
            </label>
            <input
              type="text"
              name="name"
              value={data.name || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#135334] text-sm font-bold text-gray-900"
              placeholder="मुकेश कुमार तिवारी (Mukesh Kumar Tiwari)"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              लिंग (Gender)
            </label>
            <select
              name="gender"
              value={data.gender || 'Male'}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#135334] text-sm"
            >
              <option value="Male">पुरुष (Male)</option>
              <option value="Female">महिला (Female)</option>
              <option value="Other">अन्य (Other)</option>
            </select>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiPhone className="w-3.5 h-3.5 text-emerald-600" />
              <span>मोबाइल नंबर (Mobile Number)</span>
            </label>
            <input
              type="tel"
              name="mobile"
              value={data.mobile || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#135334] text-sm"
              placeholder="10 अंकों का मोबाइल नंबर"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              यह नंबर वेबसाइट पर सीधे कॉल करने के लिए उपयोग होगा।
            </span>
          </div>

          {/* Ward Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              वार्ड संख्या / पद स्थिति
            </label>
            <input
              type="text"
              name="ward"
              value={data.ward || '0'}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#135334] text-sm"
              placeholder="0 = ग्राम पंचायत प्रधान"
            />
          </div>

          {/* Term Start Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>कार्यकाल प्रारंभ तिथि (Term Start Date)</span>
            </label>
            <input
              type="text"
              name="termStart"
              value={data.termStart || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#135334] text-sm"
              placeholder="उदा. 30 अक्टूबर 2026"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiBookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>शैक्षणिक योग्यता (Education)</span>
            </label>
            <input
              type="text"
              name="education"
              value={data.education || ''}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#135334] text-sm"
              placeholder="उदा. स्नातक / Graduate"
            />
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>स्थायी निवास / पता (Address)</span>
            </label>
            <textarea
              name="address"
              value={data.address || ''}
              onChange={handleChange}
              rows="2"
              className="w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#135334] text-sm"
              placeholder="उदा. ब्राह्मणों की सरेरी (भीलवाड़ा, राजस्थान)"
            ></textarea>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            परिवर्तन सुरक्षित करने पर वेबसाइट पर वास्तविक समय (Realtime) में अपडेट दिखाई देगा।
          </p>

          <button
            type="submit"
            disabled={saving || processingImage}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#135334] hover:bg-[#0C3822] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'सुरक्षित हो रहा है...' : 'सरपंच विवरण सुरक्षित करें (Save Details)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageSarpanch;
