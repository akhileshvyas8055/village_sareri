import { useState, useEffect } from 'react';
import { ref, onValue, set, remove, push } from 'firebase/database';
import { rtdb } from '../../firebase';
import { FiTrash2, FiPlus, FiSave, FiImage, FiAward } from 'react-icons/fi';

const ManageAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [uploadingImageId, setUploadingImageId] = useState(null);

  useEffect(() => {
    const achRef = ref(rtdb, 'adminData/achievements');
    const unsub = onValue(achRef, (snap) => {
      const data = snap.val();
      if (data) {
        setAchievements(Object.values(data).sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setAchievements([]);
      }
    });
    return () => unsub();
  }, []);

  const handleAdd = () => {
    const newRef = push(ref(rtdb, 'adminData/achievements'));
    const newItem = {
      id: newRef.key,
      title: 'UPSC Selected',
      name: 'New Achiever Name',
      category: 'Education',
      year: new Date().getFullYear().toString(),
      desc: 'Short description of the achievement...',
      image: '',
      timestamp: Date.now()
    };
    set(newRef, newItem);
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this achievement?')) {
      remove(ref(rtdb, `adminData/achievements/${id}`));
    }
  };

  const handleUpdate = (id, field, value) => {
    const updated = achievements.map(a => a.id === id ? { ...a, [field]: value } : a);
    setAchievements(updated);
  };

  const handleImageUpload = (id, file) => {
    if (!file) return;
    if (file.size > 150 * 1024) {
      alert('❌ File is too large! Please compress the image to under 150 KB.');
      return;
    }

    setUploadingImageId(id);
    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdate(id, 'image', reader.result);
      setUploadingImageId(null);
    };
    reader.onerror = () => {
      alert('Error reading file!');
      setUploadingImageId(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const updates = {};
      achievements.forEach(a => {
        updates[a.id] = a;
      });
      await set(ref(rtdb, 'adminData/achievements'), updates);
      alert('Achievements saved successfully!');
    } catch (error) {
      console.error('Error saving achievements:', error);
      alert('Failed to save. Error: ' + error.message);
    }
  };

  const categories = ['Education', 'Sports', 'Social Work', 'Panchayat', 'Military/Police', 'Other'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 notranslate">
          <FiAward className="text-yellow-500" />
          Manage Pride of Sareri
        </h2>
        <div className="flex gap-3">
          <button onClick={handleAdd} className="flex items-center gap-2 bg-saffron text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm">
            <FiPlus /> Add Achiever
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            <FiSave /> Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {achievements.length === 0 && (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
            No achievements added yet.
          </div>
        )}

        {achievements.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
            <button 
              onClick={() => handleDelete(item.id)}
              className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <FiTrash2 />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Achiever Name</label>
                <input 
                  type="text" 
                  value={item.name} 
                  onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Achievement Title</label>
                <input 
                  type="text" 
                  value={item.title} 
                  onChange={(e) => handleUpdate(item.id, 'title', e.target.value)}
                  placeholder="e.g. Gold Medal in State Boxing"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category</label>
                <select 
                  value={item.category} 
                  onChange={(e) => handleUpdate(item.id, 'category', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron bg-gray-50"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Year</label>
                <input 
                  type="text" 
                  value={item.year} 
                  onChange={(e) => handleUpdate(item.id, 'year', e.target.value)}
                  placeholder="e.g. 2024"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron bg-gray-50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description (Optional)</label>
              <textarea 
                value={item.desc} 
                onChange={(e) => handleUpdate(item.id, 'desc', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron bg-gray-50 h-20"
                placeholder="Details about the achievement..."
              />
            </div>

            <div className="flex items-end gap-4 border-t border-gray-100 pt-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Photo (Max 150KB)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(item.id, e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-saffron hover:file:bg-orange-100"
                />
              </div>
              
              <div className="w-20 h-20 shrink-0 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                {uploadingImageId === item.id ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-saffron"></div>
                ) : item.image ? (
                  <img src={item.image} alt="Achiever" className="w-full h-full object-cover" />
                ) : (
                  <FiImage className="text-gray-400 w-6 h-6" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAchievements;
