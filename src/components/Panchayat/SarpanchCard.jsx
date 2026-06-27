import React from 'react';

const SarpanchCard = ({ sarpanch }) => {
  if (!sarpanch || Object.keys(sarpanch).length === 0) {
    return (
      <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-md border border-[#FF6B00]/20 text-center">
        <p className="text-gray-500">Jankari uplabdh nahi / Information not available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F0] rounded-2xl shadow-lg border border-[#FF6B00]/30 overflow-hidden">
      <div className="bg-[#FF6B00] px-6 py-4">
        <h2 className="text-2xl font-heading font-bold text-white text-center">
          ग्राम पंचायत सरपंच / Gram Panchayat Sarpanch
        </h2>
      </div>
      <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">

        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div>
            <h3 className="text-3xl font-bold text-[#1A5C2A]">{sarpanch.name || 'Jankari uplabdh nahi'}</h3>
            <p className="text-gray-600 font-medium mt-1">
              {sarpanch.gender ? (sarpanch.gender === 'Female' ? 'महिला / Female' : sarpanch.gender === 'Male' ? 'पुरुष / Male' : sarpanch.gender) : 'Gender not specified'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">कार्यकाल प्रारंभ / Term Start</p>
              <p className="font-semibold text-gray-900">{sarpanch.termStart || 'N/A'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">वार्ड / Ward</p>
              <p className="font-semibold text-gray-900">{sarpanch.ward === '0' ? 'Gram Panchayat Head' : `Ward ${sarpanch.ward || 'N/A'}`}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">शिक्षा / Education</p>
              <p className="font-semibold text-gray-900">{sarpanch.education || 'N/A'}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">पता / Address</p>
              <p className="font-semibold text-gray-900">{sarpanch.address || 'N/A'}</p>
            </div>
          </div>
          
          <div className="pt-4 flex justify-center md:justify-start">
            <a 
              href={`tel:${sarpanch.mobile || ''}`}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-md transition-transform transform hover:scale-105 ${sarpanch.mobile ? 'bg-[#1A5C2A] text-white hover:bg-green-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              onClick={(e) => !sarpanch.mobile && e.preventDefault()}
            >
              📞 संपर्क करें / Contact Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SarpanchCard;
