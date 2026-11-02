import { useState, useEffect } from 'react';
import Gallery from '../sections/Gallery';
import SEO from '../components/SEO';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

const GalleryPage = () => {
  const [dynamicGalleries, setDynamicGalleries] = useState(null);
  const [adminGalleryItems, setAdminGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Real-time listener for Admin-added photos and YouTube videos
  useEffect(() => {
    const galleryRef = ref(rtdb, 'adminData/gallery');
    const unsub = onValue(galleryRef, (snapshot) => {
      if (snapshot.exists()) {
        const list = [];
        snapshot.forEach((child) => {
          const val = child.val();
          list.push({
            id: child.key,
            ...val,
            isVideo: val.type === 'video' || val.isVideo || false,
            isYouTube: val.isYouTube || !!val.youtubeId || false
          });
        });
        setAdminGalleryItems(list.reverse());
      } else {
        setAdminGalleryItems([]);
      }
    });

    return () => unsub();
  }, []);

  // 2. Fetch Google Apps Script Web App dynamic Drive folders
  useEffect(() => {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbz5e-ggVi-VDQ74vNHrKwKnWsEDD0ESvijHjIYHBM6QSUVaQx9p8BNUPyoxdDkkgRHiog/exec";
    const timestampUrl = `${scriptUrl}?t=${new Date().getTime()}`;
    
    fetch(timestampUrl, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        setDynamicGalleries(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching dynamic gallery:", error);
        setLoading(false);
      });
  }, []);

  // Map for descriptions based on folder name
  const getGalleryInfo = (folderName) => {
    const infoMap = {
      "slideshow": { title: "Village Moments", desc: "Beautiful moments from Brahmano Ki Sareri." },
      "mandir": { title: "Sacred Temples", desc: "Our beautiful historic temples and spiritual core." },
      "school": { title: "Village Schools", desc: "Glimpses of education and learning in our village." },
      "pond": { title: "Dharmik Talab", desc: "The serene water bodies and natural beauty of our village." },
      "ramlila": { title: "Ramleela Mahotsav", desc: "Over 50 years of rich cultural heritage where locals perform the epic of Ramayana." },
      "mela": { title: "Mela Purnima", desc: "Glimpses from the sacred Mela Purnima celebrations and gatherings." },
      "khel": { title: "Khel Mahotsav", desc: "Glimpses from the exciting village sports festival." },
      "jaljulni": { title: "Jaljulni Ekadashi", desc: "Sacred Jaljulni Ekadashi celebrations and processions in our village." },
      "gausala": { title: "Bajrang Gopal Goshala", desc: "Our beloved cattle and the vibrant Goshala of the village." },
      "gau sala": { title: "Bajrang Gopal Goshala", desc: "Our beloved cattle and the vibrant Goshala of the village." }
    };
    
    const lowerName = folderName.toLowerCase();
    for (const key in infoMap) {
      if (lowerName.includes(key)) return infoMap[key];
    }
    
    return { 
      title: folderName.charAt(0).toUpperCase() + folderName.slice(1), 
      desc: `Photos and videos from ${folderName}` 
    };
  };

  return (
    <div className="pt-2 sm:pt-4 bg-gray-50 dark:bg-gray-900 min-h-screen notranslate">
      <SEO
        title="Photo & Video Gallery | Brahmano Ki Sareri Memories"
        description="सरेरी गाँव के सुंदर दृश्य, ऐतिहासिक मंदिरों, उत्सवों, कृषि भूमि एवं खेल आयोजनों की विशेष फ़ोटो व वीडियो गैलरी।"
        url="https://villagesareri.in/gallery"
        breadcrumbs={[
          { name: 'Home', url: 'https://villagesareri.in/' },
          { name: 'Gallery', url: 'https://villagesareri.in/gallery' }
        ]}
      />
      <div className="text-center py-6 sm:py-10">
        <h1 className="text-5xl md:text-6xl font-bold font-heading text-gray-900 dark:text-white mb-4">
          Village <span className="text-saffron">Gallery</span>
        </h1>
        <div className="w-24 h-1 bg-saffron mx-auto rounded-full mb-6"></div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
          Explore the vibrant events, festivals, and beautiful moments captured in Brahmano Ki Sareri.
        </p>
      </div>

      {/* Admin Added Official Gallery Items (Live Sync with Realtime Database) */}
      {adminGalleryItems.length > 0 && (
        <Gallery
          title="आधिकारिक ग्राम गैलरी (Official Gallery)"
          folder="official"
          description="ग्राम व्यवस्थापक द्वारा साझा की गई नवीनतम तस्वीरें एवं आधिकारिक YouTube वीडियो।"
          externalLinks={adminGalleryItems}
        />
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-saffron"></div>
        </div>
      ) : dynamicGalleries ? (
        Object.entries(dynamicGalleries).map(([folderName, files], index) => {
          const info = getGalleryInfo(folderName);
          
          // Pre-process files to check if they are videos based on file extension in title & exclude corrupted/hidden ramlila_media_3
          const processedFiles = files
            .filter(file => !file.title?.toLowerCase().includes('ramlila_media_3') && !file.src?.toLowerCase().includes('ramlila_media_3'))
            .map(file => ({
              ...file,
              isVideo: !!(file.title && file.title.toLowerCase().match(/\.(mp4|mov|webm|mkv|avi)$/i))
            }));

          return (
            <Gallery 
              key={index} 
              title={info.title} 
              folder={folderName.toLowerCase().replace(/\s+/g, '')}
              description={info.desc} 
              externalLinks={processedFiles} 
            />
          );
        })
      ) : (
        <div className="text-center py-10 text-gray-500">Failed to load gallery. Please check your internet connection or try again later.</div>
      )}
      
      {/* Fallback for static Goshala folder if it doesn't exist in Drive yet but local images exist */}
      {!loading && !dynamicGalleries?.["Gausala"] && !dynamicGalleries?.["gausala"] && !dynamicGalleries?.["Gau Sala"] && (
        <Gallery title="Bajrang Gopal Goshala" folder="gausala" description="Our beloved cattle and the vibrant Goshala of the village." />
      )}
    </div>
  );
};

export default GalleryPage;
