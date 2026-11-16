import type { Expert, ExpertInput } from '@workspace/api-client-react';
import { ArrowRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const empty: ExpertInput = { name: '', specialty: '', bio: '', avatarUrl: null, tone: '' };

export function ExpertForm({ expert, busy, onClose, onSave }: {
  expert?: Expert | null;
  busy: boolean;
  onClose: () => void;
  onSave: (data: ExpertInput) => void;
}) {
  const [form, setForm] = useState<ExpertInput>(empty);
  const [error, setError] = useState('');
  useEffect(() => {
    setForm(expert ? { name: expert.name, specialty: expert.specialty, bio: expert.bio, avatarUrl: expert.avatarUrl, tone: expert.tone } : empty);
  }, [expert]);
  const set = (key: keyof ExpertInput, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.specialty.trim() || !form.tone.trim()) { setError('Add a name, specialty and the perspective you value.'); return; }
    if (form.avatarUrl && !/^https?:\/\//i.test(form.avatarUrl)) { setError('Use a complete image URL, or leave this field blank.'); return; }
    setError('');
    onSave({ ...form, name: form.name.trim(), specialty: form.specialty.trim(), bio: form.bio.trim(), tone: form.tone.trim(), avatarUrl: form.avatarUrl?.trim() || null });
  };
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="expert-dialog" role="dialog" aria-modal="true" aria-labelledby="expert-form-title">
      <div className="dialog-top"><div><div className="page-eyebrow">{expert ? 'REFINE YOUR PANEL' : 'ADD A TRUSTED VOICE'}</div><h2 id="expert-form-title">{expert ? 'Edit expert' : 'New expert'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close" data-testid="button-close-expert-form"><X size={18} /></button></div>
      <p className="dialog-intro">Create a profile for someone whose perspective you trust. You’ll record their answers yourself.</p>
      <form onSubmit={submit} className="expert-form">
        <label>Name<input autoFocus maxLength={80} value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="e.g. Morgan Lee" data-testid="input-expert-name" /></label>
        <label>Specialty<input maxLength={100} value={form.specialty} onChange={(event) => set('specialty', event.target.value)} placeholder="e.g. Career transitions" data-testid="input-expert-specialty" /></label>
        <label>About their perspective<textarea maxLength={1200} rows={3} value={form.bio} onChange={(event) => set('bio', event.target.value)} placeholder="What experience or perspective do you trust them for?" data-testid="input-expert-bio" /></label>
        <label>Their tone<input maxLength={60} value={form.tone} onChange={(event) => set('tone', event.target.value)} placeholder="e.g. Direct, kind, practical" data-testid="input-expert-tone" /></label>
        <label>Image URL <span className="optional-label">optional</span><input value={form.avatarUrl ?? ''} onChange={(event) => set('avatarUrl', event.target.value)} placeholder="https://…" data-testid="input-expert-avatar" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="button" className="button-quiet" onClick={onClose} data-testid="button-cancel-expert">Cancel</button><button type="submit" className="button-primary" disabled={busy} data-testid="button-save-expert">{busy ? 'Saving…' : expert ? 'Save changes' : 'Add to panel'} <ArrowRight size={15} /></button></div>
      </form>
    </section>
  </div>;
}

export function ExpertMark({ name, avatarUrl, size = 'normal' }: { name: string; avatarUrl?: string | null; size?: 'normal' | 'large' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
  return avatarUrl && !imageFailed ? <img className={`expert-mark-image ${size === 'large' ? 'large' : ''}`} src={avatarUrl} alt="" onError={() => setImageFailed(true)} /> : <span className={`expert-mark mark-${Math.max(0, name.length % 4)} ${size === 'large' ? 'large' : ''}`} aria-hidden="true">{initials}</span>;
}
