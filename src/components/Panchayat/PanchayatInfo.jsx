import React from 'react';

const PanchayatInfo = ({ info, sachiv }) => {
  return (
    <div className="space-y-6">
      {/* Panchayat Details Box */}
      <div className="bg-[#1A5C2A] text-white rounded-2xl shadow-md p-6 md:p-8">
        <h2 className="text-2xl font-heading font-bold text-[#FF6B00] mb-6">
          पंचायत विवरण / Panchayat Details
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <p className="text-sm text-green-200 uppercase font-semibold">पंचायत / Panchayat</p>
            <p className="font-bold text-lg">{info?.panchayatName || 'Jankari uplabdh nahi'}</p>
          </div>
          <div>
            <p className="text-sm text-green-200 uppercase font-semibold">ब्लॉक / Block</p>
            <p className="font-bold text-lg">{info?.block || 'Jankari uplabdh nahi'}</p>
          </div>
          <div>
            <p className="text-sm text-green-200 uppercase font-semibold">जिला / District</p>
            <p className="font-bold text-lg">{info?.district || 'Jankari uplabdh nahi'}</p>
          </div>
          <div>
            <p className="text-sm text-green-200 uppercase font-semibold">राज्य / State</p>
            <p className="font-bold text-lg">{info?.state || 'Rajasthan'}</p>
          </div>
          
          <div className="col-span-1 sm:col-span-2 border-t border-green-700/50 pt-4 mt-2 grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#FF6B00]">{info?.totalWards || '-'}</p>
              <p className="text-[10px] sm:text-xs text-green-100 uppercase font-medium mt-1 leading-tight">कुल वार्ड</p>
            </div>
            <div className="border-l border-r border-green-700/50">
              <p className="text-xl sm:text-2xl font-bold text-[#FF6B00]">{info?.population || '-'}</p>
              <p className="text-[10px] sm:text-xs text-green-100 uppercase font-medium mt-1 leading-tight">जनसंख्या</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#FF6B00]">{info?.bplFamilies || '-'}</p>
              <p className="text-[10px] sm:text-xs text-green-100 uppercase font-medium mt-1 leading-tight">BPL परिवार</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sachiv Info Box */}
      <div className="bg-white rounded-2xl shadow-md border border-[#1A5C2A]/20 p-6">
        <h2 className="text-xl font-heading font-bold text-[#1A5C2A] mb-4 flex items-center gap-2">
          <span className="bg-green-100 p-2 rounded-lg">👨‍💼</span> 
          ग्राम विकास अधिकारी (सचिव) / VDO (Sachiv)
        </h2>
        
        {sachiv ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-lg text-gray-900">{sachiv.name || 'Jankari uplabdh nahi'}</p>
                <p className="text-sm text-gray-500 mt-1">Office: {sachiv.officeTimings || 'N/A'}</p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-8 h-8 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center">📞</span>
                <span className="font-medium text-gray-700">{sachiv.mobile || 'N/A'}</span>
              </div>
              {sachiv.email && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center">✉️</span>
                  <span className="font-medium text-gray-700">{sachiv.email}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Jankari uplabdh nahi / Info not available</p>
        )}
      </div>
    </div>
  );
};

export default PanchayatInfo;
