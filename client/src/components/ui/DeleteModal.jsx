import { AlertTriangle, X } from "lucide-react";


const DeleteModal = ({
  isOpen,
  title = "Confirm deletion",
  itemName,
  warning = "This action cannot be undone.",
  onConfirm,
  onCancel,
  confirmText = "Yes, delete",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={18}
              className="text-orange-500 flex-shrink-0"
            />
            <p className="text-sm font-black uppercase tracking-widest text-gray-900">
              {title}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 mb-1 leading-relaxed">
            You are about to permanently delete
          </p>
          <p className="text-sm font-black text-gray-900 mb-4">"{itemName}"</p>

          {/* Warning note */}
          <div className="bg-orange-50 border-l-[3px] border-orange-400 rounded-r-xl px-4 py-3 mb-6">
            <p className="text-xs font-bold text-orange-800 leading-relaxed">
              {warning}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 bg-transparent border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
