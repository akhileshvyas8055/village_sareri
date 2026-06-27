import React, { useState, useEffect } from 'react';
import { ref, onValue, push, remove } from 'firebase/database';
import { rtdb } from '../../firebase';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const ManageNotices = () => {
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', description: '', pdfLink: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, 'panchayat/notices'), (snap) => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
        setNotices(list.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setNotices([]);
      }
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await push(ref(rtdb, 'panchayat/notices'), {
        ...formData,
        createdAt: Date.now()
      });
      setFormData({ title: '', date: '', description: '', pdfLink: '' });
      alert('Notice added successfully!');
    } catch (err) {
      alert('Error adding notice: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await remove(ref(rtdb, `panchayat/notices/${id}`));
      } catch (err) {
        alert('Error deleting: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Notice Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold mb-6 text-[#FF6B00]">Add New Notice</h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Notice Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Date</label>
            <input type="text" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]" placeholder="e.g. 15 Jan 2024" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">Description (Optional)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]"></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-1">PDF Link (Optional)</label>
            <input type="url" name="pdfLink" value={formData.pdfLink} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#FF6B00]" placeholder="Google Drive or PDF URL" />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#FF6B00] hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              <FiPlus /> {saving ? 'Adding...' : 'Add Notice'}
            </button>
          </div>
        </form>
      </div>

      {/* List Notices */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Existing Notices</h3>
          <span className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">Total: {notices.length}</span>
        </div>
        
        {notices.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notices found.</p>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="flex justify-between items-start p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-gray-900">{notice.title}</h4>
                  <p className="text-sm text-gray-500">{notice.date}</p>
                  {notice.description && <p className="text-sm mt-1 text-gray-700">{notice.description}</p>}
                  {notice.pdfLink && (
                    <a href={notice.pdfLink} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] text-sm mt-2 block hover:underline">
                      View Document
                    </a>
                  )}
                </div>
                <button onClick={() => handleDelete(notice.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageNotices;
