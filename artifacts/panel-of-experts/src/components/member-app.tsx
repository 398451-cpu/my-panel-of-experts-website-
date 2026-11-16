import { useClerk, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetExpertsQueryKey,
  getGetQuestionsQueryKey,
  useGetExperts,
} from '@workspace/api-client-react';
import { ArrowRight, BookOpen, CircleHelp, Compass, LogOut, Menu, Plus, Search, Sparkles, UsersRound, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import { AskPage } from '../pages/ask-page';
import { DashboardPage } from '../pages/dashboard-page';
import { ExpertPage } from '../pages/expert-page';
import { ExpertsPage } from '../pages/experts-page';
import { QuestionPage } from '../pages/question-page';
import { QuestionsPage } from '../pages/questions-page';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function MemberApp() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const expertsQuery = useGetExperts();
  const experts = expertsQuery.data ?? [];
  const name = user?.firstName || 'Member';
  const links = [
    { href: '/dashboard', label: 'Overview', icon: Compass },
    { href: '/ask', label: 'Ask a question', icon: Plus },
    { href: '/questions', label: 'Question library', icon: BookOpen },
    { href: '/experts', label: 'Your experts', icon: UsersRound },
  ];

  const logout = async () => {
    await signOut({ redirectUrl: basePath || '/' });
  };

  return (
    <div className="member-app">
      <aside className={`member-sidebar${mobileOpen ? ' is-open' : ''}`}>
        <div className="sidebar-top">
          <Link href="/dashboard" className="brand app-brand" data-testid="link-app-brand">
            <img src={`${basePath}/logo.svg`} alt="" />
            <span><span className="brand-name">Panel of Experts</span><span className="brand-caption">A little perspective goes far</span></span>
          </Link>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-close-menu"><X size={18} /></button>
        </div>
        <div className="sidebar-label">Your space</div>
        <nav className="side-nav" aria-label="Member navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`side-link${location === href || (href === '/questions' && location.startsWith('/questions/')) || (href === '/experts' && location.startsWith('/experts/')) ? ' active' : ''}`} onClick={() => setMobileOpen(false)} data-testid={`nav-${href.slice(1)}`}>
              <Icon size={17} strokeWidth={1.7} /><span>{label}</span>{href === '/ask' && <span className="nav-dot" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-panel">
          <div className="sidebar-panel-head"><span className="sidebar-label">Your panel</span><span className="panel-count">{experts.length.toString().padStart(2, '0')}</span></div>
          {expertsQuery.isLoading ? <div className="mini-skeleton"><i /><i /></div> : experts.length ? experts.slice(0, 4).map((expert, index) => (
            <Link href={`/experts/${expert.id}`} className="sidebar-expert" key={expert.id} data-testid={`side-expert-${expert.id}`}>
              <span className={`expert-mark mark-${index % 4}`}>{expert.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
              <span className="sidebar-expert-text"><strong>{expert.name}</strong><small>{expert.specialty}</small></span>
            </Link>
          )) : <p className="sidebar-empty">Your trusted voices will live here.</p>}
          <Link href="/experts" className="sidebar-manage" data-testid="link-manage-panel">Manage panel <ArrowRight size={13} /></Link>
        </div>
        <div className="sidebar-bottom">
          <button type="button" className="user-menu" onClick={logout} data-testid="button-sign-out">
            <span className="user-avatar">{(name[0] || 'M').toUpperCase()}</span>
            <span className="user-meta"><strong>{name}</strong><small>Private member space</small></span>
            <LogOut size={15} className="user-logout" />
          </button>
          <div className="privacy-foot"><span className="privacy-lock" /> Only you can see your panel and questions.</div>
        </div>
      </aside>
      {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <div className="app-workspace">
        <header className="app-header">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu"><Menu size={19} /></button>
          <div className="header-breadcrumb"><span>MEMBER SPACE</span><ArrowRight size={12} /><strong>{location.split('/')[1]?.replace('-', ' ') || 'overview'}</strong></div>
          <div className="header-actions">
            <Link href="/questions" className="header-search" data-testid="link-search"><Search size={16} /><span>Find a question</span><kbd>⌘ K</kbd></Link>
            <span className="header-status"><i /> Private</span>
          </div>
        </header>
        <main className="page-content" key={location}>
          <Switch>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/ask" component={AskPage} />
            <Route path="/questions" component={QuestionsPage} />
            <Route path="/questions/:id" component={QuestionPage} />
            <Route path="/experts" component={ExpertsPage} />
            <Route path="/experts/:id" component={ExpertPage} />
          </Switch>
        </main>
        <footer className="app-footer"><span>Made for thoughtful questions.</span><span>YOUR PANEL, YOUR PERSPECTIVE</span></footer>
      </div>
      <button className="mobile-ask" onClick={() => setLocation('/ask')} aria-label="Ask the panel" data-testid="mobile-ask"><Plus size={19} /></button>
    </div>
  );
}

export function PageHeading({ eyebrow, title, detail, action }: { eyebrow: string; title: ReactNode; detail?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="page-eyebrow">{eyebrow}</div><h1>{title}</h1>{detail && <p>{detail}</p>}</div>{action && <div className="heading-action">{action}</div>}</div>;
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return <div className="state-panel error-panel"><div className="state-icon"><CircleHelp size={21} /></div><h3>We couldn’t open this just now.</h3><p>Your panel is still here. Try again in a moment.</p><button className="button-secondary" onClick={onRetry} data-testid="button-retry">Try again</button></div>;
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return <div className="skeleton-list" aria-label="Loading content">{Array.from({ length: count }, (_, index) => <div className="content-skeleton" key={index}><i /><span><b /><b /></span></div>)}</div>;
}

export function useRefreshPanel() {
  const client = useQueryClient();
  return () => {
    void client.invalidateQueries({ queryKey: getGetExpertsQueryKey() });
    void client.invalidateQueries({ queryKey: getGetQuestionsQueryKey() });
  };
}
