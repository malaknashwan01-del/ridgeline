import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Asterisk, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings, useT } from '../context/SettingsContext';
import { media } from '../data/media';
import type { TKey } from '../i18n/en';
import SmartImg from '../components/ui/SmartImg';
import '../styles/login.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLIDES: [TKey, TKey, TKey][] = [
  ['slide1.a', 'slide1.b', 'slide1.sub'],
  ['slide2.a', 'slide2.b', 'slide2.sub'],
  ['slide3.a', 'slide3.b', 'slide3.sub'],
];
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function GoogleG() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function Login() {
  const { user, login, loginDemo } = useAuth();
  const { lang, set } = useSettings();
  const t = useT();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});
  const [busy, setBusy] = useState<'form' | 'google' | null>(null);
  const [note, setNote] = useState(false);
  const [slide, setSlide] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoOk, setVideoOk] = useState(true);

  // Auto-advance the pitch slides; clicking a dot restarts the timer.
  useEffect(() => {
    if (reducedMotion()) return;
    const id = setTimeout(() => setSlide((s) => (s + 1) % SLIDES.length), 7000);
    return () => clearTimeout(id);
  }, [slide]);

  if (user) return <Navigate to={from} replace />;

  const signup = mode === 'signup';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: signup && !name.trim(),
      email: !EMAIL.test(email.trim()),
      password: password.length < 6,
    };
    setErrors(next);
    if (next.name || next.email || next.password) return;
    setBusy('form');
    await login(email.trim(), signup ? name : undefined);
    navigate(from, { replace: true });
  };

  const google = async () => {
    setBusy('google');
    await loginDemo();
    navigate(from, { replace: true });
  };

  const switchMode = () => {
    setMode(signup ? 'login' : 'signup');
    setErrors({});
  };

  const [a, b, sub] = SLIDES[slide];

  return (
    <div className="auth">
      <div className="auth-scene" aria-hidden="true">
        <SmartImg sources={media.login} alt="" />
        {videoOk && !reducedMotion() && (
          <video
            className={`auth-video${videoReady ? ' ready' : ''}`}
            src={media.loginVideo}
            muted
            loop
            autoPlay
            playsInline
            onLoadedData={() => setVideoReady(true)}
            onError={() => setVideoOk(false)}
          />
        )}
        <div className="auth-shade" />
      </div>

      <section className="auth-hero">
        <header className="auth-top">
          <span className="auth-logo">
            <span className="auth-logo-tile">
              <Asterisk size={26} strokeWidth={3} />
            </span>
            {t('app.name')}
          </span>
          <button className="auth-back" onClick={() => set({ lang: lang === 'en' ? 'ar' : 'en' })}>
            {t('login.back')}
          </button>
        </header>

        <div className="auth-pitch">
          <h1 key={slide} className="auth-headline">
            <span className="line">
              <span>{t(a)}</span>
            </span>
            <span className="line">
              <span>{t(b)}</span>
            </span>
          </h1>
          <p key={`s${slide}`} className="auth-sub">
            {t(sub)}
          </p>
          <div className="auth-dots" role="tablist">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={slide === i}
                aria-label={t('slide.go', { n: i + 1 })}
                className={`auth-dot${slide === i ? ' on' : ''}`}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="auth-card">
        <form className="auth-form" onSubmit={submit} noValidate key={mode}>
          <div className="auth-head">
            <h2>{t(signup ? 'signup.title' : 'login.title')}</h2>
            <p>{t(signup ? 'signup.subtitle' : 'login.subtitle')}</p>
          </div>

          {signup && (
            <label className="auth-field">
              <span>{t('signup.name')}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('signup.namePh')}
                autoComplete="name"
                aria-invalid={errors.name || undefined}
              />
              {errors.name && <small className="auth-error">{t('login.errName')}</small>}
            </label>
          )}

          <label className="auth-field">
            <span>{t('login.email')}</span>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.emailPh')}
              autoComplete="email"
              aria-invalid={errors.email || undefined}
            />
            {errors.email && <small className="auth-error">{t('login.errEmail')}</small>}
          </label>

          <label className="auth-field">
            <span>{t('login.password')}</span>
            <span className="auth-pass">
              <input
                type={showPass ? 'text' : 'password'}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passPh')}
                autoComplete={signup ? 'new-password' : 'current-password'}
                aria-invalid={errors.password || undefined}
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPass((v) => !v)}
                aria-label={t(showPass ? 'login.hide' : 'login.show')}
                aria-pressed={showPass}
              >
                {showPass ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </span>
            {errors.password && <small className="auth-error">{t('login.errPass')}</small>}
          </label>

          {!signup && (
            <div className="auth-row">
              <label className="auth-check">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="box">
                  <Check size={15} strokeWidth={3} />
                </span>
                {t('login.remember')}
              </label>
              <button type="button" className="auth-link" onClick={() => setNote(true)}>
                {t('login.forgot')}
              </button>
            </div>
          )}
          {note && !signup && <p className="auth-note">{t('login.forgotNote')}</p>}

          <button className="auth-submit" type="submit" disabled={!!busy}>
            {busy === 'form' && <Loader2 size={19} className="spin" />}
            {t(signup ? 'signup.submit' : 'login.submit')}
          </button>

          <div className="auth-divider">
            <span>{t('login.or')}</span>
          </div>

          <button className="auth-google" type="button" onClick={google} disabled={!!busy}>
            {busy === 'google' ? <Loader2 size={20} className="spin" /> : <GoogleG />}
            {t('login.google')}
          </button>

          <p className="auth-foot">
            {t(signup ? 'signup.have' : 'login.noAccount')}{' '}
            <button type="button" className="auth-link strong" onClick={switchMode}>
              {t(signup ? 'signup.login' : 'login.signup')}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
