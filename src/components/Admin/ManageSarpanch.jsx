import React, { useState, useEffect } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import { FiSave } from 'react-icons/fi';

const ManageSarpanch = () => {
  const [data, setData] = useState({
    name: '', gender: '', mobile: '', ward: '0', termStart: '', education: '', address: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'panchayat/sarpanch'), (snap) => {
      if (snap.exists()) setData(snap.val());
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await update(ref(rtdb, 'panchayat/sarpanch'), data);
      alert('Sarpanch details saved successfully!');
    } catch (err) {
      alert('Error saving data: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold mb-6">Manage Sarpanch Info</h3>
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input type="text" name="name" value={data.name} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Gender</label>
          <select name="gender" value={data.gender} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]">
            <option value="">Select...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Mobile Number</label>
          <input type="tel" name="mobile" value={data.mobile} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Ward Number</label>
          <input type="text" name="ward" value={data.ward} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]" placeholder="0 = Gram Panchayat Head" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Term Start Date</label>
          <input type="text" name="termStart" value={data.termStart} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]" placeholder="e.g. Jan 2024" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Education</label>
          <input type="text" name="education" value={data.education} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-1">Address</label>
          <textarea name="address" value={data.address} onChange={handleChange} rows="2" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]"></textarea>
        </div>
        <div className="md:col-span-2 flex justify-end mt-4">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#FF6B00] hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageSarpanch;
