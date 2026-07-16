import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Target,
  LogOut,
  Activity,
  Download,
  Calendar,
  ChevronLeft,
} from 'lucide-react';
import { storage } from '../lib/auth';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/habits', label: 'Habits', icon: Target },
  { to: '/routines', label: 'Routines', icon: Calendar },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = storage.getUser();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    storage.clear();
    navigate('/auth/login');
  };

  return (
    <aside className={`fixed left-0 top-0 bottom-0 ${collapsed ? 'w-20' : 'w-64'} bg-white/80 backdrop-blur-xl border-r border-surface-200/60 z-50 flex flex-col transition-all duration-300 ease-out`}>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-6'} h-16 border-b border-surface-100/50`}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ink to-ink-dark flex items-center justify-center shadow-sm flex-shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-medium tracking-tight text-ink dark:text-surface-100">
            LifeTracker
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1 rounded-md text-ink-lighter hover:text-ink hover:bg-surface-100 transition-all ${collapsed ? 'ml-0' : 'ml-auto'}`}
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-3 py-5 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center w-12 h-12 rounded-xl' : 'gap-3 px-4 py-2.5 rounded-xl'} text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-ink/5 text-ink font-medium shadow-sm dark:bg-surface-100/10 dark:text-surface-100'
                  : 'text-ink-light hover:bg-surface-100 hover:text-ink dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-surface-100'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={`w-4 h-4 flex-shrink-0 ${collapsed ? 'w-5 h-5' : ''}`} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className={`px-3 py-4 border-t border-surface-100/50 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3 px-4 py-2'}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-ink/10 to-ink/5 dark:from-surface-100/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-ink dark:text-surface-100">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink dark:text-surface-100 truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-ink-lighter truncate">
                {user?.email || ''}
              </p>
            </div>
          )}
          <div className={`flex ${collapsed ? 'flex-col' : 'items-center'} gap-1`}>
            {!collapsed && (
              <a
                href="/api/export/download"
                className="p-1.5 rounded-md text-ink-lighter hover:text-ink hover:bg-surface-100 transition-colors"
                title="Export data (JSON)"
                download
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-ink-lighter hover:text-ink hover:bg-surface-100 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
