import { Menu, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

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
  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'ပင်မ ခြုံငုံသုံးသပ်ချက်';
      case 'incomes':
        return 'ဝင်ငွေ စီမံခန့်ခွဲမှု';
      case 'expenses':
        return 'ထွက်ငွေ စီမံခန့်ခွဲမှု';
      case 'categories':
        return 'ကိုယ်ပိုင်အမျိုးအစားများ';
      case 'transactions':
        return 'စာရင်းမှတ်တမ်းအားလုံး';
      case 'profile':
        return 'ကိုယ်ရေးအချက်အလက် စီမံမှု';
      default:
        return 'SmartWallet';
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
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6 md:px-8"
    >
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          id="btn-toggle-mobile-sidebar"
          onClick={onOpenMobileSidebar}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden focus:outline-none flex-shrink-0 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 id="header-page-title" className="text-base sm:text-lg font-semibold text-[#111827] tracking-tight font-sans truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Stats/Badges Row */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Monthly Goal Progress Indicator (Desktop Accent) */}
        {isGoalSet && (
          <>
            <div className="hidden md:flex items-center gap-3 bg-[#EEF2FF] border border-indigo-100 rounded-lg px-3 py-1">
              <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
              <div className="text-xs">
                <span className="font-medium text-[#4F46E5]">
                  ရည်မှန်းချက်: {currencySymbol}
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

            {/* Mobile Goal badge */}
            <div className="flex md:hidden items-center gap-1.5 bg-[#EEF2FF] border border-indigo-100/80 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#4F46E5]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{goalProgressPercent}%</span>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

