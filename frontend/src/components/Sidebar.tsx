import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Target,
  LogOut,
  Activity,
  Moon,
  Sun,
} from 'lucide-react';
import { storage } from '../lib/auth';
import { useTheme } from '../lib/useTheme';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/habits', label: 'Habits', icon: Target },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = storage.getUser();
  const { theme, toggle } = useTheme();

  const handleLogout = () => {
    storage.clear();
    navigate('/auth/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-surface-200 z-50 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-surface-100">
        <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-medium tracking-tight text-ink">
          LifeTracker
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-surface-100 space-y-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="sidebar-link w-full"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        {/* User & Logout */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center">
            <span className="text-xs font-medium text-ink-lighter">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-ink-lighter truncate">
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-ink-lighter hover:text-ink hover:bg-surface-100 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
