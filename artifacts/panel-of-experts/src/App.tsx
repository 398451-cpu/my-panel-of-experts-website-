import { useUser, useClerk, ClerkProvider, SignIn, SignUp, Show } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { Link, Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#203b34',
    colorForeground: '#203b34',
    colorMutedForeground: '#68746c',
    colorDanger: '#9c4939',
    colorBackground: '#fbf9f2',
    colorInput: '#f7f5ed',
    colorInputForeground: '#203b34',
    colorNeutral: '#203b34',
    fontFamily: 'DM Sans',
    borderRadius: '3px',
  },
  elements: {
    rootBox: 'cl-rootBox',
    cardBox: 'cl-cardBox',
    card: 'cl-card',
    footer: 'cl-footer',
    headerTitle: 'cl-headerTitle',
    headerSubtitle: 'cl-headerSubtitle',
    socialButtonsBlockButtonText: 'cl-socialButtonsBlockButtonText',
    formFieldLabel: 'cl-formFieldLabel',
    footerActionLink: 'cl-footerActionLink',
    footerActionText: 'cl-footerActionText',
    dividerText: 'cl-dividerText',
    identityPreviewEditButton: 'cl-identityPreviewEditButton',
    formFieldSuccessText: 'text-[#496b58]',
    alertText: 'cl-alertText',
    logoBox: 'cl-logoBox',
    logoImage: 'cl-logoImage',
    socialButtonsBlockButton: 'cl-socialButtonsBlockButton',
    formButtonPrimary: 'cl-formButtonPrimary',
    formFieldInput: 'cl-formFieldInput',
    footerAction: 'cl-footerAction',
    dividerLine: 'cl-dividerLine',
    alert: 'cl-alert',
    otpCodeFieldInput: 'cl-otpCodeFieldInput',
    formFieldRow: 'cl-formFieldRow',
    main: 'cl-main',
  },
};

function Brand({ mobile = false }: { mobile?: boolean }) {
  return (
    <Link href="/" className={`brand${mobile ? ' auth-mobile-brand' : ''}`} data-testid="link-home-brand">
      <img src={`${basePath}/logo.svg`} alt="" />
      <span>
        <span className="brand-name">Panel of Experts</span>
        <span className="brand-caption">A little perspective goes far</span>
      </span>
    </Link>
  );
}

function LandingPage() {
  return (
    <main className="app-shell">
      <nav className="site-nav" aria-label="Main navigation">
        <Brand />
        <div className="nav-links">
          <Link href="/sign-in" className="nav-signin" data-testid="link-sign-in-nav">Member sign in</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy-block">
          <div className="eyebrow">A members-only home for thoughtful guidance</div>
          <h1>A little<br />perspective goes<br /><em>a long way.</em></h1>
          <p className="hero-copy">Panel of Experts is a members-only home for people seeking thoughtful guidance from experienced experts. Create an account to get started, or sign in to continue.</p>
          <div className="hero-actions">
            <Link href="/sign-up" className="button-primary" data-testid="link-create-account">
              Create account <ArrowRight size={16} />
            </Link>
            <Link href="/sign-in" className="button-outline" data-testid="link-sign-in-hero">Sign in</Link>
          </div>
          <div className="hero-note"><LockKeyhole size={13} /> A private space for members</div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="orbit-dot dot-a" />
          <div className="orbit-dot dot-b" />
          <div className="orbit-dot dot-c" />
          <div className="art-center">
            <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
              <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity=".55" />
              <path d="M50 26v48M26 50h48" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
              <path d="m61 38-7 16-16 7 7-16 16-7Z" fill="#c8755d" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <circle cx="50" cy="50" r="3" fill="#f6f3eb" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="hero-stamp">PANEL<br />OF<br />EXPERTS</div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <Brand />
          <span className="footer-note">A private space for members.</span>
          <Link href="/sign-in" className="nav-signin" data-testid="link-footer-sign-in">Member sign in</Link>
        </div>
      </footer>
    </main>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/member" /></Show>
      <Show when="signed-out"><LandingPage /></Show>
    </>
  );
}

function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const signingUp = mode === 'sign-up';
  return (
    <main className="auth-layout">
      <aside className="auth-aside">
        <Brand />
        <div className="auth-aside-copy">
          <div className="eyebrow">A little perspective goes far</div>
          <h1>{signingUp ? <>Good counsel starts<br />with a <em>conversation.</em></> : <>Good to have you<br /><em>back.</em></>}</h1>
          <p>{signingUp ? 'Join a thoughtful community of people who share what they know—and make room for what you know, too.' : 'Your circle of thoughtful people is here when you need a fresh perspective.'}</p>
        </div>
        <div className="auth-assurance"><LockKeyhole size={13} /> Private conversations. Considered advice.</div>
      </aside>
      <section className="auth-main">
        <Brand mobile />
        <div className="auth-topline">
          {signingUp ? 'Already a member?' : 'New to the panel?'}
          <Link href={signingUp ? '/sign-in' : '/sign-up'} data-testid={signingUp ? 'link-auth-sign-in' : 'link-auth-sign-up'}>
            {signingUp ? 'Sign in' : 'Create an account'}
          </Link>
        </div>
        {signingUp ? (
          <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
        ) : (
          <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
        )}
        <div className="auth-footer-note"><Sparkles size={12} /> A considered community, built on trust.</div>
      </section>
    </main>
  );
}

function MemberPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const displayName = user?.fullName || user?.firstName || 'Member';
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress || '';
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();

  return (
    <main className="member-page">
      <nav className="site-nav" aria-label="Member navigation">
        <Brand />
        <Link href="/" className="nav-signin" data-testid="link-member-home">Home</Link>
      </nav>
      <section className="member-main">
        <div className="member-card">
          <div className="member-overline">Your member space</div>
          <h1>Welcome to your panel.</h1>
          <p className="member-description">A thoughtful place to find a little perspective.</p>
          {!isLoaded ? (
            <div className="member-loading" aria-label="Loading account details" data-testid="status-member-loading">
              <div className="skeleton skeleton-avatar" />
              <div className="skeleton-lines"><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>
            </div>
          ) : (
            <>
              <div className="identity-block" data-testid="display-account-identity">
                <div className="identity-mark">{initials || 'M'}</div>
                <div>
                  <div className="identity-name">{displayName}</div>
                  {email && <div className="identity-email">{email}</div>}
                </div>
              </div>
              <button type="button" className="signout-button" onClick={() => signOut({ redirectUrl: basePath || '/' })} data-testid="button-sign-out">
                Sign out <ArrowRight size={15} />
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function ProtectedMemberPage() {
  return (
    <>
      <Show when="signed-in"><MemberPage /></Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in for a thoughtful perspective.' } },
        signUp: { start: { title: 'Join the panel', subtitle: 'Make room for a better conversation.' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?" component={() => <AuthPage mode="sign-in" />} />
        <Route path="/sign-up/*?" component={() => <AuthPage mode="sign-up" />} />
        <Route path="/member" component={ProtectedMemberPage} />
      </Switch>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkRoutes />
    </WouterRouter>
  );
}

export default App;
