import React from 'react';
import { FiTrash2, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

/**
 * Custom Theme Confirmation Modal
 * Replaces browser native window.confirm() with a sleek portal-themed dialog
 */
export const ConfirmModal = ({
  isOpen,
  title = 'पुष्टि करें (Confirm)',
  message,
  confirmText = 'हाँ, हटाएं (Delete)',
  cancelText = 'रद्द करें (Cancel)',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  onConfirm,
  onClose,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform animate-in zoom-in-95 duration-200 text-center p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top colored accent line */}
        <div 
          className={`absolute top-0 left-0 w-full h-1.5 ${
            isDanger 
              ? 'bg-gradient-to-r from-red-500 via-rose-500 to-amber-500' 
              : isSuccess
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-amber-500 to-orange-500'
          }`} 
        />

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Big Icon Circle */}
        <div 
          className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 shadow-sm ${
            isDanger
              ? 'bg-red-50 text-red-600 border border-red-200'
              : isSuccess
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}
        >
          {isDanger && <FiTrash2 className="w-8 h-8" />}
          {isSuccess && <FiCheckCircle className="w-8 h-8" />}
          {isWarning && <FiAlertTriangle className="w-8 h-8" />}
          {!isDanger && !isSuccess && !isWarning && <FiInfo className="w-8 h-8" />}
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-heading leading-tight">
          {title}
        </h3>

        {/* Message */}
        <p className="mt-2 text-sm text-gray-600 font-medium leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-all"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all transform active:scale-95 disabled:opacity-50 text-white ${
              isDanger
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/25'
                : isSuccess
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-orange-500/25'
            }`}
          >
            {isProcessing ? 'हटाया जा रहा है...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Portal Toast Popup Notification
 * Replaces browser window.alert() with non-blocking elegant banners
 */
export const ToastPopup = ({ toast, onClose }) => {
  if (!toast || !toast.isOpen) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[10000] max-w-md animate-in slide-in-from-bottom-5 duration-200">
      <div 
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border text-white backdrop-blur-md ${
          isError 
            ? 'bg-slate-900/95 border-red-500/50' 
            : isSuccess 
            ? 'bg-slate-900/95 border-emerald-500/50' 
            : 'bg-slate-900/95 border-amber-500/50'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isError && <FiAlertTriangle className="w-5 h-5 text-red-400" />}
          {isSuccess && <FiCheckCircle className="w-5 h-5 text-emerald-400" />}
          {!isError && !isSuccess && <FiInfo className="w-5 h-5 text-amber-400" />}
        </div>

        <div className="flex-1 pr-2">
          {toast.title && <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300">{toast.title}</h5>}
          <p className="text-sm font-semibold text-slate-100 mt-0.5">{toast.message}</p>
        </div>

        <button 
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
