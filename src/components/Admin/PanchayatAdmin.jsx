import React, { useState } from 'react';
import ManageSarpanch from './ManageSarpanch';
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
          className={`px-6 py-4 font-semibold text-sm transition-colors ${activeTab === 'sarpanch' ? 'bg-white border-t-2 border-t-[#FF6B00] text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Sarpanch
        </button>
        <button 
          onClick={() => setActiveTab('ward')}
          className={`px-6 py-4 font-semibold text-sm transition-colors ${activeTab === 'ward' ? 'bg-white border-t-2 border-t-[#FF6B00] text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Ward Panches
        </button>
        <button 
          onClick={() => setActiveTab('sachiv')}
          className={`px-6 py-4 font-semibold text-sm transition-colors ${activeTab === 'sachiv' ? 'bg-white border-t-2 border-t-[#FF6B00] text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Sachiv
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          className={`px-6 py-4 font-semibold text-sm transition-colors ${activeTab === 'info' ? 'bg-white border-t-2 border-t-[#FF6B00] text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Panchayat Details
        </button>
        <button 
          onClick={() => setActiveTab('notices')}
          className={`px-6 py-4 font-semibold text-sm transition-colors ${activeTab === 'notices' ? 'bg-white border-t-2 border-t-[#FF6B00] text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Notice Board
        </button>
      </div>

      <div className="p-6 bg-gray-50 min-h-[500px]">
        {activeTab === 'sarpanch' && <ManageSarpanch />}
        {activeTab === 'ward' && <ManageWardPanch />}
        {activeTab === 'sachiv' && <ManageSachiv />}
        {activeTab === 'info' && <ManagePanchayatInfo />}
        {activeTab === 'notices' && <ManageNotices />}
      </div>
    </div>
  );
};

export default PanchayatAdmin;
