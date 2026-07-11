import { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { UserProfile, Category, Income, Expense } from './types';

// Components
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import IncomeManager from './components/IncomeManager';
import ExpenseManager from './components/ExpenseManager';
import CategoryManager from './components/CategoryManager';
import TransactionHistory from './components/TransactionHistory';
import ProfileManager from './components/ProfileManager';
import { ToastContainer, Toast } from './components/Toast';

import { Wallet, RefreshCw } from 'lucide-react';

export default function App() {
  // Auth & Session
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Navigation & Layout
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Loaders
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [dbError, setDbError] = useState<any>(null);

  // Notification Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const handleShowToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const handleCloseToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 1. Listen to Authentication changes & Subscribe to User Collections
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      setDbError(null);

      if (!currentUser) {
        setProfile(null);
        setCategories([]);
        setIncomes([]);
        setExpenses([]);
        setDataLoading(false);
        return;
      }

      // User logged in, begin real-time collection subscriptions
      setDataLoading(true);

      let loadedProfile = false;
      let loadedCategories = false;
      let loadedIncomes = false;
      let loadedExpenses = false;

      const checkLoadingFinished = () => {
        if (loadedProfile && loadedCategories && loadedIncomes && loadedExpenses) {
          setDataLoading(false);
        }
      };

      // A. Profile listener
      const unsubProfile = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
        try {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email || '',
              fullName: data.fullName || 'User',
              photoURL: data.photoURL || '',
              currency: data.currency || '$',
              monthlyIncomeGoal: data.monthlyIncomeGoal !== undefined ? data.monthlyIncomeGoal : null,
            });
          } else {
            // Fallback create profile in database if not populated
            const fallbackProfile = {
              fullName: currentUser.displayName || 'Finance Member',
              photoURL: currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.email || 'User')}`,
              currency: '$',
              monthlyIncomeGoal: null,
              email: currentUser.email || '',
            };
            await setDoc(doc(db, 'users', currentUser.uid), fallbackProfile);

            // Also seed default categories for new users
            const defaultCategories = [
              { name: 'Salary', type: 'income' },
              { name: 'Freelance', type: 'income' },
              { name: 'Bonus', type: 'income' },
              { name: 'Food', type: 'expense' },
              { name: 'Transport', type: 'expense' },
              { name: 'Shopping', type: 'expense' },
              { name: 'Bills', type: 'expense' },
              { name: 'Entertainment', type: 'expense' }
            ];
            for (const cat of defaultCategories) {
              const catId = cat.name.toLowerCase().replace(/\s+/g, '-');
              const catRef = doc(db, 'users', currentUser.uid, 'categories', catId);
              await setDoc(catRef, {
                name: cat.name,
                type: cat.type
              });
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
        }

        if (!loadedProfile) {
          loadedProfile = true;
          checkLoadingFinished();
        }
      }, (err) => {
        console.error("Firestore listener error for profile:", err);
        setDbError({
          message: err instanceof Error ? err.message : String(err),
          code: (err as any).code || 'unknown',
          path: `users/${currentUser.uid}`
        });
        setDataLoading(false);
      });

      // B. Categories listener
      const unsubCategories = onSnapshot(collection(db, 'users', currentUser.uid, 'categories'), (snapshot) => {
        const list: Category[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name || '',
            type: data.type || 'expense',
          });
        });
        setCategories(list);

        if (!loadedCategories) {
          loadedCategories = true;
          checkLoadingFinished();
        }
      }, (err) => {
        console.error("Firestore listener error for categories:", err);
        setDbError({
          message: err instanceof Error ? err.message : String(err),
          code: (err as any).code || 'unknown',
          path: `users/${currentUser.uid}/categories`
        });
        setDataLoading(false);
      });

      // C. Incomes listener
      const unsubIncomes = onSnapshot(collection(db, 'users', currentUser.uid, 'incomes'), (snapshot) => {
        const list: Income[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            amount: data.amount || 0,
            category: data.category || '',
            date: data.date || '',
            note: data.note,
            createdAt: data.createdAt || '',
          });
        });
        setIncomes(list);

        if (!loadedIncomes) {
          loadedIncomes = true;
          checkLoadingFinished();
        }
      }, (err) => {
        console.error("Firestore listener error for incomes:", err);
        setDbError({
          message: err instanceof Error ? err.message : String(err),
          code: (err as any).code || 'unknown',
          path: `users/${currentUser.uid}/incomes`
        });
        setDataLoading(false);
      });

      // D. Expenses listener
      const unsubExpenses = onSnapshot(collection(db, 'users', currentUser.uid, 'expenses'), (snapshot) => {
        const list: Expense[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            amount: data.amount || 0,
            category: data.category || '',
            date: data.date || '',
            note: data.note,
            createdAt: data.createdAt || '',
          });
        });
        setExpenses(list);

        if (!loadedExpenses) {
          loadedExpenses = true;
          checkLoadingFinished();
        }
      }, (err) => {
        console.error("Firestore listener error for expenses:", err);
        setDbError({
          message: err instanceof Error ? err.message : String(err),
          code: (err as any).code || 'unknown',
          path: `users/${currentUser.uid}/expenses`
        });
        setDataLoading(false);
      });

      return () => {
        unsubProfile();
        unsubCategories();
        unsubIncomes();
        unsubExpenses();
      };
    });

    return () => unsubAuth();
  }, []);

  // 2. Auth handlers
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      handleShowToast('Signed out successfully.', 'info');
      setCurrentTab('dashboard');
    } catch (err) {
      console.error(err);
      handleShowToast('Failed to sign out. Try again.', 'error');
    }
  };

  // 3. Database operations
  const handleAddIncome = async (data: Omit<Income, 'id' | 'createdAt'>) => {
    if (!user) return;
    const path = `users/${user.uid}/incomes`;
    try {
      await addDoc(collection(db, 'users', user.uid, 'incomes'), {
        ...data,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleEditIncome = async (id: string, data: Omit<Income, 'id' | 'createdAt'>) => {
    if (!user) return;
    const path = `users/${user.uid}/incomes/${id}`;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'incomes', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/incomes/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'incomes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleAddExpense = async (data: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) return;
    const path = `users/${user.uid}/expenses`;
    try {
      await addDoc(collection(db, 'users', user.uid, 'expenses'), {
        ...data,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleEditExpense = async (id: string, data: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) return;
    const path = `users/${user.uid}/expenses/${id}`;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'expenses', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/expenses/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleAddCategory = async (name: string, type: 'income' | 'expense') => {
    if (!user) return;
    const catId = name.toLowerCase().trim().replace(/\s+/g, '-');
    const path = `users/${user.uid}/categories/${catId}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'categories', catId), {
        name: name.trim(),
        type,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const handleRenameCategory = async (id: string, name: string) => {
    if (!user) return;
    const path = `users/${user.uid}/categories/${id}`;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'categories', id), {
        name: name.trim(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/categories/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Compute total income achieved for the current month
  const totalIncomeForCurrentMonth = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"
    return incomes
      .filter((inc) => inc.date.startsWith(currentYearMonth))
      .reduce((sum, item) => sum + item.amount, 0);
  }, [incomes]);

  // Loading indicator for Auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-150 mb-4 animate-bounce">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          Loading secure session...
        </div>
      </div>
    );
  }

  // Unauthenticated layout
  if (!user) {
    return (
      <>
        <Auth onShowToast={handleShowToast} />
        <ToastContainer toasts={toasts} onClose={handleCloseToast} />
      </>
    );
  }

  // Firestore Error troubleshooter
  if (dbError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 md:p-12">
        <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Database Connection Trouble</h2>
              <p className="text-xs text-slate-500 font-medium">FinTrack secure synchronization could not be established</p>
            </div>
          </div>

          <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-rose-900 flex items-center gap-1.5">
              <span>🚨</span> Firestore error code: <code className="bg-rose-100 px-1 py-0.5 rounded font-mono text-xs">{dbError.code}</code>
            </p>
            <p className="text-xs text-rose-800 leading-relaxed font-mono whitespace-pre-wrap break-all">
              {dbError.message}
            </p>
            {dbError.path && (
              <p className="text-[11px] text-slate-500">
                Attempted path: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs text-slate-700">{dbError.path}</code>
              </p>
            )}
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <h3 className="font-bold text-slate-900 text-sm">Most Common Solutions:</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">1</span>
                <div>
                  <p className="font-semibold text-slate-900">Create the Cloud Firestore Database</p>
                  <p className="text-slate-500 mt-0.5">
                    If this is a brand new Firebase project, Firestore might not be initialized yet. Go to your <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId}/firestore`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold">Firebase Console &gt; Build &gt; Firestore Database</a> and click <strong>Create database</strong>. Choose Native Mode and your preferred region.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">2</span>
                <div>
                  <p className="font-semibold text-slate-900">Deploy Firestore Security Rules</p>
                  <p className="text-slate-500 mt-0.5">
                    If you get a <code>permission-denied</code> error, your Firestore Rules are likely blocking read/write operations. In the <a href={`https://console.firebase.google.com/project/${auth.app.options.projectId}/firestore/rules`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-semibold">Rules tab</a> of your database, deploy standard rules.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">3</span>
                <div>
                  <p className="font-semibold text-slate-900">Check Database ID Mismatch</p>
                  <p className="text-slate-500 mt-0.5">
                    Your app is configured to use database ID: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-semibold">{auth.app.options.projectId}/(default)</code>. If your database is named something else, update it in your configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex justify-center py-2 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Data Synchronizer spinner
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-150 mb-4 animate-pulse">
          <Wallet className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          Synchronizing database logs...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F9FAFB]">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />

      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        profile={profile}
        onSignOut={handleSignOut}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main content frame */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          currentTab={currentTab}
          profile={profile}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          totalIncomeForMonth={totalIncomeForCurrentMonth}
        />

        {/* Scrollable layout sandbox */}
        <main className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin">
          <div className="mx-auto w-full max-w-7xl">
            {currentTab === 'dashboard' && (
              <Dashboard
                incomes={incomes}
                expenses={expenses}
                profile={profile}
                onChangeTab={setCurrentTab}
              />
            )}

            {currentTab === 'incomes' && (
              <IncomeManager
                incomes={incomes}
                categories={categories}
                profile={profile}
                onAddIncome={handleAddIncome}
                onEditIncome={handleEditIncome}
                onDeleteIncome={handleDeleteIncome}
                onShowToast={handleShowToast}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpenseManager
                expenses={expenses}
                categories={categories}
                profile={profile}
                onAddExpense={handleAddExpense}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                onShowToast={handleShowToast}
              />
            )}

            {currentTab === 'categories' && (
              <CategoryManager
                categories={categories}
                onAddCategory={handleAddCategory}
                onRenameCategory={handleRenameCategory}
                onDeleteCategory={handleDeleteCategory}
                onShowToast={handleShowToast}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionHistory
                incomes={incomes}
                expenses={expenses}
                categories={categories}
                profile={profile}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileManager
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onShowToast={handleShowToast}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
