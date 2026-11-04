import { useState, useEffect } from 'react';
import { 
  FiTrash2, FiPlus, FiSave, FiLogOut, FiBell, FiSend, FiEye, FiEyeOff, 
  FiMenu, FiX, FiMessageSquare, FiActivity, FiPieChart, FiUsers, 
  FiFileText, FiUserCheck, FiClock, FiAward, FiShoppingBag, FiCalendar,
  FiShield, FiLock, FiCheckCircle, FiAlertCircle, FiToggleLeft, FiToggleRight,
  FiSettings, FiExternalLink, FiSearch, FiImage, FiPhone, FiMail, FiMapPin, FiTag
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';
import { collection, addDoc } from 'firebase/firestore';
import { ref, onValue, set, remove, push, get, update } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db, rtdb, storage, googleProvider } from '../firebase';
import {
  cancelScheduledNotificationRequest,
  formatKolkataDateTimeInput,
  kolkataDateTimeInputToIso,
  loadNotificationDashboard,
  loadScheduledNotifications,
  saveScheduledNotification,
  sendNotificationRequest,
} from '../services/notificationApi';
import PanchayatAdmin from '../components/Admin/PanchayatAdmin';
import ManageAchievements from '../components/Admin/ManageAchievements';
import ManageEvents from '../components/Admin/ManageEvents';
import ManageBusinesses from '../components/Admin/ManageBusinesses';
import ManageNews from '../components/Admin/ManageNews';
import ManageUsers from '../components/Admin/ManageUsers';
import ManageGallery from '../components/Admin/ManageGallery';
import ManageGramSabha from '../components/Admin/ManageGramSabha';
import ManageVikasKarya from '../components/Admin/ManageVikasKarya';
import { ConfirmModal, ToastPopup } from '../components/Admin/ThemeModal';
import SEO from '../components/SEO';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminRole, setAdminRole] = useState(null); // 'admin' | 'sarpanch' | null
  const [adminUser, setAdminUser] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [news, setNews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [khelRegistrations, setKhelRegistrations] = useState([]);
  const [khelSettings, setKhelSettings] = useState({
    isOpen: false,
    title: 'सरेरी श्याम खेल महोत्सव 2026',
    subtitle: 'गाँव ब्राह्मणों की सरेरी (भीलवाड़ा) • भव्य खेलकूद महाकुंभ',
    dates: '15 से 18 मार्च 2026',
    venue: 'राजकीय उच्च माध्यमिक विद्यालय खेल मैदान, सरेरी',
    instructions: 'पंजीकरण पूरी तरह निःशुल्क है। सभी खिलाड़ी एवं टीमें नीचे दिए गए फॉर्म से तुरंत रजिस्ट्रेशन करें।'
  });
  const [isEditingKhelSettings, setIsEditingKhelSettings] = useState(false);
  const [khelFormSettings, setKhelFormSettings] = useState({
    title: 'सरेरी श्याम खेल महोत्सव 2026',
    subtitle: 'गाँव ब्राह्मणों की सरेरी (भीलवाड़ा) • भव्य खेलकूद महाकुंभ',
    dates: '15 से 18 मार्च 2026',
    venue: 'राजकीय उच्च माध्यमिक विद्यालय खेल मैदान, सरेरी',
    instructions: 'पंजीकरण पूरी तरह निःशुल्क है। सभी खिलाड़ी एवं टीमें नीचे दिए गए फॉर्म से तुरंत रजिस्ट्रेशन करें।'
  });
  const [khelSportFilter, setKhelSportFilter] = useState('ALL');
  const [khelSearchQuery, setKhelSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('news');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');
  const [notifyLink, setNotifyLink] = useState('');
  const [notifyType, setNotifyType] = useState('News Update');
  const [isSending, setIsSending] = useState(false);
  const [notificationAudience, setNotificationAudience] = useState('all');
  const [showNotificationPreview, setShowNotificationPreview] = useState(false);
  const [notificationResult, setNotificationResult] = useState(null);
  const [notificationDashboard, setNotificationDashboard] = useState({ stats: null, history: [] });
  const [notificationDashboardLoading, setNotificationDashboardLoading] = useState(false);
  const [notificationDashboardError, setNotificationDashboardError] = useState('');
  const [uploadingImageId, setUploadingImageId] = useState(null);

  // Scheduling State
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [scheduledNotificationsLoading, setScheduledNotificationsLoading] = useState(false);

  // Poll State
  const [pollData, setPollData] = useState(null);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);

  // Users State
  const [appUsers, setAppUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // Custom Theme-Styled Modal & Toast States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'हाँ, हटाएं',
    cancelText: 'रद्द करें',
    type: 'danger',
    onConfirm: null,
    isProcessing: false
  });

  const [toast, setToast] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showToast = (type, message, title = '') => {
    setToast({ isOpen: true, type, message, title });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }));
    }, 4000);
  };

  // Restrict Sarpanch tab access to only allowed tabs
  useEffect(() => {
    if (adminRole === 'sarpanch' && !['news', 'panchayat', 'events', 'complaints', 'gallery', 'gramSabha', 'vikasKarya'].includes(activeTab)) {
      setActiveTab('news');
    }
  }, [adminRole, activeTab]);

  // Load from Firestore with real-time sync
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = [];
        usersSnapshot.forEach(doc => {
          usersList.push(doc.data());
        });
        setAppUsers(usersList);
      } catch (error) {
        console.error('Failed to fetch users', error);
        setErrorUsers(error.message);
      }
      setLoadingUsers(false);
    };

    const authStatus = sessionStorage.getItem('sareriAdminAuth');
    if (authStatus === 'sarpanch') {
      setIsAuthenticated(true);
      setAdminRole('sarpanch');
      setActiveTab('news');
    } else if (authStatus === 'admin' || authStatus === 'true') {
      setIsAuthenticated(true);
      setAdminRole('admin');
      fetchUsers();
    }

    // Auth listener to check user role strictly from RTDB and Firestore
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const roleSnap = await get(ref(rtdb, `userRoles/${user.uid}`));
          let role = roleSnap.exists() ? roleSnap.val()?.role : null;
          
          if (!role) {
            try {
              const { doc, getDoc } = await import('firebase/firestore');
              const docSnap = await getDoc(doc(db, 'users', user.uid));
              if (docSnap.exists()) {
                role = docSnap.data()?.role;
              }
            } catch (fsErr) {
              console.warn('Firestore role check:', fsErr);
            }
          }

          if (role === 'sarpanch') {
            setIsAuthenticated(true);
            setAdminRole('sarpanch');
            setAdminUser(user);
            sessionStorage.setItem('sareriAdminAuth', 'sarpanch');
            sessionStorage.setItem('sareriAdminUid', user.uid);
          } else if (role === 'admin') {
            setIsAuthenticated(true);
            setAdminRole('admin');
            setAdminUser(user);
            sessionStorage.setItem('sareriAdminAuth', 'admin');
            sessionStorage.setItem('sareriAdminUid', user.uid);
            fetchUsers();
          } else {
            // Logged in user without admin or sarpanch privileges
            setIsAuthenticated(false);
            setAdminRole(null);
            setAdminUser(null);
            sessionStorage.removeItem('sareriAdminAuth');
            sessionStorage.removeItem('sareriAdminUid');
          }
        } catch (e) {
          console.warn('Role check error:', e);
          setIsAuthenticated(false);
          setAdminRole(null);
          setAdminUser(null);
          sessionStorage.removeItem('sareriAdminAuth');
          sessionStorage.removeItem('sareriAdminUid');
        }
      } else {
        // No authenticated Firebase user
        setIsAuthenticated(false);
        setAdminRole(null);
        setAdminUser(null);
        sessionStorage.removeItem('sareriAdminAuth');
        sessionStorage.removeItem('sareriAdminUid');
      }
    });

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
      if (snap.exists()) {
        const list = [];
        snap.forEach((childSnap) => {
          list.push({ ...childSnap.val(), _key: childSnap.key, id: childSnap.key });
        });
        setComplaints(list.reverse());
      } else {
        setComplaints([]);
      }
    });

    // Real-time listener for Khel Registrations
    const unsubRegistrations = onValue(ref(rtdb, 'adminData/khelRegistrations'), (snap) => {
      if (snap.exists()) {
        const list = [];
        snap.forEach((childSnap) => {
          list.push({ ...childSnap.val(), _key: childSnap.key, id: childSnap.key });
        });
        setKhelRegistrations(list.reverse());
      } else {
        setKhelRegistrations([]);
      }
    });

    // Real-time listener for Poll
    const unsubPoll = onValue(ref(rtdb, 'adminData/poll'), (snap) => {
      setPollData(snap.val() || null);
    });

    // Real-time listener for Khel Mahotsav Settings
    const unsubKhelSettings = onValue(ref(rtdb, 'adminData/khelSettings'), (snap) => {
      const data = snap.val();
      if (data) {
        setKhelSettings(prev => ({ ...prev, ...data }));
        setKhelFormSettings({
          title: data.title || 'सरेरी श्याम खेल महोत्सव 2026',
          subtitle: data.subtitle || 'गाँव ब्राह्मणों की सरेरी (भीलवाड़ा) • भव्य खेलकूद महाकुंभ',
          dates: data.dates || '15 से 18 मार्च 2026',
          venue: data.venue || 'राजकीय उच्च माध्यमिक विद्यालय खेल मैदान, सरेरी',
          instructions: data.instructions || 'पंजीकरण पूरी तरह निःशुल्क है। सभी खिलाड़ी एवं टीमें नीचे दिए गए फॉर्म से तुरंत रजिस्ट्रेशन करें।'
        });
      }
    });

    return () => {
      unsubAuth();
      unsubNews();
      unsubComplaints();
      unsubRegistrations();
      unsubPoll();
      unsubKhelSettings();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, username, password);
      const user = userCred.user;

      // Verify role in RTDB userRoles
      const roleSnap = await get(ref(rtdb, `userRoles/${user.uid}`));
      let role = roleSnap.exists() ? roleSnap.val()?.role : null;

      // Fallback check in Firestore
      if (!role) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            role = docSnap.data()?.role;
          }
        } catch (fsErr) {
          console.warn('Firestore role check:', fsErr);
        }
      }

      if (role === 'sarpanch') {
        setIsAuthenticated(true);
        setAdminRole('sarpanch');
        setAdminUser(user);
        sessionStorage.setItem('sareriAdminAuth', 'sarpanch');
        sessionStorage.setItem('sareriAdminUid', user.uid);
        setActiveTab('news');
      } else if (role === 'admin') {
        setIsAuthenticated(true);
        setAdminRole('admin');
        setAdminUser(user);
        sessionStorage.setItem('sareriAdminAuth', 'admin');
        sessionStorage.setItem('sareriAdminUid', user.uid);
        fetchUsers();
      } else {
        await signOut(auth);
        setIsAuthenticated(false);
        setAdminRole(null);
        setAdminUser(null);
        sessionStorage.removeItem('sareriAdminAuth');
        sessionStorage.removeItem('sareriAdminUid');
        alert('❌ यह खाता व्यवस्थापक (Admin) या सरपंच (Sarpanch) के रूप में अधिकृत नहीं है।');
      }
    } catch (err) {
      console.error(err);
      alert('गलत यूज़रनेम या पासवर्ड! (Wrong Username or Password)');
    }
  };

  const handleGoogleAdminLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user) {
        setGoogleLoading(false);
        return;
      }

      // Check role in RTDB userRoles
      const roleSnap = await get(ref(rtdb, `userRoles/${user.uid}`));
      let role = roleSnap.exists() ? roleSnap.val()?.role : null;

      // Fallback check in Firestore
      if (!role) {
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            role = docSnap.data()?.role;
          }
        } catch (fsErr) {
          console.warn('Firestore role check:', fsErr);
        }
      }

      if (role === 'sarpanch') {
        setIsAuthenticated(true);
        setAdminRole('sarpanch');
        setAdminUser(user);
        sessionStorage.setItem('sareriAdminAuth', 'sarpanch');
        sessionStorage.setItem('sareriAdminUid', user.uid);
        setActiveTab('news');
      } else if (role === 'admin') {
        setIsAuthenticated(true);
        setAdminRole('admin');
        setAdminUser(user);
        sessionStorage.setItem('sareriAdminAuth', 'admin');
        sessionStorage.setItem('sareriAdminUid', user.uid);
      } else {
        await signOut(auth);
        sessionStorage.removeItem('sareriAdminAuth');
        sessionStorage.removeItem('sareriAdminUid');
        alert(`❌ यह गूगल खाता (${user.email}) सरपंच या एडमिन के रूप में अधिकृत नहीं है।\n\nयदि आप सरपंच हैं, तो कृपया मुख्य व्यवस्थापक से अपने खाते को सरपंच अधिकार असाइन करवाएं।`);
      }
    } catch (err) {
      console.error('Google login error:', err);
      alert('गूगल लॉगिन में समस्या आई: ' + (err.message || 'त्रुटि'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setAdminRole(null);
    setAdminUser(null);
    sessionStorage.removeItem('sareriAdminAuth');
    sessionStorage.removeItem('sareriAdminUid');
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
  };

  const handleAddNews = () => {
    const newRef = push(ref(rtdb, 'adminData/news'));
    const newItem = {
      id: newRef.key,
      type: 'Announcement',
      title: 'New Update Title',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      desc: 'Update description goes here.',
      image: '',
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

  const handleImageUpload = async (id, file) => {
    if (!file) return;

    setUploadingImageId(id);
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef(storage, `news/${Date.now()}_${sanitizedName}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      handleUpdateNews(id, 'image', downloadUrl);
      alert('✅ फोटो सफलतापूर्वक अपलोड हो गई (Uploaded to Cloud Storage)!');
    } catch (err) {
      console.warn('Storage upload error, using local fallback:', err);
      // Fallback: If Firebase Storage is not yet enabled on free tier, prompt for URL or notify
      alert('⚠️ क्लाउड स्टोरेज अनुपलब्ध है। कृपया Firebase Console में Storage सक्रिय करें या वैध फोटो URL दर्ज करें।');
    } finally {
      setUploadingImageId(null);
    }
  };

  const sendPushNotification = async (title, body, type = 'General', link = '', audience = notificationAudience) => {
    setIsSending(true);
    try {
      const result = await sendNotificationRequest({ title, body, type, link, audience });
      setNotificationResult(result);
      loadNotificationDashboard().then((dashboard) => {
        if (dashboard.success) setNotificationDashboard(dashboard);
      });
      if (!result.success) console.warn('Notification request did not receive FCM acceptance:', result.error || result.status);
      return result;
    } catch (error) {
      console.error('Error triggering push notification:', error);
      return { success: false, status: 'Failed', error: error.message };
    } finally {
      setIsSending(false);
    }
  };

  const notificationResultMessage = (result) => {
    if (!result) return 'The notification result is unavailable.';
    const accepted = result.fcmAcceptedCount || 0;
    const targeted = result.totalTargetedDevices || 0;
    const failed = result.failedCount || 0;
    if (targeted === 0) return 'No active subscribers matched this audience.';
    if (accepted === 0) return `FCM accepted 0 of ${targeted} requests. ${result.error || 'Check notification history for details.'}`;
    return `FCM accepted ${accepted} of ${targeted} requests; ${failed} failed (${result.invalidTokenCount || 0} invalid tokens). Device delivery is unconfirmed.`;
  };

  useEffect(() => {
    if (activeTab !== 'notifications' || !isAuthenticated) return undefined;
    let isCurrent = true;
    setNotificationDashboardLoading(true);
    setNotificationDashboardError('');
    setScheduledNotificationsLoading(true);
    Promise.all([loadNotificationDashboard(), loadScheduledNotifications()])
      .then(([dashboard, schedules]) => {
        if (!isCurrent) return;
        if (dashboard.success) {
          setNotificationDashboard(dashboard);
        } else {
          setNotificationDashboardError(dashboard.error || 'Could not load notification statistics.');
        }
        if (schedules.success) setScheduledNotifications(schedules.scheduled || []);
        else setNotificationDashboardError(schedules.error || 'Could not load scheduled notifications.');
      })
      .finally(() => {
        if (isCurrent) {
          setNotificationDashboardLoading(false);
          setScheduledNotificationsLoading(false);
        }
      });
    return () => { isCurrent = false; };
  }, [activeTab, isAuthenticated]);

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
          const result = await handleCirculateNews(latest, true);
          alert(`News saved. ${notificationResultMessage(result)}`);
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
      if (item.type === 'Emergency Alert') prefix = '🚨 ';
      else if (item.type === 'Event') prefix = '🎉 ';
      else if (item.type === 'Announcement') prefix = '📣 ';
      else if (item.type === 'Notice') prefix = '📜 ';
      else prefix = '📰 ';

      const fullTitle = `${prefix}${item.title || 'Update'}`;
      
      const result = await sendPushNotification(fullTitle, item.desc || 'Details are available on the website.', item.type || 'General', '', 'all');
      
      if (!isSilent) {
        alert(notificationResultMessage(result));
      }
      return result;
    }
  };

  const getNotifyPrefix = (type) => {
    if (type === 'Emergency Alert') return '🚨 ';
    if (type === 'Event Update') return '🎉 ';
    if (type === 'Festival Announcement') return '🎆 ';
    if (type === 'Panchayat Notice') return '📜 ';
    if (type === 'Announcement') return '📣 ';
    if (type === 'Simple Message') return '💬 ';
    if (type === 'News') return '📰 ';
    return '📰 ';
  };

  const handleManualPush = async (e) => {
    e.preventDefault();
    if (!notifyTitle || !notifyBody) return alert('Please enter both title and message.');
    if (editingScheduleId && !isScheduled) return alert('Keep scheduling enabled while editing a scheduled notification.');
    if (notificationAudience === 'all') {
      const action = isScheduled ? 'schedule this notification for' : 'send this notification to';
      if (!window.confirm(`Are you sure you want to ${action} all active subscribers? FCM acceptance does not confirm device delivery.`)) return;
    }
    
    const fullTitle = `${getNotifyPrefix(notifyType)}${notifyTitle}`;

    if (isScheduled && scheduleDateTime) {
      const scheduledAt = kolkataDateTimeInputToIso(scheduleDateTime);
      if (!scheduledAt || new Date(scheduledAt).getTime() <= Date.now()) {
        return alert('Please select a valid future date and time in India.');
      }

      setIsSending(true);
      const result = await saveScheduledNotification({
        title: fullTitle,
        body: notifyBody,
        type: notifyType,
        link: notifyLink || '/',
        audience: notificationAudience,
        scheduledAt,
        timezone: 'Asia/Kolkata',
      }, editingScheduleId);
      setIsSending(false);

      if (!result.success) return alert(result.error || 'The scheduled notification could not be saved.');

      const scheduleResult = await loadScheduledNotifications();
      if (scheduleResult.success) setScheduledNotifications(scheduleResult.scheduled || []);
      alert(`Notification saved for ${formatKolkataDateTimeInput(scheduledAt).replace('T', ' ')} IST. The free scheduler checks once daily around 5:30–6:30 AM IST, so it may run nearly a day after the selected time.`);
      setNotifyTitle('');
      setNotifyBody('');
      setNotifyLink('');
      setScheduleDateTime('');
      setIsScheduled(false);
      setEditingScheduleId(null);
      return;
    }
    
    const result = await sendPushNotification(fullTitle, notifyBody, notifyType, notifyLink);
    if (result.success) {
      alert(notificationResultMessage(result));
      setNotifyTitle('');
      setNotifyBody('');
      setNotifyLink('');
    } else {
      alert(notificationResultMessage(result));
    }
  };

  const editScheduledNotification = (item) => {
    const prefix = getNotifyPrefix(item.type);
    setNotifyTitle(item.title.startsWith(prefix) ? item.title.slice(prefix.length) : item.title);
    setNotifyBody(item.body);
    setNotifyLink(item.link === '/' ? '' : item.link);
    setNotifyType(item.type);
    setNotificationAudience(item.audience || 'all');
    setScheduleDateTime(formatKolkataDateTimeInput(item.scheduledAt));
    setEditingScheduleId(item.id);
    setIsScheduled(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelScheduledNotification = async (id) => {
    if (!window.confirm('Cancel this pending notification?')) return;
    const result = await cancelScheduledNotificationRequest(id);
    if (!result.success) return alert(result.error || 'The scheduled notification could not be cancelled.');
    setScheduledNotifications((current) => current.filter((item) => item.id !== id));
  };

  const handleDeleteComplaint = (id) => {
    if (!id) return;
    setConfirmModal({
      isOpen: true,
      title: 'शिकायत हटाएं?',
      message: 'क्या आप वाकई इस शिकायत को हटाना चाहते हैं?',
      confirmText: 'हाँ, हटाएं',
      cancelText: 'रद्द करें',
      type: 'danger',
      isProcessing: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isProcessing: true }));
        try {
          await remove(ref(rtdb, `adminData/complaints/${id}`));
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
          showToast('success', 'शिकायत सफलतापूर्वक हटा दी गई!', 'सफलता');
        } catch (err) {
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
          showToast('error', 'शिकायत हटाने में समस्या आई: ' + err.message, 'त्रुटि');
        }
      }
    });
  };

  const handleUpdateComplaint = async (id, field, value) => {
    const comp = complaints.find(c => c.id === id);
    if(comp) {
      await set(ref(rtdb, `adminData/complaints/${id}`), { ...comp, [field]: value });
    }
  };

  const handleDeleteRegistration = (id) => {
    if (!id) {
      showToast('error', 'त्रुटि: पंजीकरण आईडी नहीं मिली!', 'त्रुटि');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'टीम पंजीकरण हटाएं?',
      message: 'क्या आप वाकई इस टीम पंजीकरण को हटाना (Delete) चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।',
      confirmText: 'हाँ, हटाएं',
      cancelText: 'रद्द करें',
      type: 'danger',
      isProcessing: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isProcessing: true }));
        try {
          await remove(ref(rtdb, `adminData/khelRegistrations/${id}`));
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
          showToast('success', 'टीम पंजीकरण सफलतापूर्वक हटा दिया गया!', 'सफलता');
        } catch (err) {
          console.error('Error deleting registration:', err);
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
          showToast('error', 'पंजीकरण हटाने में समस्या आई: ' + err.message, 'त्रुटि');
        }
      }
    });
  };

  const handleToggleKhelRegistration = async () => {
    const nextStatus = !khelSettings.isOpen;
    try {
      await update(ref(rtdb, 'adminData/khelSettings'), {
        ...khelSettings,
        isOpen: nextStatus,
        updatedAt: Date.now()
      });
      setKhelSettings(prev => ({ ...prev, isOpen: nextStatus }));
      showToast(
        'success',
        nextStatus 
          ? 'खेल महोत्सव पंजीकरण होम पेज पर चालू (LIVE) कर दिया गया है!' 
          : 'खेल महोत्सव पंजीकरण रोक दिया गया है (होम पेज से हटा दिया गया है)।',
        'खेल महोत्सव स्थिति'
      );
    } catch (err) {
      console.error('Error toggling khel registration:', err);
      showToast('error', 'त्रुटि: खेल महोत्सव स्थिति अपडेट नहीं हो सकी।', 'त्रुटि');
    }
  };

  const handleSaveKhelSettings = async (e) => {
    e.preventDefault();
    try {
      await update(ref(rtdb, 'adminData/khelSettings'), {
        ...khelSettings,
        ...khelFormSettings,
        updatedAt: Date.now()
      });
      setKhelSettings(prev => ({ ...prev, ...khelFormSettings }));
      setIsEditingKhelSettings(false);
      showToast('success', 'खेल महोत्सव का विवरण सफलतापूर्वक सहेज लिया गया!', 'सेव सफल');
    } catch (err) {
      console.error('Error saving khel settings:', err);
      showToast('error', 'विवरण सहेजने में त्रुटि आई।', 'त्रुटि');
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
    if (!newPollQuestion.trim()) return showToast('error', 'प्रश्न दर्ज करना आवश्यक है!', 'त्रुटि');
    if (newPollOptions.some(opt => !opt.trim())) return showToast('error', 'सभी विकल्पों में विवरण भरें!', 'त्रुटि');
    
    setConfirmModal({
      isOpen: true,
      title: 'जनमत पोल सक्रिय करें?',
      message: 'यह वर्तमान में चल रहे सक्रिय पोल को बदल देगा। क्या आप जारी रखना चाहते हैं?',
      confirmText: 'हाँ, सक्रिय करें',
      cancelText: 'रद्द करें',
      type: 'warning',
      isProcessing: false,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isProcessing: true }));
        const poll = {
          id: Date.now().toString(),
          question: newPollQuestion,
          options: newPollOptions.map(text => ({ text, votes: 0 })),
          isActive: true,
          createdAt: new Date().toISOString()
        };
        try {
          await set(ref(rtdb, 'adminData/poll'), poll);
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
          showToast('success', 'जनमत पोल सफलतापूर्वक सक्रिय कर दिया गया!', 'सफलता');
          setNewPollQuestion('');
          setNewPollOptions(['', '']);
        } catch (err) {
          console.error("Firebase Error:", err);
          setConfirmModal(prev => ({ ...prev, isOpen: false, isProcessing: false }));
          showToast('error', 'पोल सक्रिय करने में त्रुटि: ' + err.message, 'त्रुटि');
        }
      }
    });
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
      worksheetData.push(['Tracking ID', 'Name', 'Contact', 'Email', 'Ward / Location', 'Category', 'Date', 'Status', 'Details', 'Admin Reply']);
      data.forEach(c => {
        worksheetData.push([
          c.trackingId || c.id || '',
          c.name || '',
          c.contact || '',
          c.userEmail || '',
          c.ward || 'सामान्य गाँव',
          c.category || 'सामान्य',
          c.date || '',
          c.status || 'Pending',
          c.details || '',
          c.adminReply || ''
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-4 text-gray-900">
        <SEO title="Admin Portal | Village Sareri" noindex={true} />
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-100 relative overflow-hidden">
          {/* Top saffron accent bar */}
          <div className="h-2 w-full bg-gradient-to-r from-saffron via-amber-400 to-orange-600 absolute top-0 left-0"></div>

          {/* Crest / Logo */}
          <div className="text-center mb-6 pt-2">
            <img src="/photos/About.jpeg" alt="Logo" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-4 border-orange-100 shadow-md" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              ग्राम पंचायत सरेरी
            </h2>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              प्रशासनिक एवं सरपंच नियंत्रण पोर्टल (Admin & Sarpanch Portal)
            </p>
          </div>

          {/* Quick 1-Click Google Sign In for Sarpanch & Admin */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-saffron text-gray-800 font-bold text-sm shadow-sm transition-all transform active:scale-98 disabled:opacity-50"
            >
              <FcGoogle className="w-6 h-6 shrink-0" />
              <span>{googleLoading ? 'लॉगिन सत्यापित हो रहा है...' : 'Google से लॉगिन करें (सरपंच / व्यवस्थापक)'}</span>
            </button>
            <p className="text-[11px] text-center text-gray-500 mt-2">
              अधिकृत सरपंच व व्यवस्थापक अपने जीमेल से सीधे लॉगिन कर सकते हैं।
            </p>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
              या पासवर्ड से लॉगिन करें
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">यूज़रनेम / ईमेल</label>
              <input 
                type="text" 
                placeholder="Admin username or email" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron text-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">पासवर्ड</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron text-sm pr-12 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-saffron to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm transform active:scale-98">
              मुख्य एडमिन लॉगिन (Super Admin Login)
            </button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-gray-100">
            <Link className="text-xs font-semibold text-gray-500 hover:text-saffron transition-colors" to="/">
              ← वेबसाइट के मुख्य पृष्ठ पर लौटें (Home)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <SEO title="Admin Dashboard | Village Sareri" noindex={true} />
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-col z-20 hidden md:flex border-r border-gray-100 relative">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <Link to="/" className="flex items-center gap-3">
            <img src="/photos/About.jpeg" alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-saffron shadow-sm" />
            <div>
              <h1 className="text-base font-bold text-gray-800 tracking-tight leading-tight">सरेरी<span className="text-saffron"> पोर्टल</span></h1>
              <span className="text-[10px] text-gray-400 font-semibold block">व्यवस्थापक नियंत्रण</span>
            </div>
          </Link>
        </div>

        {/* Current User Role Badge */}
        <div className="p-4 pb-2">
          {adminRole === 'sarpanch' ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
              <span className="text-xl">👑</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-900 leading-tight">सरपंच पोर्टल</div>
                <div className="text-[10px] text-amber-700 truncate font-medium">
                  {adminUser?.displayName || adminUser?.email || 'सरपंच साहब'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2.5">
              <span className="text-xl">🛡️</span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-purple-900 leading-tight">मुख्य व्यवस्थापक</div>
                <div className="text-[10px] text-purple-700 truncate font-medium">
                  {adminUser?.displayName || adminUser?.email || 'Super Admin'}
                </div>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
            {adminRole === 'sarpanch' ? 'सरपंच विभाग (Sarpanch Modules)' : 'मुख्य मेन्यू (Main Menu)'}
          </p>
          
          {/* Tabs visible to BOTH Sarpanch & Admin */}
          <button onClick={() => setActiveTab('news')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'news' ? 'bg-orange-50 text-saffron shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiFileText className={`w-5 h-5 ${activeTab === 'news' ? 'text-saffron' : 'text-gray-400'}`} /> समाचार प्रबंधन (News)
          </button>
          <button onClick={() => setActiveTab('panchayat')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'panchayat' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiUsers className={`w-5 h-5 ${activeTab === 'panchayat' ? 'text-green-700' : 'text-gray-400'}`} /> ग्राम पंचायत व नोटिस
          </button>
          <button onClick={() => setActiveTab('gramSabha')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'gramSabha' ? 'bg-emerald-50 text-[#135334] font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiUsers className={`w-5 h-5 ${activeTab === 'gramSabha' ? 'text-[#135334]' : 'text-gray-400'}`} /> ग्राम सभा प्रबंधन (Gram Sabha)
          </button>
          <button onClick={() => setActiveTab('vikasKarya')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'vikasKarya' ? 'bg-amber-50 text-amber-800 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiActivity className={`w-5 h-5 ${activeTab === 'vikasKarya' ? 'text-amber-800' : 'text-gray-400'}`} /> विकास कार्य प्रबंधन (Works)
          </button>
          <button onClick={() => setActiveTab('events')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'events' ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiCalendar className={`w-5 h-5 ${activeTab === 'events' ? 'text-amber-700' : 'text-gray-400'}`} /> मेले व उत्सव (Events)
          </button>
          <button onClick={() => setActiveTab('complaints')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'complaints' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <div className="flex items-center gap-3">
              <FiMessageSquare className={`w-5 h-5 ${activeTab === 'complaints' ? 'text-red-600' : 'text-gray-400'}`} />
              <span>शिकायत निवारण (Complaints)</span>
            </div>
            {complaints.length > 0 && <span className="bg-red-100 text-red-600 text-[10px] py-1 px-2 rounded-full font-bold">{complaints.length}</span>}
          </button>
          <button onClick={() => setActiveTab('gallery')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'gallery' ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
            <FiImage className={`w-5 h-5 ${activeTab === 'gallery' ? 'text-cyan-700' : 'text-gray-400'}`} /> फोटो व वीडियो गैलरी (Gallery)
          </button>

          {/* Super Admin ONLY Tabs */}
          {adminRole === 'admin' && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6 px-2">व्यापार व नागरिक अधिकार</p>
              <button onClick={() => setActiveTab('businesses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'businesses' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <FiShoppingBag className={`w-5 h-5 ${activeTab === 'businesses' ? 'text-blue-700' : 'text-gray-400'}`} /> Business Directory
              </button>
              <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'users' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <FiShield className={`w-5 h-5 ${activeTab === 'users' ? 'text-purple-700' : 'text-gray-400'}`} /> नागरिक रोल (User Access)
              </button>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6 px-2">नागरिक डेटा व सेवाएँ</p>
              <button onClick={() => setActiveTab('khel')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'khel' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <div className="flex items-center gap-3">
                  <FiActivity className={`w-5 h-5 ${activeTab === 'khel' ? 'text-orange-600' : 'text-gray-400'}`} /> खेल महोत्सव व पंजीकरण
                </div>
                {khelRegistrations.length > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] py-1 px-2 rounded-full font-bold">{khelRegistrations.length}</span>}
              </button>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6 px-2">समुदाय व सहभागिता</p>
              <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <FiBell className={`w-5 h-5 ${activeTab === 'notifications' ? 'text-indigo-600' : 'text-gray-400'}`} /> पुश नोटिफिकेशन
              </button>
              <button onClick={() => setActiveTab('poll')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'poll' ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <FiPieChart className={`w-5 h-5 ${activeTab === 'poll' ? 'text-purple-600' : 'text-gray-400'}`} /> जनमत पोल (Poll)
              </button>
              <button onClick={() => setActiveTab('achievements')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'achievements' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <FiAward className={`w-5 h-5 ${activeTab === 'achievements' ? 'text-pink-600' : 'text-gray-400'}`} /> <span className="notranslate" translate="no">Pride of Sareri</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-gray-600 hover:text-white hover:bg-red-500 w-full py-2.5 rounded-lg transition-all font-bold text-sm shadow-sm border border-gray-200 hover:border-red-500">
            <FiLogOut className="w-4 h-4" /> साइन आउट (Sign Out)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        
        {/* Mobile Header */}
        <header className="bg-white shadow-sm z-10 p-3 sm:p-4 flex justify-between items-center md:hidden border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <FiMenu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
                {adminRole === 'sarpanch' ? '👑 सरपंच पोर्टल' : 'AdminPanel'}
              </h1>
              <p className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
                {adminUser?.displayName || adminUser?.email || 'सरेरी ग्राम पोर्टल'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold border border-red-200 flex items-center gap-1"
            title="लॉगआउट"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
        </header>

        {/* Mobile Quick-Switch Horizontal Tab Bar */}
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto md:hidden no-scrollbar">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'news' ? 'bg-saffron text-white shadow-sm' : 'bg-gray-100 text-gray-600'
            }`}
          >
            📰 समाचार
          </button>
          <button
            onClick={() => setActiveTab('panchayat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'panchayat' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
            }`}
          >
            🏛️ पंचायत
          </button>
          <button
            onClick={() => setActiveTab('gramSabha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'gramSabha' ? 'bg-[#135334] text-white shadow-sm' : 'bg-gray-100 text-gray-600'
            }`}
          >
            👥 ग्राम सभा
          </button>
          <button
            onClick={() => setActiveTab('vikasKarya')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'vikasKarya' ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
            }`}
          >
            🏗️ विकास कार्य
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'events' ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
            }`}
          >
            🚩 मेले व उत्सव
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'complaints' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
            }`}
          >
            💬 शिकायतें ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'gallery' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
            }`}
          >
            📸 गैलरी
          </button>
          {adminRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('businesses')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'businesses' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                }`}
              >
                🛍️ दुकान
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'users' ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                }`}
              >
                👥 नागरिक रोल
              </button>
              <button
                onClick={() => setActiveTab('khel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'khel' ? 'bg-orange-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                }`}
              >
                🏃 खेल ({khelRegistrations.length})
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                }`}
              >
                🔔 पुश
              </button>
            </>
          )}
        </div>

        {/* Desktop Header */}
        <header className="bg-white shadow-sm z-10 px-8 py-4 hidden md:flex justify-between items-center border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800 capitalize tracking-tight">
                {activeTab === 'businesses' ? 'Business Directory' : 
                 activeTab === 'khel' ? 'Khel Registrations' : 
                 activeTab === 'gramSabha' ? 'ग्राम सभा प्रबंधन (Gram Sabha)' :
                 activeTab === 'vikasKarya' ? 'विकास कार्य प्रबंधन (Development Works)' :
                 activeTab === 'panchayat' ? 'Gram Panchayat & Notices' : 
                 activeTab === 'events' ? 'Events & Melas' : 
                 activeTab === 'users' ? 'Registered Citizens & Roles' : 
                 activeTab === 'news' ? 'News & Announcements' : activeTab}
              </h2>
              {adminRole === 'sarpanch' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  👑 सरपंच मोड
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  🛡️ पूर्ण एडमिन
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              {adminRole === 'sarpanch' 
                ? 'गाँव के समाचार, डिजिटल नोटिस बोर्ड एवं मेले/उत्सव प्रबंधित करें।' 
                : 'गाँव का संपूर्ण डिजिटल प्रबंधन एवं नागरिक अधिकार।'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              वेबसाइट देखें ↗
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>साइन आउट</span>
            </button>
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
                  <div>
                    <h1 className="text-base font-bold text-gray-800">
                      {adminRole === 'sarpanch' ? '👑 सरपंच पोर्टल' : 'Admin Menu'}
                    </h1>
                    <span className="text-[10px] text-gray-400 font-semibold">{adminUser?.email || ''}</span>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <button onClick={() => {setActiveTab('news'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'news' ? 'bg-orange-50 text-saffron' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiFileText className="w-5 h-5" /> समाचार प्रबंधन
                </button>
                <button onClick={() => {setActiveTab('panchayat'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'panchayat' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiUsers className="w-5 h-5" /> पंचायत व नोटिस
                </button>
                <button onClick={() => {setActiveTab('gramSabha'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'gramSabha' ? 'bg-emerald-50 text-[#135334] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiUsers className="w-5 h-5" /> ग्राम सभा प्रबंधन
                </button>
                <button onClick={() => {setActiveTab('vikasKarya'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'vikasKarya' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiActivity className="w-5 h-5" /> विकास कार्य प्रबंधन
                </button>
                <button onClick={() => {setActiveTab('events'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'events' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiCalendar className="w-5 h-5" /> मेले व उत्सव
                </button>
                <button onClick={() => {setActiveTab('complaints'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'complaints' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-3"><FiMessageSquare className="w-5 h-5" /> शिकायतें (Complaints)</div>
                  {complaints.length > 0 && <span className="bg-red-100 text-red-600 text-[10px] py-1 px-2 rounded-full font-bold">{complaints.length}</span>}
                </button>
                <button onClick={() => {setActiveTab('gallery'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'gallery' ? 'bg-cyan-50 text-cyan-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <FiImage className="w-5 h-5" /> फोटो व वीडियो गैलरी (Gallery)
                </button>

                {adminRole === 'admin' && (
                  <>
                    <button onClick={() => {setActiveTab('businesses'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'businesses' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <FiShoppingBag className="w-5 h-5" /> Business Directory
                    </button>
                    <button onClick={() => {setActiveTab('users'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'users' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <FiShield className="w-5 h-5" /> नागरिक रोल (Roles)
                    </button>
                    <button onClick={() => {setActiveTab('khel'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'khel' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3"><FiActivity className="w-5 h-5" /> खेल पंजीकरण</div>
                      {khelRegistrations.length > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] py-1 px-2 rounded-full font-bold">{khelRegistrations.length}</span>}
                    </button>
                    <button onClick={() => {setActiveTab('notifications'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <FiBell className="w-5 h-5" /> नोटिफिकेशन्स
                    </button>
                    <button onClick={() => {setActiveTab('poll'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'poll' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <FiPieChart className="w-5 h-5" /> जनमत पोल
                    </button>
                    <button onClick={() => {setActiveTab('achievements'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${activeTab === 'achievements' ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                      <FiAward className="w-5 h-5" /> Pride of Sareri
                    </button>
                  </>
                )}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-white bg-red-500 hover:bg-red-600 w-full py-3 rounded-xl transition-colors font-bold shadow-sm">
                  <FiLogOut /> साइन आउट
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto pb-10">
        {activeTab === 'businesses' && (
          <div className="mb-10">
            <ManageBusinesses />
          </div>
        )}

        {activeTab === 'events' && (
          <div className="mb-10">
            <ManageEvents />
          </div>
        )}


        {activeTab === 'panchayat' && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6">Gram Panchayat Admin</h2>
            <PanchayatAdmin />
          </div>
        )}

        {activeTab === 'gramSabha' && (
          <div className="mb-10">
            <ManageGramSabha />
          </div>
        )}

        {activeTab === 'vikasKarya' && (
          <div className="mb-10">
            <ManageVikasKarya />
          </div>
        )}

        {activeTab === 'users' && adminRole === 'admin' && (
          <div className="mb-10">
            <ManageUsers />
          </div>
        )}

        {activeTab === 'news' && (
          <div className="mb-10">
            <ManageNews isSarpanch={adminRole === 'sarpanch'} />
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

                  {/* Top Bar: Tracking ID, Category & Date */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
                    <span className="font-mono font-bold text-sm bg-slate-100 text-gray-800 px-3 py-1 rounded-lg border border-slate-200">
                      ID: {comp.trackingId || comp.id}
                    </span>
                    {comp.category && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF6B00] border border-orange-200">
                        🏷️ {comp.category}
                      </span>
                    )}
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-[#135334] border border-emerald-200">
                      📍 {comp.ward || 'सामान्य सरेरी (पूरा गाँव)'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium ml-auto">
                      {comp.date}
                    </span>
                  </div>

                  {/* Citizen Info Row */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 flex-wrap">
                        <span>{comp.name}</span>
                        {comp.userEmail ? (
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300">
                            ✉️ {comp.userEmail}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            (पुराना रिकॉर्ड - बिना ईमेल)
                          </span>
                        )}
                      </h3>
                      {comp.contact && (
                        <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1.5 font-medium">
                          <FiPhone className="text-emerald-700 w-3.5 h-3.5" />
                          <span>संपर्क:</span>
                          <a href={`tel:${comp.contact}`} className="font-bold text-[#135334] hover:underline font-mono">
                            {comp.contact}
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                        वार्ड / स्थान:
                      </span>
                      <span className="text-sm font-extrabold text-gray-900 block">
                        {comp.ward || 'सामान्य सरेरी'}
                      </span>
                    </div>
                  </div>

                  {/* Complaint Details Description */}
                  <div className="bg-white p-4 rounded-xl text-gray-800 border border-gray-200 mb-4 whitespace-pre-wrap text-sm leading-relaxed">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">शिकायत का विवरण:</p>
                    {comp.details}
                  </div>

                  {comp.photo && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">संलग्न साक्ष्य फोटो:</p>
                      <img 
                        src={comp.photo} 
                        alt="Complaint Evidence" 
                        className="max-w-xs max-h-48 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:opacity-95" 
                        onClick={() => window.open(comp.photo, '_blank')}
                      />
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
          <div className="space-y-6">
            {/* TOP HEADER & CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🏆 सरेरी श्याम खेल महोत्सव 2026</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    khelSettings.isOpen 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>
                    {khelSettings.isOpen ? '🟢 LIVE ON HOMEPAGE' : '⚪ CLOSED (INACTIVE)'}
                  </span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  होम पेज पर खेल महोत्सव पंजीकरण फॉर्म शुरू/बंद करें एवं सभी पंजीकृत टीमों की सूची देखें।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to="/#khel-mahotsav"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                >
                  <FiExternalLink className="w-3.5 h-3.5" />
                  <span>होम पेज पर देखें</span>
                </Link>

                <button
                  onClick={() => setIsEditingKhelSettings(!isEditingKhelSettings)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition-all"
                >
                  <FiSettings className="w-3.5 h-3.5" />
                  <span>{isEditingKhelSettings ? 'विवरण छुपाएं' : 'टूर्नामेंट विवरण संपादित करें'}</span>
                </button>

                <button 
                  onClick={() => downloadExcel(khelRegistrations, 'Khel_Registrations', 'khel')}
                  className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-xl hover:bg-green-800 transition-colors text-xs sm:text-sm font-bold shadow-md shadow-green-700/20"
                >
                  Download Excel
                </button>
              </div>
            </div>

            {/* PROMINENT TOGGLE SWITCH BANNER */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
              khelSettings.isOpen
                ? 'bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50/50 border-emerald-300 shadow-sm'
                : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/50 border-amber-300 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{khelSettings.isOpen ? '🟢' : '⏸️'}</span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {khelSettings.isOpen 
                        ? 'खेल महोत्सव पंजीकरण होम पेज पर चालू है (Registrations OPEN)' 
                        : 'खेल महोत्सव पंजीकरण अभी बंद है (Registrations CLOSED)'
                      }
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
                    {khelSettings.isOpen
                      ? 'गाँव के सभी युवा, खिलाड़ी व टीमें वेबसाइट के मुख्य पृष्ठ (Home page) से सीधे अपनी टीम रजिस्टर कर सकते हैं।'
                      : 'वर्तमान में होम पेज पर खेल महोत्सव का फॉर्म छिपा हुआ है। जब आप तैयार हों, तब यहाँ से "पंजीकरण शुरू करें" दबाएं।'
                    }
                  </p>
                </div>

                <button
                  onClick={handleToggleKhelRegistration}
                  className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-extrabold text-sm sm:text-base transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 shrink-0 ${
                    khelSettings.isOpen
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {khelSettings.isOpen ? (
                    <>
                      <FiToggleRight className="w-5 h-5 text-red-200" />
                      <span>🛑 पंजीकरण रोकें / बंद करें (Turn OFF)</span>
                    </>
                  ) : (
                    <>
                      <FiToggleLeft className="w-5 h-5 text-emerald-200" />
                      <span>🚀 होम पेज पर पंजीकरण शुरू करें (Start / Turn ON)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* EDIT TOURNAMENT DETAILS FORM (Collapsible) */}
            {isEditingKhelSettings && (
              <form onSubmit={handleSaveKhelSettings} className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b pb-2">
                  टूर्नामेंट विवरण (Tournament Information & Venue)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">प्रतियोगिता का नाम (Title)</label>
                    <input
                      type="text"
                      value={khelFormSettings.title}
                      onChange={(e) => setKhelFormSettings({ ...khelFormSettings, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">उपशीर्षक (Subtitle)</label>
                    <input
                      type="text"
                      value={khelFormSettings.subtitle}
                      onChange={(e) => setKhelFormSettings({ ...khelFormSettings, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">तारीख (Dates)</label>
                    <input
                      type="text"
                      value={khelFormSettings.dates}
                      onChange={(e) => setKhelFormSettings({ ...khelFormSettings, dates: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">खेल मैदान / स्थान (Venue)</label>
                    <input
                      type="text"
                      value={khelFormSettings.venue}
                      onChange={(e) => setKhelFormSettings({ ...khelFormSettings, venue: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-gray-700 mb-1">निर्देश या घोषणा (Notice / Guidelines)</label>
                    <textarea
                      value={khelFormSettings.instructions}
                      onChange={(e) => setKhelFormSettings({ ...khelFormSettings, instructions: e.target.value })}
                      rows={2}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingKhelSettings(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                  >
                    विवरण सहेजें (Save Changes)
                  </button>
                </div>
              </form>
            )}

            {/* SEARCH & SPORT FILTER BAR */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'Cricket', 'Volleyball', 'Kabaddi', 'Tug of War', 'Athletics', 'Badminton', 'Kho-Kho'].map(sp => (
                  <button
                    key={sp}
                    onClick={() => setKhelSportFilter(sp)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      khelSportFilter === sp 
                        ? 'bg-orange-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {sp === 'ALL' ? `सभी टीमें (${khelRegistrations.length})` : sp}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[220px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="टीम, कप्तान या नंबर खोजें..."
                  value={khelSearchQuery}
                  onChange={(e) => setKhelSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
            </div>

            {/* REGISTERED TEAMS LIST */}
            <div className="space-y-4">
              {(() => {
                const filtered = khelRegistrations.filter(reg => {
                  const matchSport = khelSportFilter === 'ALL' || reg.sport?.toLowerCase() === khelSportFilter.toLowerCase();
                  const q = khelSearchQuery.toLowerCase().trim();
                  const matchSearch = !q || 
                    reg.teamName?.toLowerCase().includes(q) || 
                    reg.captainName?.toLowerCase().includes(q) || 
                    reg.contact?.includes(q) ||
                    reg.village?.toLowerCase().includes(q) ||
                    reg.regId?.toLowerCase().includes(q);
                  return matchSport && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200 text-gray-500">
                      {khelRegistrations.length === 0 
                        ? 'अभी तक कोई खेल पंजीकरण प्राप्त नहीं हुआ है।' 
                        : 'इस फ़िल्टर या खोज शब्द के लिए कोई टीम नहीं मिली।'}
                    </div>
                  );
                }

                return filtered.map(reg => (
                  <div key={reg.id || reg.regId} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-orange-300 transition-all relative">
                    <button 
                      onClick={() => handleDeleteRegistration(reg._key || reg.id || reg.key)}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="पंजीकरण हटाएं"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pr-10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            {reg.regId || `REG-${reg.id?.toString().slice(-4)}`}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-gray-900 mt-1">{reg.teamName}</h4>
                        <span className="inline-block mt-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          {reg.sport}
                        </span>
                      </div>

                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">कप्तान / संपर्क सूत्र</p>
                        <p className="font-bold text-sm text-gray-800 mt-0.5">{reg.captainName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a 
                            href={`tel:${reg.contact}`}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                          >
                            📞 {reg.contact}
                          </a>
                          <a 
                            href={`https://wa.me/91${(reg.contact || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-green-600 hover:underline font-bold"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">गाँव / स्थान</p>
                        <p className="font-semibold text-xs sm:text-sm text-gray-700 mt-0.5">{reg.village || 'सरेरी (Sareri)'}</p>
                        <p className="text-[11px] text-gray-400 mt-1">तारीख: {reg.date || 'हाल ही में'}</p>
                      </div>

                      <div className="sm:col-span-2 lg:col-span-1">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">खिलाड़ियों की सूची</p>
                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-1 text-xs text-gray-700 line-clamp-3">
                          {reg.playerNames || 'खिलाड़ियों का विवरण उपलब्ध नहीं'}
                        </div>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Send Push Notification</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">Send an instant alert to all villagers who have allowed notifications on their devices.</p>

            {notificationDashboardError && <p className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{notificationDashboardError}</p>}
            {notificationDashboardLoading && <p className="mb-4 text-sm text-gray-500">Loading registered device statistics…</p>}
            {notificationDashboard.stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  ['Registered devices', notificationDashboard.stats.totalRegisteredDevices],
                  ['Active tokens', notificationDashboard.stats.activeTokens],
                  ['Android', notificationDashboard.stats.androidDevices],
                  ['iOS', notificationDashboard.stats.iosDevices],
                  ['Desktop', notificationDashboard.stats.desktopDevices],
                  ['Unclassified', notificationDashboard.stats.unclassifiedDevices],
                  ['Inactive / invalid', notificationDashboard.stats.inactiveOrInvalidTokens],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{value ?? 0}</p>
                  </div>
                ))}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 col-span-2 lg:col-span-1">
                  <p className="text-xs text-gray-500">Latest device activity (IST)</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {notificationDashboard.stats.lastSeen
                      ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notificationDashboard.stats.lastSeen))
                      : 'No last-seen data yet'}
                  </p>
                </div>
              </div>
            )}
            
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                  <select
                    value={notificationAudience}
                    onChange={(e) => setNotificationAudience(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 text-gray-800 font-medium"
                  >
                    <option value="all">All active subscribers</option>
                    <option value="android">Android devices</option>
                    <option value="ios">iOS devices</option>
                    <option value="desktop">Desktop devices</option>
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Click Link (Optional)</label>
                  <input 
                    type="url"
                    value={notifyLink}
                    onChange={(e) => setNotifyLink(e.target.value)}
                    placeholder="e.g. https://www.villagesareri.in/news"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 font-medium"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-left">The link that opens when users tap on the notification.</p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowNotificationPreview((visible) => !visible)}
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    {showNotificationPreview ? 'Hide preview' : 'Preview before sending'}
                  </button>
                  {showNotificationPreview && (
                    <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-orange-700 font-bold">Village Sareri notification preview</p>
                      <p className="mt-2 font-bold text-gray-900">{notifyTitle ? `${getNotifyPrefix(notifyType)}${notifyTitle}` : 'Notification title'}</p>
                      <p className="mt-1 text-sm text-gray-700">{notifyBody || 'Your message will appear here.'}</p>
                      <p className="mt-3 text-xs text-gray-500">
                        Audience: {notificationAudience === 'all' ? 'All active subscribers' : `${notificationAudience.toUpperCase()} devices`}
                        {notifyLink && ` · Link: ${notifyLink}`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Schedule Toggle */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiClock className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">{editingScheduleId ? 'Edit Scheduled Notification' : 'Schedule for Later'}</p>
                        <p className="text-xs text-gray-400">Saved on the server; the Admin Panel can be closed</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsScheduled(!isScheduled)}
                      disabled={Boolean(editingScheduleId)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isScheduled ? 'bg-indigo-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isScheduled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {isScheduled && (
                    <div className="mt-4">
                      <input
                        type="datetime-local"
                        value={scheduleDateTime}
                        onChange={(e) => setScheduleDateTime(e.target.value)}
                        min={formatKolkataDateTimeInput()}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white font-medium text-gray-800"
                        required={isScheduled}
                      />
                      <p className="text-xs text-amber-700 mt-2">
                        Uses Asia/Kolkata time. On the free Vercel plan, processing runs once daily around 5:30–6:30 AM IST; a notification may arrive nearly 24 hours after its selected time.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button 
                    type="submit"
                    disabled={isSending}
                    className={`flex items-center justify-center gap-2 w-full ${isScheduled ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/30'} text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isScheduled ? <FiClock className="w-5 h-5" /> : <FiSend className="w-5 h-5" />}
                    {isSending ? (editingScheduleId ? 'Saving...' : isScheduled ? 'Scheduling...' : 'Sending...') : editingScheduleId ? 'Update Scheduled Notification' : isScheduled ? 'Schedule Notification' : 'Broadcast Notification Now'}
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    {isScheduled ? 'FCM acceptance will be recorded; device delivery cannot be confirmed.' : 'Notifications are dispatched via Firebase Cloud Messaging.'}
                  </p>
                </div>
              </form>
            </div>

            {notificationResult && (
              <div className={`max-w-2xl mt-5 rounded-2xl border p-5 ${notificationResult.success ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`} role="status" aria-live="polite">
                <h3 className="font-bold text-gray-900">Latest send result: {notificationResult.status || 'Failed'}</h3>
                <p className="text-sm text-gray-700 mt-2">{notificationResultMessage(notificationResult)}</p>
                {notificationResult.error && <p className="text-sm text-red-700 mt-2">{notificationResult.error}</p>}
                {notificationResult.errors && Object.keys(notificationResult.errors).length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">Error types: {Object.entries(notificationResult.errors).map(([code, count]) => `${code} (${count})`).join(', ')}</p>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-2xl mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiClock className="text-amber-500" /> Scheduled Notifications
              </h3>
              {scheduledNotificationsLoading ? (
                <p className="text-sm text-gray-500">Loading scheduled notifications…</p>
              ) : scheduledNotifications.length === 0 ? (
                <p className="text-sm text-gray-500">No pending scheduled notifications.</p>
              ) : (
                <div className="space-y-3">
                  {scheduledNotifications.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm break-words">{item.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.scheduledAt ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.scheduledAt)) : 'Time unavailable'} IST · {item.audience} · {item.status}</p>
                        <p className="text-xs text-gray-500 mt-1 break-words">{item.body}</p>
                      </div>
                      {item.status === 'Scheduled' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => editScheduledNotification(item)}
                            className="text-indigo-700 hover:text-indigo-900 text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => cancelScheduledNotification(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Notification History</h3>
                  <p className="text-xs text-gray-500 mt-1">FCM acceptance is shown; device delivery is unconfirmed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadNotificationDashboard().then((dashboard) => dashboard.success && setNotificationDashboard(dashboard))}
                  className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Refresh
                </button>
              </div>
              {notificationDashboard.history.length === 0 ? (
                <p className="text-sm text-gray-500">{notificationDashboardLoading ? 'Loading history…' : 'No notification history is available yet.'}</p>
              ) : (
                <div className="space-y-3">
                  {notificationDashboard.history.map((item) => {
                    const statusColor = item.status === 'FCM Accepted'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'Partially Failed'
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700';
                    const dateLabel = item.createdAt
                      ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))
                      : 'Date unavailable';

                    return (
                      <article key={item.id} className="rounded-xl border border-gray-200 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 break-words">{item.title || 'Untitled notification'}</h4>
                            <p className="text-sm text-gray-600 mt-1 break-words">{item.body}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor}`}>{item.status}</span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Audience: {item.targetAudience}</span>
                          <span>{dateLabel} IST</span>
                          <span>By: {item.createdBy}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <span>Targeted: <strong>{item.totalTargetedDevices}</strong></span>
                          <span>FCM accepted: <strong>{item.fcmAcceptedCount}</strong></span>
                          <span>Failed: <strong>{item.failedCount}</strong></span>
                          <span>Invalid: <strong>{item.invalidTokenCount}</strong></span>
                        </div>
                        {!item.deliveryConfirmed && <p className="text-xs text-gray-500 mt-2">Device delivery has not been confirmed.</p>}
                      </article>
                    );
                  })}
                </div>
              )}
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

        {activeTab === 'gallery' && (
          <div className="mb-10">
            <ManageGallery />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="mb-10">
            <ManageAchievements />
          </div>
        )}

          </div>
        </main>
      </div>

      {/* Theme-Styled Custom Confirmation Modal (Replaces browser window.confirm) */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        isProcessing={confirmModal.isProcessing}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Theme-Styled Non-Blocking Toast Notification (Replaces browser window.alert) */}
      <ToastPopup 
        toast={toast} 
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
};

export default Admin;
