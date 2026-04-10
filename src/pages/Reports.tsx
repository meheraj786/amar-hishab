import { useState, useMemo } from "react";
import { 
  startOfDay, endOfDay, startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, startOfYear, endOfYear, 
  isWithinInterval, format, parseISO 
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from "recharts";
import { useKhataStore } from "../store/useKhataStore";
import { 
  TrendingUp, PieChart as PieIcon, BarChart3, 
  ArrowUpRight, ArrowDownLeft, 
  ShoppingBag, Target 
} from "lucide-react";

type FilterType = "today" | "week" | "month" | "year" | "custom";

export default function Reports() {
  const { transactions } = useKhataStore();
  const [filterType, setFilterType] = useState<FilterType>("month");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;

    switch (filterType) {
      case "today":
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case "week":
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case "month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "year":
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case "custom":
        start = startOfDay(parseISO(selectedDate));
        end = endOfDay(parseISO(selectedDate));
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return transactions.filter((tx) => {
      const txDate = parseISO(tx.date);
      return isWithinInterval(txDate, { start, end });
    });
  }, [transactions, filterType, selectedDate]);

  const stats = useMemo(() => {
    const sales = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const profit = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.profit || 0), 0);
    const count = filteredTransactions.length;
    return { sales, expense, profit, count };
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, any> = {};
    filteredTransactions.forEach(tx => {
      if (!dataMap[tx.date]) dataMap[tx.date] = { date: format(parseISO(tx.date), "dd MMM"), sales: 0, profit: 0 };
      if (tx.type === 'income') {
        dataMap[tx.date].sales += tx.amount;
        dataMap[tx.date].profit += (tx.profit || 0);
      }
    });
    return Object.values(dataMap);
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'income').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#f43f5e", "#ec4899", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-[#F4F2EE] p-4 md:p-8 lg:p-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black">হিসাব <span className="text-primary">বিশ্লেষণ</span></h1>
          <p className="text-slate-500 font-bold">ব্যবসায়িক কার্যক্রমের বিস্তারিত রিপোর্ট</p>
        </div>

        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl gap-1">
          {(["today", "week", "month", "year", "custom"] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterType === type ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              {type === "today" ? "আজ" : type === "week" ? "সপ্তাহ" : type === "month" ? "মাস" : type === "year" ? "বছর" : "তারিখ"}
            </button>
          ))}
        </div>
      </div>

      {filterType === "custom" && (
        <div className="flex justify-end mb-6">
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-3 rounded-2xl border-none shadow-sm font-bold text-slate-600 outline-none focus:ring-2 ring-primary/20 bg-white"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="border-none shadow-sm rounded-[2rem] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ArrowUpRight size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase">বিক্রয়</p><p className="text-xl font-black">৳{stats.sales.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center"><ArrowDownLeft size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase">খরচ</p><p className="text-xl font-black">৳{stats.expense.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-[#F0F5FF] text-black">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center"><TrendingUp size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase">মোট লাভ</p><p className="text-xl font-black text-primary">৳{stats.profit.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[2rem] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center"><Target size={24}/></div>
            <div><p className="text-[10px] font-black text-slate-400 uppercase">লেনদেন সংখ্যা</p><p className="text-xl font-black">{stats.count} টি</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none shadow-md rounded-[3rem] p-8 bg-white">
          <div className="flex items-center gap-2 mb-8"><BarChart3 size={20} className="text-primary"/><h3 className="font-black text-xl">সময়ভিত্তিক গ্রাফ</h3></div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}/>
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}}/>
                <Bar dataKey="sales" fill="var(--brand)" radius={[6, 6, 0, 0]} name="বিক্রি"/>
                <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} name="লাভ"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-md rounded-[3rem] p-8 bg-white text-center">
          <div className="flex items-center justify-center gap-2 mb-6"><PieIcon size={20} className="text-primary"/><h3 className="font-black text-xl">বিক্রয় বিভাজন</h3></div>
          {categoryData.length > 0 ? (
            <>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-6 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                {categoryData.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-xs font-bold p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-500">{c.name}</span>
                    </div>
                    <span className="text-slate-900 font-black">৳{c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
              <ShoppingBag size={60}/>
              <p className="mt-4 font-bold">কোনো বিক্রয় নেই</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}