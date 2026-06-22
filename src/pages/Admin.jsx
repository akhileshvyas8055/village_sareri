import { useState, useEffect } from 'react';
import { FiTrash2, FiPlus, FiSave, FiLogOut, FiBell, FiSend } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';
import { collection, addDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [news, setNews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [khelRegistrations, setKhelRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('news');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');
  const [notifyType, setNotifyType] = useState('News Update');

  // Load from Firestore with real-time sync
  useEffect(() => {
    const authStatus = sessionStorage.getItem('sareriAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Real-time listener for News
    const unsubNews = onSnapshot(doc(db, 'adminData', 'news'), (snap) => {
      if (snap.exists()) {
        setNews(snap.data().items || []);
      }
    });

    // Real-time listener for Complaints
    const unsubComplaints = onSnapshot(doc(db, 'adminData', 'complaints'), (snap) => {
      if (snap.exists()) {
        setComplaints(snap.data().items || []);
      }
    });

    // Real-time listener for Khel Registrations
    const unsubRegistrations = onSnapshot(doc(db, 'adminData', 'khelRegistrations'), (snap) => {
      if (snap.exists()) {
        setKhelRegistrations(snap.data().items || []);
      }
    });

    return () => {
      unsubNews();
      unsubComplaints();
      unsubRegistrations();
    };
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

  const sendPushNotification = async (title, body, type = 'General') => {
    try {
      // Store the notification in Firestore for history
      await addDoc(collection(db, 'notifications'), {
        title,
        body,
        type,
        timestamp: new Date().toISOString()
      });

      // Call the completely free Vercel Serverless Function to broadcast the push!
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, type })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send from Serverless API');
      }

      console.log('Push notification triggered successfully:', result);
      return true;
    } catch (error) {
      console.error('Error triggering push notification:', error);
      return false;
    }
  };

  const handleSave = async () => {
    // Save to Firestore (source of truth)
    try {
      await setDoc(doc(db, 'adminData', 'news'), { items: news });
      // Auto-trigger push notification for the latest news
      if (news.length > 0) {
        const latest = news[0];
        await handleCirculateNews(latest, true);
      }
      alert('News & Updates saved successfully!');
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Failed to save. Check your internet connection.');
    }
  };

  const handleCirculateNews = async (item, isSilent = false) => {
    if (isSilent || window.confirm(`Are you sure you want to broadcast "${item.title}" as a Push Notification?`)) {
      let prefix = '';
      if (item.type === 'Emergency Alert') prefix = '🚨 Important Alert: ';
      else if (item.type === 'Event') prefix = '🎉 Event Update: ';
      else if (item.type === 'Announcement') prefix = '📣 Announcement: ';
      else if (item.type === 'Notice') prefix = '📜 Panchayat Notice: ';
      else prefix = '📰 Village News: ';

      const fullTitle = `${prefix}${item.title || 'Update'}`;
      
      const success = await sendPushNotification(fullTitle, item.desc || 'Details are available on the website.', item.type || 'General');
      
      if (!isSilent) {
        if (success) {
          alert('Notification circulated successfully to all users!');
        } else {
          alert('Failed to send notification. Check console for details.');
        }
      }
    }
  };

  const handleManualPush = async (e) => {
    e.preventDefault();
    if (!notifyTitle || !notifyBody) return alert('Please enter both title and message.');
    
    let prefix = '';
    if (notifyType === 'Emergency Alert') prefix = '🚨 Important Alert: ';
    else if (notifyType === 'Event Update') prefix = '🎉 Event Update: ';
    else if (notifyType === 'Festival Announcement') prefix = '🎆 Festival Announcement: ';
    else if (notifyType === 'Panchayat Notice') prefix = '📜 Panchayat Notice: ';
    else prefix = '📰 Village News: ';

    const fullTitle = `${prefix}${notifyTitle}`;
    
    const success = await sendPushNotification(fullTitle, notifyBody, notifyType);
    if (success) {
      alert('Notification sent successfully to all subscribed users!');
      setNotifyTitle('');
      setNotifyBody('');
    } else {
      alert('Failed to send notification. Check console for details.');
    }
  };

  const handleDeleteComplaint = async (id) => {
    if(window.confirm('Are you sure you want to delete this complaint?')) {
      const updated = complaints.filter(c => c.id !== id);
      setComplaints(updated);
      await setDoc(doc(db, 'adminData', 'complaints'), { items: updated });
    }
  };

  const handleDeleteRegistration = async (id) => {
    if(window.confirm('Are you sure you want to delete this registration?')) {
      const updated = khelRegistrations.filter(r => r.id !== id);
      setKhelRegistrations(updated);
      await setDoc(doc(db, 'adminData', 'khelRegistrations'), { items: updated });
    }
  };

  const downloadExcel = (data, filename, type) => {
    if (data.length === 0) {
      alert('No data available to download.');
      return;
    }

    let worksheetData = [];

    if (type === 'khel') {
      worksheetData.push(['ID', 'Team Name', 'Captain Name', 'Contact Number', 'Sport Category', 'Player Names', 'Registration Date']);
      data.forEach(reg => {
        worksheetData.push([
          reg.id || '',
          reg.teamName || '',
          reg.captainName || '',
          reg.contact || '',
          reg.sport || '',
          reg.playerNames || '',
          reg.date || ''
        ]);
      });
    } else if (type === 'complaints') {
      worksheetData.push(['ID', 'Name', 'Contact', 'Date', 'Details']);
      data.forEach(c => {
        worksheetData.push([
          c.id || '',
          c.name || '',
          c.contact || '',
          c.date || '',
          c.details || ''
        ]);
      });
    }

    // Create a new worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Define styles
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "FF9933" } }, // Saffron color
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const cellStyle = {
      alignment: { vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "CCCCCC" } },
        bottom: { style: "thin", color: { rgb: "CCCCCC" } },
        left: { style: "thin", color: { rgb: "CCCCCC" } },
        right: { style: "thin", color: { rgb: "CCCCCC" } }
      }
    };

    // Apply styles to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: R };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        
        if (!worksheet[cellRef]) continue;

        if (R === 0) {
          worksheet[cellRef].s = headerStyle; // Header row
        } else {
          worksheet[cellRef].s = cellStyle; // Data rows
        }
      }
    }

    // Set Column Widths
    if (type === 'khel') {
      worksheet['!cols'] = [
        { wch: 15 }, // ID
        { wch: 25 }, // Team Name
        { wch: 25 }, // Captain Name
        { wch: 15 }, // Contact
        { wch: 20 }, // Sport Category
        { wch: 50 }, // Player Names
        { wch: 20 }  // Registration Date
      ];
      // Set Row Heights (give a bit more space for player names wrap text)
      worksheet['!rows'] = [{ hpt: 30 }]; // Header height
      for(let i = 1; i <= data.length; i++) {
        worksheet['!rows'].push({ hpt: 60 }); // Data rows height
      }
    } else {
      worksheet['!cols'] = [
        { wch: 15 }, // ID
        { wch: 25 }, // Name
        { wch: 15 }, // Contact
        { wch: 15 }, // Date
        { wch: 60 }  // Details
      ];
      worksheet['!rows'] = [{ hpt: 30 }]; // Header height
      for(let i = 1; i <= data.length; i++) {
        worksheet['!rows'].push({ hpt: 60 });
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate buffer and download
    XLSX.writeFile(workbook, `${filename}_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
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
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 mb-8 border-b border-gray-200">
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
          <button 
            onClick={() => setActiveTab('khel')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${activeTab === 'khel' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Khel Registrations
            {khelRegistrations.length > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-600 text-xs py-1 px-2 rounded-full">{khelRegistrations.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'notifications' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <FiBell className="w-4 h-4" /> Push Notifications
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

                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleCirculateNews(item)}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105"
                    >
                      <FiBell className="w-4 h-4" /> Broadcast Notification
                    </button>
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
              <button 
                onClick={() => downloadExcel(complaints, 'Complaints', 'complaints')}
                className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors text-sm font-medium"
              >
                Download Excel Sheet
              </button>
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

        {activeTab === 'khel' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Khel Maha Utsav Registrations</h2>
              <button 
                onClick={() => downloadExcel(khelRegistrations, 'Khel_Registrations', 'khel')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-md shadow-green-600/20"
              >
                Download Excel Sheet
              </button>
            </div>
            <div className="space-y-6">
              {khelRegistrations.length === 0 && (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500">
                  No registrations received yet.
                </div>
              )}
              {khelRegistrations.map(reg => (
                <div key={reg.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative">
                  <button 
                    onClick={() => handleDeleteRegistration(reg.id)}
                    className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Registration"
                  >
                    <FiTrash2 />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Team Name</p>
                      <p className="font-bold text-gray-900">{reg.teamName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Captain Name</p>
                      <p className="font-bold text-gray-900">{reg.captainName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Sport Category</p>
                      <p className="font-bold text-orange-600">{reg.sport}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Contact</p>
                      <p className="text-gray-700">{reg.contact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Registration Date</p>
                      <p className="text-gray-700">{reg.date}</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 mt-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Player List</p>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{reg.playerNames}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Send Push Notification</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">Send an instant alert to all villagers who have allowed notifications on their devices.</p>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-2xl">
              <form onSubmit={handleManualPush} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Message Category</label>
                  <select 
                    value={notifyType}
                    onChange={(e) => setNotifyType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800 font-medium"
                  >
                    <option value="News Update">📰 News Update</option>
                    <option value="Event Update">🎉 Event Update</option>
                    <option value="Festival Announcement">🎆 Festival Announcement</option>
                    <option value="Emergency Alert">🚨 Emergency Alert</option>
                    <option value="Panchayat Notice">📜 Panchayat Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Title</label>
                  <input 
                    type="text"
                    value={notifyTitle}
                    onChange={(e) => setNotifyTitle(e.target.value)}
                    placeholder="e.g. Water supply will be off tomorrow"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 font-medium"
                    maxLength={50}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{notifyTitle.length}/50</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message Body</label>
                  <textarea 
                    value={notifyBody}
                    onChange={(e) => setNotifyBody(e.target.value)}
                    placeholder="Provide detailed information about the alert..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 min-h-[120px] font-medium"
                    maxLength={150}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{notifyBody.length}/150</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5"
                  >
                    <FiSend className="w-5 h-5" />
                    Broadcast Notification Now
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    Notifications are dispatched via Firebase Cloud Messaging to all subscribed phones and computers.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
