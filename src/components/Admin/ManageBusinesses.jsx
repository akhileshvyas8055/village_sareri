import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, update, set, remove } from 'firebase/database';
import { rtdb } from '../../firebase';
import {
  DEFAULT_BUSINESS_CATEGORIES,
  sanitizeSlug,
  isSlugAvailable
} from '../../services/businessService';
import {
  FiShoppingBag as LuStore,
  FiClock as LuClock,
  FiCheckCircle as LuCheckCircle,
  FiXCircle as LuXCircle,
  FiTrash2 as LuTrash2,
  FiEdit3 as LuEdit3,
  FiStar as LuStar,
  FiSearch as LuSearch,
  FiFilter as LuFilter,
  FiEye as LuEye,
  FiPlus as LuPlus,
  FiExternalLink as LuExternalLink,
  FiAward as LuAward,
  FiPhone as LuPhone,
  FiMapPin as LuMapPin,
  FiMessageSquare as LuMessageSquare,
  FiBarChart2 as LuBarChart3
} from 'react-icons/fi';

const ManageBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_BUSINESS_CATEGORIES);
  const [loading, setLoading] = useState(true);

  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected' | 'reviews' | 'categories' | 'featured' | 'analytics'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal states
  const [viewingBusiness, setViewingBusiness] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Listen to Businesses
  useEffect(() => {
    const bizRef = ref(rtdb, 'businesses');
    const unsub = onValue(bizRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list = Object.values(val).filter(Boolean);
        list.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
        setBusinesses(list);
      } else {
        setBusinesses([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Listen to All Reviews
  useEffect(() => {
    const revRef = ref(rtdb, 'businessReviews');
    const unsub = onValue(revRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const all = [];
        Object.entries(val).forEach(([bizId, userReviews]) => {
          if (userReviews && typeof userReviews === 'object') {
            Object.entries(userReviews).forEach(([uid, rev]) => {
              if (rev) {
                all.push({
                  businessId: bizId,
                  userUid: uid,
                  ...rev
                });
              }
            });
          }
        });
        all.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
        setReviews(all);
      } else {
        setReviews([]);
      }
    });
    return () => unsub();
  }, []);

  // Listen to Categories
  useEffect(() => {
    const catRef = ref(rtdb, 'businessCategories');
    const unsub = onValue(catRef, (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        const list = Object.values(val).filter(Boolean).map(c => typeof c === 'string' ? c : c.name);
        if (list.length > 0) {
          setCategories(list);
        }
      }
    });
    return () => unsub();
  }, []);

  // Counts
  const counts = useMemo(() => {
    return {
      total: businesses.length,
      pending: businesses.filter((b) => b.status === 'pending').length,
      approved: businesses.filter((b) => b.status === 'approved').length,
      rejected: businesses.filter((b) => b.status === 'rejected').length,
      featured: businesses.filter((b) => b.featured).length,
      reviewsCount: reviews.length
    };
  }, [businesses, reviews]);

  // Filtered Businesses list based on activeSubTab, category & search
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      // Tab filter
      if (activeSubTab === 'pending' && b.status !== 'pending') return false;
      if (activeSubTab === 'approved' && b.status !== 'approved') return false;
      if (activeSubTab === 'rejected' && b.status !== 'rejected') return false;
      if (activeSubTab === 'featured' && !b.featured) return false;

      // Category filter
      if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (b.name || '').toLowerCase().includes(q);
        const ownerMatch = (b.ownerName || '').toLowerCase().includes(q);
        const slugMatch = (b.slug || '').toLowerCase().includes(q);
        const phoneMatch = (b.phone || '').includes(q);
        return nameMatch || ownerMatch || slugMatch || phoneMatch;
      }
      return true;
    });
  }, [businesses, activeSubTab, categoryFilter, searchQuery]);

  // Actions
  const handleApprove = async (id, slug) => {
    try {
      await update(ref(rtdb, `businesses/${id}`), {
        status: 'approved',
        updatedAt: Date.now()
      });
      // Ensure slug mapping exists
      if (slug) {
        await set(ref(rtdb, `businessSlugs/${slug}`), id);
      }
      alert('Business approved successfully! It is now live on the website.');
    } catch (err) {
      alert('Error approving business: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return;
    try {
      await update(ref(rtdb, `businesses/${id}`), {
        status: 'rejected',
        rejectReason: reason || 'Not meeting listing standards',
        updatedAt: Date.now()
      });
    } catch (err) {
      alert('Error rejecting: ' + err.message);
    }
  };

  const handleToggleFeatured = async (id, currentVal) => {
    try {
      await update(ref(rtdb, `businesses/${id}`), {
        featured: !currentVal,
        updatedAt: Date.now()
      });
    } catch (err) {
      alert('Error toggling featured: ' + err.message);
    }
  };

  const handleDeleteBusiness = async (id, slug) => {
    if (!window.confirm('Are you sure you want to completely delete this business listing?')) return;
    try {
      await remove(ref(rtdb, `businesses/${id}`));
      if (slug) {
        await remove(ref(rtdb, `businessSlugs/${slug}`));
      }
      await remove(ref(rtdb, `businessReviews/${id}`));
      alert('Business deleted successfully.');
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBusiness) return;
    try {
      const cleanSlug = sanitizeSlug(editingBusiness.slug);
      // Check if slug changed
      const original = businesses.find((b) => b.id === editingBusiness.id);
      if (original && original.slug !== cleanSlug) {
        const check = await isSlugAvailable(cleanSlug, editingBusiness.id);
        if (!check.available) {
          alert('Cannot use this slug: ' + check.error);
          return;
        }
        // Remove old slug and set new
        await remove(ref(rtdb, `businessSlugs/${original.slug}`));
        await set(ref(rtdb, `businessSlugs/${cleanSlug}`), editingBusiness.id);
      }

      await update(ref(rtdb, `businesses/${editingBusiness.id}`), {
        name: editingBusiness.name,
        slug: cleanSlug,
        category: editingBusiness.category,
        ownerName: editingBusiness.ownerName,
        phone: editingBusiness.phone,
        whatsapp: editingBusiness.whatsapp || '',
        locality: editingBusiness.locality,
        address: editingBusiness.address || '',
        description: editingBusiness.description || '',
        openingHours: editingBusiness.openingHours || '',
        updatedAt: Date.now()
      });

      alert('Business details updated successfully!');
      setEditingBusiness(null);
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleDeleteReview = async (bizId, userUid) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await remove(ref(rtdb, `businessReviews/${bizId}/${userUid}`));
      alert('Review deleted.');
    } catch (err) {
      alert('Delete review failed: ' + err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.includes(name)) {
      alert('Category already exists!');
      return;
    }
    try {
      const updatedList = [...categories, name];
      await set(ref(rtdb, 'businessCategories'), updatedList);
      setNewCategoryName('');
      alert('Category added!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Total Shops</span>
            <span className="text-2xl font-extrabold text-gray-900 font-heading">{counts.total}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0D477A] flex items-center justify-center font-bold">
            <LuStore className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-2xl font-extrabold text-amber-600 font-heading">{counts.pending}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <LuClock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">Approved & Live</span>
            <span className="text-2xl font-extrabold text-emerald-600 font-heading">{counts.approved}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <LuCheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">Total Reviews</span>
            <span className="text-2xl font-extrabold text-purple-600 font-heading">{counts.reviewsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <LuMessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50">
          {[
            { id: 'all', label: 'All Businesses', count: counts.total },
            { id: 'pending', label: 'Pending Approvals', count: counts.pending, alert: counts.pending > 0 },
            { id: 'approved', label: 'Approved Shops', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
            { id: 'featured', label: 'Featured Shops', count: counts.featured },
            { id: 'reviews', label: 'Customer Reviews', count: counts.reviewsCount },
            { id: 'categories', label: 'Categories' },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                activeSubTab === tab.id
                  ? 'border-[#0D477A] text-[#0D477A] bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    tab.alert
                      ? 'bg-amber-500 text-white animate-pulse'
                      : activeSubTab === tab.id
                      ? 'bg-blue-100 text-[#0D477A]'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content of Active SubTab */}
        <div className="p-6">
          
          {/* SEARCH & FILTERS (Shown for business list tabs) */}
          {['all', 'pending', 'approved', 'rejected', 'featured'].includes(activeSubTab) && (
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
              <div className="relative w-full sm:w-80">
                <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, owner, phone, slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0D477A]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0D477A]"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* LISTINGS TABLE */}
          {['all', 'pending', 'approved', 'rejected', 'featured'].includes(activeSubTab) && (
            loading ? (
              <div className="py-12 text-center text-gray-400">Loading business directory...</div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <LuStore className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="font-semibold text-sm">No businesses found in this section.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="py-3 px-3">Shop & Slug</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Owner & Phone</th>
                      <th className="py-3 px-3">Rating</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBusinesses.map((biz) => (
                      <tr key={biz.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-gray-400 font-bold">
                              {biz.logoUrl ? (
                                <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                              ) : (
                                <LuStore className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <strong className="text-gray-900 block font-bold leading-tight notranslate">
                                {biz.name}
                              </strong>
                              <Link
                                to={`/${biz.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-mono"
                              >
                                /{biz.slug}
                                <LuExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-medium text-gray-600">
                          {biz.category}
                        </td>

                        <td className="py-3 px-3 text-gray-600">
                          <span className="block font-semibold text-gray-800">{biz.ownerName}</span>
                          <span className="text-[11px] text-gray-400">{biz.phone}</span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <LuStar className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{biz.rating ? Number(biz.rating).toFixed(1) : '0'}</span>
                            <span className="text-gray-400 text-[10px]">({biz.reviewCount || 0})</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              biz.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : biz.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {biz.status}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Approve / Reject Quick buttons */}
                            {biz.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(biz.id, biz.slug)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                  title="Approve Listing"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReject(biz.id)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                                  title="Reject Listing"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {/* Toggle Feature */}
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(biz.id, biz.featured)}
                              className={`p-1.5 rounded-lg text-xs transition-colors ${
                                biz.featured
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={biz.featured ? 'Unfeature' : 'Feature on Homepage'}
                            >
                              <LuAward className="w-4 h-4" />
                            </button>

                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => setViewingBusiness(biz)}
                              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                              title="View Full Details"
                            >
                              <LuEye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => setEditingBusiness({ ...biz })}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                              title="Edit Details"
                            >
                              <LuEdit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteBusiness(biz.id, biz.slug)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                              title="Delete"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* REVIEWS MANAGEMENT SUBTAB */}
          {activeSubTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 text-base mb-2">Customer Reviews Moderation</h3>
              {reviews.length === 0 ? (
                <div className="py-12 text-center text-gray-400">No customer reviews yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reviews.map((r, idx) => {
                    const biz = businesses.find((b) => b.id === r.businessId);
                    return (
                      <div key={idx} className="py-4 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{r.userName}</span>
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded">
                              {r.rating} <LuStar className="w-3 h-3 fill-amber-400 inline" />
                            </span>
                            <span className="text-gray-400 text-xs">
                              reviewed <strong>{biz ? biz.name : r.businessId}</strong>
                            </span>
                          </div>
                          {r.comment && <p className="text-xs sm:text-sm text-gray-600 italic">"{r.comment}"</p>}
                          <span className="text-[10px] text-gray-400 block">
                            {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteReview(r.businessId, r.userUid)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <LuTrash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CATEGORIES MANAGEMENT SUBTAB */}
          {activeSubTab === 'categories' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h3 className="font-bold text-gray-800 text-base mb-1">Business Categories</h3>
                <p className="text-xs text-gray-500">Manage categories available for shop registration and search.</p>
              </div>

              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Category Name (e.g. Saloon & Beauty)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0D477A]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D477A] text-white font-bold text-xs rounded-xl hover:bg-[#09355C]"
                >
                  Add Category
                </button>
              </form>

              <div className="space-y-2">
                {categories.map((cat, idx) => {
                  const countInCat = businesses.filter((b) => b.category === cat).length;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs sm:text-sm"
                    >
                      <span className="font-semibold text-gray-800">{cat}</span>
                      <span className="text-xs text-gray-400">{countInCat} shops</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DIRECTORY ANALYTICS SUBTAB */}
          {activeSubTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                <LuBarChart3 className="w-5 h-5 text-[#0D477A]" />
                <span>Directory Analytics & Insights</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category Distribution</h4>
                  <div className="space-y-2 text-xs">
                    {categories.map((cat) => {
                      const c = businesses.filter((b) => b.category === cat).length;
                      if (c === 0) return null;
                      return (
                        <div key={cat} className="flex justify-between items-center">
                          <span>{cat}</span>
                          <strong className="text-gray-800">{c}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Top Rated Shops</h4>
                  <div className="space-y-2 text-xs">
                    {businesses
                      .filter((b) => b.status === 'approved' && b.rating > 0)
                      .sort((a, b) => b.rating - a.rating)
                      .slice(0, 5)
                      .map((b) => (
                        <div key={b.id} className="flex justify-between items-center">
                          <span className="truncate max-w-[150px] font-semibold">{b.name}</span>
                          <span className="text-amber-600 font-bold">{Number(b.rating).toFixed(1)} ★ ({b.reviewCount})</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Recently Registered</h4>
                  <div className="space-y-2 text-xs">
                    {businesses.slice(0, 5).map((b) => (
                      <div key={b.id} className="flex justify-between items-center">
                        <span className="truncate max-w-[150px]">{b.name}</span>
                        <span className="text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* VIEW MODAL */}
      {viewingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 notranslate">{viewingBusiness.name}</h3>
                <span className="text-xs text-blue-600 font-mono">/{viewingBusiness.slug}</span>
              </div>
              <button onClick={() => setViewingBusiness(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-gray-700">
              <p><strong>Category:</strong> {viewingBusiness.category}</p>
              <p><strong>Owner:</strong> {viewingBusiness.ownerName} ({viewingBusiness.phone})</p>
              <p><strong>Locality:</strong> {viewingBusiness.locality}</p>
              <p><strong>Address:</strong> {viewingBusiness.address}</p>
              <p><strong>Opening Hours:</strong> {viewingBusiness.openingHours}</p>
              <p><strong>Description:</strong> {viewingBusiness.description}</p>
              <p><strong>Products:</strong> {Array.isArray(viewingBusiness.products) ? viewingBusiness.products.join(', ') : 'N/A'}</p>
              <p><strong>Keywords:</strong> {Array.isArray(viewingBusiness.keywords) ? viewingBusiness.keywords.join(', ') : 'N/A'}</p>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewingBusiness(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              {viewingBusiness.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(viewingBusiness.id, viewingBusiness.slug);
                    setViewingBusiness(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Approve Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900">Edit Business Details</h3>
              <button onClick={() => setEditingBusiness(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1">Business Name</label>
                <input
                  type="text"
                  value={editingBusiness.name}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={editingBusiness.slug}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, slug: sanitizeSlug(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={editingBusiness.category}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Owner Name</label>
                  <input
                    type="text"
                    value={editingBusiness.ownerName}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, ownerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingBusiness.phone}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Locality</label>
                <input
                  type="text"
                  value={editingBusiness.locality}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, locality: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={editingBusiness.openingHours}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, openingHours: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editingBusiness.description}
                  onChange={(e) => setEditingBusiness({ ...editingBusiness, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                ></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0D477A] text-white font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBusinesses;
