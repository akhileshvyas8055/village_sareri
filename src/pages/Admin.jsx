import { useState, useEffect } from 'react';
import { FiTrash2, FiPlus, FiSave, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [news, setNews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('news');

  // Load from local storage
  useEffect(() => {
    const authStatus = sessionStorage.getItem('sareriAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    
    const savedNews = localStorage.getItem('sareriNews');
    if (savedNews) {
      try {
        setNews(JSON.parse(savedNews));
      } catch (e) {
        // use default
      }
    } else {
      setNews([]);
    }

    const savedComplaints = localStorage.getItem('sareriComplaints');
    if (savedComplaints) {
      try {
        setComplaints(JSON.parse(savedComplaints));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'villagesareri56@') {
      setIsAuthenticated(true);
      sessionStorage.setItem('sareriAdminAuth', 'true');
    } else {
      alert('Wrong Password!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sareriAdminAuth');
  };

  const handleAddNews = () => {
    const newItem = {
      id: Date.now(),
      type: 'Announcement',
      title: 'New Update Title',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      desc: 'Update description goes here.'
    };
    setNews([newItem, ...news]);
  };

  const handleDeleteNews = (id) => {
    if(window.confirm('Are you sure you want to delete this update?')) {
      setNews(news.filter(n => n.id !== id));
    }
  };

  const handleUpdateNews = (id, field, value) => {
    setNews(news.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const handleSave = () => {
    localStorage.setItem('sareriNews', JSON.stringify(news));
    alert('News & Updates saved successfully! They are now live on the website.');
  };

  const handleDeleteComplaint = (id) => {
    if(window.confirm('Are you sure you want to delete this complaint?')) {
      const updated = complaints.filter(c => c.id !== id);
      setComplaints(updated);
      localStorage.setItem('sareriComplaints', JSON.stringify(updated));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Panel</h2>
          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron mb-4"
          />
          <button type="submit" className="w-full btn-primary py-2 rounded-lg">
            Login
          </button>
          <div className="mt-4 text-center">
            <Link text-sm text-gray-500 hover:text-saffron to="/">Go back to Home</Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Updates</h1>
            <p className="text-sm text-gray-500">Add, edit or delete village news.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <FiSave /> Save Changes
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('news')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'news' ? 'border-saffron text-saffron' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Manage News
          </button>
          <button 
            onClick={() => setActiveTab('complaints')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'complaints' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            User Complaints
            {complaints.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs py-1 px-2 rounded-full">{complaints.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'news' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">News List</h2>
              <button onClick={handleAddNews} className="flex items-center gap-2 bg-saffron text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                <FiPlus /> Add New Update
              </button>
            </div>

            <div className="space-y-6">
              {news.length === 0 && (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                  No news updates yet. Click "Add New Update" to create one.
                </div>
              )}

              {news.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group">
                  <button 
                    onClick={() => handleDeleteNews(item.id)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Update"
                  >
                    <FiTrash2 />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-10">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Title</label>
                      <input 
                        type="text" 
                        value={item.title} 
                        onChange={(e) => handleUpdateNews(item.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date</label>
                      <input 
                        type="text" 
                        value={item.date} 
                        onChange={(e) => handleUpdateNews(item.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type (Notice/Event/Announcement)</label>
                      <select 
                        value={item.type} 
                        onChange={(e) => handleUpdateNews(item.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron bg-white"
                      >
                        <option value="Notice">Notice</option>
                        <option value="Event">Event</option>
                        <option value="Announcement">Announcement</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                    <textarea 
                      value={item.desc} 
                      onChange={(e) => handleUpdateNews(item.id, 'desc', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron min-h-[100px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Registered Complaints</h2>
            </div>
            <div className="space-y-6">
              {complaints.length === 0 && (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                  No complaints received yet.
                </div>
              )}
              {complaints.map(comp => (
                <div key={comp.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                  <button 
                    onClick={() => handleDeleteComplaint(comp.id)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Complaint"
                  >
                    <FiTrash2 />
                  </button>
                  <div className="flex justify-between items-start mb-4 pr-10">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{comp.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <span className="font-medium text-gray-700">Contact:</span> {comp.contact}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full">{comp.date}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-100 mb-4 whitespace-pre-wrap">
                    {comp.details}
                  </div>
                  {comp.photo && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Attached Evidence</p>
                      <img src={comp.photo} alt="Complaint Evidence" className="max-w-xs rounded-lg border border-gray-200 shadow-sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
