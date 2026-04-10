export type Transaction = {
  id: string;
  date: string; 
  type: 'income' | 'expense';
  amount: number; 
  costPrice?: number;
  profit?: number;
  category: string;
  notes?: string;
  createdAt: number; 
};

export const popularCategories = {
  income: ['পণ্য বিক্রয়', 'সেবা বিক্রয়', 'বিনিয়োগ', 'কমিশন', 'অন্যান্য'],
  expense: ['পণ্য ক্রয়', 'দোকান ভাড়া', 'বিদ্যুৎ বিল', 'বেতন', 'পরিবহন', 'বাজার', 'অন্যান্য']
};