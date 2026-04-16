import { create } from 'zustand';
import { Transaction, Due } from '../types';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface KhataStore {
  transactions: Transaction[];
  dues: Due[];
  setTransactions: (txs: Transaction[]) => void;
  setDues: (dues: Due[]) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'profit'>) => Promise<void>;
  addDue: (due: Omit<Due, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  payDue: (dueId: string, payAmount: number) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteDue: (id: string) => Promise<void>;
  getTotalSales: () => number;
  getTotalExpense: () => number;
  getTotalProfit: () => number;
  getBalance: () => number;
  getTodayTransactions: () => Transaction[];
}

export const useKhataStore = create<KhataStore>((set, get) => ({
  transactions: [],
  dues: [],
  setTransactions: (txs) => set({ transactions: txs }),
  setDues: (dues) => set({ dues }),

  addTransaction: async (tx) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const profit = tx.type === 'income' ? (tx.amount - (tx.costPrice || 0)) : 0;
    await addDoc(collection(db, 'users', userId, 'transactions'), {
      ...tx, userId, profit, createdAt: Date.now(),
    });
  },

  addDue: async (dueData) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await addDoc(collection(db, 'users', userId, 'dues'), {
      ...dueData, userId, createdAt: Date.now(),
    });
  },

  payDue: async (dueId, payAmount) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const targetDue = get().dues.find(d => d.id === dueId);
    if (!targetDue) return;

    const newDueAmount = targetDue.dueAmount - payAmount;
    const dueRef = doc(db, 'users', userId, 'dues', dueId);
    
    if (newDueAmount <= 0) await deleteDoc(dueRef);
    else await updateDoc(dueRef, { dueAmount: newDueAmount });

    const proportionalCost = (targetDue.costPrice / targetDue.totalAmount) * payAmount;
    await addDoc(collection(db, 'users', userId, 'transactions'), {
      date: new Date().toISOString().split("T")[0],
      type: 'income',
      amount: payAmount,
      costPrice: proportionalCost,
      profit: payAmount - proportionalCost,
      category: 'বাকি আদায়',
      notes: `${targetDue.customerName} এর বাকি পরিশোধ`,
      createdAt: Date.now(),
      userId
    });
  },

  updateTransaction: async (id, tx) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const docRef = doc(db, 'users', userId, 'transactions', id);
    await updateDoc(docRef, tx);
  },

  deleteTransaction: async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'transactions', id));
  },

  deleteDue: async (id) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'dues', id));
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