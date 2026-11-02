import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { rtdb, storage } from '../../firebase';
import { ConfirmModal } from './ThemeModal';
import * as XLSX from 'xlsx-js-style';
import {
  FiActivity,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiUploadCloud,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiX,
  FiCheck,
  FiFileText,
  FiImage,
  FiDollarSign,
  FiMapPin,
  FiMessageSquare,
  FiStar,
  FiPieChart,
  FiLayers
} from 'react-icons/fi';

const CATEGORIES = [
  'Road Construction',
  'Drainage',
  'Drinking Water',
  'Street Lighting',
  'Sanitation',
  'School Infrastructure',
  'Health Infrastructure',
  'Community Buildings',
  'Parks/Public Spaces',
  'Other'
];

const CATEGORY_LABELS = {
  'Road Construction': 'सड़क निर्माण (Road Construction)',
  'Drainage': 'जल निकासी / नाली (Drainage)',
  'Drinking Water': 'पेयजल आपूर्ति (Drinking Water)',
  'Street Lighting': 'स्ट्रीट लाइट / CCTV (Street Lighting)',
  'Sanitation': 'स्वच्छता व कचरा प्रबंधन (Sanitation)',
  'School Infrastructure': 'विद्यालय / शिक्षा (School Infrastructure)',
  'Health Infrastructure': 'स्वास्थ्य केंद्र (Health Infrastructure)',
  'Community Buildings': 'सामुदायिक भवन (Community Buildings)',
  'Parks/Public Spaces': 'पार्क व सार्वजनिक स्थल (Parks/Public Spaces)',
  'Other': 'अन्य विकास कार्य (Other)'
};

const WARDS = [
  'वार्ड 1',
  'वार्ड 2',
  'वार्ड 3',
  'वार्ड 4',
  'वार्ड 5',
  'वार्ड 6',
  'वार्ड 7',
  'वार्ड 8',
  'वार्ड 9',
  'वार्ड 10',
  'वार्ड 11',
  'संपूर्ण पंचायत'
];

const FUNDING_SCHEMES = [
  '15वाँ वित्त आयोग (15th Finance Commission)',
  'राज्य वित्त आयोग (SFC)',
  'मनरेगा (MGNREGA)',
  'विधायक कोष (MLA Fund)',
  'सांसद कोष (MP Fund)',
  'जल जीवन मिशन (JJM)',
  'स्वच्छ भारत मिशन (SBM-G)',
  'ग्राम पंचायत स्वयं का राजस्व (Panchayat Own Revenue)',
  'अन्य सरकारी योजना (Other Scheme)'
];

const emptyForm = {
  title: '',
  titleEn: '',
  workId: '',
  category: 'Road Construction',
  ward: 'वार्ड 1',
  location: '',
  estimatedDuration: '',
  description: '',
  // Financial
  sanctionedBudget: '',
  utilizedBudget: '',
  fundingSource: '15वाँ वित्त आयोग (15th Finance Commission)',
  sanctionOrderNo: '',
  sanctionDate: '',
  // Status & Timeline
  status: 'In Progress', // 'Proposed' | 'Approved' | 'In Progress' | 'Completed' | 'On Hold'
  progressPercentage: 50,
  startDate: '',
  completionDate: '',
  contractorAgency: '',
  supervisor: '',
  isPublished: true,
  // Media & Docs
  photos: [], // [{ id, url, caption, stage: 'before'|'during'|'after' }]
  documents: [], // [{ name, url, type }]
  updates: [] // [{ date, note }]
};

