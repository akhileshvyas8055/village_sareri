import { useRef, useState } from 'react';
import { FiCamera } from 'react-icons/fi';

export const EditableImage = ({ 
  src, 
  onChange, 
  isEditMode, 
  className = '',
  placeholder = 'Image'
}) => {
  const fileInputRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          onChange(reader.result);
        } catch (error) {
          alert("Image is too large to save locally. Please configure a database.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContainerClick = () => {
    if (isEditMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!isEditMode) {
    return src ? (
      <img src={src} alt="Uploaded content" className={className} />
    ) : (
      <div className={`${className} bg-gray-200 dark:bg-gray-800 flex items-center justify-center`}>
        <span className="text-gray-400 font-bold uppercase tracking-widest">{placeholder}</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative cursor-pointer group ${className} outline-none outline-offset-4 ring-2 ring-saffron/50 ring-dashed transition-all duration-200 overflow-hidden`}
      onClick={handleContainerClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {src ? (
        <>
          <img src={src} alt="Editable" className="w-full h-full object-cover transition-transform duration-300" />
          {isHovered && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
              <FiCamera className="w-8 h-8 mb-2" />
              <span className="font-medium">Change Image</span>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex flex-col items-center justify-center text-saffron backdrop-blur-sm">
          <FiCamera className="w-10 h-10 mb-2" />
          <span className="font-bold tracking-widest uppercase">Upload Photo</span>
        </div>
      )}
    </div>
  );
};
