/**
 * Configuration and metadata constants for Gram Sabha.
 * Demo/mock data has been removed. All records are live from Firebase Realtime Database.
 */

export const DEFAULT_MEETINGS = [];
export const DEFAULT_RESOLUTIONS = [];

export const MEETING_TYPES = [
  { id: 'साधारण', label: 'साधारण ग्राम सभा (Regular)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'विशेष', label: 'विशेष ग्राम सभा (Special)', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'आपातकालीन', label: 'आपातकालीन ग्राम सभा (Emergency)', badge: 'bg-rose-100 text-rose-800 border-rose-300' }
];

export const RESOLUTION_STATUSES = [
  { id: 'प्रस्तावित', label: 'प्रस्तावित (Proposed)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'पारित', label: 'पारित (Passed)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'प्रगति में', label: 'प्रगति में (In Progress)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'पूर्ण', label: 'पूर्ण (Completed)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'स्थगित', label: 'स्थगित (Deferred)', color: 'bg-gray-100 text-gray-800 border-gray-200' }
];
