export type Transaction = {
  id: string;
  date: string; 
  type: 'income' | 'expense';
  amount: number; 
  costPrice?: number;
  profit?: number;
  category: string;
  notes?: string;
  paymentMethod: 'cash' | 'bank' | 'mobile';
  yardsSold?: number;
  pricePerYard?: number;
  createdAt: number;
};

export type Due = {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  dueAmount: number;
  costPrice: number;
  date: string;
  notes?: string;
  paymentMethod: 'cash' | 'bank' | 'mobile';
  yardsSold?: number;
  pricePerYard?: number;
  userId: string;
  createdAt: number;
};

export const popularCategories = {
  income: ['পণ্য বিক্রয়', 'সেবা বিক্রয়', 'বিনিয়োগ', 'কমিশন', 'বাকি আদায়', 'অন্যান্য'],
  expense: ['পণ্য ক্রয়', 'দোকান ভাড়া', 'বিদ্যুৎ বিল', 'বেতন', 'পরিবহন', 'বাজার', 'অন্যান্য']
};