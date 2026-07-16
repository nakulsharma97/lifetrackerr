import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Target,
  LogOut,
  Activity,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/habits', label: 'Habits', icon: Target },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = (() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileOpen(false);
    navigate('/auth/login');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-surface-100 dark:border-surface-800">
        <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center dark:bg-surface-100">
          <Activity className="w-4 h-4 text-white dark:text-surface-950" />
        </div>
        <span className="text-lg font-medium tracking-tight text-ink dark:text-surface-100">
          LifeTracker
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="px-4 py-4 border-t border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center dark:bg-surface-700">
            <span className="text-xs font-medium text-ink-lighter dark:text-surface-300">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate dark:text-surface-100">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-ink-lighter truncate dark:text-surface-400">
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-ink-lighter hover:text-ink hover:bg-surface-100 transition-colors dark:hover:bg-surface-800 dark:hover:text-surface-100"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ─── Mobile Hamburger Button ──────────────────────── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-[60] lg:hidden w-9 h-9 rounded-lg bg-white border border-surface-200 shadow-sm flex items-center justify-center hover:bg-surface-100 transition-colors dark:bg-surface-900 dark:border-surface-800 dark:hover:bg-surface-800"
      >
        {mobileOpen ? (
          <X className="w-4 h-4 text-ink dark:text-surface-100" />
        ) : (
          <Menu className="w-4 h-4 text-ink dark:text-surface-100" />
        )}
      </button>

      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-surface-200 z-50 flex-col dark:bg-surface-900 dark:border-surface-800">
        {sidebarContent}
      </aside>

      {/* ─── Mobile Overlay ───────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Mobile Sidebar (slide-in) ────────────────────── */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-surface-200 z-50 flex-col
          lg:hidden transition-transform duration-300 ease-out
          dark:bg-surface-900 dark:border-surface-800
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
