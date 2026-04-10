import { create } from 'zustand';
import { Transaction } from '../types';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface KhataStore {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'profit' | 'userId'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTotalSales: () => number;
  getTotalExpense: () => number;
  getTotalProfit: () => number;
  getBalance: () => number;
  getTodayTransactions: () => Transaction[];
}

export const useKhataStore = create<KhataStore>((set, get) => ({
  transactions: [],
  setTransactions: (txs) => set({ transactions: txs }),

  addTransaction: (tx) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const profit = tx.type === 'income' ? (tx.amount - (tx.costPrice || 0)) : 0;
    addDoc(collection(db, 'users', userId, 'transactions'), {
      ...tx,
      userId,
      profit,
      createdAt: Date.now(),
    });
  },

  updateTransaction: async (id, tx) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const docRef = doc(db, 'users', userId, 'transactions', id);
    const updatedProfit = tx.type === 'income' ? (tx.amount! - (tx.costPrice || 0)) : 0;
    await updateDoc(docRef, { ...tx, profit: updatedProfit });
  },

  deleteTransaction: async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'transactions', id));
  },

  getTotalSales: () => get().transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
  getTotalExpense: () => get().transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  getTotalProfit: () => get().transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.profit || 0), 0),
  getBalance: () => get().getTotalSales() - get().getTotalExpense(),
  getTodayTransactions: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().transactions.filter((t) => t.date === today);
  },
}));