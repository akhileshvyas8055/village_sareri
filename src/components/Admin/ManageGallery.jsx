import React, { useState, useEffect } from 'react';
import { 
  FiImage, FiVideo, FiTrash2, FiPlus, FiCheck, FiExternalLink, 
  FiSearch, FiFilter, FiUpload, FiX, FiPlay 
} from 'react-icons/fi';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { rtdb } from '../../firebase';

export const GALLERY_CATEGORIES = [
  { id: 'mandir', label: 'Sacred Temples / मंदिर', icon: '🛕' },
  { id: 'ramlila', label: 'Ramleela Mahotsav / रामलीला', icon: '🎭' },
  { id: 'jaljulni', label: 'Jaljulni Ekadashi / जलझूलनी एकादशी', icon: '🚩' },
  { id: 'mela', label: 'Mela Purnima / मेला पूर्णिमा', icon: '🎡' },
  { id: 'khel', label: 'Khel Mahotsav / खेल महोत्सव', icon: '🏆' },
  { id: 'school', label: 'Village Schools / विद्यालय', icon: '🏫' },
  { id: 'pond', label: 'Dharmik Talab / धार्मिक तालाब', icon: '🌊' },
  { id: 'gausala', label: 'Bajrang Gopal Goshala / गोशाला', icon: '🐄' },
  { id: 'slideshow', label: 'Village Moments / गाँव के दृश्य', icon: '📸' },
  { id: 'custom', label: 'नया एल्बम / अन्य (Custom Album)', icon: '📁' }
];

// Helper to extract YouTube video ID from various URL formats
export const extractYouTubeId = (url) => {
  if (!url) return null;
  const clean = url.trim();
  // If it's directly an 11-char ID
  if (/^[\w-]{11}$/.test(clean)) return clean;
  // Patterns for youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = clean.match(regExp);
  return match && match[1] ? match[1] : null;
};

