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

export type WalletType = 'kbz_pay' | 'wave_pay' | 'cb_pay' | 'mab_bank' | 'yoma_bank';

export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  kbz_pay: 'KBZPay',
  wave_pay: 'WavePay',
  cb_pay: 'CBPay',
  mab_bank: 'MAB Bank',
  yoma_bank: 'Yoma Bank',
};

export function getWalletLabel(type: string, fallbackName?: string): string {
  if (type in WALLET_TYPE_LABELS) {
    return WALLET_TYPE_LABELS[type as WalletType];
  }
  return fallbackName || type;
}

export interface Wallet {
  id: string;
  type: WalletType;
  initialBalance: number;
  name?: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  date: string; // 'YYYY-MM-DD'
  createdAt: string;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  category: string; // Stored as name or ID, we will store category name for stability and custom entries
  date: string; // 'YYYY-MM-DD'
  walletId?: string;
  note?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // 'YYYY-MM-DD'
  walletId?: string;
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
  walletId?: string;
  note?: string;
  createdAt: string;
}
