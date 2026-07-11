export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  photoURL: string;
  currency: string;
  monthlyIncomeGoal: number | null;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  category: string; // Stored as name or ID, we will store category name for stability and custom entries
  date: string; // 'YYYY-MM-DD'
  note?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // 'YYYY-MM-DD'
  note?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
}
