import { Menu, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage } from '../lib/LanguageContext';

interface HeaderProps {
  currentTab: string;
  profile: UserProfile | null;
  onOpenMobileSidebar: () => void;
  totalIncomeForMonth?: number;
}

export default function Header({
  currentTab,
  profile,
  onOpenMobileSidebar,
  totalIncomeForMonth = 0,
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return t('header.dashboard');
      case 'incomes':
        return t('header.incomes');
      case 'expenses':
        return t('header.expenses');
      case 'categories':
        return t('header.categories');
      case 'transactions':
        return t('header.transactions');
      case 'profile':
        return t('header.profile');
      default:
        return t('common.appName');
    }
  };

  // Safe checks for currency
  const currencySymbol = 'Ks ';
  const monthlyGoal = profile?.monthlyIncomeGoal;
  const isGoalSet = monthlyGoal && monthlyGoal > 0;
  const goalProgressPercent = isGoalSet
    ? Math.min(100, Math.round((totalIncomeForMonth / monthlyGoal) * 100))
    : 0;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8"
    >
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-4">
        <button
          id="btn-toggle-mobile-sidebar"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 id="header-page-title" className="text-lg font-semibold text-[#111827] tracking-tight font-sans">
          {getPageTitle()}
        </h1>
      </div>

      {/* Stats/Badges Row */}
      <div className="flex items-center gap-3">
        {/* Language Switcher EN | MM */}
        <div id="language-switcher" className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 text-[11px] font-semibold h-7.5">
          <button
            id="btn-lang-en"
            onClick={() => setLanguage('en')}
            className={`px-2.5 h-full transition-colors flex items-center justify-center cursor-pointer ${
              language === 'en'
                ? 'bg-[#4F46E5] text-white font-bold'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            EN
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button
            id="btn-lang-mm"
            onClick={() => setLanguage('mm')}
            className={`px-2.5 h-full transition-colors flex items-center justify-center cursor-pointer ${
              language === 'mm'
                ? 'bg-[#4F46E5] text-white font-bold'
                : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            MM
          </button>
        </div>

        {/* Monthly Goal Progress Indicator (Header Accent) */}
        {isGoalSet && (
          <div className="hidden md:flex items-center gap-3 bg-[#EEF2FF] border border-indigo-100 rounded-lg px-3 py-1">
            <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
            <div className="text-xs">
              <span className="font-medium text-[#4F46E5]">
                {t('header.goal')}: {currencySymbol}
                {monthlyGoal.toLocaleString()}
              </span>
              <span className="text-slate-500 ml-1">({goalProgressPercent}%)</span>
              <div className="w-20 bg-slate-200 h-1 rounded-full mt-0.5 overflow-hidden">
                <div
                  className="bg-[#4F46E5] h-full rounded-full transition-all duration-500"
                  style={{ width: `${goalProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
