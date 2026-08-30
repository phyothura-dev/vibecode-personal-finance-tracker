import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Folder,
  ArrowRight,
  Activity,
  Calendar
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Balance Card */}
        <div id="card-total-balance" className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('dashboard.totalBalance')}</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              totals.balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {totals.balance < 0 ? '-' : ''}
              {currencySymbol}
              {Math.abs(totals.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Income Card */}
        <div id="card-total-income" className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('dashboard.totalIncome')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-emerald-600">
              {currencySymbol}
              {totals.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Expenses Card */}
        <div id="card-total-expenses" className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('dashboard.totalExpenses')}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <TrendingDown className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold tracking-tight text-rose-600">
              {currencySymbol}
              {totals.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Income vs Expense Chart */}
        <div id="card-monthly-chart" className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2 flex flex-col h-[360px]">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 text-sm">{t('dashboard.sixMonthTrend')}</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-sm" />
                <span className="text-slate-600 font-medium">{t('transactions.incomeType')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-sm" />
                <span className="text-slate-600 font-medium">{t('transactions.expenseType')}</span>
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
        <div id="card-category-chart" className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col h-[360px]">
          <h4 className="mb-4 font-semibold text-slate-900 text-sm">{t('dashboard.spendingDistribution')}</h4>
          <div className="flex-1 min-h-0 flex flex-col justify-center">
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <Folder className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">{t('dashboard.noCategoriesYet')}</p>
              </div>
            ) : (
              <>
                <div className="h-40 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
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
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{t('dashboard.totalSpent')}</span>
                    <span className="text-base font-bold text-slate-800">
                      {currencySymbol}
                      {totals.totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Categorized list */}
                <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 max-h-32 scrollbar-thin">
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div id="card-recent-transactions" className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="font-semibold text-slate-900 text-sm">{t('dashboard.recentActivities')}</h4>
          <button
            id="dash-btn-view-all-tx"
            onClick={() => onChangeTab('transactions')}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
          >
            {t('dashboard.viewHistory')} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div>
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8">
              <Calendar className="h-9 w-9 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">{t('dashboard.noTransactionsYet')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <div key={`${tx.type}-${tx.id}`} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg font-bold ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
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
                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
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
    </div>
  );
}
