import { useEffect, useRef } from "react";

export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, busy = false }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onCancel, open]);

  if (!open) return null;
  return (
    <div className="confirm-dialog-backdrop" role="presentation" onMouseDown={() => !busy && onCancel()}>
      <section className="confirm-dialog card glass" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message" onMouseDown={(event) => event.stopPropagation()}>
        <div className="confirm-dialog-icon" aria-hidden="true"><svg><use href="#i-trash" /></svg></div>
        <h3 id="confirm-dialog-title">{title}</h3>
        <p id="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button ref={cancelRef} type="button" className="btn" disabled={busy} onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className="btn confirm-dialog-danger" disabled={busy} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
