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
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-surface-200 z-50 flex flex-col dark:bg-surface-950 dark:border-surface-800">
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
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Theme Toggle + User & Logout */}
      <div className="px-4 py-3 border-t border-surface-100 dark:border-surface-800">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-ink-light hover:bg-surface-100 hover:text-ink transition-all duration-200 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-4 py-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center dark:bg-surface-700">
            <span className="text-xs font-medium text-ink-lighter dark:text-surface-400">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink truncate dark:text-surface-100">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-ink-lighter truncate dark:text-surface-500">
              {user?.email || ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-ink-lighter hover:text-ink hover:bg-surface-100 transition-colors dark:hover:text-surface-100 dark:hover:bg-surface-800"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
