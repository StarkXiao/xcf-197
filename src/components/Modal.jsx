import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, showCloseButton = true }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content relative"
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors text-2xl leading-none"
          >
            ×
          </button>
        )}

        {title && (
          <h2 className="text-2xl font-bold text-star-gold mb-6 text-center glow-text">
            {title}
          </h2>
        )}

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
