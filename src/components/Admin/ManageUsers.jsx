import React, { useState, useEffect, useMemo } from 'react';
import { db, rtdb } from '../../firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, onValue, set as rtdbSet } from 'firebase/database';
import { 
  FiUsers, 
  FiShield, 
  FiUserCheck, 
  FiSearch, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiAward,
  FiMail,
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';

const ROLES = [
  { id: 'citizen', label: 'नागरिक (Citizen)', icon: '👤', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { id: 'sarpanch', label: 'सरपंच (Sarpanch)', icon: '👑', color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' },
  { id: 'admin', label: 'मुख्य व्यवस्थापक (Super Admin)', icon: '🛡️', color: 'bg-purple-100 text-purple-900 border-purple-300 font-bold' }
];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingUid, setUpdatingUid] = useState(null);
  const [alertMsg, setAlertMsg] = useState(null);

  // Fetch Firestore users + RTDB userRoles
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Firestore users collection
      const usersSnap = await getDocs(collection(db, 'users'));
      const list = [];
      usersSnap.forEach((d) => {
        const data = d.data();
        list.push({
          uid: d.id,
          ...data
        });
      });
      setUsers(list);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();

    // Listen to real-time roles from RTDB userRoles
    const rolesRef = ref(rtdb, 'userRoles');
    const unsub = onValue(rolesRef, (snapshot) => {
      const val = snapshot.val() || {};
      setRolesMap(val);
    });

    return () => unsub();
  }, []);

  const handleRoleChange = async (targetUser, newRole) => {
    const uid = targetUser.uid;
    const oldRole = rolesMap[uid]?.role || targetUser.role || 'citizen';
    if (oldRole === newRole) return;

    const confirmText = newRole === 'sarpanch'
      ? `क्या आप ${targetUser.displayName || targetUser.email} को "सरपंच (Sarpanch)" का अधिकार देना चाहते हैं? इससे वे न्यूज़, नोटिस और मेले/इवेंट्स प्रबंधित कर पाएंगे।`
      : newRole === 'admin'
      ? `क्या आप ${targetUser.displayName || targetUser.email} को "मुख्य व्यवस्थापक (Super Admin)" का पूर्ण अधिकार देना चाहते हैं?`
      : `क्या आप ${targetUser.displayName || targetUser.email} के विशेषाधिकार हटाकर सामान्य "नागरिक (Citizen)" बनाना चाहते हैं?`;

    if (!window.confirm(confirmText)) return;

    setUpdatingUid(uid);
    try {
      const rolePayload = {
        role: newRole,
        email: targetUser.email || '',
        displayName: targetUser.displayName || '',
        updatedAt: Date.now()
      };

      // 1. Update RTDB for instant fast lookup
      await rtdbSet(ref(rtdb, `userRoles/${uid}`), rolePayload);

      // 2. Update Firestore user document
      try {
        const userDocRef = doc(db, 'users', uid);
        await setDoc(userDocRef, { role: newRole, roleUpdatedAt: Date.now() }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore update error (non-fatal):', fsErr);
      }

      // Update local state
      setRolesMap((prev) => ({
        ...prev,
        [uid]: rolePayload
      }));

      setAlertMsg({
        type: 'success',
        text: `सफलतापूर्वक अपडेट किया गया: ${targetUser.displayName || targetUser.email} अब "${ROLES.find(r => r.id === newRole)?.label}" हैं!`
      });

      setTimeout(() => setAlertMsg(null), 5000);
    } catch (err) {
      console.error('Failed to change role:', err);
      setAlertMsg({
        type: 'error',
        text: 'रोल बदलने में त्रुटि हुई: ' + err.message
      });
    } finally {
      setUpdatingUid(null);
    }
  };

  const usersWithRole = useMemo(() => {
    return users.map((u) => {
      const rtdbRole = rolesMap[u.uid]?.role;
      const effectiveRole = rtdbRole || u.role || 'citizen';
      return {
        ...u,
        effectiveRole
      };
    });
  }, [users, rolesMap]);

  const filteredUsers = useMemo(() => {
    return usersWithRole.filter((u) => {
      const query = searchQuery.trim().toLowerCase();
      const matchQuery = !query || 
        (u.displayName && u.displayName.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.uid && u.uid.toLowerCase().includes(query));

      const matchRole = roleFilter === 'ALL' || u.effectiveRole === roleFilter;
      return matchQuery && matchRole;
    });
  }, [usersWithRole, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    let total = usersWithRole.length;
    let sarpanch = 0;
    let admin = 0;
    let citizen = 0;

    usersWithRole.forEach((u) => {
      if (u.effectiveRole === 'sarpanch') sarpanch++;
      else if (u.effectiveRole === 'admin') admin++;
      else citizen++;
    });

    return { total, sarpanch, admin, citizen };
  }, [usersWithRole]);

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-saffron">
                <FiShield className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-gray-900">
                पंजीकृत नागरिक व अधिकार प्रबंधन (Role Access)
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              यहाँ से आप पंजीकृत यूज़र्स में से सरपंच या एडमिन के अधिकार बाँट सकते हैं।
            </p>
          </div>
          <button
            onClick={fetchAllUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-all shadow-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-saffron' : ''}`} />
            रिफ्रेश करें
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500">कुल पंजीकृत सदस्य</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-700">👑 सरपंच पद</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                सीमित अधिकार
              </span>
            </div>
            <p className="text-2xl font-black text-amber-900 mt-1">{stats.sarpanch}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-purple-700">🛡️ मुख्य व्यवस्थापक</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                पूर्ण नियंत्रण
              </span>
            </div>
            <p className="text-2xl font-black text-purple-900 mt-1">{stats.admin}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700">👤 सामान्य नागरिक</p>
            <p className="text-2xl font-black text-blue-900 mt-1">{stats.citizen}</p>
          </div>
        </div>

        {/* Role Explanation Note */}
        <div className="mt-6 p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 text-xs text-orange-950 flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div>
            <p className="font-bold mb-1">सरपंच (Sarpanch) रोल के अधिकार:</p>
            <p className="text-gray-700 leading-relaxed">
              सरपंच रोल वाले यूज़र जब अपने गूगल खाते से एडमिन पैनल पर लॉगिन करेंगे, तो उन्हें <strong>सिर्फ 3 विभाग</strong> दिखेंगे: 
              <strong> 📰 गाँव की ताज़ा न्यूज़</strong>, <strong>🏛️ ग्राम पंचायत व डिजिटल नोटिस बोर्ड</strong>, और <strong>🚩 गाँव के मेले व उत्सव</strong>। 
              बाकी निजी डेटा (शिकायतें, खेल फॉर्म, यूज़र रोल) सिर्फ मुख्य एडमिन के लिए सुरक्षित रहेगा।
            </p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-fade-in ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className="text-sm font-semibold">{alertMsg.text}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            className="text-xs font-bold underline hover:opacity-80"
          >
            बंद करें
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="नाम या ईमेल से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent transition-all"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'ALL'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            सभी ({stats.total})
          </button>
          <button
            onClick={() => setRoleFilter('sarpanch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'sarpanch'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            👑 सरपंच ({stats.sarpanch})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            🛡️ एडमिन ({stats.admin})
          </button>
          <button
            onClick={() => setRoleFilter('citizen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'citizen'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            👤 नागरिक ({stats.citizen})
          </button>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-saffron"></div>
          <p className="mt-4 text-sm font-semibold text-gray-600">यूज़र्स लोड हो रहे हैं...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">कोई यूज़र नहीं मिला</h3>
          <p className="text-xs text-gray-500 mt-1">
            {searchQuery ? 'सर्च क्वेरी बदलकर देखें' : 'कोई पंजीकृत यूज़र उपलब्ध नहीं है'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">प्रोफ़ाइल व नाम</th>
                  <th className="px-6 py-4">ईमेल</th>
                  <th className="px-6 py-4">पंजीकरण तिथि</th>
                  <th className="px-6 py-4">वर्तमान पद (Role)</th>
                  <th className="px-6 py-4 text-right">अधिकार बदलें (Assign Role)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const currentRoleObj = ROLES.find(r => r.id === u.effectiveRole) || ROLES[0];
                  const isBusy = updatingUid === u.uid;
                  
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                      {/* Avatar & Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || u.email || 'User')}&background=ea580c&color=fff`}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm flex-shrink-0"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=ea580c&color=fff`;
                            }}
                          />
                          <div>
                            <div className="font-bold text-gray-900 leading-snug">
                              {u.displayName || (u.email ? u.email.split('@')[0] : 'ग्रामीण नागरिक')}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                              ID: {u.uid.slice(0, 10)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <FiMail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{u.email || 'ईमेल अनुपलब्ध'}</span>
                        </div>
                      </td>

                      {/* Reg Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {u.creationTime 
                              ? new Date(u.creationTime).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'अज्ञात'}
                          </span>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${currentRoleObj.color}`}>
                          <span>{currentRoleObj.icon}</span>
                          <span>{currentRoleObj.label}</span>
                        </span>
                      </td>

                      {/* Role Selector */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={u.effectiveRole}
                            disabled={isBusy}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            aria-label={`Role for ${u.displayName || u.email || 'User'}`}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-300 bg-white shadow-sm hover:border-saffron focus:ring-2 focus:ring-saffron focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                          >
                            <option value="citizen">👤 सामान्य नागरिक (Citizen)</option>
                            <option value="sarpanch">👑 सरपंच (Sarpanch - सीमित अधिकार)</option>
                            <option value="admin">🛡️ एडमिन (Super Admin - पूर्ण अधिकार)</option>
                          </select>
                          {isBusy && (
                            <div className="w-4 h-4 border-2 border-saffron border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filteredUsers.map((u) => {
              const currentRoleObj = ROLES.find(r => r.id === u.effectiveRole) || ROLES[0];
              const isBusy = updatingUid === u.uid;

              return (
                <div key={u.uid} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || u.email || 'User')}&background=ea580c&color=fff`}
                        alt="Avatar"
                        className="w-11 h-11 rounded-full object-cover border border-gray-200 shadow-sm"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || 'U')}&background=ea580c&color=fff`;
                        }}
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-sm">
                          {u.displayName || (u.email ? u.email.split('@')[0] : 'ग्रामीण नागरिक')}
                        </div>
                        <div className="text-xs text-gray-500 break-all">{u.email}</div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border shrink-0 ${currentRoleObj.color}`}>
                      <span>{currentRoleObj.icon}</span>
                      <span>{currentRoleObj.label.split(' ')[0]}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
                    <span className="text-gray-400">
                      {u.creationTime ? new Date(u.creationTime).toLocaleDateString() : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-gray-600">रोल बदलें:</label>
                      <select
                        value={u.effectiveRole}
                        disabled={isBusy}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        aria-label={`Role for ${u.displayName || u.email || 'User'}`}
                        className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:ring-1 focus:ring-saffron"
                      >
                        <option value="citizen">👤 नागरिक</option>
                        <option value="sarpanch">👑 सरपंच</option>
                        <option value="admin">🛡️ एडमिन</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