const ManageVikasKarya = () => {
  const [activeSubTab, setActiveSubTab] = useState('works'); // 'works' | 'add' | 'feedback' | 'analytics'
  const [works, setWorks] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formSection, setFormSection] = useState(1); // 1 to 6
  const [uploadingFile, setUploadingFile] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', msg: '' });

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Photo / Doc inputs
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoStage, setNewPhotoStage] = useState('during');
  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newUpdateDate, setNewUpdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [newUpdateNote, setNewUpdateNote] = useState('');

  // 1. Listen to real Works from RTDB
  useEffect(() => {
    const worksRef = ref(rtdb, 'adminData/vikasKarya/works');
    const unsubWorks = onValue(
      worksRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data).map(([id, val]) => ({
            id,
            ...val
          }));
          setWorks(list);
        } else {
          setWorks([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching works:', err);
        setWorks([]);
        setLoading(false);
      }
    );

    // 2. Listen to Citizen Feedback
    const fbRef = ref(rtdb, 'adminData/vikasKarya/feedback');
    const unsubFb = onValue(fbRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = [];
        Object.entries(data).forEach(([workId, reviews]) => {
          if (reviews && typeof reviews === 'object') {
            Object.entries(reviews).forEach(([fbId, fbVal]) => {
              list.push({
                fbId,
                workId,
                ...fbVal
              });
            });
          }
        });
        setFeedbackList(list);
      } else {
        setFeedbackList([]);
      }
    });

    return () => {
      unsubWorks();
      unsubFb();
    };
  }, []);

  // Filtered Works
  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      const matchStatus = statusFilter === 'ALL' || w.status === statusFilter;
      const matchCat = categoryFilter === 'ALL' || w.category === categoryFilter;
      const matchWard = wardFilter === 'ALL' || w.ward === wardFilter;
      const matchSearch =
        searchQuery === '' ||
        w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.workId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchCat && matchWard && matchSearch;
    });
  }, [works, statusFilter, categoryFilter, wardFilter, searchQuery]);

  // Analytics Metrics
  const analytics = useMemo(() => {
    let sanctionedSum = 0;
    let utilizedSum = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let approvedCount = 0;

    works.forEach((w) => {
      sanctionedSum += Number(w.sanctionedBudget) || 0;
      utilizedSum += Number(w.utilizedBudget) || 0;
      if (w.status === 'Completed') completedCount++;
      else if (w.status === 'In Progress') inProgressCount++;
      else if (w.status === 'Approved') approvedCount++;
    });

    return {
      total: works.length,
      completedCount,
      inProgressCount,
      approvedCount,
      sanctionedSum,
      utilizedSum
    };
  }, [works]);

  // Handlers
  const handleStartAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      workId: `SARERI-VK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    });
    setFormSection(1);
    setActiveSubTab('add');
  };

  const handleStartEdit = (work) => {
    setEditingId(work.id);
    setForm({
      ...emptyForm,
      ...work
    });
    setFormSection(1);
    setActiveSubTab('add');
  };

  const handleDeleteWork = (id, title) => {
    setConfirmModal({
      isOpen: true,
      title: 'विकास कार्य हटाएं?',
      message: `क्या आप वाकई "${title}" को डेटाबेस से हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।`,
      onConfirm: async () => {
        try {
          await remove(ref(rtdb, `adminData/vikasKarya/works/${id}`));
          setConfirmModal({ isOpen: false });
        } catch (err) {
          alert('हटाने में त्रुटि हुई: ' + err.message);
        }
      }
    });
  };

  const handleTogglePublish = async (work) => {
    const newStatus = work.isPublished === false ? true : false;
    try {
      await update(ref(rtdb, `adminData/vikasKarya/works/${work.id}`), {
        isPublished: newStatus
      });
    } catch (err) {
      alert('अपडेट करने में समस्या: ' + err.message);
    }
  };

  // Save / Update Work to RTDB
  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('कृपया कार्य का शीर्षक (हिंदी) भरें');
      return;
    }

    setSaveStatus({ state: 'saving', msg: 'सेव किया जा रहा है...' });

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        titleEn: form.titleEn?.trim() || '',
        workId: form.workId?.trim() || `SARERI-VK-${Date.now()}`,
        sanctionedBudget: Number(form.sanctionedBudget) || 0,
        utilizedBudget: Number(form.utilizedBudget) || 0,
        progressPercentage: Number(form.progressPercentage) || 0,
        updatedAt: Date.now()
      };

      if (editingId) {
        await update(ref(rtdb, `adminData/vikasKarya/works/${editingId}`), payload);
      } else {
        payload.createdAt = Date.now();
        const newRef = push(ref(rtdb, 'adminData/vikasKarya/works'));
        await set(newRef, payload);
      }

      setSaveStatus({ state: 'success', msg: 'सफलतापूर्वक सुरक्षित किया गया!' });
      setTimeout(() => {
        setSaveStatus({ state: 'idle', msg: '' });
        setActiveSubTab('works');
      }, 1000);
    } catch (err) {
      console.error('Error saving work:', err);
      setSaveStatus({ state: 'error', msg: 'त्रुटि: ' + err.message });
    }
  };

  // Add Photo
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const photoObj = {
      id: `p-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'साइट फोटो',
      stage: newPhotoStage
    };
    setForm((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), photoObj]
    }));
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemovePhoto = (id) => {
    setForm((prev) => ({
      ...prev,
      photos: (prev.photos || []).filter((p) => p.id !== id)
    }));
  };

  // Add Document
  const handleAddDocument = () => {
    if (!newDocUrl.trim()) return;
    const docObj = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim() || 'स्वीकृति आदेश पत्र',
      url: newDocUrl.trim()
    };
    setForm((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), docObj]
    }));
    setNewDocName('');
    setNewDocUrl('');
  };

  const handleRemoveDocument = (id) => {
    setForm((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((d) => d.id !== id)
    }));
  };

  // Add Progress Milestone Note
  const handleAddUpdate = () => {
    if (!newUpdateNote.trim()) return;
    const updateObj = {
      id: `u-${Date.now()}`,
      date: newUpdateDate || new Date().toISOString().split('T')[0],
      note: newUpdateNote.trim()
    };
    setForm((prev) => ({
      ...prev,
      updates: [...(prev.updates || []), updateObj]
    }));
    setNewUpdateNote('');
  };

  const handleRemoveUpdate = (id) => {
    setForm((prev) => ({
      ...prev,
      updates: (prev.updates || []).filter((u) => u.id !== id)
    }));
  };

  // Feedback Moderation (Approve / Reject / Delete)
  const handleModerateFeedback = async (workId, fbId, newStatus) => {
    try {
      if (newStatus === 'deleted') {
        await remove(ref(rtdb, `adminData/vikasKarya/feedback/${workId}/${fbId}`));
      } else {
        await update(ref(rtdb, `adminData/vikasKarya/feedback/${workId}/${fbId}`), {
          status: newStatus
        });
      }
    } catch (err) {
      alert('अपडेट में समस्या: ' + err.message);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (works.length === 0) {
      alert('निर्यात हेतु कोई विकास कार्य उपलब्ध नहीं है।');
      return;
    }

    const data = works.map((w, idx) => ({
      'क्र. सं.': idx + 1,
      'कार्य कोड': w.workId || '',
      'कार्य का नाम (हिंदी)': w.title || '',
      'Name (English)': w.titleEn || '',
      'श्रेणी': CATEGORY_LABELS[w.category] || w.category || '',
      'वार्ड': w.ward || '',
      'स्थान': w.location || '',
      'स्वीकृत बजट (₹)': w.sanctionedBudget || 0,
      'व्यय बजट (₹)': w.utilizedBudget || 0,
      'प्रगति (%)': (w.progressPercentage || 0) + '%',
      'वर्तमान स्थिति': w.status || '',
      'वित्तीय योजना': w.fundingSource || '',
      'संवेदक / एजेंसी': w.contractorAgency || '',
      'स्वीकृति आदेश क्रमांक': w.sanctionOrderNo || '',
      'प्रारंभ तिथि': w.startDate || '',
      'पूर्ण होने की तिथि': w.completionDate || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'VikasKarya');
    XLSX.writeFile(workbook, `Sareri_Vikas_Karya_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN');
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200/90 shadow-sm font-sans">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#135334]"></span>
            <span className="text-xs font-bold text-[#135334] uppercase tracking-wider">
              ग्राम पंचायत सरेरी • विकास कार्य प्रबंधन
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            विकास कार्य नियंत्रण पोर्टल (Development Works Admin)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            गाँव के सभी स्वीकृत, चालू और पूर्ण निर्माण कार्यों की निगरानी, वित्तीय विवरण व नागरिक समीक्षा
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveSubTab('works')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSubTab === 'works'
                ? 'bg-[#135334] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiActivity className="w-4 h-4" />
            <span>सभी कार्य ({works.length})</span>
          </button>

          <button
            onClick={handleStartAdd}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSubTab === 'add' && !editingId
                ? 'bg-[#135334] text-white shadow-xs'
                : 'bg-emerald-50 text-[#135334] hover:bg-emerald-100'
            }`}
          >
            <FiPlus className="w-4 h-4" />
            <span>नया कार्य जोड़ें</span>
          </button>

          <button
            onClick={() => setActiveSubTab('feedback')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSubTab === 'feedback'
                ? 'bg-[#135334] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiMessageSquare className="w-4 h-4" />
            <span>नागरिक फीडबैक ({feedbackList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeSubTab === 'analytics'
                ? 'bg-[#135334] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiPieChart className="w-4 h-4" />
            <span>एनालिटिक्स</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ALL WORKS LIST */}
      {activeSubTab === 'works' && (
        <div className="pt-6">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="कार्य खोजें (शीर्षक, कोड, स्थान)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
            >
              <option value="ALL">सभी स्थितियां (All Status)</option>
              <option value="In Progress">प्रगति में (In Progress)</option>
              <option value="Completed">पूर्ण (Completed)</option>
              <option value="Approved">स्वीकृत (Approved)</option>
              <option value="Proposed">प्रस्तावित (Proposed)</option>
              <option value="On Hold">लंबित / स्थगित (On Hold)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
            >
              <option value="ALL">सभी श्रेणियां (All Categories)</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
              >
                <option value="ALL">सभी वार्ड (All Wards)</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportExcel}
                title="Excel रिपोर्ट डाउनलोड करें"
                className="p-2.5 rounded-xl bg-green-50 text-[#135334] border border-green-200 hover:bg-green-100 transition-colors shrink-0"
              >
                <FiDownload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Works List / Cards */}
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              <div className="w-10 h-10 border-4 border-[#135334] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-gray-500">डेटा लोड हो रहा है...</p>
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FiActivity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">कोई विकास कार्य नहीं मिला</p>
              <p className="text-xs text-gray-400 mt-1">
                {works.length === 0
                  ? 'अभी तक कोई कार्य नहीं जोड़ा गया है। ऊपर "नया कार्य जोड़ें" बटन दबाएं।'
                  : 'दिए गए फ़िल्टर के अनुसार कोई परिणाम नहीं मिला।'}
              </p>
              {works.length === 0 && (
                <button
                  onClick={handleStartAdd}
                  className="mt-4 px-4 py-2 bg-[#135334] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0e3e26]"
                >
                  पहला कार्य जोड़ें
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredWorks.map((work) => {
                const progress = Number(work.progressPercentage) || 0;
                const isPublished = work.isPublished !== false;

                let statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                if (work.status === 'Completed') {
                  statusBadgeClass = 'bg-emerald-50 text-[#135334] border-emerald-200';
                } else if (work.status === 'Approved') {
                  statusBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                } else if (work.status === 'On Hold') {
                  statusBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                }

                return (
                  <div
                    key={work.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isPublished
                        ? 'bg-white border-gray-200 hover:border-[#135334]/40 hover:shadow-xs'
                        : 'bg-gray-50 border-dashed border-gray-300 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${statusBadgeClass}`}>
                            ● {work.status}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {work.ward}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {work.workId}
                          </span>
                          {!isPublished && (
                            <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              अप्रकाशित (Draft)
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                          {work.title}
                        </h3>
                        {work.titleEn && (
                          <p className="text-xs text-gray-400 font-medium">{work.titleEn}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                          <span>
                            📍 <strong>स्थान:</strong> {work.location || 'सरेरी'}
                          </span>
                          <span>
                            🏷️ <strong>श्रेणी:</strong> {CATEGORY_LABELS[work.category] || work.category}
                          </span>
                          <span>
                            💰 <strong>स्वीकृत बजट:</strong> {formatCurrency(work.sanctionedBudget)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 max-w-md">
                          <div className="flex justify-between items-center text-[11px] font-bold mb-1">
                            <span className="text-gray-500">भौतिक प्रगति:</span>
                            <span className="text-[#135334]">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#135334] h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                        <button
                          onClick={() => handleTogglePublish(work)}
                          title={isPublished ? 'अप्रकाशित करें' : 'प्रकाशित करें'}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            isPublished
                              ? 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              : 'bg-emerald-50 text-[#135334] border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {isPublished ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                          <span className="hidden sm:inline">
                            {isPublished ? 'लाइव' : 'ड्राफ्ट'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleStartEdit(work)}
                          className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>संपादित करें</span>
                        </button>

                        <button
                          onClick={() => handleDeleteWork(work.id, work.title)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                          title="हटाएं"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ADD / EDIT WORK FORM (6 SECTIONS) */}
      {activeSubTab === 'add' && (
        <form onSubmit={handleSaveForm} className="pt-6">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900">
                {editingId ? 'विकास कार्य विवरण संपादित करें' : 'नया विकास कार्य पंजीकृत करें'}
              </h3>
              <p className="text-xs text-gray-500">
                सभी आवश्यक जानकारियां 6 चरणों में व्यवस्थित रूप से दर्ज करें
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('works')}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200"
            >
              ← वापस सूची में
            </button>
          </div>

          {/* Section Indicator Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-gray-100 text-xs font-bold">
            {[
              { num: 1, label: '1. बुनियादी विवरण' },
              { num: 2, label: '2. वित्तीय विवरण' },
              { num: 3, label: '3. स्थिति व प्रगति' },
              { num: 4, label: '4. फोटो गैलरी' },
              { num: 5, label: '5. आदेश व PDF' },
              { num: 6, label: '6. प्रगति अपडेट्स' }
            ].map((sec) => (
              <button
                key={sec.num}
                type="button"
                onClick={() => setFormSection(sec.num)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                  formSection === sec.num
                    ? 'bg-[#135334] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* SECTION 1: BASIC DETAILS */}
          {formSection === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    कार्य का शीर्षक (हिंदी में) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. नया बस स्टैंड से मुख्य चौराहे तक सीसी सड़क निर्माण"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Title in English
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., CC Road Construction from Bus Stand to Main Chowk"
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    योजना / कार्य कोड
                  </label>
                  <input
                    type="text"
                    placeholder="SARERI-VK-2026-001"
                    value={form.workId}
                    onChange={(e) => setForm({ ...form, workId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    कार्य श्रेणी (Category)
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat] || cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    वार्ड संख्या
                  </label>
                  <select
                    value={form.ward}
                    onChange={(e) => setForm({ ...form, ward: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  >
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    स्थान / मोहल्ला विवरण
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. ब्राह्मणों की सरेरी, वार्ड 4 मुख्य मार्ग"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    अनुमानित समयावधि (Duration)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. 4 माह (120 दिन)"
                    value={form.estimatedDuration}
                    onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  कार्य का विस्तृत विवरण (Scope of Work)
                </label>
                <textarea
                  rows={3}
                  placeholder="कार्य की तकनीकी रूपरेखा, लंबाई, चौड़ाई अथवा मुख्य विशेषताएं लिखें..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                ></textarea>
              </div>
            </div>
          )}

          {/* SECTION 2: FINANCIAL DETAILS */}
          {formSection === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    कुल स्वीकृत बजट (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="उदा. 1500000"
                    value={form.sanctionedBudget}
                    onChange={(e) => setForm({ ...form, sanctionedBudget: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    प्रदर्शित: {formatCurrency(form.sanctionedBudget)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    अब तक का कुल व्यय (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="उदा. 750000"
                    value={form.utilizedBudget}
                    onChange={(e) => setForm({ ...form, utilizedBudget: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    प्रदर्शित: {formatCurrency(form.utilizedBudget)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    वित्तीय योजना / मद (Scheme)
                  </label>
                  <select
                    value={form.fundingSource}
                    onChange={(e) => setForm({ ...form, fundingSource: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  >
                    {FUNDING_SCHEMES.map((fs) => (
                      <option key={fs} value={fs}>
                        {fs}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    स्वीकृति आदेश क्रमांक (Sanction Order)
                  </label>
                  <input
                    type="text"
                    placeholder="F.12(4)/GP/2026/89"
                    value={form.sanctionOrderNo}
                    onChange={(e) => setForm({ ...form, sanctionOrderNo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    स्वीकृति दिनांक (Approval Date)
                  </label>
                  <input
                    type="date"
                    value={form.sanctionDate}
                    onChange={(e) => setForm({ ...form, sanctionDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: STATUS & TIMELINE */}
          {formSection === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    कार्य की वर्तमान स्थिति *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  >
                    <option value="Proposed">प्रस्तावित (Proposed)</option>
                    <option value="Approved">स्वीकृत (Approved)</option>
                    <option value="In Progress">प्रगति में (In Progress)</option>
                    <option value="Completed">पूर्ण (Completed)</option>
                    <option value="On Hold">लंबित / स्थगित (On Hold)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">
                      भौतिक प्रगति प्रतिशत (Progress %)
                    </label>
                    <span className="text-xs font-extrabold text-[#135334]">
                      {form.progressPercentage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.progressPercentage}
                    onChange={(e) => setForm({ ...form, progressPercentage: e.target.value })}
                    className="w-full accent-[#135334] cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    कार्य प्रारंभ दिनांक (Start Date)
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    पूर्णता दिनांक / अनुमानित पूर्णता
                  </label>
                  <input
                    type="date"
                    value={form.completionDate}
                    onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    कार्यकारी एजेंसी / संवेदक का नाम (Contractor)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. श्री सांवरिया कंस्ट्रक्शन या ग्राम पंचायत सरेरी"
                    value={form.contractorAgency}
                    onChange={(e) => setForm({ ...form, contractorAgency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    पर्यवेक्षक अधिकारी / कनिष्ठ अभियंता (JEN)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. कनिष्ठ अभियंता, पंचायत समिति आसींद"
                    value={form.supervisor}
                    onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#135334]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: MEDIA & PHOTOS */}
          {formSection === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">
                  साइट की नई फोटो जोड़ें
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="url"
                    placeholder="फोटो URL (Image Link)"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="sm:col-span-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <select
                    value={newPhotoStage}
                    onChange={(e) => setNewPhotoStage(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  >
                    <option value="before">कार्य से पूर्व (Before)</option>
                    <option value="during">कार्य के दौरान (During)</option>
                    <option value="after">कार्य के बाद / पूर्ण (After)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="कैप्शन (उदा. बेस कंक्रीट कार्य प्रगति पर)"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-4 py-2 bg-[#135334] text-white text-xs font-bold rounded-xl"
                  >
                    + फोटो जोड़ें
                  </button>
                </div>
              </div>

              {/* Photo Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(form.photos || []).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-28 object-cover"
                      onError={(e) => {
                        e.target.src = '/photos/About.jpeg';
                      }}
                    />
                    <div className="p-2 text-[10px] text-gray-600 truncate">{photo.caption}</div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: OFFICIAL DOCUMENTS */}
          {formSection === 5 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">
                  आधिकारिक दस्तावेज / PDF लिंक जोड़ें
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="दस्तावेज का नाम (उदा. प्रशासनिक स्वीकृति पत्र)"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <input
                    type="url"
                    placeholder="PDF / फ़ाइल लिंक (Google Drive या Web URL)"
                    value={newDocUrl}
                    onChange={(e) => setNewDocUrl(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDocument}
                  className="px-4 py-2 bg-[#135334] text-white text-xs font-bold rounded-xl"
                >
                  + दस्तावेज जोड़ें
                </button>
              </div>

              {/* Doc List */}
              <div className="space-y-2">
                {(form.documents || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <FiFileText className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-gray-800">{doc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      हटाएं
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: PROGRESS MILESTONES */}
          {formSection === 6 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">
                  नया प्रगति मील का पत्थर (Milestone Note) जोड़ें
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <input
                    type="date"
                    value={newUpdateDate}
                    onChange={(e) => setNewUpdateDate(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="प्रगति टिप्पणी (उदा. नाली खुदाई का कार्य 80% पूर्ण)"
                    value={newUpdateNote}
                    onChange={(e) => setNewUpdateNote(e.target.value)}
                    className="sm:col-span-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddUpdate}
                  className="px-4 py-2 bg-[#135334] text-white text-xs font-bold rounded-xl"
                >
                  + प्रगति नोट जोड़ें
                </button>
              </div>

              {/* Timeline List */}
              <div className="space-y-2">
                {(form.updates || []).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-[#135334] block">{u.date}</span>
                      <span className="text-xs text-gray-700">{u.note}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUpdate(u.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      हटाएं
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Status & Action Buttons */}
          <div className="pt-6 mt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {saveStatus.state === 'saving' && (
                <span className="text-xs font-bold text-blue-600 animate-pulse">
                  ⏳ {saveStatus.msg}
                </span>
              )}
              {saveStatus.state === 'success' && (
                <span className="text-xs font-bold text-emerald-600">
                  ✓ {saveStatus.msg}
                </span>
              )}
              {saveStatus.state === 'error' && (
                <span className="text-xs font-bold text-red-600">
                  ⚠️ {saveStatus.msg}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('works')}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                रद्द करें
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#135334] hover:bg-[#0e3e26] text-white text-xs font-bold shadow-sm transition-all"
              >
                {editingId ? 'परिवर्तन सुरक्षित करें' : 'विकास कार्य प्रकाशित करें'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: CITIZEN FEEDBACK MODERATION */}
      {activeSubTab === 'feedback' && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">
              नागरिक प्रतिक्रिया एवं रेटिंग सूची ({feedbackList.length})
            </h3>
            <span className="text-xs text-gray-500">
              नागरिकों द्वारा वेबसाइट पर दिए गए रिव्यू यहाँ मॉडरेट करें
            </span>
          </div>

          {feedbackList.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <FiMessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600">अभी तक कोई नागरिक प्रतिक्रिया प्राप्त नहीं हुई है।</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackList.map((item) => (
                <div
                  key={item.fbId}
                  className="p-4 rounded-2xl border border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-gray-900">
                        {item.citizenName || 'नागरिक'} ({item.ward || 'सरेरी'})
                      </span>
                      <span className="text-xs text-amber-500 flex items-center">
                        {'★'.repeat(item.rating || 5)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === 'approved'
                            ? 'bg-emerald-100 text-[#135334]'
                            : item.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status || 'pending'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 mb-1">{item.feedback}</p>
                    <span className="text-[10px] text-gray-400">
                      कार्य: <strong>{item.workTitle || 'विकास कार्य'}</strong> •{' '}
                      {new Date(item.createdAt || Date.now()).toLocaleDateString('hi-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status !== 'approved' && (
                      <button
                        onClick={() => handleModerateFeedback(item.workId, item.fbId, 'approved')}
                        className="px-3 py-1.5 bg-emerald-50 text-[#135334] hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold"
                      >
                        स्वीकृत करें
                      </button>
                    )}
                    {item.status !== 'rejected' && (
                      <button
                        onClick={() => handleModerateFeedback(item.workId, item.fbId, 'rejected')}
                        className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold"
                      >
                        अस्वीकृत
                      </button>
                    )}
                    <button
                      onClick={() => handleModerateFeedback(item.workId, item.fbId, 'deleted')}
                      className="p-1.5 text-red-500 hover:text-red-700"
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

      {/* SUB-TAB 4: ANALYTICS & REPORTS */}
      {activeSubTab === 'analytics' && (
        <div className="pt-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[11px] font-bold text-gray-500 block uppercase">कुल योजनाएं</span>
              <span className="text-2xl font-extrabold text-[#135334]">{analytics.total}</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-[11px] font-bold text-gray-500 block uppercase">प्रगतिरत कार्य</span>
              <span className="text-2xl font-extrabold text-blue-800">{analytics.inProgressCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
              <span className="text-[11px] font-bold text-gray-500 block uppercase">पूर्ण कार्य</span>
              <span className="text-2xl font-extrabold text-green-800">{analytics.completedCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] font-bold text-gray-500 block uppercase">स्वीकृत बजट</span>
              <span className="text-lg font-extrabold text-amber-900 truncate block">
                {formatCurrency(analytics.sanctionedSum)}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-800">
                विकास कार्य पूर्ण एक्सेल रिपोर्ट डाउनलोड करें
              </h4>
              <p className="text-xs text-gray-500">
                ग्राम पंचायत की सभी योजनाओं का विवरण, बजट, संवेदक व भौतिक प्रगति रिपोर्ट
              </p>
            </div>
            <button
              onClick={handleExportExcel}
              className="px-5 py-2.5 bg-[#135334] hover:bg-[#0e3e26] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <FiDownload className="w-4 h-4" />
              <span>Excel रिपोर्ट डाउनलोड (.xlsx)</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ isOpen: false })}
        />
      )}
    </div>
  );
};

export default ManageVikasKarya;
