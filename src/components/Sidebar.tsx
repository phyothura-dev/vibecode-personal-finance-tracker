import { LayoutDashboard, ArrowUpRight, ArrowDownRight, FolderTree, ArrowLeftRight, UserCircle, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../lib/LanguageContext';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  profile: UserProfile | null;
  onSignOut: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  currentTab,
  onChangeTab,
  profile,
  onSignOut,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'incomes', label: t('nav.income'), icon: ArrowUpRight },
    { id: 'expenses', label: t('nav.expenses'), icon: ArrowDownRight },
    { id: 'categories', label: t('nav.categories'), icon: FolderTree },
    { id: 'transactions', label: t('nav.transactions'), icon: ArrowLeftRight },
    { id: 'profile', label: t('nav.profile'), icon: UserCircle },
  ];

  const handleTabClick = (tabId: string) => {
    onChangeTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header/Logo */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-200">
          <div style={{ width: '24px', height: '24px', background: '#4F46E5', borderRadius: '6px' }} />
          <span className="text-[20px] font-bold text-[#4F46E5] tracking-tight font-sans">
            FinTrack
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                id={`sidebar-item-${item.id}`}
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F3F4F6] text-[#4F46E5]'
                    : 'text-[#4B5563] hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent
                  className={`h-4.5 w-4.5 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile Info & Sign Out */}
        <div className="border-t border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <img
              id="sidebar-user-avatar"
              src={profile?.photoURL || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
              referrerPolicy="no-referrer"
              alt="Profile"
              className="h-8 w-8 rounded-full border border-slate-100 object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-slate-900">
                {profile?.fullName || 'User'}
              </p>
              <p className="truncate text-xs text-[#6B7280]">
                {profile?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          
          <button
            id="sidebar-btn-signout"
            onClick={onSignOut}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="h-5 w-5 text-rose-400" />
            {t('nav.signOut')}
          </button>
        </div>
      </aside>
    </>
  );
}
