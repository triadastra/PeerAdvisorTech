import { useState } from 'react';
import Dialog from './Dialog';

export default function ConfirmDialog({ title, description, onConfirm, onClose, label = 'Delete' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const confirm = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try { await onConfirm(); onClose(); }
    catch (error) { setError(error.message || 'Could not finish this action. Please try again.'); }
    finally { setBusy(false); }
  };
  return <Dialog titleId="confirm-action-title" onClose={onClose} busy={busy}>
    <div className="ws-confirm-dialog">
      <h2 id="confirm-action-title">{title}</h2>
      <p>{description}</p>
      {error && <p role="alert">{error}</p>}
      <div><button data-autofocus className="ws-secondary" disabled={busy} onClick={onClose}>Cancel</button><button className="ws-secondary ws-danger" disabled={busy} onClick={confirm}>{busy ? 'Working…' : label}</button></div>
    </div>
  </Dialog>;
}
