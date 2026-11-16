import type { QuestionThread } from '@workspace/api-client-react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';

export function QuestionCard({ question }: { question: QuestionThread }) {
  const count = question.answers?.length ?? 0;
  return <Link href={`/questions/${question.id}`} className="question-card" data-testid={`question-card-${question.id}`}>
    <div className="question-card-top"><span className="topic-chip">{question.topic || 'General'}</span><span className={`answer-state ${count ? 'answered' : ''}`}><i />{count ? `${count} ${count === 1 ? 'perspective' : 'perspectives'}` : 'Awaiting perspective'}</span></div>
    <h3>{question.body}</h3>
    <div className="question-card-bottom"><span className="question-target">{question.expertName || 'Whole panel'}</span><span className="question-date">{new Date(question.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><span className="question-answer-count"><MessageCircle size={14} /> {count}</span><ArrowUpRight size={16} className="card-arrow" /></div>
  </Link>;
}
