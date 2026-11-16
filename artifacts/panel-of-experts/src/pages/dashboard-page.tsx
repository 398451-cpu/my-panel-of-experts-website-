import { useGetExperts, useGetQuestions } from '@workspace/api-client-react';
import { ArrowRight, ArrowUpRight, Plus, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'wouter';
import { ExpertMark } from '../components/expert-form';
import { PageHeading, LoadError, SkeletonRows } from '../components/member-app';
import { QuestionCard } from '../components/question-card';

export function DashboardPage() {
  const expertsQuery = useGetExperts();
  const questionsQuery = useGetQuestions({ status: 'all' });
  const experts = expertsQuery.data ?? [];
  const questions = questionsQuery.data ?? [];
  if (expertsQuery.isLoading || questionsQuery.isLoading) return <><PageHeading eyebrow="YOUR PRIVATE PANEL" title="A little perspective, ready." detail="Your trusted voices and the questions you’re working through." /><SkeletonRows count={4} /></>;
  if (expertsQuery.isError || questionsQuery.isError) return <LoadError onRetry={() => { void expertsQuery.refetch(); void questionsQuery.refetch(); }} />;
  const openCount = questions.filter((question) => !question.answers?.length).length;
  return <div className="dashboard-page">
    <PageHeading eyebrow="YOUR PRIVATE PANEL" title={<>A little perspective,<br /><em>ready when you are.</em></>} detail="A private place to collect trusted advice and see it clearly." action={<Link href="/ask" className="button-primary" data-testid="button-ask-dashboard"><Plus size={16} /> Ask your panel</Link>} />
    <section className="welcome-band"><div className="welcome-mark"><Sparkles size={20} /></div><div><span className="welcome-kicker">A note to begin</span><p>Thoughtful questions deserve thoughtful company. Start with one voice, or invite the whole panel to weigh in.</p></div><Link href="/ask" aria-label="Start a question" data-testid="link-start-question"><ArrowRight size={19} /></Link></section>
    <div className="overview-columns">
      <section className="overview-section experts-overview">
        <div className="section-title-row"><div><span className="section-kicker">THE PEOPLE YOU TRUST</span><h2>Your panel <span className="count-pill">{experts.length}</span></h2></div><Link href="/experts" className="text-link" data-testid="link-view-experts">View panel <ArrowRight size={14} /></Link></div>
        {experts.length ? <div className="expert-overview-list">{experts.slice(0, 3).map((expert, index) => <Link key={expert.id} href={`/experts/${expert.id}`} className="expert-overview-item" data-testid={`dashboard-expert-${expert.id}`}><ExpertMark name={expert.name} avatarUrl={expert.avatarUrl} /><span className="expert-overview-copy"><strong>{expert.name}</strong><small>{expert.specialty}</small></span><span className={`expert-orbit orbit-tone-${index % 3}`}><ArrowUpRight size={15} /></span></Link>)}</div> : <div className="empty-card"><div className="empty-illustration"><UsersRound size={25} /></div><h3>Your panel begins with one person.</h3><p>Add a specialist whose perspective you value.</p><Link href="/experts" className="text-link" data-testid="link-add-first-expert">Add your first expert <ArrowRight size={14} /></Link></div>}
        {experts.length > 0 && <Link href="/experts" className="add-expert-line" data-testid="link-add-another-expert"><Plus size={15} /> Add someone to your panel</Link>}
      </section>
      <section className="overview-section questions-overview">
        <div className="section-title-row"><div><span className="section-kicker">THOUGHTS IN PROGRESS</span><h2>Recent questions</h2></div><Link href="/questions" className="text-link" data-testid="link-all-questions">All questions <ArrowRight size={14} /></Link></div>
        {questions.length ? <div className="recent-question-list">{questions.slice(0, 3).map((question) => <QuestionCard key={question.id} question={question} />)}</div> : <div className="empty-card questions-empty"><div className="empty-number">01</div><h3>No questions yet.</h3><p>When something is on your mind, this is where it can live.</p><Link href="/ask" className="text-link" data-testid="link-ask-first">Ask your first question <ArrowRight size={14} /></Link></div>}
      </section>
    </div>
    <div className="dashboard-bottom-note"><span className="note-rule" />{openCount ? `${openCount} question${openCount === 1 ? '' : 's'} still waiting for an answer` : 'Your notes and questions stay private to you.'}<Link href="/questions" data-testid="link-review-questions">Take a look <ArrowRight size={13} /></Link></div>
  </div>;
}
