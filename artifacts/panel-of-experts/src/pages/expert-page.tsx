import { getGetExpertQueryKey, getGetQuestionsQueryKey, useGetExpert, useGetQuestions } from '@workspace/api-client-react';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { ExpertMark } from '../components/expert-form';
import { LoadError, PageHeading, SkeletonRows } from '../components/member-app';
import { QuestionCard } from '../components/question-card';

export function ExpertPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const valid = Number.isFinite(id) && id > 0;
  const expertQuery = useGetExpert(id, { query: { enabled: valid, queryKey: getGetExpertQueryKey(id) } });
  const questionsQuery = useGetQuestions({ status: 'all' }, { query: { enabled: valid, queryKey: getGetQuestionsQueryKey({ status: 'all' }) } });
  const expert = expertQuery.data;
  if (!valid) return <div className="state-panel"><h3>That expert isn’t available.</h3><Link href="/experts" className="text-link">Back to your panel <ArrowRight size={14} /></Link></div>;
  if (expertQuery.isLoading || questionsQuery.isLoading) return <><SkeletonRows count={2} /><SkeletonRows count={3} /></>;
  if (expertQuery.isError || questionsQuery.isError || !expert) return <LoadError onRetry={() => { void expertQuery.refetch(); void questionsQuery.refetch(); }} />;
  const expertAnswers = (questionsQuery.data ?? []).flatMap((question) => (question.answers ?? []).filter((answer) => answer.expertId === id).map((answer) => ({ answer, question }))).sort((a, b) => b.answer.createdAt.localeCompare(a.answer.createdAt));
  return <div className="expert-detail-page">
    <Link href="/experts" className="back-link" data-testid="link-back-experts"><ArrowLeft size={15} /> Your panel</Link>
    <section className="expert-detail-hero">
      <div className="expert-detail-orbit" />
      <div className="expert-detail-main"><div className="profile-index">A VOICE IN YOUR PANEL</div><div className="expert-detail-identity"><ExpertMark name={expert.name} avatarUrl={expert.avatarUrl} size="large" /><div><span className="specialty-label">{expert.specialty}</span><h1>{expert.name}</h1></div></div><p className="expert-detail-bio">{expert.bio || 'A trusted perspective, ready when you need it.'}</p><div className="expert-tone"><span>THEIR TONE</span><strong>{expert.tone}</strong></div><div className="expert-since"><CalendarDays size={14} /> In your panel since {new Date(expert.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div></div>
      <div className="expert-detail-aside"><span className="aside-quote">“</span><p>A perspective you chose to keep close.</p><Link href={`/ask?expert=${expert.id}`} className="button-primary" data-testid="button-ask-this-expert">Ask {expert.name.split(' ')[0]} <ArrowRight size={15} /></Link></div>
    </section>
    <section className="expert-history"><div className="section-title-row"><div><span className="section-kicker">A RECORD OF YOUR CONVERSATIONS</span><h2>Past answers <span className="count-pill">{expertAnswers.length}</span></h2></div></div>
      {expertAnswers.length ? <div className="expert-answer-history">{expertAnswers.map(({ answer, question }) => <article className="history-item" key={answer.id}><span className="history-date">{new Date(answer.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><div><Link href={`/questions/${question.id}`} className="history-question">{question.body}</Link><p>{answer.body}</p><span className="topic-chip">{question.topic}</span></div></article>)}</div> : <div className="empty-card"><div className="empty-illustration"><CalendarDays size={23} /></div><h3>No answers from {expert.name.split(' ')[0]} yet.</h3><p>When you record one in a question thread, it will appear here.</p><Link href={`/ask?expert=${expert.id}`} className="text-link">Ask this expert <ArrowRight size={14} /></Link></div>}
    </section>
  </div>;
}
