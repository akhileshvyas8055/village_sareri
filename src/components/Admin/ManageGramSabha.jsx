import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { rtdb, storage } from '../../firebase';
import { ConfirmModal } from './ThemeModal';
import { DEFAULT_MEETINGS, DEFAULT_RESOLUTIONS, MEETING_TYPES, RESOLUTION_STATUSES } from '../../data/defaultGramSabha';
import {
  FiUsers,
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiClock,
  FiMapPin,
  FiFileText,
  FiUploadCloud,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiActivity,
  FiLayers,
  FiArrowRight,
  FiCheck,
  FiDownload
} from 'react-icons/fi';

const ManageGramSabha = () => {
  // Sub-tabs in Admin
  const [adminTab, setAdminTab] = useState('meetings'); // 'meetings' | 'resolutions' | 'attendance'

  // Data states
  const [meetings, setMeetings] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [meetingSearch, setMeetingSearch] = useState('');
  const [meetingFilterStatus, setMeetingFilterStatus] = useState('ALL');
  const [resolutionSearch, setResolutionSearch] = useState('');
  const [resolutionFilterStatus, setResolutionFilterStatus] = useState('ALL');

  // Meeting Modal State
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    type: 'साधारण',
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00 AM',
    endTime: '03:00 PM',
    venue: 'ग्राम पंचायत भवन, सरेरी',
    description: '',
    agenda: ['पिछली बैठक की कार्यवाही की पुष्टि', 'विकास कार्यों की समीक्षा', 'नए प्रस्तावों पर चर्चा', 'अन्य सार्वजनिक विषय'],
    agendaPdfUrl: '',
    minutesPdfUrl: '',
    status: 'Scheduled', // 'Scheduled' | 'Completed' | 'Postponed' | 'Cancelled'
    statusReason: '',
    noticeText: 'सभी सम्मानित ग्रामवासी समय पर उपस्थित होकर अपने विचार रखें।',
    attendeeCount: 0,
    quorumReached: true,
    isPublished: true
  });
  const [agendaInput, setAgendaInput] = useState('');
  const [uploadingAgendaPdf, setUploadingAgendaPdf] = useState(false);
  const [uploadingMinutesPdf, setUploadingMinutesPdf] = useState(false);

  // Resolution Modal State
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [editingResolutionId, setEditingResolutionId] = useState(null);
  const [resolutionForm, setResolutionForm] = useState({
    resolutionNumber: '',
    meetingId: '',
    title: '',
    description: '',
    approvalDate: new Date().toISOString().split('T')[0],
    responsibleDepartment: 'ग्राम पंचायत सरेरी',
    status: 'पारित', // 'प्रस्तावित' | 'पारित' | 'प्रगति में' | 'पूर्ण' | 'स्थगित'
    progressNotes: '',
    documentUrl: '',
    isPublished: true
  });
  const [uploadingResolutionDoc, setUploadingResolutionDoc] = useState(false);

  // Attendance Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    attendeeCount: 0,
    quorumReached: true,
    quorumRemarks: '',
    attendanceSheetUrl: ''
  });
  const [uploadingAttendanceSheet, setUploadingAttendanceSheet] = useState(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: null,
    isProcessing: false
  });

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Fetch Meetings & Resolutions from RTDB
  useEffect(() => {
    const meetingsRef = ref(rtdb, 'adminData/gramSabha/meetings');
    const unsubMeetings = onValue(meetingsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .filter(m => !m.id?.startsWith('GS-2026-M') && !m.id?.startsWith('GS-2025-M'));
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setMeetings(list);
      } else {
        setMeetings([]);
      }
      setLoading(false);
    });

    const resolutionsRef = ref(rtdb, 'adminData/gramSabha/resolutions');
    const unsubResolutions = onValue(resolutionsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .filter(r => !r.id?.startsWith('GPKS-GS-2026-R') && !r.id?.startsWith('GPKS-GS-2025-R'));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setResolutions(list);
      } else {
        setResolutions([]);
      }
    });

    return () => {
      unsubMeetings();
      unsubResolutions();
    };
  }, []);

  // Admin Dashboard Statistics
  const stats = useMemo(() => {
    const totalMeetings = meetings.length;
    const today = new Date().toISOString().split('T')[0];
    const upcomingMeetings = meetings.filter(
      (m) => (m.status === 'Scheduled' || !m.status) && m.date >= today
    ).length;
    const completedMeetings = meetings.filter(
      (m) => m.status === 'Completed' || (m.status === 'Scheduled' && m.date < today)
    ).length;

    const totalResolutions = resolutions.length;
    const pendingResolutions = resolutions.filter(
      (r) => r.status === 'प्रस्तावित' || r.status === 'प्रगति में'
    ).length;
    const completedResolutions = resolutions.filter((r) => r.status === 'पूर्ण').length;

    return {
      totalMeetings,
      upcomingMeetings,
      completedMeetings,
      totalResolutions,
      pendingResolutions,
      completedResolutions
    };
  }, [meetings, resolutions]);

  // Filtered Meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const matchSearch =
        meetingSearch === '' ||
        m.title?.toLowerCase().includes(meetingSearch.toLowerCase()) ||
        m.venue?.toLowerCase().includes(meetingSearch.toLowerCase());
      const matchStatus =
        meetingFilterStatus === 'ALL' || m.status === meetingFilterStatus;
      return matchSearch && matchStatus;
    });
  }, [meetings, meetingSearch, meetingFilterStatus]);

  // Filtered Resolutions
  const filteredResolutions = useMemo(() => {
    return resolutions.filter((r) => {
      const matchSearch =
        resolutionSearch === '' ||
        r.resolutionNumber?.toLowerCase().includes(resolutionSearch.toLowerCase()) ||
        r.title?.toLowerCase().includes(resolutionSearch.toLowerCase()) ||
        r.responsibleDepartment?.toLowerCase().includes(resolutionSearch.toLowerCase());
      const matchStatus =
        resolutionFilterStatus === 'ALL' || r.status === resolutionFilterStatus;
      return matchSearch && matchStatus;
    });
  }, [resolutions, resolutionSearch, resolutionFilterStatus]);

  // Helper for uploading files to Firebase Storage
  const handleUploadFile = async (file, pathPrefix) => {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = storageRef(storage, `gramSabha/${pathPrefix}/${Date.now()}_${sanitizedName}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      return downloadUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  // ==========================================
  // MEETING ACTIONS
  // ==========================================
  const handleOpenAddMeeting = () => {
    setEditingMeetingId(null);
    setMeetingForm({
      title: '',
      type: 'साधारण',
      date: new Date().toISOString().split('T')[0],
      startTime: '11:00 AM',
      endTime: '03:00 PM',
      venue: 'ग्राम पंचायत भवन, सरेरी',
      description: '',
      agenda: ['पिछली बैठक की कार्यवाही की पुष्टि', 'विकास कार्यों की समीक्षा', 'नए प्रस्तावों पर चर्चा', 'अन्य सार्वजनिक विषय'],
      agendaPdfUrl: '',
      minutesPdfUrl: '',
      status: 'Scheduled',
      statusReason: '',
      noticeText: 'सभी सम्मानित ग्रामवासी समय पर उपस्थित होकर अपने विचार रखें।',
      attendeeCount: 0,
      quorumReached: true,
      isPublished: true
    });
    setAgendaInput('');
    setIsMeetingModalOpen(true);
  };

  const handleOpenEditMeeting = (m) => {
    setEditingMeetingId(m.id);
    setMeetingForm({
      title: m.title || '',
      type: m.type || 'साधारण',
      date: m.date || new Date().toISOString().split('T')[0],
      startTime: m.startTime || '11:00 AM',
      endTime: m.endTime || '',
      venue: m.venue || 'ग्राम पंचायत भवन, सरेरी',
      description: m.description || '',
      agenda: Array.isArray(m.agenda) ? [...m.agenda] : [],
      agendaPdfUrl: m.agendaPdfUrl || '',
      minutesPdfUrl: m.minutesPdfUrl || '',
      status: m.status || 'Scheduled',
      statusReason: m.statusReason || '',
      noticeText: m.noticeText || '',
      attendeeCount: m.attendeeCount || 0,
      quorumReached: m.quorumReached !== false,
      isPublished: m.isPublished !== false
    });
    setAgendaInput('');
    setIsMeetingModalOpen(true);
  };

  const handleAddAgendaPoint = () => {
    if (!agendaInput.trim()) return;
    setMeetingForm((prev) => ({
      ...prev,
      agenda: [...prev.agenda, agendaInput.trim()]
    }));
    setAgendaInput('');
  };

  const handleRemoveAgendaPoint = (index) => {
    setMeetingForm((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }));
  };

  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) {
      alert('कृपया बैठक का शीर्षक दर्ज करें।');
      return;
    }

    try {
      if (editingMeetingId) {
        // Update existing
        const meetingRef = ref(rtdb, `adminData/gramSabha/meetings/${editingMeetingId}`);
        await update(meetingRef, {
          ...meetingForm,
          updatedAt: Date.now()
        });
        showToast('ग्राम सभा बैठक सफलतापूर्वक अपडेट की गई!');
      } else {
        // Create new
        const meetingsRef = ref(rtdb, 'adminData/gramSabha/meetings');
        const newRef = push(meetingsRef);
        await set(newRef, {
          id: newRef.key,
          ...meetingForm,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        showToast('नई ग्राम सभा बैठक सफलतापूर्वक जोड़ी गई!');
      }
      setIsMeetingModalOpen(false);
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('बैठक सहेजने में त्रुटि हुई: ' + error.message);
    }
  };

  const handleToggleMeetingPublish = async (m) => {
    try {
      const meetingRef = ref(rtdb, `adminData/gramSabha/meetings/${m.id}`);
      await update(meetingRef, {
        isPublished: !m.isPublished,
        updatedAt: Date.now()
      });
      showToast(
        !m.isPublished ? 'बैठक सार्वजनिक रूप से प्रकाशित कर दी गई!' : 'बैठक को ड्राफ्ट (अप्रकाशित) कर दिया गया।'
      );
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert('त्रुटि: ' + error.message);
    }
  };

  const handleDeleteMeeting = (m) => {
    setConfirmModal({
      isOpen: true,
      title: 'ग्राम सभा बैठक हटाएं?',
      message: `क्या आप सुनिश्चित हैं कि आप बैठक "${m.title}" को हमेशा के लिए हटाना चाहते हैं?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
          const meetingRef = ref(rtdb, `adminData/gramSabha/meetings/${m.id}`);
          await remove(meetingRef);
          showToast('बैठक सफलतापूर्वक हटा दी गई।');
          setConfirmModal({ isOpen: false, isProcessing: false });
        } catch (err) {
          console.error('Error deleting meeting:', err);
          alert('हटाने में त्रुटि: ' + err.message);
          setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
        }
      }
    });
  };

  // Quick Postpone / Cancel Meeting
  const handleQuickStatusChange = (m, newStatus) => {
    const reasonPrompt = window.prompt(
      `कृपया ${newStatus === 'Postponed' ? 'स्थगित' : 'रद्द'} करने का आधिकारिक कारण दर्ज करें:`
    );
    if (reasonPrompt === null) return; // User cancelled prompt

    const meetingRef = ref(rtdb, `adminData/gramSabha/meetings/${m.id}`);
    update(meetingRef, {
      status: newStatus,
      statusReason: reasonPrompt,
      updatedAt: Date.now()
    })
      .then(() => showToast(`बैठक को ${newStatus === 'Postponed' ? 'स्थगित' : 'रद्द'} कर दिया गया।`))
      .catch((err) => alert('त्रुटि: ' + err.message));
  };

  // ==========================================
  // RESOLUTION ACTIONS
  // ==========================================
  const handleOpenAddResolution = () => {
    setEditingResolutionId(null);
    // Generate auto resolution number e.g. GPKS-GS-2026-RXX
    const currentYear = new Date().getFullYear();
    const nextNum = resolutions.length + 1;
    const padded = nextNum < 10 ? `0${nextNum}` : nextNum;
    const generatedNumber = `GPKS-GS-${currentYear}-R${padded}`;

    const defaultMeeting = meetings.length > 0 ? meetings[0].id : '';

    setResolutionForm({
      resolutionNumber: generatedNumber,
      meetingId: defaultMeeting,
      title: '',
      description: '',
      approvalDate: new Date().toISOString().split('T')[0],
      responsibleDepartment: 'ग्राम पंचायत सरेरी',
      status: 'पारित',
      progressNotes: '',
      documentUrl: '',
      isPublished: true
    });
    setIsResolutionModalOpen(true);
  };

  const handleOpenEditResolution = (res) => {
    setEditingResolutionId(res.id);
    setResolutionForm({
      resolutionNumber: res.resolutionNumber || '',
      meetingId: res.meetingId || (meetings.length > 0 ? meetings[0].id : ''),
      title: res.title || '',
      description: res.description || '',
      approvalDate: res.approvalDate || new Date().toISOString().split('T')[0],
      responsibleDepartment: res.responsibleDepartment || 'ग्राम पंचायत सरेरी',
      status: res.status || 'पारित',
      progressNotes: res.progressNotes || '',
      documentUrl: res.documentUrl || '',
      isPublished: res.isPublished !== false
    });
    setIsResolutionModalOpen(true);
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    if (!resolutionForm.title.trim() || !resolutionForm.resolutionNumber.trim()) {
      alert('कृपया प्रस्ताव संख्या एवं शीर्षक दर्ज करें।');
      return;
    }

    // Find linked meeting title for quick display
    const linkedMeeting = meetings.find((m) => m.id === resolutionForm.meetingId);
    const meetingTitle = linkedMeeting ? linkedMeeting.title : '';

    try {
      if (editingResolutionId) {
        const resRef = ref(rtdb, `adminData/gramSabha/resolutions/${editingResolutionId}`);
        await update(resRef, {
          ...resolutionForm,
          meetingTitle,
          updatedAt: Date.now()
        });
        showToast('प्रस्ताव सफलतापूर्वक अपडेट किया गया!');
      } else {
        const resListRef = ref(rtdb, 'adminData/gramSabha/resolutions');
        const newRef = push(resListRef);
        await set(newRef, {
          id: newRef.key,
          ...resolutionForm,
          meetingTitle,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        showToast('नया ग्राम सभा प्रस्ताव सफलतापूर्वक जोड़ा गया!');
      }
      setIsResolutionModalOpen(false);
    } catch (error) {
      console.error('Error saving resolution:', error);
      alert('प्रस्ताव सहेजने में त्रुटि: ' + error.message);
    }
  };

  const handleDeleteResolution = (res) => {
    setConfirmModal({
      isOpen: true,
      title: 'प्रस्ताव हटाएं?',
      message: `क्या आप प्रस्ताव "${res.resolutionNumber} - ${res.title}" को हमेशा के लिए हटाना चाहते हैं?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
          const resRef = ref(rtdb, `adminData/gramSabha/resolutions/${res.id}`);
          await remove(resRef);
          showToast('प्रस्ताव सफलतापूर्वक हटा दिया गया।');
          setConfirmModal({ isOpen: false, isProcessing: false });
        } catch (err) {
          console.error('Error deleting resolution:', err);
          alert('हटाने में त्रुटि: ' + err.message);
          setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
        }
      }
    });
  };

  // ==========================================
  // ATTENDANCE & QUORUM ACTIONS
  // ==========================================
  const handleOpenAttendanceModal = (m) => {
    setAttendanceMeeting(m);
    setAttendanceForm({
      attendeeCount: m.attendeeCount || 0,
      quorumReached: m.quorumReached !== false,
      quorumRemarks: m.quorumRemarks || '',
      attendanceSheetUrl: m.attendanceSheetUrl || ''
    });
    setIsAttendanceModalOpen(true);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceMeeting) return;

    try {
      const meetingRef = ref(rtdb, `adminData/gramSabha/meetings/${attendanceMeeting.id}`);
      await update(meetingRef, {
        attendeeCount: Number(attendanceForm.attendeeCount) || 0,
        quorumReached: Boolean(attendanceForm.quorumReached),
        quorumRemarks: attendanceForm.quorumRemarks,
        attendanceSheetUrl: attendanceForm.attendanceSheetUrl,
        updatedAt: Date.now()
      });
      showToast('उपस्थिति एवं कोरम विवरण सुरक्षित कर लिया गया!');
      setIsAttendanceModalOpen(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('त्रुटि: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] bg-[#135334] text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-3 animate-in fade-in duration-200">
          <FiCheckCircle className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* ADMIN MODULE HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#135334] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
            <FiUsers className="w-3.5 h-3.5" />
            <span>ई-पंचायत ग्राम सभा प्रणाली</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            ग्राम सभा प्रबंधन (Gram Sabha Management)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            बैठकें, एजेंडा बिंदु, पारित प्रस्ताव, कोरम उपस्थिति और विकास निर्णयों का पूर्ण प्रशासनिक नियंत्रण।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenAddMeeting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#135334] hover:bg-[#0e4027] text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <FiPlus className="w-4 h-4" />
            <span>नई बैठक जोड़ें</span>
          </button>

          <button
            onClick={handleOpenAddResolution}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            <FiFileText className="w-4 h-4" />
            <span>नया प्रस्ताव जोड़ें</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD STATISTICS 6 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase">कुल बैठकें</span>
          <span className="text-2xl font-extrabold text-[#135334]">{stats.totalMeetings}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase">आगामी बैठकें</span>
          <span className="text-2xl font-extrabold text-blue-700">{stats.upcomingMeetings}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase">सम्पन्न बैठकें</span>
          <span className="text-2xl font-extrabold text-emerald-700">{stats.completedMeetings}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase">कुल प्रस्ताव</span>
          <span className="text-2xl font-extrabold text-purple-700">{stats.totalResolutions}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase">प्रगति में प्रस्ताव</span>
          <span className="text-2xl font-extrabold text-amber-700">{stats.pendingResolutions}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-teal-100 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-400 block uppercase">पूर्ण प्रस्ताव</span>
          <span className="text-2xl font-extrabold text-teal-700">{stats.completedResolutions}</span>
        </div>
      </div>

      {/* SUB-TABS SWITCHER */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setAdminTab('meetings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            adminTab === 'meetings'
              ? 'bg-[#135334] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FiCalendar className="w-4 h-4" />
          <span>बैठक प्रबंधन (Meetings) ({meetings.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('resolutions')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            adminTab === 'resolutions'
              ? 'bg-[#135334] text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <FiFileText className="w-4 h-4" />
          <span>प्रस्ताव प्रबंधन (Resolutions) ({resolutions.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MANAGE MEETINGS */}
      {/* ========================================================================= */}
      {adminTab === 'meetings' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="बैठक का नाम या स्थान खोजें..."
                value={meetingSearch}
                onChange={(e) => setMeetingSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={meetingFilterStatus}
                onChange={(e) => setMeetingFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-white text-gray-700"
              >
                <option value="ALL">सभी स्थितियां (All Status)</option>
                <option value="Scheduled">नियोजित (Scheduled)</option>
                <option value="Completed">सम्पन्न (Completed)</option>
                <option value="Postponed">स्थगित (Postponed)</option>
                <option value="Cancelled">रद्द (Cancelled)</option>
              </select>
            </div>
          </div>

          {/* Meetings List */}
          {filteredMeetings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiCalendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">कोई बैठक नहीं मिली।</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredMeetings.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl border border-gray-200 hover:border-[#135334]/40 bg-white transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#135334] border border-emerald-200">
                        {m.type || 'साधारण'}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          m.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : m.status === 'Postponed'
                            ? 'bg-amber-100 text-amber-800'
                            : m.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {m.status || 'Scheduled'}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          m.isPublished !== false ? 'bg-emerald-50 text-[#135334]' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {m.isPublished !== false ? 'सार्वजनिक' : 'ड्राफ्ट'}
                      </span>
                      <span className="text-xs text-gray-400">दिनांक: {m.date}</span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-gray-900">{m.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      <strong>स्थान:</strong> {m.venue} | <strong>समय:</strong> {m.startTime}
                      {m.attendeeCount > 0 && ` | उपस्थिति: ${m.attendeeCount}`}
                    </p>

                    {/* Agenda chips preview */}
                    {Array.isArray(m.agenda) && m.agenda.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.agenda.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md truncate max-w-[200px]"
                          >
                            • {item}
                          </span>
                        ))}
                        {m.agenda.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{m.agenda.length - 3} और</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    <button
                      onClick={() => handleOpenAttendanceModal(m)}
                      title="उपस्थिति व कोरम दर्ज करें"
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <FiUsers className="w-3.5 h-3.5" />
                      उपस्थिति
                    </button>

                    <button
                      onClick={() => handleToggleMeetingPublish(m)}
                      title={m.isPublished !== false ? 'अप्रकाशित करें' : 'प्रकाशित करें'}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                        m.isPublished !== false
                          ? 'bg-emerald-50 text-[#135334] hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {m.isPublished !== false ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleOpenEditMeeting(m)}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                      title="संपादित करें"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteMeeting(m)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="हटाएं"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAGE RESOLUTIONS */}
      {/* ========================================================================= */}
      {adminTab === 'resolutions' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="प्रस्ताव संख्या या शीर्षक खोजें..."
                value={resolutionSearch}
                onChange={(e) => setResolutionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
              />
            </div>

            <select
              value={resolutionFilterStatus}
              onChange={(e) => setResolutionFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-white text-gray-700"
            >
              <option value="ALL">सभी स्थितियां (All Status)</option>
              {RESOLUTION_STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Resolutions List */}
          {filteredResolutions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">कोई प्रस्ताव नहीं मिला।</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredResolutions.map((res) => {
                const statusObj = RESOLUTION_STATUSES.find((s) => s.id === res.status) || {
                  color: 'bg-gray-100 text-gray-800'
                };

                return (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl border border-gray-200 hover:border-[#135334]/40 bg-white transition-all flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#135334] border border-emerald-200">
                          {res.resolutionNumber}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusObj.color}`}>
                          {res.status}
                        </span>
                        <span className="text-xs text-gray-400">स्वीकृति: {res.approvalDate}</span>
                      </div>

                      <h4 className="text-base font-bold text-gray-900">{res.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{res.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-1">
                        <span>
                          <strong>विभाग:</strong> {res.responsibleDepartment || 'सरेरी पंचायत'}
                        </span>
                        {res.progressNotes && (
                          <span className="text-amber-700">
                            <strong>प्रगति:</strong> {res.progressNotes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      {res.documentUrl && (
                        <a
                          href={res.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          title="दस्तावेज देखें"
                        >
                          <FiDownload className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleOpenEditResolution(res)}
                        className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        title="संपादित करें"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteResolution(res)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="हटाएं"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT MEETING */}
      {/* ========================================================================= */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#135334] text-white p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingMeetingId ? 'ग्राम सभा बैठक संपादित करें' : 'नई ग्राम सभा बैठक जोड़ें'}
              </h3>
              <button
                onClick={() => setIsMeetingModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveMeeting} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">बैठक शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. वार्षिक ग्राम सभा बैठक 2026 – विकास कार्य अनुमोदन"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">बैठक प्रकार *</label>
                  <select
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                  >
                    <option value="साधारण">साधारण ग्राम सभा (Regular)</option>
                    <option value="विशेष">विशेष ग्राम सभा (Special)</option>
                    <option value="आपातकालीन">आपातकालीन ग्राम सभा (Emergency)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">दिनांक *</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">प्रारंभ समय *</label>
                  <input
                    type="text"
                    required
                    placeholder="प्रातः 11:00 बजे"
                    value={meetingForm.startTime}
                    onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">समापन समय (वैकल्पिक)</label>
                  <input
                    type="text"
                    placeholder="दोपहर 03:00 बजे"
                    value={meetingForm.endTime}
                    onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">बैठक स्थिति</label>
                  <select
                    value={meetingForm.status}
                    onChange={(e) => setMeetingForm({ ...meetingForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                  >
                    <option value="Scheduled">नियोजित (Scheduled)</option>
                    <option value="Completed">सम्पन्न (Completed)</option>
                    <option value="Postponed">स्थगित (Postponed)</option>
                    <option value="Cancelled">रद्द (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">स्थान (Venue) *</label>
                <input
                  type="text"
                  required
                  placeholder="ग्राम पंचायत भवन प्रांगण, सरेरी"
                  value={meetingForm.venue}
                  onChange={(e) => setMeetingForm({ ...meetingForm, venue: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">विवरण (Description)</label>
                <textarea
                  rows={2}
                  placeholder="बैठक का उद्देश्य एवं ग्रामीण सहभागिता हेतु संदेश..."
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              {/* Dynamic Agenda Points */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <label className="block text-xs font-bold text-gray-800 uppercase">
                  बैठक के एजेंडा बिंदु (Agenda Points)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="नया एजेंडा बिंदु लिखें..."
                    value={agendaInput}
                    onChange={(e) => setAgendaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAgendaPoint();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAgendaPoint}
                    className="px-4 py-2 bg-[#135334] text-white text-xs font-bold rounded-xl"
                  >
                    जोड़ें
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                  {meetingForm.agenda.map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800"
                    >
                      <span className="truncate">
                        <strong>{idx + 1}.</strong> {pt}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAgendaPoint(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PDF Documents: Agenda & Minutes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    एजेंडा PDF (दस्तावेज URL या अपलोड)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... या फाइल चुनें"
                    value={meetingForm.agendaPdfUrl}
                    onChange={(e) => setMeetingForm({ ...meetingForm, agendaPdfUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white mb-1.5"
                  />
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploadingAgendaPdf(true);
                      try {
                        const url = await handleUploadFile(file, 'agendas');
                        setMeetingForm((prev) => ({ ...prev, agendaPdfUrl: url }));
                        showToast('एजेंडा PDF अपलोड सफल!');
                      } catch {
                        alert('अपलोड विफल रहा');
                      }
                      setUploadingAgendaPdf(false);
                    }}
                    className="text-[11px] text-gray-500"
                  />
                  {uploadingAgendaPdf && <span className="text-[10px] text-emerald-700 block">अपलोड हो रहा है...</span>}
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    कार्यवाही विवरण (Minutes PDF)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... या फाइल चुनें"
                    value={meetingForm.minutesPdfUrl}
                    onChange={(e) => setMeetingForm({ ...meetingForm, minutesPdfUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white mb-1.5"
                  />
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploadingMinutesPdf(true);
                      try {
                        const url = await handleUploadFile(file, 'minutes');
                        setMeetingForm((prev) => ({ ...prev, minutesPdfUrl: url }));
                        showToast('कार्यवाही विवरण PDF अपलोड सफल!');
                      } catch {
                        alert('अपलोड विफल रहा');
                      }
                      setUploadingMinutesPdf(false);
                    }}
                    className="text-[11px] text-gray-500"
                  />
                  {uploadingMinutesPdf && <span className="text-[10px] text-blue-700 block">अपलोड हो रहा है...</span>}
                </div>
              </div>

              {/* Status Reason if postponed/cancelled */}
              {(meetingForm.status === 'Postponed' || meetingForm.status === 'Cancelled') && (
                <div>
                  <label className="block text-xs font-bold text-rose-700 uppercase mb-1">
                    स्थगित / रद्द करने का आधिकारिक कारण *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. अपरिहार्य प्रशासनिक कारणों से बैठक आगामी आदेश तक स्थगित..."
                    value={meetingForm.statusReason}
                    onChange={(e) => setMeetingForm({ ...meetingForm, statusReason: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-rose-300 text-sm bg-rose-50/40"
                  />
                </div>
              )}

              {/* Publish Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="publishCheckbox"
                  checked={meetingForm.isPublished}
                  onChange={(e) => setMeetingForm({ ...meetingForm, isPublished: e.target.checked })}
                  className="w-4 h-4 text-[#135334] rounded"
                />
                <label htmlFor="publishCheckbox" className="text-xs sm:text-sm font-semibold text-gray-700">
                  सार्वजनिक रूप से पोर्टल पर तुरंत प्रकाशित करें (Publish Now)
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#135334] text-white text-xs sm:text-sm font-bold hover:bg-[#0e4027]"
                >
                  {editingMeetingId ? 'बदलाव सहेजें' : 'बैठक सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT RESOLUTION */}
      {/* ========================================================================= */}
      {isResolutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-purple-800 text-white p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingResolutionId ? 'प्रस्ताव विवरण संपादित करें' : 'नया ग्राम सभा प्रस्ताव जोड़ें'}
              </h3>
              <button
                onClick={() => setIsResolutionModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveResolution} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    प्रस्ताव संख्या (Resolution No) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. GPKS-GS-2026-R01"
                    value={resolutionForm.resolutionNumber}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, resolutionNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">संबद्ध बैठक *</label>
                  <select
                    value={resolutionForm.meetingId}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, meetingId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                  >
                    {meetings.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} ({m.date})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">प्रस्ताव शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. वार्ड 3 में सीसी सड़क व नाली निर्माण"
                  value={resolutionForm.title}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">प्रस्ताव का विस्तृत विवरण *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="प्रस्ताव का संपूर्ण विवरण, कार्यक्षेत्र और अनुमोदन का संदर्भ..."
                  value={resolutionForm.description}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">स्वीकृति दिनांक *</label>
                  <input
                    type="date"
                    required
                    value={resolutionForm.approvalDate}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, approvalDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">वर्तमान स्थिति *</label>
                  <select
                    value={resolutionForm.status}
                    onChange={(e) => setResolutionForm({ ...resolutionForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white font-bold text-gray-800"
                  >
                    {RESOLUTION_STATUSES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  जिम्मेदार विभाग / अधिकारी
                </label>
                <input
                  type="text"
                  placeholder="उदा. सार्वजनिक निर्माण विभाग (PWD) / ग्राम विकास अधिकारी"
                  value={resolutionForm.responsibleDepartment}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, responsibleDepartment: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  प्रगति टिप्पणी / नवीनतम स्थिति (Progress Notes)
                </label>
                <textarea
                  rows={2}
                  placeholder="उदा. तकनीकी स्वीकृति प्राप्त, सामग्री निविदा आमंत्रित, 65% कार्य पूर्ण..."
                  value={resolutionForm.progressNotes}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, progressNotes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              {/* Supporting Document */}
              <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                <label className="block text-[11px] font-bold text-purple-900 uppercase mb-1">
                  प्रस्ताव आधिकारिक दस्तावेज (PDF URL या फाइल)
                </label>
                <input
                  type="text"
                  placeholder="https://... या फाइल अपलोड करें"
                  value={resolutionForm.documentUrl}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, documentUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white mb-1.5"
                />
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploadingResolutionDoc(true);
                    try {
                      const url = await handleUploadFile(file, 'resolutions');
                      setResolutionForm((prev) => ({ ...prev, documentUrl: url }));
                      showToast('प्रस्ताव दस्तावेज अपलोड सफल!');
                    } catch {
                      alert('अपलोड विफल रहा');
                    }
                    setUploadingResolutionDoc(false);
                  }}
                  className="text-[11px] text-gray-500"
                />
                {uploadingResolutionDoc && <span className="text-[10px] text-purple-700 block">अपलोड हो रहा है...</span>}
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="resPublishCheckbox"
                  checked={resolutionForm.isPublished}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, isPublished: e.target.checked })}
                  className="w-4 h-4 text-purple-700 rounded"
                />
                <label htmlFor="resPublishCheckbox" className="text-xs sm:text-sm font-semibold text-gray-700">
                  सार्वजनिक पोर्टल पर तुरंत प्रदर्शित करें
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsResolutionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs sm:text-sm font-bold hover:bg-purple-800"
                >
                  {editingResolutionId ? 'बदलाव सहेजें' : 'प्रस्ताव सुरक्षित करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ATTENDANCE & QUORUM MODAL */}
      {/* ========================================================================= */}
      {isAttendanceModalOpen && attendanceMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-teal-700 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-teal-200 uppercase tracking-wider block">उपस्थिति एवं कोरम प्रबंधन</span>
                <h3 className="text-lg font-bold">{attendanceMeeting.title}</h3>
              </div>
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  उपस्थित ग्रामीण नागरिकों की कुल संख्या *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={attendanceForm.attendeeCount}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, attendeeCount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  कोरम स्थिति (Quorum Status)
                </label>
                <div className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="quorum"
                      checked={attendanceForm.quorumReached === true}
                      onChange={() => setAttendanceForm({ ...attendanceForm, quorumReached: true })}
                      className="text-teal-700"
                    />
                    कोरम पूर्ण (Quorum Reached)
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="quorum"
                      checked={attendanceForm.quorumReached === false}
                      onChange={() => setAttendanceForm({ ...attendanceForm, quorumReached: false })}
                      className="text-teal-700"
                    />
                    कोरम अपूर्ण (Quorum Not Met)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  कोरम टिप्पणी (Quorum Remarks)
                </label>
                <input
                  type="text"
                  placeholder="उदा. कुल मतदाता संख्या के 10% से अधिक ग्रामीण उपस्थित रहे।"
                  value={attendanceForm.quorumRemarks}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, quorumRemarks: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  हस्ताक्षरित उपस्थिति पत्रक (Attendance Sheet PDF / Document URL)
                </label>
                <input
                  type="text"
                  placeholder="https://... या फाइल अपलोड करें"
                  value={attendanceForm.attendanceSheetUrl}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, attendanceSheetUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs mb-2"
                />
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploadingAttendanceSheet(true);
                    try {
                      const url = await handleUploadFile(file, 'attendance');
                      setAttendanceForm((prev) => ({ ...prev, attendanceSheetUrl: url }));
                      showToast('उपस्थिति पत्रक अपलोड सफल!');
                    } catch {
                      alert('अपलोड विफल रहा');
                    }
                    setUploadingAttendanceSheet(false);
                  }}
                  className="text-xs text-gray-500"
                />
                {uploadingAttendanceSheet && <span className="text-[10px] text-teal-700 block">अपलोड हो रहा है...</span>}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 text-white text-xs sm:text-sm font-bold hover:bg-teal-800"
                >
                  उपस्थिति सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isProcessing={confirmModal.isProcessing}
      />
    </div>
  );
};

export default ManageGramSabha;
