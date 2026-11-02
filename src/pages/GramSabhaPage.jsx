import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import { DEFAULT_MEETINGS, DEFAULT_RESOLUTIONS, MEETING_TYPES, RESOLUTION_STATUSES } from '../data/defaultGramSabha';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiUsers,
  FiAlertCircle,
  FiArrowRight,
  FiExternalLink,
  FiChevronRight,
  FiInfo,
  FiX,
  FiLayers,
  FiActivity,
  FiAward,
  FiEye
} from 'react-icons/fi';

const GramSabhaPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'resolutions' | 'status' | 'archive'
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMeetingFilter, setSelectedMeetingFilter] = useState('ALL');

  // Modal State for Meeting Details
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedResolution, setSelectedResolution] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch meetings from RTDB
    const meetingsRef = ref(rtdb, 'adminData/gramSabha/meetings');
    const unsubMeetings = onValue(meetingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data)
          .map(([id, val]) => ({
            id,
            ...val
          }))
          .filter(
            (m) =>
              m.isPublished !== false &&
              !m.id?.startsWith('GS-2026-M') &&
              !m.id?.startsWith('GS-2025-M')
          );
        setMeetings(list);
      } else {
        setMeetings([]);
      }
      setLoading(false);
    }, (error) => {
      console.warn('Firebase RTDB meetings error:', error);
      setMeetings([]);
      setLoading(false);
    });

    // Fetch resolutions from RTDB
    const resolutionsRef = ref(rtdb, 'adminData/gramSabha/resolutions');
    const unsubResolutions = onValue(resolutionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.entries(data)
          .map(([id, val]) => ({
            id,
            ...val
          }))
          .filter(
            (r) =>
              r.isPublished !== false &&
              !r.id?.startsWith('GPKS-GS-2026-R') &&
              !r.id?.startsWith('GPKS-GS-2025-R')
          );
        setResolutions(list);
      } else {
        setResolutions([]);
      }
    }, (error) => {
      console.warn('Firebase RTDB resolutions error:', error);
      setResolutions([]);
    });

    return () => {
      unsubMeetings();
      unsubResolutions();
    };
  }, []);

  // Compute Upcoming & Past Meetings based on Date & Status
  const { upcomingMeetings, pastMeetings, nearestMeeting } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    const upcoming = [];
    const past = [];

    meetings.forEach((m) => {
      // If explicitly marked completed, consider it past
      if (m.status === 'Completed') {
        past.push(m);
      } else if (m.status === 'Cancelled' || m.status === 'Postponed') {
        // Postponed/cancelled can be listed with their respective status
        if (m.date >= today) {
          upcoming.push(m);
        } else {
          past.push(m);
        }
      } else {
        // Scheduled
        if (m.date >= today) {
          upcoming.push(m);
        } else {
          past.push({ ...m, status: 'Completed' });
        }
      }
    });

    // Sort upcoming ascending (nearest first)
    upcoming.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    // Sort past descending (most recent first)
    past.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    const nearest = upcoming.length > 0 ? upcoming[0] : null;

    return {
      upcomingMeetings: upcoming,
      pastMeetings: past,
      nearestMeeting: nearest
    };
  }, [meetings]);

  // Dynamic Dashboard Counters (Calculated strictly from real records)
  const stats = useMemo(() => {
    const upcomingCount = upcomingMeetings.length;
    const conductedCount = pastMeetings.length;
    const passedResolutionsCount = resolutions.filter(
      r => r.status === 'पारित' || r.status === 'प्रगति में' || r.status === 'पूर्ण'
    ).length;
    const inProgressCount = resolutions.filter(r => r.status === 'प्रगति में').length;

    return {
      upcomingCount,
      conductedCount,
      passedResolutionsCount,
      inProgressCount
    };
  }, [upcomingMeetings, pastMeetings, resolutions]);

  // Filtered Resolutions for Tab 2 & Tab 3
  const filteredResolutions = useMemo(() => {
    return resolutions.filter((res) => {
      const matchSearch =
        searchQuery === '' ||
        res.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.resolutionNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.responsibleDepartment?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchYear =
        selectedYear === 'ALL' ||
        (res.approvalDate && res.approvalDate.startsWith(selectedYear));

      const matchStatus =
        selectedStatus === 'ALL' || res.status === selectedStatus;

      const matchMeeting =
        selectedMeetingFilter === 'ALL' || res.meetingId === selectedMeetingFilter;

      return matchSearch && matchYear && matchStatus && matchMeeting;
    });
  }, [resolutions, searchQuery, selectedYear, selectedStatus, selectedMeetingFilter]);

  // Unique Years from resolutions for Filter
  const availableYears = useMemo(() => {
    const years = new Set();
    resolutions.forEach(r => {
      if (r.approvalDate && r.approvalDate.length >= 4) {
        years.add(r.approvalDate.substring(0, 4));
      }
    });
    return Array.from(years).sort().reverse();
  }, [resolutions]);

  // Format Hindi Date
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

  // Printable Agenda Generator if no direct PDF link
  const handlePrintAgenda = (meeting) => {
    if (meeting.agendaPdfUrl) {
      window.open(meeting.agendaPdfUrl, '_blank');
      return;
    }
    // Generate simple printable agenda view
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>ग्राम सभा एजेंडा - ${meeting.title}</title>
          <style>
            body { font-family: 'Noto Sans Devanagari', Arial, sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #135334; padding-bottom: 20px; margin-bottom: 25px; }
            .title { font-size: 24px; font-weight: bold; color: #135334; margin-bottom: 8px; }
            .sub { font-size: 16px; color: #475569; }
            .meta { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
            .meta p { margin: 6px 0; font-size: 15px; }
            h3 { color: #0f172a; border-left: 4px solid #135334; padding-left: 10px; margin-top: 25px; }
            ol { padding-left: 20px; line-height: 1.8; }
            li { margin-bottom: 8px; font-size: 15px; }
            .footer { margin-top: 50px; text-align: right; border-top: 1px dashed #cbd5e1; padding-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ग्राम पंचायत ब्राह्मणों की सरेरी</div>
            <div class="sub">पंचायत समिति एवं जिला भीलवाड़ा (राजस्थान)</div>
            <h2>ग्राम सभा आधिकारिक बैठक एजेंडा</h2>
          </div>
          <div class="meta">
            <p><strong>बैठक का नाम:</strong> ${meeting.title}</p>
            <p><strong>बैठक का प्रकार:</strong> ${meeting.type || 'साधारण'}</p>
            <p><strong>दिनांक:</strong> ${formatHindiDate(meeting.date)}</p>
            <p><strong>समय:</strong> ${meeting.startTime || 'प्रातः 11:00 बजे'} ${meeting.endTime ? 'से ' + meeting.endTime : ''}</p>
            <p><strong>स्थान:</strong> ${meeting.venue}</p>
          </div>
          <h3>बैठक के प्रमुख विचारणीय एजेंडा बिंदु:</h3>
          <ol>
            ${(meeting.agenda || []).map(pt => `<li>${pt}</li>`).join('')}
          </ol>
          ${meeting.noticeText ? `<p style="margin-top:20px; background:#fffbeb; padding:12px; border-left:4px solid #f59e0b;"><strong>सार्वजनिक सूचना:</strong> ${meeting.noticeText}</p>` : ''}
          <div class="footer">
            <p>हस्ताक्षर / आदेशानुसार</p>
            <p>सरपंच / ग्राम विकास अधिकारी</p>
            <p>ग्राम पंचायत ब्राह्मणों की सरेरी</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  return (
    <div className="bg-[#FAF9F6] text-slate-800 min-h-screen pt-4 sm:pt-6 pb-20 selection:bg-[#135334]/20">
      <SEO
        title="Gram Sabha Decisions & Agenda | Village Sareri"
        description="सरेरी ग्राम सभा की बैठकें, पारित प्रस्ताव, वार्षिक कार्ययोजना एवं जनसहभागिता की पारदर्शी जानकारी।"
        url="https://villagesareri.in/gram-sabha"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Gram Panchayat', url: 'https://villagesareri.in/panchayat' },
          { name: 'Gram Sabha', url: 'https://villagesareri.in/gram-sabha' }
        ]}
      />

      {/* TOP BREADCRUMB & HEADER */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl mb-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-3 font-medium">
          <Link to="/" className="hover:text-[#135334] transition-colors flex items-center gap-1">
            होम
          </Link>
          <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/panchayat" className="hover:text-[#135334] transition-colors">
            ग्राम पंचायत
          </Link>
          <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#135334] font-semibold">ग्राम सभा</span>
        </nav>

        {/* Hero Banner Header */}
        <div className="bg-gradient-to-br from-[#135334] via-[#0E3E26] to-[#0A2E1C] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 text-white shadow-lg relative overflow-hidden">
          {/* Decorative Background Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2.5 border border-white/15">
              <FiUsers className="w-3.5 h-3.5 text-emerald-300" />
              <span>पारदर्शी पंचायती राज व्यवस्था</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading leading-snug sm:leading-tight mb-2">
              ग्राम सभा – ग्राम पंचायत सरेरी
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-2xl">
              ग्राम सभा की बैठकें, कार्यवाही, प्रस्ताव और विकास संबंधी निर्णयों की जानकारी। गांव के विकास में प्रत्येक नागरिक की भागीदारी सुनिश्चित करने का खुला मंच।
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: 4 DYNAMIC DASHBOARD COUNTERS */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl mb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {/* 1. आगामी बैठकें */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#135334] flex items-center justify-center shrink-0 border border-emerald-200 shadow-inner">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">आगामी बैठकें</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#135334] leading-tight">
                {loading ? '...' : stats.upcomingCount}
              </h3>
            </div>
          </div>

          {/* 2. आयोजित बैठकें */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 shadow-inner">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">आयोजित बैठकें</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-800 leading-tight">
                {loading ? '...' : stats.conductedCount}
              </h3>
            </div>
          </div>

          {/* 3. पारित प्रस्ताव */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200 shadow-inner">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">पारित प्रस्ताव</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-800 leading-tight">
                {loading ? '...' : stats.passedResolutionsCount}
              </h3>
            </div>
          </div>

          {/* 4. प्रगति में प्रस्ताव */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 shadow-inner">
              <FiActivity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">प्रगति में प्रस्ताव</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-800 leading-tight">
                {loading ? '...' : stats.inProgressCount}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SUB-NAVIGATION TABS (ALIGNED IN CLEAN SINGLE LINE) */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-1.5 shadow-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max md:min-w-0 md:grid md:grid-cols-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-[#135334] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FiCalendar className="w-4 h-4 shrink-0" />
              <span>आगामी बैठकें ({stats.upcomingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('resolutions')}
              className={`flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'resolutions'
                  ? 'bg-[#135334] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FiFileText className="w-4 h-4 shrink-0" />
              <span>पारित प्रस्ताव ({stats.passedResolutionsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'status'
                  ? 'bg-[#135334] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FiActivity className="w-4 h-4 shrink-0" />
              <span>प्रस्ताव की स्थिति (Timeline)</span>
            </button>

            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                activeTab === 'archive'
                  ? 'bg-[#135334] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FiLayers className="w-4 h-4 shrink-0" />
              <span>आयोजित बैठकें आर्काइव ({stats.conductedCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: TAB CONTENTS */}
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* ============================================================ */}
        {/* TAB 1: UPCOMING MEETINGS */}
        {/* ============================================================ */}
        {activeTab === 'upcoming' && (
          <div className="space-y-8">
            {/* Prominent Nearest Upcoming Meeting Card (Reference Layout) */}
            {nearestMeeting ? (
              <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-xl overflow-hidden relative">
                {/* Top Badge Strip */}
                <div className="bg-gradient-to-r from-[#135334] to-[#166534] text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300"></span>
                    </span>
                    <span className="font-extrabold text-xs sm:text-sm tracking-wide uppercase">
                      निकटतम आगामी ग्राम सभा
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm border border-white/20">
                    प्रकार: {nearestMeeting.type || 'साधारण ग्राम सभा'}
                  </span>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 leading-snug">
                        {nearestMeeting.title}
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                        {nearestMeeting.description}
                      </p>

                      {/* Quick Details Badges */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#135334] flex items-center justify-center shrink-0">
                            <FiCalendar className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-gray-500 block uppercase">दिनांक</span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatHindiDate(nearestMeeting.date)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#135334] flex items-center justify-center shrink-0">
                            <FiClock className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-gray-500 block uppercase">समय</span>
                            <span className="text-sm font-bold text-gray-900">
                              {nearestMeeting.startTime || 'प्रातः 11:00 बजे'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#135334] flex items-center justify-center shrink-0">
                            <FiMapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-gray-500 block uppercase">स्थान</span>
                            <span className="text-sm font-bold text-gray-900">
                              {nearestMeeting.venue}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agenda Bullet Points */}
                  <div className="mb-8">
                    <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FiFileText className="w-4 h-4 text-[#135334]" />
                      <span>बैठक का एजेंडा (विचारणीय विषय):</span>
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {(nearestMeeting.agenda || []).map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-gray-100 shadow-xs text-sm text-gray-800"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#135334] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handlePrintAgenda(nearestMeeting)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#135334] hover:bg-[#0e4027] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>पूरा एजेंडा डाउनलोड करें (PDF)</span>
                    </button>

                    <button
                      onClick={() => setSelectedMeeting(nearestMeeting)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#135334] font-bold text-sm border border-emerald-200 transition-all"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>बैठक का पूरा विवरण देखें</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
                <FiInfo className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">वर्तमान में कोई नई ग्राम सभा बैठक प्रस्तावित नहीं है</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  आगामी बैठक की सूचना पंचायत द्वारा शीघ्र ही इस पोर्टल पर प्रकाशित की जाएगी। आप पूर्व बैठकों की कार्यवाही आर्काइव में देख सकते हैं।
                </p>
              </div>
            )}

            {/* Other Upcoming Meetings If Any */}
            {upcomingMeetings.length > 1 && (
              <div className="mt-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>अन्य आगामी बैठकें</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-[#135334]">
                    {upcomingMeetings.length - 1}
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {upcomingMeetings.slice(1).map((m) => (
                    <div
                      key={m.id}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-[#135334] border border-emerald-200">
                            {m.type || 'साधारण'}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formatHindiDate(m.date)}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{m.title}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{m.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5 text-emerald-700" />
                          {m.startTime}
                        </span>
                        <button
                          onClick={() => setSelectedMeeting(m)}
                          className="text-sm font-bold text-[#135334] hover:underline flex items-center gap-1"
                        >
                          विवरण देखें <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PASSED RESOLUTIONS (पारित प्रस्ताव) */}
        {/* ============================================================ */}
        {activeTab === 'resolutions' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="प्रस्ताव संख्या, कार्य शीर्षक या विभाग खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#135334]/20 focus:border-[#135334]"
                />
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
                {/* Year Filter */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
                >
                  <option value="ALL">सभी वर्ष (All Years)</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>वर्ष {yr}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#135334]/20"
                >
                  <option value="ALL">सभी स्थितियां (All Status)</option>
                  {RESOLUTION_STATUSES.map(st => (
                    <option key={st.id} value={st.id}>{st.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resolutions Cards Grid */}
            {filteredResolutions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8">
                <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">कोई प्रस्ताव नहीं मिला</h3>
                <p className="text-gray-500 text-sm mt-1">कृपया खोज शब्द या फ़िल्टर बदलकर पुनः प्रयास करें।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredResolutions.map((res) => {
                  const statusObj = RESOLUTION_STATUSES.find(s => s.id === res.status) || {
                    color: 'bg-gray-100 text-gray-800'
                  };

                  return (
                    <div
                      key={res.id}
                      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-[#135334] border border-emerald-200">
                            {res.resolutionNumber}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${statusObj.color}`}>
                            {res.status}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                          {res.title}
                        </h4>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                          {res.description}
                        </p>

                        {/* Key Info Details */}
                        <div className="space-y-1.5 text-xs text-gray-500 mb-4 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-600">स्वीकृति दिनांक:</span>
                            <span className="font-medium text-gray-800">{formatHindiDate(res.approvalDate)}</span>
                          </div>
                          {res.responsibleDepartment && (
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-600">जिम्मेदार विभाग:</span>
                              <span className="font-medium text-gray-800">{res.responsibleDepartment}</span>
                            </div>
                          )}
                          {res.meetingTitle && (
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-600">संबद्ध बैठक:</span>
                              <span className="font-medium text-gray-800 line-clamp-1 max-w-[200px] text-right">{res.meetingTitle}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <button
                          onClick={() => setSelectedResolution(res)}
                          className="text-xs sm:text-sm font-bold text-[#135334] hover:underline flex items-center gap-1"
                        >
                          प्रगति रिपोर्ट व विवरण <FiArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {res.documentUrl && (
                          <a
                            href={res.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          >
                            <FiDownload className="w-3 h-3" />
                            दस्तावेज
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: RESOLUTION STATUS & PROGRESS TIMELINE */}
        {/* ============================================================ */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {/* Info Notice Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-emerald-950">
              <FiActivity className="w-5 h-5 text-[#135334] mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-bold text-[#135334] mb-0.5">पारदर्शी निर्णय क्रियान्वयन ट्रैकर</p>
                ग्राम सभा में पारित समस्त जनहित प्रस्तावों के क्रियान्वयन की वर्तमान प्रगति एवं प्रशासनिक अद्यतन यहां रियल-टाइम प्रदर्शित किए जाते हैं।
              </div>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedStatus === 'ALL'
                    ? 'bg-[#135334] text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                सभी प्रस्ताव ({resolutions.length})
              </button>
              {RESOLUTION_STATUSES.map((st) => {
                const count = resolutions.filter(r => r.status === st.id).length;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStatus(st.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedStatus === st.id
                        ? 'bg-[#135334] text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {st.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Timeline Cards */}
            <div className="space-y-5">
              {filteredResolutions.map((res) => {
                // Determine 4-step progress index
                const steps = ['प्रस्तावित', 'पारित', 'प्रगति में', 'पूर्ण'];
                const currentStepIdx = steps.indexOf(res.status);

                return (
                  <div
                    key={res.id}
                    className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <div>
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-[#135334] border border-emerald-200 mr-2">
                          {res.resolutionNumber}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          स्वीकृति: {formatHindiDate(res.approvalDate)}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-[#135334] self-start sm:self-auto">
                        स्थिति: {res.status}
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {res.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {res.description}
                    </p>

                    {/* Visual 4-Step Stepper Progress Bar */}
                    <div className="py-4 px-2 sm:px-6 bg-[#FAF9F6] rounded-2xl border border-gray-100 mb-6">
                      <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 h-1 bg-gray-200 z-0">
                          <div
                            className="h-full bg-[#135334] transition-all duration-500"
                            style={{
                              width:
                                currentStepIdx >= 0
                                  ? `${(currentStepIdx / (steps.length - 1)) * 100}%`
                                  : '0%'
                            }}
                          ></div>
                        </div>

                        {/* Steps Icons */}
                        {steps.map((stepName, sIdx) => {
                          const isDone = currentStepIdx >= sIdx;
                          const isCurrent = currentStepIdx === sIdx;

                          return (
                            <div key={stepName} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isCurrent
                                    ? 'bg-[#135334] text-white ring-4 ring-emerald-200 scale-110 shadow-md'
                                    : isDone
                                    ? 'bg-[#135334] text-white'
                                    : 'bg-white border-2 border-gray-300 text-gray-400'
                                }`}
                              >
                                {isDone ? '✓' : sIdx + 1}
                              </div>
                              <span
                                className={`text-[11px] sm:text-xs mt-2 font-bold ${
                                  isCurrent
                                    ? 'text-[#135334]'
                                    : isDone
                                    ? 'text-gray-800'
                                    : 'text-gray-400'
                                }`}
                              >
                                {stepName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Progress Notes */}
                    {res.progressNotes && (
                      <div className="bg-amber-50/70 border-l-4 border-amber-400 p-4 rounded-r-xl text-xs sm:text-sm text-gray-800 mb-4">
                        <span className="font-bold text-amber-900 block mb-1">
                          नवीनतम प्रगति टिप्पणी (Progress Note):
                        </span>
                        <p>{res.progressNotes}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
                      {res.responsibleDepartment && (
                        <span>
                          <strong>जिम्मेदार विभाग:</strong> {res.responsibleDepartment}
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedResolution(res)}
                        className="font-bold text-[#135334] hover:underline flex items-center gap-1"
                      >
                        संपूर्ण जानकारी देखें <FiChevronRight />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: PREVIOUS MEETINGS ARCHIVE */}
        {/* ============================================================ */}
        {activeTab === 'archive' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">आयोजित ग्राम सभा बैठकें</h3>
                <p className="text-sm text-gray-500">पूर्व में संपन्न हुई ग्राम सभा बैठकों का विवरण एवं कार्यवाही</p>
              </div>
            </div>

            {pastMeetings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8">
                <FiLayers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">आर्काइव में कोई बैठक उपलब्ध नहीं है</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {pastMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          {m.type || 'विशेष ग्राम सभा'}
                        </span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          सम्पन्न (Conducted)
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          दिनांक: {formatHindiDate(m.date)}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{m.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{m.description}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setSelectedMeeting(m)}
                        className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FiEye className="w-4 h-4 text-gray-600" />
                        कार्यवाही व विवरण
                      </button>

                      <button
                        onClick={() => handlePrintAgenda(m)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#135334] border border-emerald-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FiDownload className="w-4 h-4" />
                        एजेंडा PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: MEETING DETAILS MODAL */}
      {/* ============================================================ */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#135334] text-white p-6 flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-white/20 text-xs font-bold uppercase mb-2">
                  {selectedMeeting.type || 'ग्राम सभा'}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold leading-snug">
                  {selectedMeeting.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100 text-sm">
                <div>
                  <span className="text-xs text-gray-500 font-semibold block">दिनांक</span>
                  <span className="font-bold text-gray-900">{formatHindiDate(selectedMeeting.date)}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-semibold block">समय</span>
                  <span className="font-bold text-gray-900">
                    {selectedMeeting.startTime} {selectedMeeting.endTime ? 'से ' + selectedMeeting.endTime : ''}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500 font-semibold block">स्थान (Venue)</span>
                  <span className="font-bold text-gray-900">{selectedMeeting.venue}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">विवरण (Description)</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{selectedMeeting.description}</p>
              </div>

              {/* Full Agenda */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">बैठक एजेंडा सूची</h4>
                <ul className="space-y-2">
                  {(selectedMeeting.agenda || []).map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 text-sm text-gray-800 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="w-5 h-5 rounded-full bg-[#135334] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {pIdx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attendance Info if recorded */}
              {selectedMeeting.attendeeCount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiUsers className="w-6 h-6 text-[#135334]" />
                    <div>
                      <h5 className="font-bold text-sm text-emerald-950">नागरिक उपस्थिति एवं कोरम</h5>
                      <p className="text-xs text-emerald-800">
                        {selectedMeeting.attendeeCount} ग्रामीण नागरिक उपस्थित रहे। कोरम पूर्ण।
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-200 text-emerald-900">
                    सत्यापित
                  </span>
                </div>
              )}

              {/* Minutes of Meeting if available */}
              {selectedMeeting.minutesPdfUrl && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-blue-950">बैठक कार्यवाही विवरण (Minutes of Meeting)</h5>
                    <p className="text-xs text-blue-700">सत्यापित प्रतिलिपि उपलब्ध है।</p>
                  </div>
                  <a
                    href={selectedMeeting.minutesPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    MOM डाउनलोड
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handlePrintAgenda(selectedMeeting)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#135334] text-white font-bold text-xs hover:bg-[#0e4027] transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                एजेंडा डाउनलोड / प्रिंट
              </button>

              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition-colors"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: RESOLUTION DETAILS MODAL */}
      {/* ============================================================ */}
      {selectedResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#135334] to-[#166534] text-white p-6 flex items-start justify-between gap-4">
              <div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-white/20 uppercase mb-2 inline-block">
                  {selectedResolution.resolutionNumber}
                </span>
                <h3 className="text-xl font-bold leading-snug">
                  {selectedResolution.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResolution(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  प्रस्ताव का पूरा विवरण
                </span>
                <p className="text-sm text-gray-800 leading-relaxed bg-[#FAF9F6] p-4 rounded-2xl border border-gray-100">
                  {selectedResolution.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-500 font-semibold block">स्वीकृति दिनांक</span>
                  <span className="font-bold text-gray-900">{formatHindiDate(selectedResolution.approvalDate)}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block">वर्तमान स्थिति</span>
                  <span className="font-bold text-[#135334]">{selectedResolution.status}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 font-semibold block">जिम्मेदार विभाग / कार्यकारी संस्था</span>
                  <span className="font-bold text-gray-900">{selectedResolution.responsibleDepartment || 'ग्राम पंचायत सरेरी'}</span>
                </div>
              </div>

              {selectedResolution.progressNotes && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">
                    अद्यतन प्रगति एवं स्थिति विवरण
                  </span>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                    {selectedResolution.progressNotes}
                  </p>
                </div>
              )}

              {selectedResolution.documentUrl && (
                <div className="pt-2">
                  <a
                    href={selectedResolution.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#135334] text-white font-bold text-xs hover:bg-[#0e4027] transition-all"
                  >
                    <FiDownload className="w-4 h-4" />
                    आधिकारिक प्रस्ताव दस्तावेज डाउनलोड करें
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
              <button
                onClick={() => setSelectedResolution(null)}
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

export default GramSabhaPage;
