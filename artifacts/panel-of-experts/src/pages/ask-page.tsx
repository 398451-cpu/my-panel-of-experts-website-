import { getGetQuestionsQueryKey, getSearchPanelQueryKey, useCreateQuestion, useGetExperts } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, LockKeyhole, MessageSquareText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { PageHeading } from '../components/member-app';

const topics = ['Work & career', 'Health & wellbeing', 'Learning', 'Relationships', 'Money', 'Life decisions', 'Other'];

export function AskPage() {
  const [, navigate] = useLocation();
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState('');
  const [expert, setExpert] = useState('');
  const [error, setError] = useState('');
  const expertsQuery = useGetExperts();
  const experts = expertsQuery.data ?? [];
  const create = useCreateQuestion();
  const queryClient = useQueryClient();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('expert');
    if (id) setExpert(id);
  }, []);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim() || !topic) { setError('Write your question and choose a topic to continue.'); return; }
    create.mutate({ data: { body: body.trim(), topic, expertId: expert ? Number(expert) : null } }, {
      onSuccess: async (question) => {
        await queryClient.invalidateQueries({ queryKey: getGetQuestionsQueryKey() });
        await queryClient.invalidateQueries({ queryKey: getSearchPanelQueryKey() });
        navigate(`/questions/${question.id}`);
      },
      onError: () => setError('Your question could not be saved. Please try again.'),
    });
  };
  return <div className="ask-page">
    <PageHeading eyebrow="MAKE ROOM FOR A QUESTION" title={<>What’s on your<br /><em>mind?</em></>} detail="Take a moment. You don’t need to have it all figured out before you ask." />
    <div className="ask-layout">
      <form className="ask-form" onSubmit={submit}>
        <label className="form-section-label" htmlFor="question-body"><span>01</span> Your question</label>
        <textarea id="question-body" rows={5} maxLength={3000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="What would you like to think through?" data-testid="input-question-body" />
        <div className="character-count">{body.length} / 3,000</div>
        <label className="form-section-label" htmlFor="question-topic"><span>02</span> A little context</label>
        <select id="question-topic" value={topic} onChange={(event) => setTopic(event.target.value)} data-testid="select-question-topic"><option value="">Choose a topic</option>{topics.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <label className="form-section-label" htmlFor="question-expert"><span>03</span> Who would you like to hear from?</label>
        <select id="question-expert" value={expert} onChange={(event) => setExpert(event.target.value)} data-testid="select-question-expert"><option value="">The whole panel</option>{experts.map((person) => <option key={person.id} value={person.id}>{person.name} — {person.specialty}</option>)}</select>
        {experts.length === 0 && !expertsQuery.isLoading && <div className="form-hint">You can ask the whole panel now, or <a href="/experts">add an expert</a> first.</div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button-primary ask-submit" type="submit" disabled={create.isPending || expertsQuery.isLoading} data-testid="button-submit-question">{create.isPending ? 'Saving your question…' : 'Keep this question'} <ArrowRight size={16} /></button>
        <div className="form-privacy"><LockKeyhole size={14} /> This question is private to your panel.</div>
      </form>
      <aside className="ask-side-note"><div className="ask-side-art"><MessageSquareText size={25} /><span className="art-line line-a" /><span className="art-line line-b" /></div><span className="section-kicker">A THOUGHTFUL SPACE</span><h2>Good questions don’t need perfect words.</h2><p>Your panel is a personal reference, not a broadcast. Ask in your own way, then add the perspectives you want to remember.</p><div className="manual-note"><Check size={15} /> Answers are recorded by you, in your experts’ own words.</div></aside>
    </div>
  </div>;
}
