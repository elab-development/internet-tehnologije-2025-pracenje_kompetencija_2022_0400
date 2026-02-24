"use client";

export default function ModalKredencijali({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="p-modal-overlay" role="dialog" aria-modal="true">
      <div className="p-modal">
        <div className="p-modal-head">
          <h2 className="p-modal-title">{title}</h2>
          <button type="button" onClick={onClose} className="p-modal-x" aria-label="Zatvori">
            ×
          </button>
        </div>

        <div className="p-modal-body">{children}</div>
      </div>
    </div>
  );
}