import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Heart, 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  Bell, 
  HeartHandshake,
  PlusCircle, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { subscribeToMyNotifications } from '@/src/services/notifications/notificationService';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { user, userProfile, isDonor, signInWithGoogle, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToMyNotifications(
      user.uid,
      (list) => {
        const count = list.filter(n => !n.isRead).length;
        setUnreadCount(count);
      },
      (err) => {
        console.warn('Navbar notification badge notice:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setIsMobileMenuOpen(false);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-md shadow-red-500/15 group-hover:scale-105 transition-transform duration-300">
              <img src="/blood-drop-logo.svg" alt="Blood Bank Halsha logo" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#252525] group-hover:text-[#C62828] transition-colors">
                Blood Bank <span className="text-[#C62828]">Halsha</span>
              </span>
              <span className="text-xs font-medium text-gray-500 tracking-wide uppercase">
                Donate Blood. Save Lives.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/') 
                  ? 'text-[#C62828] bg-[#FCE8E8]' 
                  : 'text-gray-700 hover:text-[#C62828] hover:bg-rose-50/50'
              }`}
            >
              Home
            </Link>
            
            <Link
              to="/find-blood"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/find-blood') 
                  ? 'text-[#C62828] bg-[#FCE8E8]' 
                  : 'text-gray-700 hover:text-[#C62828] hover:bg-rose-50/50'
              }`}
            >
              <Search className="w-4 h-4 text-[#C62828]" />
              Find Blood
            </Link>

            <Link
              to="/donor-center"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/donor-center') 
                  ? 'text-[#C62828] bg-[#FCE8E8]' 
                  : 'text-gray-700 hover:text-[#C62828] hover:bg-rose-50/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Become a Donor
            </Link>

            {user && isDonor && (
              <Link
                to="/dashboard#incoming-requests"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  location.pathname === '/dashboard' && location.hash === '#incoming-requests'
                    ? 'text-[#C62828] bg-[#FCE8E8]'
                    : 'text-gray-700 hover:text-[#C62828] hover:bg-rose-50/50'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-[#C62828]" />
                Incoming Blood Requests
              </Link>
            )}

            <Link
              to="/blood-request"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/blood-request') 
                  ? 'text-red-700 bg-red-100' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
              Emergency Request
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/about') 
                  ? 'text-[#C62828] bg-[#FCE8E8]' 
                  : 'text-gray-700 hover:text-[#C62828] hover:bg-rose-50/50'
              }`}
            >
              About Us
            </Link>
          </nav>

          {/* Desktop Right CTA / User Section */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell Icon */}
                <Link
                  to="/notifications"
                  aria-label="View notifications"
                  className="relative p-2 rounded-xl text-gray-600 hover:text-[#C62828] hover:bg-rose-50/70 transition-colors focus:outline-hidden"
                  title="Notifications & Alerts"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#C62828] text-[10px] font-extrabold text-white shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-[#C62828]/40 hover:bg-rose-50/40 transition-all focus:outline-hidden"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#C62828] text-white flex items-center justify-center font-bold text-xs">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">
                      {user.displayName?.split(' ')[0] || 'My Account'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setIsUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || 'Member'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-[#C62828] transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        Dashboard & Profile
                      </Link>

                      <Link
                        to="/my-requests"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-[#C62828] transition-colors"
                      >
                        <Droplet className="w-4 h-4 text-[#C62828]" />
                        My Blood Requests
                      </Link>

                      <Link
                        to="/dashboard#incoming-requests"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-[#C62828] transition-colors"
                      >
                        <HeartHandshake className="w-4 h-4 text-[#C62828]" />
                        Incoming Blood Requests
                      </Link>

                      <Link
                        to="/notifications"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-[#C62828] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-500" />
                          <span>Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C62828] text-white">
                            {unreadCount}
                          </span>
                        )}
                      </Link>

                      {(userProfile?.role === 'admin' || userProfile?.isAdmin || user.email?.toLowerCase() === 'mohistudio95@gmail.com') && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#1D4ED8] bg-blue-50/70 hover:bg-blue-100/80 font-bold transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-[#C62828] hover:bg-rose-50/50 transition-colors"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-rose-50/50 hover:border-[#C62828]/30 text-gray-800 text-sm font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-98"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  Login with Google
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button & quick notifications */}
          <div className="flex md:hidden items-center gap-1.5">
            {user && (
              <Link
                to="/notifications"
                aria-label="View notifications"
                className="relative p-2 rounded-xl text-gray-700 hover:text-[#C62828] hover:bg-rose-50 transition-colors focus:outline-hidden"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#C62828] text-[9px] font-extrabold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-gray-700 hover:text-[#C62828] hover:bg-rose-50 transition-colors focus:outline-hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[2.2]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2.2]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-rose-100 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-3.5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                isActive('/') ? 'text-[#C62828] bg-[#FCE8E8]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/find-blood"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                isActive('/find-blood') ? 'text-[#C62828] bg-[#FCE8E8]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Search className="w-5 h-5 text-[#C62828]" />
              Find Blood
            </Link>

            <Link
              to="/donor-center"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                isActive('/donor-center') ? 'text-[#C62828] bg-[#FCE8E8]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              Become a Donor
            </Link>

            <Link
              to="/blood-request"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                isActive('/blood-request') ? 'text-red-700 bg-red-100' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-red-600" />
              Emergency Request
            </Link>

            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-3.5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                isActive('/about') ? 'text-[#C62828] bg-[#FCE8E8]' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              About Us
            </Link>
          </div>

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3.5 py-2 bg-rose-50/60 rounded-xl">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-10 h-10 rounded-full object-cover border border-rose-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#C62828] text-white flex items-center justify-center font-bold text-sm">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-gray-900 truncate">{user.displayName || 'Member'}</span>
                    <span className="text-xs text-gray-500 truncate">{user.email}</span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  My Dashboard
                </Link>

                {isDonor && (
                  <Link
                    to="/dashboard#incoming-requests"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <HeartHandshake className="w-4 h-4 text-[#C62828]" />
                    Incoming Blood Requests
                  </Link>
                )}

                <Link
                  to="/my-requests"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Droplet className="w-4 h-4 text-[#C62828]" />
                  My Blood Requests
                </Link>

                <Link
                  to="/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <span>Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#C62828] text-white">
                      {unreadCount} new
                    </span>
                  )}
                </Link>

                {(userProfile?.role === 'admin' || userProfile?.isAdmin || user.email?.toLowerCase() === 'mohistudio95@gmail.com') && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#1D4ED8] bg-blue-50/80 hover:bg-blue-100"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Admin Command Console</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                Login with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
