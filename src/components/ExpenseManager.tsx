import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, AlertTriangle, X } from 'lucide-react';
import { Expense, Category, UserProfile } from '../types';
import { useLanguage } from '../lib/LanguageContext';

interface ExpenseManagerProps {
  expenses: Expense[];
  categories: Category[];
  profile: UserProfile | null;
  onAddExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  onEditExpense: (id: string, data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export default function ExpenseManager({
  expenses,
  categories,
  profile,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onShowToast,
}: ExpenseManagerProps) {
  const { t } = useLanguage();
  const currencySymbol = profile?.currency || '$';

  // State
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form values
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter categories to only expense categories
  const expenseCategories = categories.filter((cat) => cat.type === 'expense');

  const openAddModal = () => {
    setTitle('');
    setAmount('');
    setCategory(expenseCategories[0]?.name || '');
    setDate(new Date().toISOString().substring(0, 10));
    setNote('');
    setEditingId(null);
    setIsOpenForm(true);
  };

  const openEditModal = (item: Expense) => {
    setTitle(item.title);
    setAmount(item.amount.toString());
    setCategory(item.category);
    setDate(item.date);
    setNote(item.note || '');
    setEditingId(item.id);
    setIsOpenForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast(t('expenses.fillFieldsError'), 'error');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      onShowToast(t('expenses.amountPositiveError'), 'error');
      return;
    }
    if (!category) {
      onShowToast(t('expenses.selectCategoryError'), 'error');
      return;
    }
    if (!date) {
      onShowToast(t('expenses.fillFieldsError'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataPayload = {
        title: title.trim(),
        amount: parsedAmount,
        category,
        date,
        note: note.trim() || undefined,
      };

      if (editingId) {
        await onEditExpense(editingId, dataPayload);
        onShowToast(t('expenses.editSuccess'), 'success');
      } else {
        await onAddExpense(dataPayload);
        onShowToast(t('expenses.addSuccess'), 'success');
      }
      setIsOpenForm(false);
    } catch (err) {
      console.error(err);
      onShowToast(t('expenses.fillFieldsError'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await onDeleteExpense(deletingId);
      onShowToast(t('expenses.deleteSuccess'), 'success');
    } catch (err) {
      console.error(err);
      onShowToast(t('expenses.deleteConfirmTitle'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-semibold text-[#111827] text-lg">{t('expenses.title')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('expenses.description')}</p>
        </div>
        <button
          id="btn-open-add-expense"
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4338CA] transition-all focus:outline-none cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t('expenses.addNew')}
        </button>
      </div>

      {/* Main Expense History Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
              <Calendar className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg">{t('expenses.emptyState')}</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {t('dashboard.noTransactionsYet')}
            </p>
            <button
              id="btn-empty-state-add-expense"
              onClick={openAddModal}
              className="mt-5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-[#4F46E5] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t('expenses.addNew')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  <th className="py-3 px-6">{t('transactions.colTitle')}</th>
                  <th className="py-3 px-4">{t('common.category')}</th>
                  <th className="py-3 px-4">{t('common.date')}</th>
                  <th className="py-3 px-4">{t('common.note')}</th>
                  <th className="py-3 px-4 text-right">{t('common.amount')}</th>
                  <th className="py-3 px-6 text-center">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-700">
                      <td className="py-4 px-6 font-semibold text-[#111827]">{item.title}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-[#DC2626]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">{item.date}</td>
                      <td className="py-4 px-4 max-w-[200px] truncate text-slate-500 text-xs">
                        {item.note || <span className="text-slate-300 italic">{t('transactions.colNote')}</span>}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#DC2626] text-right">
                        -{currencySymbol}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`btn-edit-expense-${item.id}`}
                            onClick={() => openEditModal(item)}
                            title={t('common.edit')}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-expense-${item.id}`}
                            onClick={() => setDeletingId(item.id)}
                            title={t('common.delete')}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors focus:outline-none cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over / Modal Form */}
      {isOpenForm && (
        <div id="expense-form-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs animate-fade-in" onClick={() => setIsOpenForm(false)} />
          <div className="relative bg-white rounded-xl max-w-lg w-full p-6 border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#111827]">
                {editingId ? t('expenses.editTitle') : t('expenses.addNew')}
              </h3>
              <button
                id="btn-close-expense-modal"
                onClick={() => setIsOpenForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                  {t('transactions.colTitle')} *
                </label>
                <input
                  id="expense-input-title"
                  type="text"
                  required
                  placeholder={t('expenses.titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                    {t('common.amount')} ({currencySymbol}) *
                  </label>
                  <input
                    id="expense-input-amount"
                    type="number"
                    step="0.01"
                    required
                    placeholder={t('expenses.amountPlaceholder')}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                    {t('common.category')} *
                  </label>
                  <select
                    id="expense-input-category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="" disabled>{t('expenses.categorySelect')}</option>
                    {expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                  {t('common.date')} *
                </label>
                <input
                  id="expense-input-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
                  {t('common.note')}
                </label>
                <textarea
                  id="expense-input-note"
                  rows={3}
                  placeholder={t('expenses.optionalDetails')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  id="btn-cancel-expense-form"
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  id="btn-save-expense-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#4F46E5] text-sm font-medium text-white hover:bg-[#4338CA] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isSubmitting ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {deletingId && (
        <div id="delete-expense-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs animate-fade-in" onClick={() => setDeletingId(null)} />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-150 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-[#DC2626]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-[#111827]">{t('expenses.deleteConfirmTitle')}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {t('expenses.deleteConfirmDescription')}
              </p>
            </div>

            <div className="flex gap-3 w-full justify-center mt-2">
              <button
                id="btn-delete-expense-abort"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                id="btn-delete-expense-confirm"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 rounded-lg bg-[#DC2626] text-sm font-medium text-white hover:bg-[#B91C1C] transition-colors cursor-pointer"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
