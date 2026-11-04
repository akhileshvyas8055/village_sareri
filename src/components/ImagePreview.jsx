import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

const ImagePreview = ({ src, alt = 'Image preview', className = '', children }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`block appearance-none border-0 bg-transparent p-0 text-left ${className}`}
        aria-label={`तस्वीर का preview खोलें: ${alt}`}
        title="तस्वीर देखने के लिए क्लिक करें"
      >
        {children}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="तस्वीर का preview"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/60 text-white shadow-xl transition hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Preview बंद करें"
            title="बंद करें"
          >
            <FiX className="h-6 w-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[88vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ImagePreview;
