import React, { useState, useEffect } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import { FiSave } from 'react-icons/fi';

const ManageUpSarpanch = () => {
  const [data, setData] = useState({
    name: '',
    gender: '',
    mobile: '',
    ward: '',
    termStart: '',
    education: '',
    address: '',
    photo: '',
    additionalDetails: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'panchayat/upSarpanch'), (snap) => {
      if (snap.exists()) setData(snap.val());
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await update(ref(rtdb, 'panchayat/upSarpanch'), data);
      alert('उप-सरपंच विवरण सफलतापूर्वक सुरक्षित किया गया!');
    } catch (err) {
      alert('Error saving data: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">उप-सरपंच विवरण प्रबंधन (Manage Up-Sarpanch)</h3>
        <p className="text-xs text-gray-500 mt-1">
          यदि जानकारी उपलब्ध न हो तो खाली छोड़ें, वेबसाइट पर "जानकारी उपलब्ध नहीं" प्रदर्शित होगा।
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-1">पूरा नाम (Full Name)</label>
          <input
            type="text"
            name="name"
            value={data.name || ''}
            onChange={handleChange}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
            placeholder="उप-सरपंच का नाम दर्ज करें"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">लिंग (Gender)</label>
          <select
            name="gender"
            value={data.gender || ''}
            onChange={handleChange}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
          >
            <option value="">चुनें...</option>
            <option value="Male">पुरुष / Male</option>
            <option value="Female">महिला / Female</option>
            <option value="Other">अन्य / Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">मोबाइल नंबर (Mobile Number)</label>
          <input
            type="tel"
            name="mobile"
            value={data.mobile || ''}
            onChange={handleChange}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
            placeholder="10 अंकों का मोबाइल नंबर"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">प्रतिनिधित्व वार्ड (Ward Number)</label>
          <input
            type="text"
            name="ward"
            value={data.ward || ''}
            onChange={handleChange}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
            placeholder="उदा. वार्ड 5"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">कार्यकाल प्रारंभ (Term Start)</label>
          <input
            type="text"
            name="termStart"
            value={data.termStart || ''}
            onChange={handleChange}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
            placeholder="उदा. 30 अक्टूबर 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">फोटो URL (Photo URL - Optional)</label>
          <input
            type="url"
            name="photo"
            value={data.photo || ''}
            onChange={handleChange}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
            placeholder="https://... (वैकल्पिक)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">शैक्षणिक योग्यता (Education)</label>
          <input
            type="text"
            name="education"
            value={data.education || ''}
            onChange={handleChange}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
            placeholder="उदा. स्नातक / Graduate"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">पता / निवास (Address)</label>
          <input
            type="text"
            name="address"
            value={data.address || ''}
            onChange={handleChange}
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
            placeholder="उदा. ब्राह्मणों की सरेरी"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">अतिरिक्त विवरण (Additional Details - Optional)</label>
          <textarea
            name="additionalDetails"
            value={data.additionalDetails || ''}
            onChange={handleChange}
            rows="2"
            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-[#135334] text-sm"
            placeholder="कोई अन्य सार्वजनिक सूचना या दायित्व..."
          ></textarea>
        </div>

        <div className="md:col-span-2 flex justify-end mt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#135334] hover:bg-[#0e3e26] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'सुरक्षित हो रहा है...' : 'परिवर्तन सुरक्षित करें'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageUpSarpanch;
