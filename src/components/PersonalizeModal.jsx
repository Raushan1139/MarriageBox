import { useState, useEffect, useRef } from 'react';

export default function PersonalizeModal({ bride: initBride, groom: initGroom, onSave, onClose }) {
  const [bride, setBride] = useState(initBride || '');
  const [groom, setGroom] = useState(initGroom || '');
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus first input on open
    inputRef.current?.focus();

    // Close on Escape
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(bride.trim(), groom.trim());
    onClose();
  };

  const handleClear = () => {
    onSave('', '');
    onClose();
  };

  const shareURL = () => {
    const url = new URL(window.location.href);
    if (bride.trim()) url.searchParams.set('bride', bride.trim());
    if (groom.trim()) url.searchParams.set('groom', groom.trim());
    navigator.clipboard.writeText(url.toString()).then(() => {
      // small visual feedback via alert (can be replaced with toast)
      window.alert('Personalized link copied to clipboard! 🎊');
    });
  };

  return (
    <div
      className="modal-backdrop"
      id="personalizeModal"
      ref={modalRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div className="modal-box">
        <button className="modal-close" aria-label="Close" onClick={onClose}>&times;</button>

        <div className="modal-icon">💍</div>
        <h2 className="modal-title" id="modalTitle">Personalize Shaadi</h2>
        <p className="modal-subtitle">Add names to get a shareable wedding link!</p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="brideInput">Bride's Name</label>
            <input
              id="brideInput"
              ref={inputRef}
              type="text"
              placeholder="e.g. Priya"
              value={bride}
              maxLength={40}
              onChange={(e) => setBride(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="modal-field">
            <label htmlFor="groomInput">Groom's Name</label>
            <input
              id="groomInput"
              type="text"
              placeholder="e.g. Rahul"
              value={groom}
              maxLength={40}
              onChange={(e) => setGroom(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="modal-btn-primary" id="modalSave">
              💍 Set Names
            </button>
            <button type="button" className="modal-btn-secondary" id="modalShare" onClick={shareURL}>
              🔗 Copy Link
            </button>
          </div>

          {(initBride || initGroom) && (
            <button type="button" className="modal-btn-clear" id="modalClear" onClick={handleClear}>
              Remove names
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
