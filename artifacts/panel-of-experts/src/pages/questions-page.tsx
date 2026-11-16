import { getSearchPanelQueryKey, useGetExperts, useGetQuestions, useSearchPanel } from '@workspace/api-client-react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { LoadError, PageHeading, SkeletonRows } from '../components/member-app';
import { QuestionCard } from '../components/question-card';

export function QuestionsPage() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [expertId, setExpertId] = useState('');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<'all' | 'answered' | 'open'>('all');
  const expertsQuery = useGetExperts();
  const topicListQuery = useGetQuestions({ status: 'all' });
  const filters = useMemo(() => ({ ...(expertId ? { expertId: Number(expertId) } : {}), ...(topic ? { topic } : {}), status }), [expertId, status, topic]);
  const questionsQuery = useGetQuestions(filters);
  const searchQuery = useSearchPanel({ q: debounced }, { query: { enabled: debounced.length > 0, queryKey: getSearchPanelQueryKey({ q: debounced }) } });
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(search.trim()), 250); return () => window.clearTimeout(timer); }, [search]);
  const questions = questionsQuery.data ?? [];
  const results = searchQuery.data;
  const sourceThreads = topicListQuery.data ?? questions;
  const visibleQuestions = debounced
    ? (results?.questions ?? []).map((question) => ({ ...question, answers: sourceThreads.find((thread) => thread.id === question.id)?.answers ?? [] }))
      .filter((question) => (!expertId || question.expertId === Number(expertId) || question.answers.some((answer) => answer.expertId === Number(expertId))) && (!topic || question.topic === topic) && (status === 'all' || (status === 'answered' ? question.answers.length > 0 : question.answers.length === 0)))
    : questions;
  const answerResults = (results?.answers ?? []).filter((answer) => (!expertId || answer.expertId === Number(expertId)) && (!topic || sourceThreads.find((thread) => thread.id === answer.questionId)?.topic === topic) && (status !== 'open'));
  const expertResults = (results?.experts ?? []).filter((expert) => !expertId || expert.id === Number(expertId));
  const isLoading = questionsQuery.isLoading || (debounced.length > 0 && searchQuery.isLoading);
  const error = questionsQuery.isError || (debounced.length > 0 && searchQuery.isError);
  return <div className="questions-page">
    <PageHeading eyebrow="YOUR PRIVATE LIBRARY" title={<>Questions worth<br /><em>keeping.</em></>} detail="Every question, in one place. Find a thought you’ve been working through." action={<Link className="button-primary" href="/ask" data-testid="button-ask-feed">Ask a question <span>↗</span></Link>} />
    <div className="feed-toolbar">
      <label className="feed-search"><Search size={17} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions, answers, experts…" aria-label="Search questions and answers" data-testid="input-search-questions" />{search && <button onClick={() => setSearch('')} aria-label="Clear search" data-testid="button-clear-search"><X size={15} /></button>}</label>
      <div className="filter-group"><SlidersHorizontal size={15} /><select value={expertId} onChange={(event) => setExpertId(event.target.value)} aria-label="Filter by expert" data-testid="filter-expert"><option value="">Every voice</option>{(expertsQuery.data ?? []).map((expert) => <option value={expert.id} key={expert.id}>{expert.name}</option>)}</select><select value={topic} onChange={(event) => setTopic(event.target.value)} aria-label="Filter by topic" data-testid="filter-topic"><option value="">Every topic</option>{Array.from(new Set(sourceThreads.map((question) => question.topic).filter(Boolean))).sort().map((item) => <option value={item} key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Filter by answer status" data-testid="filter-status"><option value="all">All questions</option><option value="answered">Answered</option><option value="open">Waiting for an answer</option></select></div>
    </div>
    {debounced && <div className="search-caption">Searching your panel for <strong>“{debounced}”</strong><span>{(results?.questions.length ?? 0) + (results?.answers.length ?? 0) + (results?.experts.length ?? 0)} matches</span></div>}
    {isLoading ? <SkeletonRows count={5} /> : error ? <LoadError onRetry={() => { void questionsQuery.refetch(); void searchQuery.refetch(); }} /> : debounced ? <div className="search-results-stack">{visibleQuestions.length > 0 && <><div className="search-result-heading">QUESTIONS <span>{visibleQuestions.length}</span></div><div className="feed-grid">{visibleQuestions.map((question) => <QuestionCard key={question.id} question={question} />)}</div></>}{answerResults.length > 0 && <section className="search-result-section"><div className="search-result-heading">RECORDED ANSWERS <span>{answerResults.length}</span></div>{answerResults.map((answer) => <Link key={answer.id} href={`/questions/${answer.questionId}`} className="search-result-line">{answer.body}<small>{answer.expertName} · {sourceThreads.find((thread) => thread.id === answer.questionId)?.topic}</small></Link>)}</section>}{expertResults.length > 0 && <section className="search-result-section"><div className="search-result-heading">EXPERTS <span>{expertResults.length}</span></div>{expertResults.map((expert) => <Link key={expert.id} href={`/experts/${expert.id}`} className="search-result-line">{expert.name}<small>{expert.specialty}</small></Link>)}</section>}{!visibleQuestions.length && !answerResults.length && !expertResults.length && <div className="empty-state-large"><div className="empty-illustration"><Search size={24} /></div><span className="section-kicker">NO MATCHES FOUND</span><h2>Nothing found in your panel.</h2><p>Try a different word or remove a filter.</p></div>}</div> : visibleQuestions.length ? <div className="feed-grid">{visibleQuestions.map((question) => <QuestionCard key={question.id} question={question} />)}</div> : <div className="empty-state-large"><div className="empty-illustration"><Search size={24} /></div><span className="section-kicker">A CLEAR PAGE FOR NOW</span><h2>Your questions will gather here.</h2><p>Ask something you’ve been thinking about. You can keep the answer here, too.</p><Link href="/ask" className="button-primary" data-testid="link-ask-from-empty">Ask your first question <span>↗</span></Link></div>}
  </div>;
}
