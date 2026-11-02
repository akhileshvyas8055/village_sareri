import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, push, set } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiFilter,
  FiDownload,
  FiChevronRight,
  FiInfo,
  FiMapPin,
  FiCalendar,
  FiTool,
  FiArrowRight,
  FiCheck,
  FiStar,
  FiFileText,
  FiImage,
  FiDollarSign,
  FiUser,
  FiSend,
  FiX,
  FiExternalLink
} from 'react-icons/fi';

const CATEGORIES = [
  { id: 'ALL', label: 'सभी श्रेणियां (All Categories)' },
  { id: 'Road Construction', label: 'सड़क निर्माण (Road Construction)' },
  { id: 'Drainage', label: 'जल निकासी / नाली (Drainage)' },
  { id: 'Drinking Water', label: 'पेयजल आपूर्ति (Drinking Water)' },
  { id: 'Street Lighting', label: 'स्ट्रीट लाइट / CCTV (Street Lighting)' },
  { id: 'Sanitation', label: 'स्वच्छता व कचरा प्रबंधन (Sanitation)' },
  { id: 'School Infrastructure', label: 'विद्यालय / शिक्षा (School Infrastructure)' },
  { id: 'Health Infrastructure', label: 'स्वास्थ्य केंद्र (Health Infrastructure)' },
  { id: 'Community Buildings', label: 'सामुदायिक भवन (Community Buildings)' },
  { id: 'Parks/Public Spaces', label: 'पार्क व सार्वजनिक स्थल (Parks/Public Spaces)' },
  { id: 'Other', label: 'अन्य विकास कार्य (Other)' }
];

