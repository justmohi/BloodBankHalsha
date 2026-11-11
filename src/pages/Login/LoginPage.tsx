import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Droplet, Heart, ShieldCheck, Lock, AlertCircle, ArrowRight, CheckCircle2, Mail, Eye, EyeOff, UserRound, KeyRound } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, loading, error, clearError, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>(() => new URLSearchParams(location.search).get('mode') === 'signup' ? 'signup' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    setNotice('');
    try {
      if (mode === 'signup') {
        await signUpWithEmail(name, email, password);
        setNotice('Account created. A verification email has been sent if email delivery is available. Please check your inbox.');
      } else {
        await signInWithEmail(email, password);
      }
      navigate(from, { replace: true });
    } catch {
      // AuthContext exposes a user-friendly error.
    }
  };

  const handleGoogle = async () => {
    clearError();
    try {
      await signInWithGoogle(false);
      navigate(from, { replace: true });
    } catch {
      // AuthContext exposes a user-friendly error.
    }
  };

  const handleReset = async () => {
    clearError();
    setNotice('');
    try {
      await resetPassword(email);
      setNotice('If an account exists for this email, a password reset link has been sent.');
    } catch {
      // AuthContext exposes a user-friendly error.
    }
  };

  if (user) {
    return (
      <div className="min-h-[80vh] bg-stone-50/50 py-16 px-4 flex items-center justify-center text-[#252525]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FCE8E8] text-[#C62828] flex items-center justify-center mx-auto"><CheckCircle2 className="w-9 h-9" /></div>
          <div><h2 className="text-2xl font-bold text-gray-900">Already Signed In</h2><p className="text-sm text-gray-600 mt-1">You are authenticated as {user.email}.</p></div>
          <Link to={from} className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#C62828] text-white font-semibold text-sm">Continue <ArrowRight className="w-4 h-4" /></Link>
          <button type="button" onClick={() => logout()} className="w-full py-2 text-xs font-semibold text-gray-600 hover:text-red-600">Sign out / Switch account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-stone-50/60 py-10 sm:py-16 px-4 flex items-center justify-center text-[#252525]">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-9 border border-gray-200 shadow-lg space-y-6">
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C62828] text-white shadow-md mx-auto"><Droplet className="w-8 h-8 fill-white stroke-[#C62828]" /><Heart className="w-4 h-4 absolute fill-red-100 text-red-100 top-4" /></div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{mode === 'signup' ? 'Create Your Account' : 'Sign In to Blood Bank Halsha'}</h1>
          <p className="text-sm text-gray-600">{mode === 'signup' ? 'Register with your name, email and password.' : 'Sign in with your email and password or Google account.'}</p>
        </div>

        <div className="grid grid-cols-2 rounded-xl bg-stone-100 p-1">
          <button type="button" onClick={() => { setMode('login'); clearError(); setNotice(''); }} className={`rounded-lg py-2.5 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-white text-[#C62828] shadow-sm' : 'text-gray-500'}`}>Sign In</button>
          <button type="button" onClick={() => { setMode('signup'); clearError(); setNotice(''); }} className={`rounded-lg py-2.5 text-sm font-bold transition-colors ${mode === 'signup' ? 'bg-white text-[#C62828] shadow-sm' : 'text-gray-500'}`}>Create Account</button>
        </div>

        {error && <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
        {notice && <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">{notice}</div>}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === 'signup' && <label className="block space-y-1.5"><span className="text-xs font-bold text-gray-700">Full Name</span><span className="relative block"><UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input required minLength={2} autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#C62828]" /></span></label>}
          <label className="block space-y-1.5"><span className="text-xs font-bold text-gray-700">Email Address</span><span className="relative block"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-[#C62828]" /></span></label>
          <label className="block space-y-1.5"><span className="text-xs font-bold text-gray-700">Password</span><span className="relative block"><KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input required type={showPassword ? 'text' : 'password'} minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'} className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-11 text-sm outline-none focus:border-[#C62828]" /><button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></span></label>
          {mode === 'login' && <div className="text-right"><button type="button" onClick={handleReset} className="text-xs font-semibold text-[#C62828] hover:underline">Forgot password?</button></div>}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] px-5 py-3.5 text-white text-sm font-bold shadow-sm disabled:opacity-60">{loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4" /></button>
        </form>

        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">OR CONTINUE WITH</span></div></div>
        <button type="button" disabled={loading} onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-gray-200 hover:border-[#C62828]/40 bg-white text-gray-800 font-bold text-sm disabled:opacity-60">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          Continue with Google
        </button>

        <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-500"><div className="flex gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> Secure authentication powered by Firebase.</div><div className="flex gap-2"><Lock className="w-4 h-4 text-emerald-600 shrink-0" /> Donor contact details remain private.</div><div className="flex gap-2"><Droplet className="w-4 h-4 text-[#C62828] shrink-0" /> Your account works with Blood Bank Halsha.</div></div>
        <div className="text-center"><Link to="/" className="text-xs font-semibold text-gray-500 hover:text-gray-800">← Return to Home Page</Link></div>
      </div>
    </div>
  );
};
