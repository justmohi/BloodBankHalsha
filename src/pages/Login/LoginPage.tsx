import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Droplet, 
  Heart, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { user, signInWithGoogle, loading, error, clearError, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [preferRedirect, setPreferRedirect] = useState(false);

  // Return to intended page or dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleLogin = async (redirectMode = false) => {
    clearError();
    try {
      await signInWithGoogle(redirectMode);
      navigate(from, { replace: true });
    } catch (err) {
      console.warn('Login attempt completed with error:', err);
    }
  };

  // If already authenticated
  if (user) {
    return (
      <div className="min-h-[80vh] bg-stone-50/50 py-16 px-4 flex items-center justify-center text-[#252525]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-200/80 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#FCE8E8] text-[#C62828] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Already Signed In</h2>
            <p className="text-sm text-gray-600">
              You are currently authenticated as:
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-gray-100 flex items-center gap-3 text-left">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-12 h-12 rounded-xl object-cover border border-rose-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#C62828] text-white font-bold text-lg flex items-center justify-center">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'Member'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to={from}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#C62828] text-white font-semibold text-sm hover:bg-[#B71C1C] transition-colors shadow-xs"
            >
              <span>Continue to Destination</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out / Switch Google account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-stone-50/50 py-12 sm:py-20 px-4 flex items-center justify-center text-[#252525]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-lg space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C62828] text-white shadow-md shadow-red-600/20 mx-auto">
            <Droplet className="w-8 h-8 fill-white stroke-[#C62828]" />
            <Heart className="w-4 h-4 absolute fill-red-100 text-red-100 top-4" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252525] tracking-tight">
            Sign In to Blood Bank Halsha
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed">
            Connect your voluntary donor profile or post emergency blood requests with secure Google authentication.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>Authentication Notice</span>
            </div>
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Action Button: Google Sign-in */}
        <div className="space-y-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleLogin(false)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-gray-200 hover:border-[#C62828]/40 bg-white hover:bg-rose-50/30 text-gray-800 font-bold text-base shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#C62828] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
          </button>

          {/* Mobile or Popup Blocked Alternative */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => handleLogin(true)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#C62828] transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile user or popup blocked? Use redirect mode</span>
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 border-t border-gray-100 space-y-3 text-xs text-gray-500">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Official Google Authentication via Firebase Web SDK</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Phone numbers and private address records remain strictly shielded</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Droplet className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
            <span>Shared with the Blood Bank Halsha Android app</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link to="/" className="text-xs font-semibold text-gray-500 hover:text-gray-800">
            &larr; Return to Home Page
          </Link>
        </div>

      </div>
    </div>
  );
};
