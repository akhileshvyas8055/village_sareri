import { useState, useEffect } from 'react';
import { FiTrash2, FiPlus, FiSave, FiLogOut, FiBell, FiSend, FiEye, FiEyeOff, FiMenu, FiX, FiMessageSquare, FiActivity, FiPieChart, FiUsers, FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';
import { collection, addDoc } from 'firebase/firestore';
import { ref, onValue, set, remove, push, get } from 'firebase/database';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, rtdb } from '../firebase';
import PanchayatAdmin from '../components/Admin/PanchayatAdmin';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [news, setNews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [khelRegistrations, setKhelRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('news');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');
  const [notifyType, setNotifyType] = useState('News Update');
  const [isSending, setIsSending] = useState(false);

  // Poll State
  const [pollData, setPollData] = useState(null);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);

  // Load from Firestore with real-time sync
  useEffect(() => {
    const authStatus = sessionStorage.getItem('sareriAdminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Real-time listener for News
    const unsubNews = onValue(ref(rtdb, 'adminData/news'), (snap) => {
      const data = snap.val();
      if (data) {
        setNews(Object.values(data).sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setNews([]);
      }
    });

    // Real-time listener for Complaints
    const unsubComplaints = onValue(ref(rtdb, 'adminData/complaints'), (snap) => {
      const data = snap.val();
      if (data) {
        setComplaints(Object.values(data).reverse());
      } else {
        setComplaints([]);
      }
    });

    // Real-time listener for Khel Registrations
    const unsubRegistrations = onValue(ref(rtdb, 'adminData/khelRegistrations'), (snap) => {
      const data = snap.val();
      if (data) {
        setKhelRegistrations(Object.values(data).reverse());
      } else {
        setKhelRegistrations([]);
      }
    });

    // Real-time listener for Poll
    const unsubPoll = onValue(ref(rtdb, 'adminData/poll'), (snap) => {
      setPollData(snap.val() || null);
    });

    return () => {
      unsubNews();
      unsubComplaints();
      unsubRegistrations();
      unsubPoll();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, username, password);
      setIsAuthenticated(true);
      sessionStorage.setItem('sareriAdminAuth', 'true');
    } catch (err) {
      console.error(err);
      alert('Wrong Username or Password! (or account does not exist)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sareriAdminAuth');
  };

  const handleAddNews = () => {
    const newRef = push(ref(rtdb, 'adminData/news'));
    const newItem = {
      id: newRef.key,
      type: 'Announcement',
      title: 'New Update Title',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      desc: 'Update description goes here.',
      timestamp: Date.now()
    };
    set(newRef, newItem);
  };

  const handleDeleteNews = (id) => {
    if(window.confirm('Are you sure you want to delete this update?')) {
      remove(ref(rtdb, `adminData/news/${id}`));
    }
  };

  const handleUpdateNews = (id, field, value) => {
    const updatedNews = news.map(n => n.id === id ? { ...n, [field]: value } : n);
    setNews(updatedNews);
  };

  const sendPushNotification = async (title, body, type = 'General') => {
    setIsSending(true);
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
      setIsSending(false);
      return true;
    } catch (error) {
      console.error('Error triggering push notification:', error);
      setIsSending(false);
      return false;
    }
  };

  const handleSave = async () => {
    // Save to Firebase RTDB (source of truth)
    try {
      const updates = {};
      news.forEach(n => {
        updates[n.id] = n;
      });
      await set(ref(rtdb, 'adminData/news'), updates);
      
      if (news.length > 0) {
        const latest = news[0];
        // Confirm before sending to prevent accidental spam when just editing a typo
        if (window.confirm(`क्या आप लेटेस्ट न्यूज़ "${latest.title}" का Auto Push Notification सभी को भेजना चाहते हैं?`)) {
          await handleCirculateNews(latest, true);
          alert('News saved and notification sent successfully!');
          return;
        }
      }
      
      alert('News & Updates saved successfully!');
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Failed to save to Firebase Database. Error: ' + error.message);
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
    else if (notifyType === 'Announcement') prefix = '📣 Announcement: ';
    else if (notifyType === 'Simple Message') prefix = '💬 Message: ';
    else if (notifyType === 'News') prefix = '📰 News: ';
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
      await remove(ref(rtdb, `adminData/complaints/${id}`));
    }
  };

  const handleUpdateComplaint = async (id, field, value) => {
    const comp = complaints.find(c => c.id === id);
    if(comp) {
      await set(ref(rtdb, `adminData/complaints/${id}`), { ...comp, [field]: value });
    }
  };

  const handleDeleteRegistration = async (id) => {
    if(window.confirm('Are you sure you want to delete this registration?')) {
      await remove(ref(rtdb, `adminData/khelRegistrations/${id}`));
    }
  };

  const handleAddPollOption = () => {
    if (newPollOptions.length < 5) setNewPollOptions([...newPollOptions, '']);
  };

  const handleRemovePollOption = (index) => {
    if (newPollOptions.length > 2) {
      setNewPollOptions(newPollOptions.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePollOption = (index, value) => {
    const newOptions = [...newPollOptions];
    newOptions[index] = value;
    setNewPollOptions(newOptions);
  };

  const handleActivatePoll = async () => {
    if (!newPollQuestion.trim()) return alert("Question is required");
    if (newPollOptions.some(opt => !opt.trim())) return alert("All options must have text");
    
    if (window.confirm("This will replace any currently active poll. Are you sure?")) {
      const poll = {
        id: Date.now().toString(),
        question: newPollQuestion,
        options: newPollOptions.map(text => ({ text, votes: 0 })),
        isActive: true,
        createdAt: new Date().toISOString()
      };
      set(ref(rtdb, 'adminData/poll'), poll)
        .then(() => {
          alert("Poll Activated Successfully!");
          setNewPollQuestion('');
          setNewPollOptions(['', '']);
        })
        .catch(err => {
          console.error("Firebase Error:", err);
          alert("Failed to activate poll. Error: " + err.message);
        });
    }
  };

  const handleDeactivatePoll = async () => {
    if (window.confirm("Are you sure you want to deactivate the current poll?")) {
      await set(ref(rtdb, 'adminData/poll/isActive'), false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 text-gray-900">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Admin Panel</h2>
          <div className="mb-4">
            <input 
              type="text" 
              placeholder="Enter Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron"
            />
          </div>
          <div className="relative mb-4">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none p-1"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full btn-primary py-3 rounded-lg mt-2">
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
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-col z-20 hidden md:flex border-r border-gray-100 relative">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <Link to="/" className="flex items-center gap-3">
            <img src="/photos/About.jpeg" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-saffron shadow-sm" />
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Admin<span className="text-saffron">Panel</span></h1>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2 px-2">Main Menu</p>
          <button onClick={() => setActiveTab('news')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'news' ? 'bg-orange-50 text-saffron shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiFileText className={`w-5 h-5 ${activeTab === 'news' ? 'text-saffron' : 'text-gray-400'}`} /> Manage News
          </button>
          <button onClick={() => setActiveTab('panchayat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'panchayat' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiUsers className={`w-5 h-5 ${activeTab === 'panchayat' ? 'text-green-700' : 'text-gray-400'}`} /> Panchayat Info
          </button>
          
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-6 px-2">User Data</p>
          <button onClick={() => setActiveTab('complaints')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'complaints' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <div className="flex items-center gap-3">
              <FiMessageSquare className={`w-5 h-5 ${activeTab === 'complaints' ? 'text-red-600' : 'text-gray-400'}`} /> Complaints
            </div>
            {complaints.length > 0 && <span className="bg-red-100 text-red-600 text-[10px] py-1 px-2 rounded-full font-bold">{complaints.length}</span>}
          </button>
          <button onClick={() => setActiveTab('khel')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'khel' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <div className="flex items-center gap-3">
              <FiActivity className={`w-5 h-5 ${activeTab === 'khel' ? 'text-orange-600' : 'text-gray-400'}`} /> Khel Registrations
            </div>
            {khelRegistrations.length > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] py-1 px-2 rounded-full font-bold">{khelRegistrations.length}</span>}
          </button>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-6 px-2">Engagement</p>
          <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiBell className={`w-5 h-5 ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-gray-400'}`} /> Push Notifications
          </button>
          <button onClick={() => setActiveTab('poll')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'poll' ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiPieChart className={`w-5 h-5 ${activeTab === 'poll' ? 'text-purple-600' : 'text-gray-400'}`} /> Manage Poll
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-gray-600 hover:text-white hover:bg-red-500 w-full py-2.5 rounded-lg transition-all font-bold text-sm shadow-sm border border-gray-200 hover:border-red-500">
            <FiLogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        
        {/* Mobile Header */}
        <header className="bg-white shadow-sm z-10 p-4 flex justify-between items-center md:hidden border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Admin<span className="text-saffron">Panel</span></h1>
          </div>
          {activeTab === 'news' && (
            <button onClick={handleSave} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors text-xs shadow-sm">
              <FiSave /> Save
            </button>
          )}
        </header>

        {/* Desktop Header */}
        <header className="bg-white shadow-sm z-10 px-8 py-5 hidden md:flex justify-between items-center border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize tracking-tight">
              {activeTab === 'khel' ? 'Khel Registrations' : activeTab === 'panchayat' ? 'Gram Panchayat' : activeTab} Management
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manage and update village information seamlessly.</p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'news' && (
              <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30 transform hover:-translate-y-0.5">
                <FiSave className="w-5 h-5" /> Save Changes
              </button>
            )}
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <aside className="w-72 bg-white h-full flex flex-col relative z-50 shadow-2xl transform transition-transform">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <img src="/photos/About.jpeg" alt="Logo" className="w-8 h-8 rounded-full border border-saffron" />
                  <h1 className="text-lg font-bold text-gray-800">Menu</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <button onClick={() => {setActiveTab('news'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'news' ? 'bg-orange-50 text-saffron' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiFileText className="w-5 h-5" /> Manage News
                </button>
                <button onClick={() => {setActiveTab('panchayat'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'panchayat' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiUsers className="w-5 h-5" /> Panchayat Info
                </button>
                <button onClick={() => {setActiveTab('complaints'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'complaints' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3"><FiMessageSquare className="w-5 h-5" /> Complaints</div>
                  {complaints.length > 0 && <span className="bg-red-100 text-red-600 text-[10px] py-1 px-2 rounded-full font-bold">{complaints.length}</span>}
                </button>
                <button onClick={() => {setActiveTab('khel'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'khel' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3"><FiActivity className="w-5 h-5" /> Khel Registrations</div>
                  {khelRegistrations.length > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] py-1 px-2 rounded-full font-bold">{khelRegistrations.length}</span>}
                </button>
                <button onClick={() => {setActiveTab('notifications'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiBell className="w-5 h-5" /> Notifications
                </button>
                <button onClick={() => {setActiveTab('poll'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'poll' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiPieChart className="w-5 h-5" /> Manage Poll
                </button>
              </nav>
              <div className="p-4 border-t border-gray-100">
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-white bg-red-500 hover:bg-red-600 w-full py-3 rounded-xl transition-colors font-bold shadow-sm">
                  <FiLogOut /> Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto pb-10">

        {activeTab === 'panchayat' && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6">Gram Panchayat Admin</h2>
            <PanchayatAdmin />
          </div>
        )}

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
                      disabled={isSending}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiBell className="w-4 h-4" /> {isSending ? 'Sending...' : 'Broadcast Notification'}
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
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status (Accept/Reject)</label>
                      <select 
                        value={comp.status || 'Pending'}
                        onChange={(e) => handleUpdateComplaint(comp.id, 'status', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron bg-white text-sm font-medium ${
                          comp.status === 'Resolved' ? 'text-green-600' : 
                          comp.status === 'Rejected' ? 'text-red-600' : 
                          comp.status === 'In Progress' ? 'text-blue-600' : 'text-orange-600'
                        }`}
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="In Progress">🔄 In Progress</option>
                        <option value="Resolved">✅ Resolved (Accept)</option>
                        <option value="Rejected">❌ Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin Reply to User</label>
                      <textarea 
                        value={comp.adminReply || ''}
                        onChange={(e) => handleUpdateComplaint(comp.id, 'adminReply', e.target.value)}
                        placeholder="Type reply to user (they will see this in their app)..."
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron min-h-[42px] text-sm"
                      />
                    </div>
                  </div>
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
                    <option value="Simple Message">💬 Simple Message</option>
                    <option value="Announcement">📣 Announcement</option>
                    <option value="News">📰 News</option>
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
                    disabled={isSending}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                    {isSending ? 'Sending Notification...' : 'Broadcast Notification Now'}
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    Notifications are dispatched via Firebase Cloud Messaging to all subscribed phones and computers.
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'poll' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manage Public Poll</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">Create a public opinion poll that will be displayed on the Home page.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create New Poll */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Poll</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Poll Question</label>
                    <input 
                      type="text"
                      value={newPollQuestion}
                      onChange={(e) => setNewPollQuestion(e.target.value)}
                      placeholder="e.g., What should be the theme for next festival?"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Poll Options (Min 2, Max 5)</label>
                    {newPollOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input 
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdatePollOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all bg-gray-50"
                        />
                        {newPollOptions.length > 2 && (
                          <button 
                            onClick={() => handleRemovePollOption(idx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    ))}
                    {newPollOptions.length < 5 && (
                      <button 
                        onClick={handleAddPollOption}
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700 mt-2 flex items-center gap-1"
                      >
                        <FiPlus /> Add Option
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={handleActivatePoll}
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md"
                  >
                    Publish & Activate Poll
                  </button>
                </div>
              </div>

              {/* Active Poll Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Current Active Poll</h3>
                {pollData && pollData.isActive ? (
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-4">{pollData.question}</h4>
                    <div className="space-y-4 mb-6">
                      {pollData.options && pollData.options.map((opt, idx) => {
                        const totalVotes = pollData.options.reduce((sum, o) => sum + (o.votes || 0), 0);
                        const percentage = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                        return (
                          <div key={idx} className="relative">
                            <div className="flex justify-between items-end mb-1">
                              <span className="font-medium text-gray-800">{opt.text}</span>
                              <span className="text-sm font-bold text-gray-600">{opt.votes || 0} Votes ({percentage}%)</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <button 
                        onClick={handleDeactivatePoll}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
                      >
                        Deactivate Poll
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                    No active poll right now.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
