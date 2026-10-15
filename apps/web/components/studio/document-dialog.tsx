import { useEffect, useRef, useState, type FormEvent } from 'react';

interface DocumentDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  inputLabel?: string;
  initialValue?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: (value: string) => string | null;
}

export function DocumentDialog({ title, description, confirmLabel, inputLabel = 'Nome do documento', initialValue, destructive = false, onCancel, onConfirm }: DocumentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [value, setValue] = useState(initialValue ?? '');
  const [error, setError] = useState<string | null>(null);
  const hasInput = initialValue !== undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onConfirm(value);
    if (result) setError(result);
  }

  return <dialog ref={dialogRef} className="document-dialog" aria-labelledby="document-dialog-title" onCancel={event => { event.preventDefault(); onCancel(); }} onClick={event => { if (event.target === event.currentTarget) onCancel(); }}>
    <form onSubmit={submit}>
      <h2 id="document-dialog-title">{title}</h2>
      <p>{description}</p>
      {hasInput && <label>{inputLabel}<input autoFocus value={value} onChange={event => { setValue(event.target.value); setError(null); }} spellCheck={false} aria-invalid={!!error} aria-describedby={error ? 'document-dialog-error' : undefined} /></label>}
      {error && <span id="document-dialog-error" className="dialog-error" role="alert">{error}</span>}
      <div className="dialog-actions">
        <button type="button" className="button secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className={`button ${destructive ? 'danger' : 'primary'}`}>{confirmLabel}</button>
      </div>
    </form>
  </dialog>;
}
