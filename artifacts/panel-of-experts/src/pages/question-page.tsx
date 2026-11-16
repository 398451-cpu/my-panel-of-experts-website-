import { getGetQuestionAnswersQueryKey, getGetQuestionQueryKey, getGetQuestionsQueryKey, getSearchPanelQueryKey, useCreateQuestionAnswer, useGetExperts, useGetQuestion, useGetQuestionAnswers } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ExpertMark } from '../components/expert-form';
import { LoadError, PageHeading, SkeletonRows } from '../components/member-app';

export function QuestionPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const validId = Number.isFinite(id) && id > 0;
  const questionQuery = useGetQuestion(id, { query: { enabled: validId, queryKey: getGetQuestionQueryKey(id) } });
  const answersQuery = useGetQuestionAnswers(id, { query: { enabled: validId, queryKey: getGetQuestionAnswersQueryKey(id) } });
  const expertsQuery = useGetExperts();
  const experts = expertsQuery.data ?? [];
  const createAnswer = useCreateQuestionAnswer();
  const client = useQueryClient();
  const [expertId, setExpertId] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const question = questionQuery.data;
  const answers = answersQuery.data ?? question?.answers ?? [];
  const answeredIds = new Set(answers.map((answer) => answer.expertId));
  const eligibleExperts = experts.filter((expert) => (!question?.expertId || question.expertId === expert.id) && !answeredIds.has(expert.id));
  const saveAnswer = (event: React.FormEvent) => {
    event.preventDefault();
    if (!expertId || !body.trim()) { setError('Choose an expert and add their answer before saving.'); return; }
    createAnswer.mutate({ id, data: { expertId: Number(expertId), body: body.trim() } }, {
      onSuccess: async () => {
        setBody('');
        setExpertId('');
        setError('');
        await Promise.all([
          client.invalidateQueries({ queryKey: getGetQuestionQueryKey(id) }),
          client.invalidateQueries({ queryKey: getGetQuestionAnswersQueryKey(id) }),
          client.invalidateQueries({ queryKey: getGetQuestionsQueryKey() }),
          client.invalidateQueries({ queryKey: getSearchPanelQueryKey() }),
        ]);
      },
      onError: () => setError('That answer could not be saved. Please try again.'),
    });
  };
  if (!validId) return <div className="state-panel"><h3>That question isn’t available.</h3><Link href="/questions" className="text-link">Back to your questions <ArrowRight size={14} /></Link></div>;
  if (questionQuery.isLoading || answersQuery.isLoading) return <><SkeletonRows count={2} /><SkeletonRows count={2} /></>;
  if (questionQuery.isError || answersQuery.isError || !question) return <LoadError onRetry={() => { void questionQuery.refetch(); void answersQuery.refetch(); }} />;
  return <div className="thread-page">
    <Link href="/questions" className="back-link" data-testid="link-back-questions"><ArrowLeft size={15} /> All questions</Link>
    <PageHeading eyebrow={question.topic || 'YOUR QUESTION'} title="A thought, kept here." detail={new Date(question.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} />
    <article className="thread-question">
      <div className="thread-question-label"><span className="topic-chip">{question.topic}</span><span>{question.expertName || 'The whole panel'}</span></div>
      <h2>{question.body}</h2>
      <div className="thread-question-foot"><span><MessageCircle size={15} /> {answers.length} {answers.length === 1 ? 'perspective' : 'perspectives'}</span><span><LockKeyhole size={13} /> Private to you</span></div>
    </article>
    <section className="thread-answers">
      <div className="thread-section-head"><div><span className="section-kicker">THE PERSPECTIVES YOU’VE GATHERED</span><h2>{answers.length ? 'Answers, in their own words.' : 'Nothing recorded yet.'}</h2></div><span className="count-pill">{answers.length}</span></div>
      {answers.length ? <div className="answer-list">{answers.map((answer) => <article className="answer-entry" key={answer.id} data-testid={`answer-${answer.id}`}><div className="answer-person"><ExpertMark name={answer.expertName} avatarUrl={experts.find((person) => person.id === answer.expertId)?.avatarUrl} /><div><Link href={`/experts/${answer.expertId}`}><strong>{answer.expertName}</strong></Link><small>Added {new Date(answer.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</small></div><span className="answer-check"><Check size={14} /></span></div><p>{answer.body}</p></article>)}</div> : <div className="answer-empty"><div className="empty-illustration"><MessageCircle size={23} /></div><p>When you’ve spoken with your expert, keep their response here. No answers are generated for you.</p></div>}
    </section>
    {eligibleExperts.length > 0 ? <section className="record-answer"><div className="record-answer-heading"><div><span className="section-kicker">KEEP A PERSPECTIVE</span><h2>Record an answer</h2></div><span className="manual-badge"><LockKeyhole size={12} /> Added by you</span></div><p>Keep the words your expert shared with you. This space won’t create answers on their behalf.</p><form onSubmit={saveAnswer}><label htmlFor="answer-expert">Expert</label><select id="answer-expert" value={expertId} onChange={(event) => setExpertId(event.target.value)} data-testid="select-answer-expert"><option value="">Choose an expert</option>{eligibleExperts.map((expert) => <option key={expert.id} value={expert.id}>{expert.name} — {expert.specialty}</option>)}</select><label htmlFor="answer-body">Their answer</label><textarea id="answer-body" rows={5} maxLength={5000} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write the answer you’d like to remember…" data-testid="input-answer-body" />{error && <p className="form-error" role="alert">{error}</p>}<button className="button-primary" type="submit" disabled={createAnswer.isPending} data-testid="button-save-answer">{createAnswer.isPending ? 'Saving…' : 'Save this perspective'} <ArrowRight size={15} /></button></form></section> : experts.length === 0 ? <div className="record-answer-empty"><p>Add an expert to your panel before recording their answer.</p><Link href="/experts" className="text-link">Manage your panel <ArrowRight size={14} /></Link></div> : <div className="all-answered-note"><Check size={15} /> You’ve recorded an answer from every expert this question was sent to.</div>}
  </div>;
}
