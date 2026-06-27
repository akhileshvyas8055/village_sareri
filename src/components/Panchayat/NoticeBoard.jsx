import React from 'react';
import { FiDownload, FiCalendar } from 'react-icons/fi';

const NoticeBoard = ({ notices }) => {
  // Convert to array and sort by createdAt desc
  const noticesList = notices 
    ? Object.values(notices)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5) // Latest 5
    : [];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 h-full">
      <h2 className="text-2xl font-heading font-bold text-[#FF6B00] mb-6 border-b-2 border-[#FF6B00]/20 pb-4 inline-block">
        सूचना पट्ट / Notice Board
      </h2>
      
      {noticesList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Koi nayi suchna nahi hai / No new notices
        </div>
      ) : (
        <div className="space-y-4">
          {noticesList.map((notice, idx) => (
            <div key={idx} className="group border-l-4 border-[#1A5C2A] bg-gray-50 hover:bg-green-50 p-4 rounded-r-lg transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#1A5C2A] transition-colors line-clamp-2">
                    {notice.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 font-medium">
                    <FiCalendar />
                    <span>{notice.date || new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                  {notice.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{notice.description}</p>
                  )}
                </div>
                {notice.pdfLink && (
                  <a 
                    href={notice.pdfLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-white text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white rounded-lg shadow-sm transition-colors border border-orange-100 shrink-0"
                    title="Download PDF"
                  >
                    <FiDownload />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
