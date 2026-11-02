import React, { useState } from 'react';
import ManageSarpanch from './ManageSarpanch';
import ManageUpSarpanch from './ManageUpSarpanch';
import ManageWardPanch from './ManageWardPanch';
import ManageSachiv from './ManageSachiv';
import ManagePanchayatInfo from './ManagePanchayatInfo';
import ManageNotices from './ManageNotices';

const PanchayatAdmin = () => {
  const [activeTab, setActiveTab] = useState('sarpanch');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 flex flex-wrap">
        <button 
          onClick={() => setActiveTab('sarpanch')}
          className={`px-5 py-3.5 font-semibold text-xs sm:text-sm transition-colors ${activeTab === 'sarpanch' ? 'bg-white border-t-2 border-t-[#135334] text-[#135334] font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          👑 सरपंच (Sarpanch)
        </button>
        <button 
          onClick={() => setActiveTab('upSarpanch')}
          className={`px-5 py-3.5 font-semibold text-xs sm:text-sm transition-colors ${activeTab === 'upSarpanch' ? 'bg-white border-t-2 border-t-[#135334] text-[#135334] font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          🎖️ उप-सरपंच (Up-Sarpanch)
        </button>
        <button 
          onClick={() => setActiveTab('ward')}
          className={`px-5 py-3.5 font-semibold text-xs sm:text-sm transition-colors ${activeTab === 'ward' ? 'bg-white border-t-2 border-t-[#135334] text-[#135334] font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          👥 11 वार्ड पंच (Ward Panches)
        </button>
        <button 
          onClick={() => setActiveTab('sachiv')}
          className={`px-5 py-3.5 font-semibold text-xs sm:text-sm transition-colors ${activeTab === 'sachiv' ? 'bg-white border-t-2 border-t-[#135334] text-[#135334] font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          📋 सचिव / VDO (Sachiv)
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          className={`px-5 py-3.5 font-semibold text-xs sm:text-sm transition-colors ${activeTab === 'info' ? 'bg-white border-t-2 border-t-[#135334] text-[#135334] font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          📊 पंचायत विवरण व सांख्यिकी
        </button>
        <button 
          onClick={() => setActiveTab('notices')}
          className={`px-5 py-3.5 font-semibold text-xs sm:text-sm transition-colors ${activeTab === 'notices' ? 'bg-white border-t-2 border-t-[#135334] text-[#135334] font-bold' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          📜 नोटिस बोर्ड
        </button>
      </div>

      <div className="p-4 sm:p-6 bg-gray-50 min-h-[500px]">
        {activeTab === 'sarpanch' && <ManageSarpanch />}
        {activeTab === 'upSarpanch' && <ManageUpSarpanch />}
        {activeTab === 'ward' && <ManageWardPanch />}
        {activeTab === 'sachiv' && <ManageSachiv />}
        {activeTab === 'info' && <ManagePanchayatInfo />}
        {activeTab === 'notices' && <ManageNotices />}
      </div>
    </div>
  );
};

export default PanchayatAdmin;
