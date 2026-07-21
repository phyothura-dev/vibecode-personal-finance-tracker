import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PlusCircle,
  Folder,
  ArrowRight,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Income, Expense, UserProfile, Transaction } from '../types';
import { useLanguage } from '../lib/LanguageContext';

interface DashboardProps {
  incomes: Income[];
  expenses: Expense[];
  profile: UserProfile | null;
  onChangeTab: (tab: string) => void;
}

export default function Dashboard({ incomes, expenses, profile, onChangeTab }: DashboardProps) {
  const { t } = useLanguage();
  const currencySymbol = 'Ks ';

  // 1. Calculations
  const totals = useMemo(() => {
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
    };
  }, [incomes, expenses]);

  // 2. Combined and sorted transactions (Recent 5)
  const recentTransactions = useMemo(() => {
    const combined: Transaction[] = [
      ...incomes.map((inc) => ({ ...inc, type: 'income' as const })),
      ...expenses.map((exp) => ({ ...exp, type: 'expense' as const })),
    ];
    // Sort by date (newest first), then by createdAt (newest first)
    return combined
      .sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);
  }, [incomes, expenses]);

  // 3. Month grouping for Bar Chart (Last 6 months)
  const monthlyChartData = useMemo(() => {
    const months = [
      t('dashboard.monthJan'), t('dashboard.monthFeb'), t('dashboard.monthMar'),
      t('dashboard.monthApr'), t('dashboard.monthMay'), t('dashboard.monthJun'),
      t('dashboard.monthJul'), t('dashboard.monthAug'), t('dashboard.monthSep'),
      t('dashboard.monthOct'), t('dashboard.monthNov'), t('dashboard.monthDec')
    ];

    const rawMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Generate last 6 months keys (e.g. "2026-07")
    const chartDataMap: { [key: string]: { monthName: string; income: number; expense: number; sortKey: string } } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      chartDataMap[key] = {
        monthName: `${months[monthIndex]} ${String(year).substring(2)}`,
        income: 0,
        expense: 0,
        sortKey: key
      };
    }

    // Accumulate incomes
    incomes.forEach((inc) => {
      const key = inc.date.substring(0, 7); // "YYYY-MM"
      if (chartDataMap[key]) {
        chartDataMap[key].income += inc.amount;
      }
    });

    // Accumulate expenses
    expenses.forEach((exp) => {
      const key = exp.date.substring(0, 7); // "YYYY-MM"
      if (chartDataMap[key]) {
        chartDataMap[key].expense += exp.amount;
      }
    });

    return Object.values(chartDataMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [incomes, expenses, t]);

  // 4. Expense by Category for Pie Chart
  const categoryChartData = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach((exp) => {
      const cat = exp.category || 'Uncategorized';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
    });

    const totalExpense = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);

    const data = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      percentage: totalExpense > 0 ? Math.round((value / totalExpense) * 100) : 0,
    }));

    // Sort descending by amount
    return data.sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Pie chart theme colors
  const COLORS = [
    '#6366f1', // indigo-500
    '#06b6d4', // cyan-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // rose-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#3b82f6'  // blue-500
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Balance Card */}
        <div id="card-total-balance" className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6" style={{ paddingLeft: '21px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#6B7280] mb-2">{t('dashboard.totalBalance')}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {totals.balance < 0 ? '-' : ''}
                {currencySymbol}
                {Math.abs(totals.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${
              totals.balance >= 0 ? 'bg-indigo-600' : 'bg-rose-600'
            }`}>
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-y-1 text-xs text-slate-500">
            <span className={totals.balance >= 0 ? 'text-[#059669] font-semibold' : 'text-[#DC2626] font-semibold'}>
              {totals.balance >= 0 ? t('dashboard.safe') : t('dashboard.deficit')}
            </span>
            <span className="ml-2">{t('dashboard.netPosition')}</span>
          </div>
        </div>

        {/* Income Card */}
        <div id="card-total-income" className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#6B7280] mb-2">{t('dashboard.totalIncome')}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-[#059669] tracking-tight">
                {currencySymbol}
                {totals.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-y-1 text-xs text-slate-500">
            <button
              id="dash-link-add-income"
              onClick={() => onChangeTab('incomes')}
              className="flex items-center gap-1 font-semibold text-[#059669] hover:underline cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" /> {t('dashboard.addIncomeShortcut')}
            </button>
            <span className="mx-2 text-slate-300">•</span>
            <span>{t('dashboard.allEntries')}</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div id="card-total-expenses" className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-[#6B7280] mb-2">{t('dashboard.totalExpenses')}</p>
              <h3 className="text-xl sm:text-2xl font-bold text-[#DC2626] tracking-tight">
                {currencySymbol}
                {totals.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500 text-white">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-y-1 text-xs text-slate-500">
            <button
              id="dash-link-add-expense"
              onClick={() => onChangeTab('expenses')}
              className="flex items-center gap-1 font-semibold text-[#DC2626] hover:underline cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" /> {t('dashboard.addExpenseShortcut')}
            </button>
            <span className="mx-2 text-slate-300">•</span>
            <span>{t('dashboard.allEntries')}</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Income vs Expense Chart */}
        <div id="card-monthly-chart" className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2 flex flex-col h-[380px]">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-[#111827] text-[15px]">{t('dashboard.sixMonthTrend')}</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-sm" />
                <span className="text-slate-500 font-medium">{t('transactions.incomeType')}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 bg-rose-400 rounded-sm" />
                <span className="text-slate-500 font-medium">{t('transactions.expenseType')}</span>
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            {incomes.length === 0 && expenses.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <Activity className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">{t('dashboard.noChartData')}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                    formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="income" fill="#4F46E5" radius={[3, 3, 0, 0]} barSize={14} />
                  <Bar dataKey="expense" fill="#DC2626" radius={[3, 3, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div id="card-category-chart" className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col h-[380px]">
          <h4 className="mb-4 font-semibold text-[#111827] text-[15px]">{t('dashboard.spendingDistribution')}</h4>
          <div className="flex-1 min-h-0 flex flex-col justify-center">
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <Folder className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">{t('dashboard.noCategoriesYet')}</p>
              </div>
            ) : (
              <>
                <div className="h-44 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, t('common.amount')]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('dashboard.totalSpent')}</span>
                    <span className="text-lg font-bold text-slate-800">
                      {currencySymbol}
                      {totals.totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Simplified Scrollable Categorized list */}
                <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 max-h-36 scrollbar-thin">
                  {categoryChartData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="truncate text-slate-700">{entry.name}</span>
                      </div>
                      <div className="text-slate-500 flex-shrink-0">
                        {currencySymbol}{entry.value.toLocaleString()} <span className="text-slate-400 text-[10px]">({entry.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                  {categoryChartData.length > 4 && (
                    <p className="text-[10px] text-center text-slate-400 font-medium">
                      {t('dashboard.moreCategories', { count: categoryChartData.length - 4 })}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Bottom overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Transactions Panel */}
        <div id="card-recent-transactions" className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-[#111827] text-[15px]">{t('dashboard.recentActivities')}</h4>
            <button
              id="dash-btn-view-all-tx"
              onClick={() => onChangeTab('transactions')}
              className="flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:underline cursor-pointer"
            >
              {t('dashboard.viewHistory')} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <Calendar className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">{t('dashboard.noTransactionsYet')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-hidden">
                {recentTransactions.map((tx) => (
                  <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg font-bold ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-[#059669]'
                          : 'bg-rose-50/70 text-[#DC2626]'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp className="h-4.5 w-4.5" /> : <TrendingDown className="h-4.5 w-4.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{tx.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium text-slate-600 uppercase">
                            {tx.category}
                          </span>
                          <span>•</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-[#059669]' : 'text-slate-800'}`}>
                        {tx.type === 'income' ? '+' : '-'}
                        {currencySymbol}
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {tx.note && (
                        <p className="truncate text-[10px] text-slate-400 max-w-[150px] mt-0.5">
                          {tx.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Financial Health Tips or Mini Summary */}
        <div id="card-financial-health" className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-[#111827] text-[15px] mb-3 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-[#4F46E5]" />
              {t('dashboard.financialHealth')}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('dashboard.financialHealthDesc')}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>{t('dashboard.savingsRate')}</span>
                  <span>
                    {totals.totalIncome > 0
                      ? `${Math.round((totals.balance / totals.totalIncome) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      totals.balance >= 0 ? 'bg-[#059669]' : 'bg-[#DC2626]'
                    }`}
                    style={{
                      width: `${
                        totals.totalIncome > 0
                          ? Math.max(0, Math.min(100, Math.round((totals.balance / totals.totalIncome) * 100)))
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>{t('dashboard.expensesVsIncome')}</span>
                  <span>
                    {totals.totalIncome > 0
                      ? `${Math.round((totals.totalExpense / totals.totalIncome) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden relative">
                  <div
                    className="bg-[#4F46E5] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        totals.totalIncome > 0
                          ? Math.min(100, Math.round((totals.totalExpense / totals.totalIncome) * 100))
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-slate-50 border border-slate-100 rounded-lg flex gap-2 items-start">
            <AlertCircle className="w-4.5 h-4.5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-normal">
              {totals.balance < 0 ? (
                <span className="font-semibold text-[#DC2626]">
                  {t('dashboard.warningExpensesExceed')}
                </span>
              ) : totals.totalIncome === 0 ? (
                <span>{t('dashboard.logToAnalyze')}</span>
              ) : totals.balance / totals.totalIncome > 0.2 ? (
                <span className="font-semibold text-[#059669]">
                  {t('dashboard.savingMoreThan20')}
                </span>
              ) : (
                <span>{t('dashboard.savingHealthy')}</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
