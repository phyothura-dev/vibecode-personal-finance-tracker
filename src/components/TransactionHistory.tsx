import { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  X
} from 'lucide-react';
import { Income, Expense, Category, UserProfile, Transaction } from '../types';

interface TransactionHistoryProps {
  incomes: Income[];
  expenses: Expense[];
  categories: Category[];
  profile: UserProfile | null;
}

export default function TransactionHistory({
  incomes,
  expenses,
  categories: _categories,
  profile: _profile,
}: TransactionHistoryProps) {
  const currencySymbol = 'Ks ';

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Unified lists
  const allTransactions = useMemo(() => {
    const list: Transaction[] = [
      ...incomes.map((inc) => ({ ...inc, type: 'income' as const })),
      ...expenses.map((exp) => ({ ...exp, type: 'expense' as const })),
    ];
    return list;
  }, [incomes, expenses]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    let list = [...allTransactions];

    // 1. Search text
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (tx) =>
          tx.title.toLowerCase().includes(q) ||
          (tx.note && tx.note.toLowerCase().includes(q))
      );
    }

    // 2. Type Filter
    if (typeFilter !== 'all') {
      list = list.filter((tx) => tx.type === typeFilter);
    }

    // 3. Date range filter
    if (startDate) {
      list = list.filter((tx) => tx.date >= startDate);
    }
    if (endDate) {
      list = list.filter((tx) => tx.date <= endDate);
    }

    // 4. Default sort (newest first)
    list.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const diff = dateB - dateA;
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [allTransactions, search, typeFilter, startDate, endDate]);

  // Clear filters helper
  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter bar card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 sm:top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="tx-search-input"
              type="text"
              placeholder="မှတ်တမ်းများကို ရှာဖွေပါ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-base sm:text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            <button
              id="tx-filter-type-all"
              onClick={() => setTypeFilter('all')}
              className={`flex-1 text-center py-2 sm:py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer min-h-[38px] sm:min-h-0 flex items-center justify-center ${
                typeFilter === 'all'
                  ? 'bg-white text-[#4F46E5] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              အားလုံး
            </button>
            <button
              id="tx-filter-type-income"
              onClick={() => setTypeFilter('income')}
              className={`flex-1 text-center py-2 sm:py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer min-h-[38px] sm:min-h-0 flex items-center justify-center ${
                typeFilter === 'income'
                  ? 'bg-white text-[#059669] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ဝင်ငွေ
            </button>
            <button
              id="tx-filter-type-expense"
              onClick={() => setTypeFilter('expense')}
              className={`flex-1 text-center py-2 sm:py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer min-h-[38px] sm:min-h-0 flex items-center justify-center ${
                typeFilter === 'expense'
                  ? 'bg-white text-[#DC2626] shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ထွက်ငွေ
            </button>
          </div>
        </div>

        {/* Date range filter options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-100">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              စတင်ရက်
            </label>
            <input
              id="tx-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 sm:py-1.5 border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm sm:text-xs focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              ပြီးဆုံးရက်
            </label>
            <input
              id="tx-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 sm:py-1.5 border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm sm:text-xs focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Reset filters row */}
        {(search || typeFilter !== 'all' || startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button
              id="btn-clear-tx-filters"
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-[#DC2626] hover:text-[#B91C1C] focus:outline-none transition-colors cursor-pointer py-1"
            >
              <X className="w-3.5 h-3.5" /> စစ်ထုတ်မှုများ ဖျက်မည်
            </button>
          </div>
        )}
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 text-base">မှတ်တမ်း မတွေ့ရှိပါ</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              ရွေးချယ်ထားသော စစ်ထုတ်မှုများနှင့် ကိုက်ညီသော မှတ်တမ်း မရှိပါ။
            </p>
            {allTransactions.length > 0 && (
              <button
                id="btn-reset-filters-empty-state"
                onClick={handleClearFilters}
                className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                စစ်ထုတ်မှုများ ဖျက်မည်
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    <th className="py-3.5 px-6">အမျိုးအစား</th>
                    <th className="py-3.5 px-4">ခေါင်းစဉ်</th>
                    <th className="py-3.5 px-4">ခေါင်းစဉ်အုပ်စု</th>
                    <th className="py-3.5 px-4">ရက်စွဲ</th>
                    <th className="py-3.5 px-4">မှတ်ချက်</th>
                    <th className="py-3.5 px-6 text-right">ပမာဏ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/40 transition-colors text-sm text-slate-700">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-[#059669]'
                            : 'bg-rose-50 text-[#DC2626]'
                        }`}>
                          {tx.type === 'income' ? (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#059669]" />
                              ဝင်ငွေ
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5 text-[#DC2626]" />
                              ထွက်ငွေ
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#111827]">{tx.title}</td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500">{tx.date}</td>
                      <td className="py-4 px-4 text-xs text-slate-400 italic max-w-[200px] truncate">
                        {tx.note || <span className="text-slate-250">-</span>}
                      </td>
                      <td className={`py-4 px-6 text-right font-semibold ${
                        tx.type === 'income' ? 'text-[#059669]' : 'text-[#DC2626]'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}
                        {currencySymbol}
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <div key={`${tx.type}-${tx.id}`} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-[#059669]'
                            : 'bg-rose-50 text-[#DC2626]'
                        }`}>
                          {tx.type === 'income' ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-[#059669]" />
                              ဝင်ငွေ
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3 h-3 text-[#DC2626]" />
                              ထွက်ငွေ
                            </>
                          )}
                        </span>
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          {tx.category}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm break-words">{tx.title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{tx.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`font-bold text-base ${
                        tx.type === 'income' ? 'text-[#059669]' : 'text-[#DC2626]'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}
                        {currencySymbol}
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {tx.note && (
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5 italic break-words">
                      {tx.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
