import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  Droplet, 
  ShieldCheck, 
  FileText, 
  BarChart3, 
  ScrollText, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X, 
  ChevronRight,
  Shield,
  Bell
} from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { BlueVerifiedBadge } from '@/src/components/common/BlueVerifiedBadge';

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    {
      name: 'Overview',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users
    },
    {
      name: 'Donors',
      path: '/admin/donors',
      icon: HeartHandshake
    },
    {
      name: 'Blood Requests',
      path: '/admin/requests',
      icon: Droplet
    },
    {
      name: 'Blue Verification',
      path: '/admin/blue-verification',
      icon: ShieldCheck,
      highlight: true
    },
    {
      name: 'Donation Records',
      path: '/admin/donations',
      icon: FileText
    },
    {
      name: 'Reports & Analytics',
      path: '/admin/reports',
      icon: BarChart3
    },
    {
      name: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: ScrollText
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings
    }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row text-slate-900 font-sans">
      
      {/* Desktop Sidebar (Deep Navy) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#C62828] text-white flex items-center justify-center shadow-md">
              <Droplet className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>Halsha Admin</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Command Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#1D4ED8] text-white shadow-md shadow-blue-900/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.highlight && !active && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Public Portal Switch & Admin Info */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              Public Portal
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <div className="px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Administrator</span>
              <span className="text-xs font-bold text-white truncate">{user?.email}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C62828] text-white flex items-center justify-center">
            <Droplet className="w-4 h-4 fill-white" />
          </div>
          <span className="text-sm font-bold text-white">Halsha Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            title="Public Portal"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isSidebarOpen && (
        <div className="md:hidden bg-slate-900 text-white px-4 py-4 space-y-1 border-b border-slate-800 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  active ? 'bg-[#1D4ED8] text-white font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 truncate">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-red-400 hover:text-red-300 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-stone-50 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};