// Canvas image compression for fast RTDB storage (<120KB)
const compressGalleryImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const ManageGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Mode: 'photo' | 'video'
  const [mediaType, setMediaType] = useState('photo');
  
  // Form State
  const [category, setCategory] = useState('mandir');
  const [customCategory, setCustomCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Photo State
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  // Video State (YouTube Only)
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [detectedYouTubeId, setDetectedYouTubeId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Real-time sync with RTDB adminData/gallery
  useEffect(() => {
    const galleryRef = ref(rtdb, 'adminData/gallery');
    const unsubscribe = onValue(galleryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.entries(data).map(([id, val]) => ({
          id,
          ...val
        })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setGalleryItems(items);
      } else {
        setGalleryItems([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching gallery:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle YouTube URL change & real-time ID extraction
  const handleYouTubeUrlChange = (val) => {
    setYoutubeUrl(val);
    const id = extractYouTubeId(val);
    setDetectedYouTubeId(id);
  };

  // Handle Photo File Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज फ़ाइल (JPG, PNG, WebP) अपलोड करें!');
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await compressGalleryImage(file);
      setImagePreview(compressed);
      setImageUrlInput('');
    } catch (err) {
      console.error('Compression error:', err);
      alert('फोटो प्रोसेस करने में समस्या आई।');
    } finally {
      setIsCompressing(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImagePreview('');
    setImageUrlInput('');
    setYoutubeUrl('');
    setDetectedYouTubeId(null);
    setCustomCategory('');
  };

  // Handle Add Item to Gallery
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('कृपया शीर्षक (Title) दर्ज करें!');
      return;
    }

    const finalCategory = category === 'custom' 
      ? (customCategory.trim().toLowerCase().replace(/\s+/g, '_') || 'village_moments')
      : category;

    if (mediaType === 'photo') {
      const finalImage = imagePreview || imageUrlInput.trim();
      if (!finalImage) {
        alert('कृपया फोटो अपलोड करें या इमेज URL दर्ज करें!');
        return;
      }

      setIsSubmitting(true);
      try {
        const newRef = push(ref(rtdb, 'adminData/gallery'));
        const newItem = {
          id: newRef.key,
          type: 'photo',
          isVideo: false,
          category: finalCategory,
          title: title.trim(),
          desc: description.trim(),
          src: finalImage,
          createdAt: Date.now()
        };
        await set(newRef, newItem);
        alert('✅ फोटो सफलतापूर्वक गैलरी में जोड़ दी गई!');
        resetForm();
      } catch (err) {
        console.error('Error adding photo:', err);
        alert('फोटो जोड़ने में त्रुटि आई।');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // YouTube Video
      const ytId = detectedYouTubeId || extractYouTubeId(youtubeUrl);
      if (!ytId) {
        alert('कृपया वैध YouTube वीडियो लिंक (URL) दर्ज करें!\nउदा. https://www.youtube.com/watch?v=... या https://youtu.be/...');
        return;
      }

      setIsSubmitting(true);
      try {
        const newRef = push(ref(rtdb, 'adminData/gallery'));
        const embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
        const thumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

        const newItem = {
          id: newRef.key,
          type: 'video',
          isVideo: true,
          isYouTube: true,
          youtubeId: ytId,
          src: embedUrl,
          thumbnail: thumbnailUrl,
          category: finalCategory,
          title: title.trim(),
          desc: description.trim(),
          createdAt: Date.now()
        };
        await set(newRef, newItem);
        alert('✅ YouTube वीडियो सफलतापूर्वक गैलरी में जोड़ दी गई!');
        resetForm();
      } catch (err) {
        console.error('Error adding video:', err);
        alert('वीडियो जोड़ने में त्रुटि आई।');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Delete Gallery Item
  const handleDeleteItem = async (id, itemTitle) => {
    if (window.confirm(`क्या आप "${itemTitle}" को गैलरी से हटाना चाहते हैं?`)) {
      try {
        await remove(ref(rtdb, `adminData/gallery/${id}`));
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('हटाने में समस्या आई।');
      }
    }
  };

  // Filtered List
  const filteredItems = galleryItems.filter(item => {
    const matchCat = filterCategory === 'ALL' || item.category === filterCategory;
    const matchType = filterType === 'ALL' || 
      (filterType === 'PHOTO' && !item.isVideo) || 
      (filterType === 'VIDEO' && item.isVideo);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      item.title?.toLowerCase().includes(q) || 
      item.desc?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q);
    return matchCat && matchType && matchSearch;
  });

  return (
    <div className="space-y-8 notranslate" translate="no">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📸 गाँव गैलरी प्रबंधन (Village Gallery)</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            गाँव की फ़ोटो अपलोड करें अथवा केवल YouTube लिंक से वीडियो जोड़ें।
          </p>
        </div>

        <a
          href="/gallery"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition-all self-start sm:self-auto"
        >
          <FiExternalLink className="w-3.5 h-3.5" />
          <span>लाइव गैलरी देखें</span>
        </a>
      </div>

      {/* ADD MEDIA FORM */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        
        {/* Toggle between Photo & YouTube Video */}
        <div className="flex items-center gap-3 mb-6 p-1 bg-gray-100 rounded-xl max-w-md">
          <button
            type="button"
            onClick={() => setMediaType('photo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              mediaType === 'photo' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiImage className="w-4 h-4" />
            <span>📷 नई फ़ोटो जोड़ें (Upload Photo)</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaType('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              mediaType === 'video' 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiVideo className="w-4 h-4" />
            <span>🎬 YouTube वीडियो (YouTube Link)</span>
          </button>
        </div>

        <form onSubmit={handleAddItem} className="space-y-5">
          
          {/* CATEGORY & TITLE ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                एल्बम / श्रेणी (Album Category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium bg-white"
              >
                {GALLERY_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Category Input if selected */}
            {category === 'custom' ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  नए एल्बम का नाम (Custom Album Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. स्वतंत्रता दिवस 2026"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  शीर्षक (Title / Caption) *
                </label>
                <input
                  type="text"
                  required
                  placeholder={mediaType === 'photo' ? 'उदा. श्री चारभुजा नाथ मंदिर प्रांगण' : 'उदा. रामलीला 2026 - धनुष यज्ञ दृश्य'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium"
                />
              </div>
            )}
          </div>

          {category === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                शीर्षक (Title / Caption) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. कार्यक्रम का मुख्य दृश्य"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm font-medium"
              />
            </div>
          )}

          {/* PHOTO INPUT SECTION */}
          {mediaType === 'photo' && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  फोटो चुनें (Upload Photo from Device)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-dashed border-orange-300 cursor-pointer font-bold text-xs sm:text-sm transition-all shadow-sm">
                    <FiUpload className="w-4 h-4" />
                    <span>{isCompressing ? 'कंप्रेस हो रही है...' : 'डिवाइस या कैमरा से फ़ोटो चुनें'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-gray-400">अथवा</span>
                  <input
                    type="url"
                    placeholder="डायरेक्ट इमेज URL (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      if (e.target.value) setImagePreview('');
                    }}
                    className="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* Photo Preview */}
              {(imagePreview || imageUrlInput) && (
                <div className="relative inline-block mt-2">
                  <img
                    src={imagePreview || imageUrlInput}
                    alt="Preview"
                    className="w-48 h-32 object-cover rounded-xl border border-gray-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(''); setImageUrlInput(''); }}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
                    title="फोटो हटाएं"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIDEO INPUT SECTION (YouTube ONLY) */}
          {mediaType === 'video' && (
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="text-red-600">▶️</span>
                  <span>YouTube वीडियो लिंक (YouTube Video URL / Shorts / ID) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. https://www.youtube.com/watch?v=... या https://youtu.be/..."
                  value={youtubeUrl}
                  onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-xs sm:text-sm font-medium"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  💡 वीडियो के लिए केवल YouTube लिंक ही स्वीकार्य है। इससे वेबसाइट की स्पीड सुपरफ़ास्ट रहती है और वीडियो कभी बफ़र नहीं होती।
                </p>
              </div>

              {/* Real-time YouTube Thumbnail & Embed Preview */}
              {detectedYouTubeId && (
                <div className="p-4 bg-red-50/50 rounded-2xl border border-red-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-44 h-28 rounded-xl overflow-hidden shadow-sm shrink-0 bg-black">
                    <img
                      src={`https://img.youtube.com/vi/${detectedYouTubeId}/hqdefault.jpg`}
                      alt="YouTube Thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                        <FiPlay className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <FiCheck className="w-3 h-3" /> YouTube ID पहचानी गई: {detectedYouTubeId}
                    </span>
                    <h4 className="text-sm font-bold text-gray-800">वीडियो तैयार है!</h4>
                    <p className="text-xs text-gray-500">
                      यह वीडियो गैलरी में सुंदर थंबनेल और डायरेक्ट एचडी प्लेयर के साथ दिखाई देगी।
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              विवरण (Optional Description)
            </label>
            <textarea
              rows={2}
              placeholder="इस फ़ोटो या वीडियो के बारे में संक्षिप्त जानकारी..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs sm:text-sm font-medium"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className={`px-8 py-3 rounded-xl text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 ${
                mediaType === 'video'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                  : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
              } disabled:opacity-50`}
            >
              <FiPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'जोड़ा जा रहा है...' : mediaType === 'video' ? 'YouTube वीडियो जोड़ें 🎬' : 'फ़ोटो जोड़ें 📸'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* FILTER & GALLERY LIST SECTION */}
      <div className="space-y-4">
        
        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Media Type & Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              सभी ({galleryItems.length})
            </button>
            <button
              onClick={() => setFilterType('PHOTO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'PHOTO' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📷 केवल फ़ोटो
            </button>
            <button
              onClick={() => setFilterType('VIDEO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'VIDEO' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎬 केवल YouTube वीडियो
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="गैलरी में खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              filterCategory === 'ALL' 
                ? 'bg-amber-600 text-white' 
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            सभी एल्बम
          </button>
          {GALLERY_CATEGORIES.filter(c => c.id !== 'custom').map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterCategory === cat.id 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat.icon} {cat.label.split(' / ')[1] || cat.label}
            </button>
          ))}
        </div>

        {/* ITEMS GRID */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">गैलरी लोड हो रही है...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-gray-500">
            {galleryItems.length === 0
              ? 'गैलरी में अभी तक एडमिन द्वारा कोई फ़ोटो या YouTube वीडियो नहीं जोड़ी गई है।'
              : 'इस फ़िल्टर या खोज शब्द के लिए कोई मीडिया नहीं मिली।'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                {/* Media Thumbnail */}
                <div className="relative h-44 bg-gray-900 overflow-hidden">
                  {item.isVideo ? (
                    item.isYouTube || item.youtubeId ? (
                      <div className="relative w-full h-full">
                        <img
                          src={item.thumbnail || `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                            <FiPlay className="w-5 h-5 ml-0.5 fill-current" />
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">
                          YouTube Video
                        </div>
                      </div>
                    ) : (
                      <video
                        src={item.src}
                        className="w-full h-full object-cover"
                        muted
                      />
                    )
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Category Pill */}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                    {GALLERY_CATEGORIES.find(c => c.id === item.category)?.label.split(' / ')[0] || item.category}
                  </span>
                </div>

                {/* Info & Actions */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                    {item.desc && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.desc}</p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('hi-IN') : 'सरेरी गैलरी'}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors text-xs font-semibold flex items-center gap-1"
                      title="गैलरी से हटाएं"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      <span>हटाएं</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ManageGallery;
