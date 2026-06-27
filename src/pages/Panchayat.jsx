import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import SarpanchCard from '../components/Panchayat/SarpanchCard';
import WardPanchGrid from '../components/Panchayat/WardPanchGrid';
import NoticeBoard from '../components/Panchayat/NoticeBoard';
import PanchayatInfo from '../components/Panchayat/PanchayatInfo';

const PanchayatPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const panchayatRef = ref(rtdb, 'panchayat');
    const unsubscribe = onValue(panchayatRef, (snapshot) => {
      const val = snapshot.val();
      setData(val || {});
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-[#FFF8F0]">
        <div className="w-16 h-16 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#1A5C2A] font-bold text-lg animate-pulse">Loading Panchayat Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-[#FF6B00] mb-3 md:mb-4 px-2">
            ग्राम पंचायत कार्यालय
          </h1>
          <p className="text-xl text-[#1A5C2A] font-semibold">
            Gram Panchayat Office - Brahmano Ki Sareri
          </p>
          <div className="w-24 h-1 bg-[#1A5C2A] mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column (Sarpanch) */}
          <div className="lg:col-span-2">
            <SarpanchCard sarpanch={data?.sarpanch} />
          </div>

          {/* Right Column (Info & Sachiv) */}
          <div className="lg:col-span-1">
            <PanchayatInfo info={data?.info} sachiv={data?.sachiv} />
          </div>
        </div>

        {/* Notices Section */}
        <div className="mb-16 max-w-4xl mx-auto">
          <NoticeBoard notices={data?.notices} />
        </div>

        {/* Ward Panches Grid */}
        <WardPanchGrid wardPanches={data?.wardPanches} />

        {/* Footer timestamp */}
        <div className="mt-16 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
          <p>Last Updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="font-bold text-[#FF6B00]">Jai Hind 🇮🇳</p>
        </div>
      </div>
    </div>
  );
};

export default PanchayatPage;
