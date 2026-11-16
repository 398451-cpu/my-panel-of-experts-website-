import { useQueryClient } from '@tanstack/react-query';
import {
  getGetExpertQueryKey, getGetExpertsQueryKey, getSearchPanelQueryKey, useCreateExpert, useDeleteExpert,
  useGetExperts, useUpdateExpert,
} from '@workspace/api-client-react';
import type { Expert, ExpertInput } from '@workspace/api-client-react';
import { ArrowRight, MoreHorizontal, Plus, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { ExpertForm, ExpertMark } from '../components/expert-form';
import { LoadError, PageHeading, SkeletonRows } from '../components/member-app';

export function ExpertsPage() {
  const queryClient = useQueryClient();
  const query = useGetExperts();
  const create = useCreateExpert();
  const update = useUpdateExpert();
  const remove = useDeleteExpert();
  const [dialog, setDialog] = useState<Expert | null | false>(false);
  const [notice, setNotice] = useState('');
  const [menuId, setMenuId] = useState<number | null>(null);
  const refresh = async (id?: number) => {
    await queryClient.invalidateQueries({ queryKey: getGetExpertsQueryKey() });
    await queryClient.invalidateQueries({ queryKey: getSearchPanelQueryKey() });
    if (id) await queryClient.invalidateQueries({ queryKey: getGetExpertQueryKey(id) });
  };
  const save = (data: ExpertInput) => {
    if (dialog) update.mutate({ id: dialog.id, data }, { onSuccess: async () => { await refresh(dialog.id); setDialog(false); setNotice('Expert profile updated.'); }, onError: () => setNotice('We couldn’t save those changes. Please try again.') });
    else create.mutate({ data }, { onSuccess: async () => { await refresh(); setDialog(false); setNotice('A new trusted voice has joined your panel.'); }, onError: () => setNotice('We couldn’t add this expert. Please try again.') });
  };
  const deleteExpert = (expert: Expert) => {
    if (!window.confirm(`Remove ${expert.name} from your panel? Their existing answer history will remain with the questions.`)) return;
    remove.mutate({ id: expert.id }, { onSuccess: async () => { await refresh(expert.id); setMenuId(null); setNotice(`${expert.name} was removed from your panel.`); }, onError: () => setNotice('We couldn’t remove this expert. Please try again.') });
  };
  const experts = query.data ?? [];
  return <div>
    <PageHeading eyebrow="THE PEOPLE YOU TRUST" title="Your panel" detail="A small circle of specialists, each here for a different perspective." action={<button className="button-primary" onClick={() => setDialog(null)} data-testid="button-add-expert"><Plus size={16} /> Add an expert</button>} />
    {notice && <div className="inline-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button></div>}
    {query.isLoading ? <SkeletonRows count={4} /> : query.isError ? <LoadError onRetry={() => void query.refetch()} /> : experts.length ? <section className="experts-grid" aria-label="Your experts">
      {experts.map((expert, index) => <article className={`expert-profile-card expert-color-${index % 4}`} key={expert.id} data-testid={`expert-profile-${expert.id}`}>
        <div className="expert-card-top"><span className="profile-index">PANELIST {String(index + 1).padStart(2, '0')}</span><div className="expert-menu-wrap"><button className="icon-button" onClick={() => setMenuId(menuId === expert.id ? null : expert.id)} aria-label={`Options for ${expert.name}`} data-testid={`button-expert-menu-${expert.id}`}><MoreHorizontal size={18} /></button>{menuId === expert.id && <div className="expert-menu"><button onClick={() => { setDialog(expert); setMenuId(null); }} data-testid={`button-edit-expert-${expert.id}`}>Edit profile</button><button className="danger-menu" disabled={remove.isPending} onClick={() => deleteExpert(expert)} data-testid={`button-delete-expert-${expert.id}`}>Remove from panel</button></div>}</div></div>
        <div className="expert-card-portrait"><ExpertMark name={expert.name} avatarUrl={expert.avatarUrl} size="large" /></div>
        <div className="expert-card-copy"><span className="specialty-label">{expert.specialty}</span><h2>{expert.name}</h2><p>{expert.bio || 'A trusted perspective, ready when you need it.'}</p></div>
        <div className="expert-tone"><span>THEIR TONE</span><strong>{expert.tone}</strong></div>
        <div className="expert-card-actions"><Link href={`/experts/${expert.id}`} className="text-link" data-testid={`link-expert-profile-${expert.id}`}>View profile <ArrowRight size={14} /></Link><Link href={`/ask?expert=${expert.id}`} className="small-ask-link" data-testid={`link-ask-expert-${expert.id}`}>Ask them</Link></div>
      </article>)}
      <button className="add-expert-card" onClick={() => setDialog(null)} data-testid="button-add-expert-card"><span className="add-expert-mark"><Plus size={23} /></span><strong>Make room for another voice.</strong><span>Add a specialist whose perspective you value.</span></button>
    </section> : <div className="empty-state-large"><div className="empty-illustration"><UsersRound size={27} /></div><span className="section-kicker">START WITH SOMEONE YOU TRUST</span><h2>Your panel is a work in progress.</h2><p>Add a specialist and give their point of view a place to belong.</p><button className="button-primary" onClick={() => setDialog(null)} data-testid="button-add-first-expert"><Plus size={15} /> Add your first expert</button></div>}
    {dialog !== false && <ExpertForm expert={dialog} busy={create.isPending || update.isPending} onClose={() => setDialog(false)} onSave={save} />}
  </div>;
}
