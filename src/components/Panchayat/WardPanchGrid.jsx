import React from 'react';

const WardPanchGrid = ({ wardPanches }) => {
  // Convert object to array, filter active, and sort by ward number
  const panchesList = wardPanches 
    ? Object.values(wardPanches)
        .filter(panch => panch.status === 'active')
        .sort((a, b) => parseInt(a.ward || '0') - parseInt(b.ward || '0'))
    : [];

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-heading font-bold text-center text-[#1A5C2A] mb-10">
        वार्ड पंच / Ward Panches
      </h2>
      
      {panchesList.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">Jankari uplabdh nahi / No ward panches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {panchesList.map((panch, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden flex flex-col p-5 relative pt-10">
              <div className="absolute top-0 right-0 bg-[#FF6B00] text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg shadow-sm">
                Ward {panch.ward || '?'}
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{panch.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-500 mb-4">{panch.gender === 'Female' ? 'महिला / Female' : panch.gender === 'Male' ? 'पुरुष / Male' : (panch.gender || 'Unknown')}</p>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400">📍</span>
                    <span className="text-gray-700">{panch.address || 'Address N/A'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400">📞</span>
                    <span className="text-gray-700">{panch.mobile || 'Mobile N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WardPanchGrid;
