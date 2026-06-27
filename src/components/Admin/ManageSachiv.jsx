import React, { useState, useEffect } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import { FiSave } from 'react-icons/fi';

const ManageSachiv = () => {
  const [data, setData] = useState({
    name: '', mobile: '', email: '', officeTimings: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'panchayat/sachiv'), (snap) => {
      if (snap.exists()) setData(snap.val());
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await update(ref(rtdb, 'panchayat/sachiv'), data);
      alert('Sachiv details saved successfully!');
    } catch (err) {
      alert('Error saving data: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold mb-6">Manage Sachiv (VDO) Info</h3>
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input type="text" name="name" value={data.name} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Mobile Number</label>
          <input type="tel" name="mobile" value={data.mobile} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email Address (Optional)</label>
          <input type="email" name="email" value={data.email} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Office Timings</label>
          <input type="text" name="officeTimings" value={data.officeTimings} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" placeholder="e.g. 10:00 AM - 5:00 PM" />
        </div>
        
        <div className="md:col-span-2 flex justify-end mt-4">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#1A5C2A] hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManageSachiv;
