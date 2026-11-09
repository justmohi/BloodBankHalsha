import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft, RefreshCw, AlertTriangle, Droplet } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { checkAdminClaims, bootstrapAdmin } from '@/src/services/admin/adminService';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [canBootstrap, setCanBootstrap] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const [bootstrapping, setBootstrapping] = useState<boolean>(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [bootstrapSuccess, setBootstrapSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    let isMounted = true;
    const verifyStatus = async () => {
      setChecking(true);
      try {
        const claims = await checkAdminClaims();
        if (isMounted) {
          setIsAdmin(claims.isAdmin);
          setCanBootstrap(claims.canBootstrap);
        }
      } catch (err) {
        console.warn('Admin check warning:', err);
        // Fallback: check email directly
        if (isMounted) {
          const isOwner = user.email?.toLowerCase() === 'mohistudio95@gmail.com';
          setIsAdmin(isOwner);
          setCanBootstrap(isOwner);
        }
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    verifyStatus();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleBootstrap = async () => {
    setBootstrapping(true);
    setBootstrapError(null);
    try {
      const result = await bootstrapAdmin();
      setBootstrapSuccess(result.message);
      setIsAdmin(true);
      setCanBootstrap(false);
    } catch (err: any) {
      console.error('Bootstrap error:', err);
      setBootstrapError(err.message || 'Failed to initialize administrator role.');
    } finally {
      setBootstrapping(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-200 shadow-sm text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Verifying Security Credentials</h3>
          <p className="text-xs text-gray-500">
            Checking Firebase Custom Claims and server-side administrator authorization...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Eligible for initial bootstrap procedure
  if (canBootstrap && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-3xl p-8 max-w-lg w-full border border-slate-700 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Authorized Setup
              </span>
              <h2 className="text-xl font-extrabold text-white">
                Admin Account Bootstrap
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
            <p>
              Your account (<strong>{user.email}</strong>) is the pre-authorized administrator for Blood Bank Halsha.
            </p>
            <p>
              Click below to initiate the trusted server-side bootstrap procedure. This assigns the permanent Firebase Custom Claim, activates administrative Firestore rules, and logs an immutable audit trail.
            </p>
          </div>

          {bootstrapError && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{bootstrapError}</span>
            </div>
          )}

          {bootstrapSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{bootstrapSuccess}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleBootstrap}
              disabled={bootstrapping}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {bootstrapping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Provisioning Admin Privileges...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Initialize Administrator Privileges</span>
                </>
              )}
            </button>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-rose-200 text-center space-y-5 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-red-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Administrative privileges are required to access this portal. Your authenticated account (<strong>{user.email}</strong>) is not authorized.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C62828] text-white text-xs font-bold hover:bg-[#B71C1C] transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
