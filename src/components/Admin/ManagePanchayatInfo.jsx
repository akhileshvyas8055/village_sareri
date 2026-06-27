import React, { useState, useEffect } from 'react';
import { ref, update, onValue } from 'firebase/database';
import { rtdb } from '../../firebase';
import { FiSave } from 'react-icons/fi';

const ManagePanchayatInfo = () => {
  const [data, setData] = useState({
    panchayatName: 'Brahmano Ki Sareri', block: '', district: '', state: 'Rajasthan',
    totalWards: '', population: '', bplFamilies: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'panchayat/info'), (snap) => {
      if (snap.exists()) setData({ ...data, ...snap.val() });
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await update(ref(rtdb, 'panchayat/info'), data);
      alert('Panchayat Info saved successfully!');
    } catch (err) {
      alert('Error saving data: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold mb-6">Manage Panchayat Details</h3>
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Panchayat Name</label>
          <input type="text" name="panchayatName" value={data.panchayatName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Block / Tehsil</label>
          <input type="text" name="block" value={data.block} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">District</label>
          <input type="text" name="district" value={data.district} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">State</label>
          <input type="text" name="state" value={data.state} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Total Wards</label>
          <input type="number" name="totalWards" value={data.totalWards} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Total Population (Approx)</label>
          <input type="text" name="population" value={data.population} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Total BPL Families</label>
          <input type="text" name="bplFamilies" value={data.bplFamilies} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#1A5C2A]" />
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

export default ManagePanchayatInfo;
