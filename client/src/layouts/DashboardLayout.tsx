import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { useAuth } from '../hooks/useAuth';
import { useGetUnreadCountQuery } from '../services/notificationApi';
import { OrganizationSwitcher } from '../components/organization/OrganizationSwitcher';
import { NotificationPopover } from '../components/notification/NotificationPopover';
import { CommandPaletteModal } from '../components/search/CommandPaletteModal';
import {
  Layers,
  LayoutDashboard,
  BarChart3,
  Kanban,
  FolderKanban,
  Users,
  CheckSquare,
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Settings,
  UserPlus
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const activeOrgId = useSelector((state: RootState) => state.auth.activeOrganizationId);
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Kanban Board', href: '/board', icon: Kanban },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Teams', href: '/teams', icon: Users },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Invitations', href: '/invitations', icon: UserPlus },
    { name: 'Org Settings', href: '/org-settings', icon: Settings },
    { name: 'Health Check', href: '/health', icon: Layers }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800/80 p-4 shrink-0 space-y-4">
        <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-600/30">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">WorkForge</span>
        </div>

        {/* Workspace Organization Switcher */}
        <div className="px-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-2">Active Workspace</p>
          <OrganizationSwitcher />
        </div>

        <nav className="flex-1 space-y-1 pt-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-slate-400 hover:text-slate-200"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="md:hidden w-44">
              <OrganizationSwitcher />
            </div>
            <h2 className="hidden md:block text-sm font-semibold text-slate-300">
              Welcome back, <span className="text-white font-bold">{user?.name}</span>
            </h2>
          </div>

          {/* Global Search Trigger Input */}
          <div className="flex-1 max-w-xs md:max-w-md mx-4">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-xl px-3 py-2 text-xs transition-colors shadow-inner"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500" />
                <span>Search tasks, projects, teams...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 bg-slate-800 text-[10px] text-slate-400 font-mono rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                )}
              </button>

              <NotificationPopover isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-700 border border-brand-500/40 flex items-center justify-center text-white text-xs font-bold uppercase">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user?.name?.slice(0, 2) || 'WF'
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-slate-200">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4 text-brand-400" />
                    Profile & Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <CommandPaletteModal
          orgId={activeOrgId || ''}
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
        />
      </div>
    </div>
  );
};
