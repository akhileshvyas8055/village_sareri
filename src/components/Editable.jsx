import { useState, useEffect, useRef } from 'react';

export const EditableText = ({ 
  tag: Tag = 'span', 
  value, 
  onChange, 
  isEditMode, 
  className = '',
  multiline = false
}) => {
  const contentRef = useRef(null);

  // Sync value if it changes from outside
  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== value) {
      contentRef.current.textContent = value;
    }
  }, [value]);

  const handleBlur = () => {
    if (contentRef.current) {
      onChange(contentRef.current.textContent || '');
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      contentRef.current?.blur();
    }
  };

  if (!isEditMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  return (
    <Tag
      ref={contentRef}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`relative ${className} outline-none outline-offset-4 ring-2 ring-saffron/50 ring-dashed hover:bg-black/5 dark:hover:bg-white/10 rounded-sm cursor-text transition-all duration-200`}
    >
      {value}
    </Tag>
  );
};
