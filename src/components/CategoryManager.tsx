import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, AlertCircle } from 'lucide-react';
import { Category, CategoryType } from '../types';
import { useLanguage } from '../lib/LanguageContext';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, type: CategoryType) => Promise<void>;
  onRenameCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export default function CategoryManager({
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onShowToast,
}: CategoryManagerProps) {
  const { t } = useLanguage();

  // Tabs: 'income' or 'expense'
  const [activeType, setActiveType] = useState<CategoryType>('income');
  
  // New category name state
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Deleting confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered categories
  const filteredCategories = categories.filter((cat) => cat.type === activeType);

  const getTypeName = (type: CategoryType) => {
    return type === 'income' ? t('transactions.incomeType') : t('transactions.expenseType');
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      onShowToast(t('categories.nameNotEmpty'), 'error');
      return;
    }

    // Check if duplicate name in active type
    const duplicate = categories.some(
      (cat) => cat.type === activeType && cat.name.toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (duplicate) {
      onShowToast(t('categories.duplicateError', { type: getTypeName(activeType), name: newCatName.trim() }), 'error');
      return;
    }

    setIsAdding(true);
    try {
      await onAddCategory(newCatName.trim(), activeType);
      onShowToast(t('categories.createSuccess', { name: newCatName.trim() }), 'success');
      setNewCatName('');
    } catch (err) {
      console.error(err);
      onShowToast(t('categories.createFail'), 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveRename = async (id: string) => {
    if (!editingName.trim()) {
      onShowToast(t('categories.nameNotEmpty'), 'error');
      return;
    }

    // Check duplicate
    const duplicate = categories.some(
      (cat) => cat.id !== id && cat.type === activeType && cat.name.toLowerCase() === editingName.trim().toLowerCase()
    );
    if (duplicate) {
      onShowToast(t('categories.duplicateError', { type: getTypeName(activeType), name: editingName.trim() }), 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      await onRenameCategory(id, editingName.trim());
      onShowToast(t('categories.renameSuccess'), 'success');
      setEditingId(null);
    } catch (err) {
      console.error(err);
      onShowToast(t('categories.renameFail'), 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await onDeleteCategory(id);
      onShowToast(t('categories.deleteSuccess'), 'success');
    } catch (err) {
      console.error(err);
      onShowToast(t('categories.deleteFail'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-slate-800 text-sm">{t('categories.bannerTitle')}</h3>
          <p className="text-xs text-slate-400 mt-1">{t('categories.bannerDescription')}</p>
        </div>

        {/* Toggle tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            id="tab-income-categories"
            onClick={() => {
              setActiveType('income');
              setEditingId(null);
            }}
            className={`pb-3 text-sm font-medium border-b-2 px-4 transition-all cursor-pointer ${
              activeType === 'income'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('categories.incomeTab')}
          </button>
          <button
            id="tab-expense-categories"
            onClick={() => {
              setActiveType('expense');
              setEditingId(null);
            }}
            className={`pb-3 text-sm font-medium border-b-2 px-4 transition-all cursor-pointer ${
              activeType === 'expense'
                ? 'border-[#4F46E5] text-[#4F46E5]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('categories.expenseTab')}
          </button>
        </div>

        {/* Create Form */}
        <form onSubmit={handleAddCategory} className="flex gap-3 mb-6 max-w-md">
          <input
            id="category-input-name"
            type="text"
            required
            placeholder={t('categories.inputPlaceholder', { type: getTypeName(activeType) })}
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-440 focus:outline-none focus:border-indigo-500 text-sm focus:ring-1 focus:ring-indigo-500 bg-white transition-colors"
          />
          <button
            id="btn-add-category"
            type="submit"
            disabled={isAdding}
            className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4338CA] transition-colors focus:outline-none flex-shrink-0 cursor-pointer"
          >
            {isAdding ? t('common.adding') : t('common.add')}
          </button>
        </form>

        {/* Categories List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            {t('categories.activeClassifications', { type: getTypeName(activeType) })}
          </h4>
          
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              {t('categories.emptyGroup')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg transition-all"
                >
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        id={`input-rename-category-${cat.id}`}
                        type="text"
                        required
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        id={`btn-save-rename-${cat.id}`}
                        onClick={() => handleSaveRename(cat.id)}
                        disabled={isSavingEdit}
                        className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 focus:outline-none cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-cancel-rename-${cat.id}`}
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded-md text-slate-400 hover:bg-slate-200 focus:outline-none cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-800 truncate">{cat.name}</span>
                      
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          id={`btn-start-rename-${cat.id}`}
                          onClick={() => handleStartEdit(cat)}
                          title={t('common.edit')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors focus:outline-none cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-trigger-delete-${cat.id}`}
                          onClick={() => setDeletingId(cat.id)}
                          title={t('common.delete')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {deletingId && (
        <div id="delete-category-confirm-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs animate-fade-in" onClick={() => setDeletingId(null)} />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-150 shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-[#DC2626]">
              <Trash2 className="w-5 h-5" />
            </div>
            
            <div>
              <h3 className="text-base font-semibold text-[#111827]">{t('categories.deleteConfirmTitle')}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {t('categories.deleteConfirmDescription')}
              </p>
            </div>

            <div className="flex gap-3 w-full justify-center mt-2">
              <button
                id="btn-delete-category-abort"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                id="btn-delete-category-confirm"
                onClick={() => handleDeleteCategory(deletingId)}
                className="flex-1 py-2 rounded-lg bg-[#DC2626] text-sm font-medium text-white hover:bg-[#B91C1C] transition-colors cursor-pointer"
              >
                {t('categories.deleteButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