const WARDS = [
  'ALL',
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

const VikasKaryaPage = () => {
  const [works, setWorks] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'In Progress' | 'Completed' | 'Approved' | 'Proposed'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Project Details Modal
  const [selectedWork, setSelectedWork] = useState(null);
  const [detailTab, setDetailTab] = useState('basic'); // 'basic' | 'financial' | 'implementation' | 'gallery' | 'docs' | 'timeline' | 'feedback'

  // Citizen Feedback Form State
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [citizenWard, setCitizenWard] = useState('वार्ड 1');
  const [citizenName, setCitizenName] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    // 1. Fetch real development works from RTDB
    const worksRef = ref(rtdb, 'adminData/vikasKarya/works');
    const unsubWorks = onValue(
      worksRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.entries(data)
            .map(([id, val]) => ({
              id,
              ...val
            }))
            // Strictly exclude any soft-deleted or unpublished works and demo IDs
            .filter((w) => w.isPublished !== false && !w.isDeleted && !w.id?.startsWith('DEMO-'));
          
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setWorks(list);
        } else {
          setWorks([]);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Firebase RTDB works error:', error);
        setWorks([]);
        setLoading(false);
      }
    );

    // 2. Fetch approved citizen feedback
    const feedbackRef = ref(rtdb, 'adminData/vikasKarya/feedback');
    const unsubFeedback = onValue(feedbackRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFeedbackMap(data);
      } else {
        setFeedbackMap({});
      }
    });

    return () => {
      unsubWorks();
      unsubFeedback();
    };
  }, []);

  // Format Indian Currency in Lakhs or Crores
  const formatRupees = (amount) => {
    const num = Number(amount);
    if (!num || isNaN(num)) return '₹0.00';
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} करोड़`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} लाख`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Extract unique financial years for filter
  const availableYears = useMemo(() => {
    const years = new Set();
    works.forEach((w) => {
      if (w.financialYear) years.add(w.financialYear);
      else if (w.approvalDate && w.approvalDate.length >= 4) {
        years.add(w.approvalDate.substring(0, 4));
      }
    });
    return Array.from(years).sort().reverse();
  }, [works]);

  // Dynamic Dashboard Counters strictly calculated from real records
  const stats = useMemo(() => {
    const total = works.length;
    const completed = works.filter((w) => w.status === 'Completed' || w.status === 'पूर्ण').length;
    const inProgress = works.filter((w) => w.status === 'In Progress' || w.status === 'प्रगति में').length;
    const approved = works.filter((w) => w.status === 'Approved' || w.status === 'स्वीकृत').length;
    const pending = works.filter(
      (w) => w.status === 'Proposed' || w.status === 'प्रस्तावित' || w.status === 'On Hold' || w.status === 'लंबित'
    ).length;

    // Sum sanctioned budget
    const totalBudget = works.reduce((sum, w) => {
      const b = Number(w.sanctionedAmount) || 0;
      return sum + b;
    }, 0);

    return {
      total,
      completed,
      inProgress,
      approved,
      pending,
      totalBudget
    };
  }, [works]);

  // Filtered projects
  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      // Status Match
      let matchStatus = true;
      if (statusFilter === 'In Progress') {
        matchStatus = w.status === 'In Progress' || w.status === 'प्रगति में';
      } else if (statusFilter === 'Completed') {
        matchStatus = w.status === 'Completed' || w.status === 'पूर्ण';
      } else if (statusFilter === 'Approved') {
        matchStatus = w.status === 'Approved' || w.status === 'स्वीकृत';
      } else if (statusFilter === 'Pending') {
        matchStatus =
          w.status === 'Proposed' ||
          w.status === 'प्रस्तावित' ||
          w.status === 'On Hold' ||
          w.status === 'लंबित';
      }

      // Category Match
      const matchCategory = categoryFilter === 'ALL' || w.category === categoryFilter;

      // Ward Match
      const matchWard = wardFilter === 'ALL' || w.ward === wardFilter;

      // Year Match
      const matchYear =
        yearFilter === 'ALL' ||
        w.financialYear === yearFilter ||
        (w.approvalDate && w.approvalDate.startsWith(yearFilter));

      // Search Query
      const matchSearch =
        searchQuery === '' ||
        w.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.workId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.responsibleDepartment?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchCategory && matchWard && matchYear && matchSearch;
    });
  }, [works, statusFilter, categoryFilter, wardFilter, yearFilter, searchQuery]);

  const formatHindiDate = (dateStr) => {
    if (!dateStr) return 'दिनांक उपलब्ध नहीं';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Submit citizen feedback with anti-spam check
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedWork) return;

    if (!feedbackText.trim()) {
      setFeedbackError('कृपया अपनी प्रतिक्रिया या सुझाव लिखें।');
      return;
    }

    // Check duplicate submission in localStorage
    const submittedKey = `sareri_feedback_${selectedWork.id}`;
    if (localStorage.getItem(submittedKey)) {
      setFeedbackError('आप इस विकास कार्य के लिए पहले ही प्रतिक्रिया दर्ज कर चुके हैं। धन्यवाद!');
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError('');

    try {
      const workFeedbackRef = ref(rtdb, `adminData/vikasKarya/feedback/${selectedWork.id}`);
      const newFeedbackRef = push(workFeedbackRef);
      await set(newFeedbackRef, {
        id: newFeedbackRef.key,
        workId: selectedWork.id,
        workTitle: selectedWork.title,
        rating: Number(rating),
        feedback: feedbackText.trim(),
        citizenName: citizenName.trim() || 'सरेरी नागरिक',
        ward: citizenWard,
        status: 'pending', // Moderation required
        createdAt: Date.now()
      });

      // Save flag to prevent spam/duplicates
      try {
        localStorage.setItem(submittedKey, 'true');
      } catch (err) {}

      setFeedbackSuccess(true);
      setFeedbackText('');
      setCitizenName('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setFeedbackError('प्रतिक्रिया सबमिट करने में त्रुटि हुई: ' + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Approved feedback list for the selected work
  const currentWorkApprovedFeedback = useMemo(() => {
    if (!selectedWork || !feedbackMap[selectedWork.id]) return [];
    return Object.values(feedbackMap[selectedWork.id]).filter((f) => f.status === 'approved');
  }, [selectedWork, feedbackMap]);

  return (
    <div className="bg-[#FAF9F6] text-slate-800 min-h-screen pt-4 sm:pt-6 pb-20 selection:bg-[#135334]/20 font-sans">
      <SEO
        title="Village Development Projects | Vikas Karya Sareri"
        description="सरेरी में चल रहे एवं पूर्ण विकास कार्य, सीसी रोड, नाली निर्माण, पेयजल परियोजनाएं एवं सार्वजनिक निर्माण कार्यों का ब्यौरा।"
        url="https://villagesareri.in/vikas-karya"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Gram Panchayat', url: 'https://villagesareri.in/panchayat' },
          { name: 'Vikas Karya', url: 'https://villagesareri.in/vikas-karya' }
        ]}
      />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-3 font-medium">
          <Link to="/" className="hover:text-[#135334] transition-colors">
            होम
          </Link>
          <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/panchayat" className="hover:text-[#135334] transition-colors">
            ग्राम पंचायत
          </Link>
          <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#135334] font-semibold">गाँव के विकास कार्य</span>
        </nav>

        {/* Main Hero Banner Header */}
        <div className="bg-gradient-to-br from-[#135334] via-[#0E3E26] to-[#0A2E1C] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 text-white shadow-lg relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2.5 border border-white/15">
              <FiTool className="w-3.5 h-3.5 text-emerald-300" />
              <span>पारदर्शी पंचायती राज विकास पोर्टल</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight mb-2">
              गाँव के विकास कार्य
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-2xl">
              "हर विकास कार्य की जानकारी, प्रगति और स्थिति – एक ही स्थान पर।"
            </p>
          </div>
        </div>

        {/* DASHBOARD 6 DYNAMIC KPI COUNTERS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {/* 1. कुल विकास कार्य */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 block uppercase">कुल विकास कार्य</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#135334] leading-tight mt-1">
              {loading ? '...' : stats.total}
            </h3>
          </div>

          {/* 2. पूर्ण कार्य */}
          <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-xs">
            <span className="text-[11px] font-bold text-teal-700 block uppercase">पूर्ण कार्य</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-teal-800 leading-tight mt-1">
              {loading ? '...' : stats.completed}
            </h3>
          </div>

          {/* 3. प्रगति में */}
          <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 block uppercase">प्रगति में</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-800 leading-tight mt-1">
              {loading ? '...' : stats.inProgress}
            </h3>
          </div>

          {/* 4. स्वीकृत */}
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs">
            <span className="text-[11px] font-bold text-blue-700 block uppercase">स्वीकृत</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-800 leading-tight mt-1">
              {loading ? '...' : stats.approved}
            </h3>
          </div>

          {/* 5. लंबित */}
          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs">
            <span className="text-[11px] font-bold text-purple-700 block uppercase">लंबित</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-800 leading-tight mt-1">
              {loading ? '...' : stats.pending}
            </h3>
          </div>

          {/* 6. कुल स्वीकृत बजट */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800 block uppercase">कुल स्वीकृत बजट</span>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#135334] leading-tight mt-1 truncate">
              {loading ? '...' : formatRupees(stats.totalBudget)}
            </h3>
          </div>
        </div>

        {/* FILTER SYSTEM */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs mb-8 space-y-4">
          {/* Status Tabs in a single neat line */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'ALL', label: `सभी कार्य (${stats.total})` },
              { id: 'In Progress', label: `प्रगति में (${stats.inProgress})` },
              { id: 'Completed', label: `पूर्ण (${stats.completed})` },
              { id: 'Approved', label: `स्वीकृत (${stats.approved})` },
              { id: 'Pending', label: `लंबित (${stats.pending})` }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  statusFilter === st.id
                    ? 'bg-[#135334] text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Detailed Filters Dropdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="कार्य का नाम, स्थान या ID खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Ward Filter */}
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
            >
              <option value="ALL">सभी वार्ड (All Wards)</option>
              {WARDS.filter((w) => w !== 'ALL').map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            {/* Financial Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
            >
              <option value="ALL">सभी वित्तीय वर्ष (All Years)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  वर्ष {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DEVELOPMENT WORK CARDS GRID */}
        {filteredWorks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#135334] flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <FiTool className="w-8 h-8 opacity-75" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              वर्तमान में कोई विकास कार्य सूची उपलब्ध नहीं है
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto">
              ग्राम पंचायत सरेरी द्वारा स्वीकृत एवं प्रगतिरत विकास कार्यों का आधिकारिक विवरण शीघ्र ही पोर्टल पर प्रकाशित किया जाएगा।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => {
              const statusMap = {
                'Completed': { label: 'पूर्ण (Completed)', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
                'In Progress': { label: 'प्रगति में (In Progress)', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                'Approved': { label: 'स्वीकृत (Approved)', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                'Proposed': { label: 'प्रस्तावित (Proposed)', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
                'On Hold': { label: 'लंबित / स्थगित', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
                'Cancelled': { label: 'निरस्त (Cancelled)', bg: 'bg-rose-50 text-rose-800 border-rose-200' }
              };
              const statusObj = statusMap[work.status] || {
                label: work.status || 'स्वीकृत',
                bg: 'bg-gray-100 text-gray-800 border-gray-200'
              };

              const progress = Math.min(100, Math.max(0, Number(work.progressPercentage) || 0));

              return (
                <div
                  key={work.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Cover Image */}
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={work.coverPhoto || '/photos/About.jpeg'}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/photos/About.jpeg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Work ID & Category Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-gray-900 shadow-xs">
                        {work.workId || work.id}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border backdrop-blur-md shadow-xs ${statusObj.bg}`}>
                        {statusObj.label}
                      </span>
                    </div>

                    {/* Ward & Location on image bottom */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] font-semibold text-emerald-200 flex items-center gap-1">
                        <FiMapPin className="w-3 h-3 text-emerald-300" />
                        {work.ward || 'सरेरी'} {work.location ? `• ${work.location}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md inline-block mb-2">
                        {work.category || 'विकास कार्य'}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#135334] transition-colors">
                        {work.title}
                      </h3>
                      {work.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
                          {work.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar & Financials */}
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      {/* Budget */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">स्वीकृत बजट:</span>
                        <span className="font-extrabold text-[#135334]">
                          {formatRupees(work.sanctionedAmount)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className="text-gray-600">कार्य प्रगति:</span>
                          <span className="text-[#135334]">{progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              progress === 100
                                ? 'bg-teal-600'
                                : progress >= 50
                                ? 'bg-[#135334]'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>स्वीकृति: {formatHindiDate(work.approvalDate || work.startDate)}</span>
                        <span>लक्ष्य: {formatHindiDate(work.expectedCompletionDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Button */}
                  <div className="p-4 bg-gray-50/70 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedWork(work);
                        setDetailTab('basic');
                        setFeedbackSuccess(false);
                        setFeedbackError('');
                      }}
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-[#135334] text-[#135334] hover:text-white border border-emerald-200 hover:border-[#135334] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>संपूर्ण विवरण व फोटो देखें</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILED PROJECT MODAL VIEW */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#135334] text-white p-5 sm:p-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/20 text-white uppercase">
                    {selectedWork.workId || selectedWork.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-200 border border-white/10 font-semibold">
                    {selectedWork.category || 'विकास कार्य'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold leading-snug">
                  {selectedWork.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedWork(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto no-scrollbar">
              {[
                { id: 'basic', label: 'मूल विवरण', icon: FiInfo },
                { id: 'financial', label: 'वित्तीय स्थिति', icon: FiDollarSign },
                { id: 'implementation', label: 'क्रियान्वयन व एजेंसी', icon: FiTool },
                { id: 'gallery', label: 'प्रोजेक्ट गैलरी', icon: FiImage },
                { id: 'docs', label: 'दस्तावेज', icon: FiFileText },
                { id: 'timeline', label: 'प्रगति टाइमलाइन', icon: FiClock },
                { id: 'feedback', label: 'नागरिक प्रतिक्रिया', icon: FiStar }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      detailTab === t.id
                        ? 'bg-[#135334] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* TAB 1: BASIC INFORMATION */}
              {detailTab === 'basic' && (
                <div className="space-y-4">
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      कार्य का विवरण (Description)
                    </span>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {selectedWork.description || 'विवरण उपलब्ध नहीं है।'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-gray-500 font-semibold block">वार्ड संख्या:</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedWork.ward || 'सरेरी'}</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-gray-500 font-semibold block">सटीक स्थान (Location):</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedWork.location || 'ग्राम सरेरी'}</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-gray-500 font-semibold block">योजना का उद्देश्य:</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedWork.purpose || 'सार्वजनिक जनसुविधा'}</span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="text-gray-500 font-semibold block">लाभान्वित क्षेत्र / जनसंख्या:</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedWork.beneficiaryArea || 'समस्त ग्रामवासी'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FINANCIAL INFORMATION */}
              {detailTab === 'financial' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <span className="text-xs text-gray-500 font-bold block">स्वीकृत राशि (Sanctioned):</span>
                      <span className="text-xl font-extrabold text-[#135334] mt-1 block">
                        {formatRupees(selectedWork.sanctionedAmount)}
                      </span>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <span className="text-xs text-gray-500 font-bold block">जारी राशि (Released):</span>
                      <span className="text-xl font-extrabold text-blue-800 mt-1 block">
                        {formatRupees(selectedWork.releasedAmount || selectedWork.sanctionedAmount)}
                      </span>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <span className="text-xs text-gray-500 font-bold block">व्यय राशि (Expenditure):</span>
                      <span className="text-xl font-extrabold text-amber-800 mt-1 block">
                        {formatRupees(selectedWork.expenditure || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-500 font-semibold block">फंडिंग स्रोत (Funding Source):</span>
                      <span className="font-bold text-gray-900">{selectedWork.fundingSource || '15वां वित्त आयोग / GPDP'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">वित्तीय वर्ष:</span>
                      <span className="font-bold text-gray-900">{selectedWork.financialYear || '2025-26'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">प्रशासनिक स्वीकृति क्रमांक (AS Ref):</span>
                      <span className="font-bold text-gray-900">{selectedWork.adminApprovalRef || 'उपलब्ध नहीं'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">तकनीकी स्वीकृति क्रमांक (TS Ref):</span>
                      <span className="font-bold text-gray-900">{selectedWork.technicalSanctionRef || 'उपलब्ध नहीं'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: IMPLEMENTATION & AGENCY */}
              {detailTab === 'implementation' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-500 font-semibold block">कार्यकारी एजेंसी:</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedWork.executingAgency || 'ग्राम पंचायत ब्राह्मणों की सरेरी'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">जिम्मेदार विभाग:</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedWork.responsibleDepartment || 'पंचायती राज विभाग'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">कार्य प्रारंभ तिथि:</span>
                      <span className="font-bold text-gray-900 text-sm">{formatHindiDate(selectedWork.startDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-semibold block">प्रत्याशित पूर्णता तिथि:</span>
                      <span className="font-bold text-gray-900 text-sm">{formatHindiDate(selectedWork.expectedCompletionDate)}</span>
                    </div>
                    {selectedWork.actualCompletionDate && (
                      <div>
                        <span className="text-gray-500 font-semibold block">वास्तविक पूर्णता तिथि:</span>
                        <span className="font-bold text-teal-800 text-sm">{formatHindiDate(selectedWork.actualCompletionDate)}</span>
                      </div>
                    )}
                    {selectedWork.contractorName && (
                      <div>
                        <span className="text-gray-500 font-semibold block">ठेकेदार / वेंडर का नाम:</span>
                        <span className="font-bold text-gray-900 text-sm">{selectedWork.contractorName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: PROJECT GALLERY */}
              {detailTab === 'gallery' && (
                <div>
                  {(!selectedWork.photos || selectedWork.photos.length === 0) ? (
                    <div className="text-center py-10 text-gray-400">
                      <FiImage className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">इस कार्य की अतिरिक्त तस्वीरें अपलोड नहीं की गई हैं।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedWork.photos.map((img, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
                          <img src={img.url} alt={img.caption || 'कार्य फोटो'} className="w-full h-48 object-cover" />
                          <div className="p-3">
                            <span className="text-[10px] text-gray-400 block">{img.stage || 'प्रगति फोटो'} • {img.date || ''}</span>
                            <p className="text-xs font-semibold text-gray-800">{img.caption || 'निर्माण कार्य'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: DOCUMENTS */}
              {detailTab === 'docs' && (
                <div className="space-y-3">
                  {(!selectedWork.documents || selectedWork.documents.length === 0) && !selectedWork.documentUrl ? (
                    <div className="text-center py-10 text-gray-400">
                      <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">कोई सार्वजनिक दस्तावेज संलग्न नहीं है।</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedWork.documentUrl && (
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <FiFileText className="w-5 h-5 text-[#135334]" />
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900">आधिकारिक स्वीकृति / कार्य पत्र</h4>
                              <span className="text-[10px] text-gray-400">PDF Document</span>
                            </div>
                          </div>
                          <a
                            href={selectedWork.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#135334] text-white text-xs font-bold hover:bg-[#0e4027] flex items-center gap-1"
                          >
                            <FiDownload className="w-3.5 h-3.5" /> डाउनलोड
                          </a>
                        </div>
                      )}
                      {(selectedWork.documents || []).map((doc, dIdx) => (
                        <div key={dIdx} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                          <div className="flex items-center gap-3">
                            <FiFileText className="w-5 h-5 text-blue-700" />
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900">{doc.title || 'संलग्न दस्तावेज'}</h4>
                              <span className="text-[10px] text-gray-400">{doc.type || 'PDF'}</span>
                            </div>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 flex items-center gap-1"
                          >
                            <FiDownload className="w-3.5 h-3.5" /> देखें
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: TIMELINE */}
              {detailTab === 'timeline' && (
                <div className="space-y-4">
                  {(!selectedWork.updates || selectedWork.updates.length === 0) ? (
                    <div className="text-center py-10 text-gray-400">
                      <FiClock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">कोई समयबद्ध प्रगति अद्यतन दर्ज नहीं है।</p>
                    </div>
                  ) : (
                    <div className="border-l-2 border-emerald-500 pl-4 space-y-4 ml-2">
                      {selectedWork.updates.map((upd, uIdx) => (
                        <div key={uIdx} className="relative">
                          <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-[#135334] ring-4 ring-emerald-100"></div>
                          <span className="text-[11px] font-bold text-emerald-800">{formatHindiDate(upd.date)}</span>
                          <h4 className="text-sm font-bold text-gray-900 mt-0.5">{upd.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{upd.description}</p>
                          {upd.progressPercentage !== undefined && (
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#135334]">
                              प्रगति: {upd.progressPercentage}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: CITIZEN FEEDBACK & REVIEWS */}
              {detailTab === 'feedback' && (
                <div className="space-y-6">
                  {/* Submission Form */}
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                    <h4 className="text-sm font-bold text-[#135334] mb-1">
                      इस विकास कार्य पर अपनी प्रतिक्रिया दें
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">
                      आपकी निष्पक्ष प्रतिक्रिया कार्य की गुणवत्ता एवं पारदर्शिता सुनिश्चित करने में सहायक होगी।
                    </p>

                    {feedbackSuccess ? (
                      <div className="p-4 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <FiCheck className="w-5 h-5 text-emerald-700" />
                        <span>आपकी प्रतिक्रिया सफलतापूर्वक प्राप्त हो गई है। सत्यापन उपरांत इसे सार्वजनिक किया जाएगा। धन्यवाद!</span>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitFeedback} className="space-y-3">
                        {/* Rating Star Selection */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-700">रेटिंग दें:</span>
                          <div className="flex gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setRating(num)}
                                className="text-lg hover:scale-110 transition-transform"
                              >
                                <FiStar className={num <= rating ? 'fill-amber-400 text-amber-500' : 'text-gray-300'} />
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-amber-700">({rating} / 5)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            placeholder="आपका नाम (वैकल्पिक)"
                            value={citizenName}
                            onChange={(e) => setCitizenName(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                          />
                          <select
                            value={citizenWard}
                            onChange={(e) => setCitizenWard(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white text-gray-700"
                          >
                            {WARDS.filter((w) => w !== 'ALL').map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                        </div>

                        <textarea
                          rows={2}
                          required
                          placeholder="कार्य की गुणवत्ता, उपयोगिता या सुझाव लिखें..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                        />

                        {feedbackError && (
                          <p className="text-[11px] text-rose-600 font-semibold">{feedbackError}</p>
                        )}

                        <button
                          type="submit"
                          disabled={submittingFeedback}
                          className="px-4 py-2 rounded-xl bg-[#135334] text-white text-xs font-bold hover:bg-[#0e4027] transition-all flex items-center gap-1.5"
                        >
                          <FiSend className="w-3.5 h-3.5" />
                          <span>{submittingFeedback ? 'भेज रहे हैं...' : 'प्रतिक्रिया सबमिट करें'}</span>
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Public Approved Feedback List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      नागरिक समीक्षाएं ({currentWorkApprovedFeedback.length})
                    </h4>
                    {currentWorkApprovedFeedback.length === 0 ? (
                      <p className="text-xs text-gray-400">वर्तमान में कोई सार्वजनिक प्रतिक्रिया उपलब्ध नहीं है।</p>
                    ) : (
                      <div className="space-y-2.5">
                        {currentWorkApprovedFeedback.map((fb) => (
                          <div key={fb.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-gray-900">{fb.citizenName || 'सरेरी नागरिक'} ({fb.ward})</span>
                              <div className="flex gap-0.5 text-amber-500">
                                {[...Array(fb.rating || 5)].map((_, i) => (
                                  <FiStar key={i} className="w-3 h-3 fill-amber-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{fb.feedback}</p>
                            {fb.adminResponse && (
                              <div className="mt-2 pl-3 border-l-2 border-[#135334] bg-emerald-50/50 p-2 rounded-r-lg">
                                <span className="text-[10px] font-bold text-[#135334] block">पंचायत आधिकारिक उत्तर:</span>
                                <span className="text-gray-800">{fb.adminResponse}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setSelectedWork(null)}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition-colors"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VikasKaryaPage;
