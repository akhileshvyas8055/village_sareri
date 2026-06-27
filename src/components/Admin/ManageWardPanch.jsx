import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { rtdb } from '../../firebase';
import { FiTrash2, FiEdit2, FiPlus, FiX } from 'react-icons/fi';

const ManageWardPanch = () => {
  const [panches, setPanches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', gender: '', ward: '', mobile: '', address: '', status: 'active'
  });

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'panchayat/wardPanches'), (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setPanches(list.sort((a, b) => parseInt(a.ward || 0) - parseInt(b.ward || 0)));
      } else {
        setPanches([]);
      }
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', gender: '', ward: '', mobile: '', address: '', status: 'active' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (panch) => {
    setFormData(panch);
    setEditingId(panch.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Ward Panch?')) {
      try {
        await remove(ref(rtdb, `panchayat/wardPanches/${id}`));
      } catch (err) {
        alert('Error deleting: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update(ref(rtdb, `panchayat/wardPanches/${editingId}`), formData);
      } else {
        await push(ref(rtdb, 'panchayat/wardPanches'), formData);
      }
      resetForm();
    } catch (err) {
      alert('Error saving data: ' + err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Manage Ward Panches</h3>
        <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2 bg-[#1A5C2A] text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
          <FiPlus /> Add New
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 font-semibold text-gray-600">Ward</th>
              <th className="p-3 font-semibold text-gray-600">Name</th>
              <th className="p-3 font-semibold text-gray-600">Gender</th>
              <th className="p-3 font-semibold text-gray-600">Mobile</th>
              <th className="p-3 font-semibold text-gray-600">Status</th>
              <th className="p-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {panches.map((panch) => (
              <tr key={panch.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{panch.ward}</td>
                <td className="p-3 font-medium">{panch.name}</td>
                <td className="p-3 text-sm">{panch.gender}</td>
                <td className="p-3 text-sm">{panch.mobile}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${panch.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {panch.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => handleEdit(panch)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(panch.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {panches.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">No Ward Panches added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={resetForm} className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full">
              <FiX className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Ward Panch' : 'Add Ward Panch'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ward Number</label>
                  <input type="number" value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value})} className="w-full p-2 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-2 border rounded-lg" required>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Mobile</label>
                  <input type="tel" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows="2" className="w-full p-2 border rounded-lg"></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#1A5C2A] text-white rounded-lg hover:bg-green-800">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWardPanch;
