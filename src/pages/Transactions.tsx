import { useState } from "react";
import { Trash2, TrendingUp, TrendingDown, Wallet, Filter, AlertCircle, X, Calendar, Edit2, MoreVertical, ShoppingBag, Ruler, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useKhataStore } from "../store/useKhataStore";
import { popularCategories } from "../types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Transactions() {
  const { transactions, deleteTransaction, updateTransaction } = useKhataStore();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({ date: "", type: "income", amount: 0, costPrice: 0, pricePerYard: 0, costPricePerYard: 0, yardsSold: 0, category: "", notes: "", paymentMethod: "cash" });

  const availableYears = ["all", ...Array.from(new Set(transactions.map((tx) => new Date(tx.date).getFullYear()))).sort((a, b) => b - a)];

  const filteredTx = transactions.filter((tx) => {
    if (selectedDate) return tx.date === selectedDate;
    const txDate = new Date(tx.date);
    if (selectedMonth !== "all" && selectedYear !== "all") return txDate.getFullYear() === parseInt(selectedYear) && txDate.getMonth() + 1 === parseInt(selectedMonth);
    if (selectedYear !== "all") return txDate.getFullYear() === parseInt(selectedYear);
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const stats = {
    income: filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense: filteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    profit: filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.profit || 0), 0),
    yards: filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + (t.yardsSold || 0), 0),
  };

  const handleEditClick = (tx: any) => {
    setEditingTx(tx.id);
    setEditData({ ...tx, costPricePerYard: tx.costPricePerYard || (tx.yardsSold ? tx.costPrice / tx.yardsSold : 0) });
  };

  const handleUpdateInput = (field: string, val: any) => {
    const updated = { ...editData, [field]: val };
    if (updated.yardsSold > 0) {
      if (field === 'pricePerYard' || field === 'yardsSold') updated.amount = Math.round(updated.yardsSold * updated.pricePerYard);
      if (field === 'costPricePerYard' || field === 'yardsSold') updated.costPrice = Math.round(updated.yardsSold * updated.costPricePerYard);
    }
    setEditData(updated);
  };

  const groupedTx = filteredTx.reduce((groups, tx) => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
    return groups;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-[#F4F2EE] p-4 md:p-12 pb-32">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
             <h1 className="text-4xl font-black text-slate-900">সব <span className="text-primary">লেনদেন</span></h1>
             <p className="text-slate-500 font-bold italic flex items-center justify-center md:justify-start gap-2"><Filter size={18}/> জমানো সব হিসাবের তালিকা</p>
          </div>
          {(selectedYear !== "all" || selectedMonth !== "all" || selectedDate) && (
            <Button variant="outline" size="sm" onClick={() => { setSelectedYear("all"); setSelectedMonth("all"); setSelectedDate(""); }} className="rounded-full px-6 border-rose-200 text-rose-500 font-bold bg-rose-50 hover:bg-rose-100"><X size={14} className="mr-2" /> রিসেট</Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6">
               <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-primary"/> ফিল্টার</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="p-3 rounded-xl bg-slate-50 border-none font-bold outline-none text-sm"><option value="all">সব বছর</option>{availableYears.slice(1).map(y => <option key={y} value={y}>{y}</option>)}</select>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-3 rounded-xl bg-slate-50 border-none font-bold outline-none text-sm"><option value="all">সব মাস</option>{["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"].map((m,i) => <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>)}</select>
                  </div>
                  <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-12 rounded-xl bg-slate-50 border-none font-bold cursor-pointer" />
               </div>
            </div>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex justify-between">সামারি <Wallet size={14}/></p>
               <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400">মোট বিক্রি</span><span className="text-emerald-400 font-black">৳{stats.income.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400">মোট গজ</span><span className="text-blue-400 font-black">{stats.yards.toFixed(1)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400">মোট খরচ</span><span className="text-rose-400 font-black">৳{stats.expense.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-3"><span className="text-xs font-bold text-slate-400">নিট লাভ</span><span className="text-primary font-black text-xl">৳{stats.profit.toLocaleString()}</span></div>
               </div>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-10">
            {Object.keys(groupedTx).length === 0 ? (
              <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100 text-slate-300 font-black">লেনদেন নেই</div>
            ) : (
              Object.entries(groupedTx).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()).map(([date, txs]) => {
                const dIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                const dProfit = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.profit || 0), 0);
                const dYards = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.yardsSold || 0), 0);
                return (
                  <div key={date} className="space-y-4">
                    <div className="sticky top-6 z-10 flex flex-col md:flex-row md:items-center justify-between bg-white/95 backdrop-blur-xl p-4 md:px-6 rounded-3xl shadow-sm border border-slate-50 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex flex-col items-center justify-center text-white shadow-lg"><span className="text-[10px] font-black">{new Date(date).toLocaleDateString("bn-BD", { month: "short" })}</span><span className="text-xl font-black">{new Date(date).toLocaleDateString("bn-BD", { day: "2-digit" })}</span></div>
                        <h3 className="font-black text-slate-900 text-lg uppercase">{new Date(date).toLocaleDateString("bn-BD", { weekday: "long" })}</h3>
                      </div>
                      <div className="flex items-center gap-6 justify-between flex-1 md:justify-end md:border-l md:pl-6 border-slate-100 text-right">
                         <div><p className="text-[8px] font-black text-emerald-500 uppercase">বিক্রি</p><p className="text-xs font-black">৳{dIncome.toLocaleString()}</p></div>
                         <div><p className="text-[8px] font-black text-blue-500 uppercase">গজ</p><p className="text-xs font-black">{dYards.toFixed(1)}</p></div>
                         <div><p className="text-[8px] font-black text-primary uppercase">লাভ</p><p className="text-xs font-black text-primary">৳{dProfit.toLocaleString()}</p></div>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {txs.map((tx: any) => (
                        <div key={tx.id} className="group bg-white p-5 rounded-[2rem] border border-transparent hover:border-primary/10 flex items-center justify-between shadow-sm transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{tx.type === "income" ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}</div>
                            <div>
                               <p className="font-black text-slate-900 leading-tight">{tx.category}</p>
                               <div className="flex flex-col gap-1 mt-1">
                                 {tx.yardsSold && <p className="text-[10px] font-black text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md self-start flex items-center gap-1"><Ruler size={10}/> {tx.yardsSold} গজ @ ৳{tx.pricePerYard}</p>}
                                 <p className="text-[10px] font-bold text-slate-400 italic truncate max-w-[150px]">{tx.notes || tx.paymentMethod}</p>
                               </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                               <p className={`text-xl font-black ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>{tx.type === "income" ? "+" : "-"} ৳{tx.amount.toLocaleString()}</p>
                               {tx.type === "income" && tx.profit > 0 && <p className="text-[10px] font-black text-emerald-500">লাভ ৳{tx.profit.toLocaleString()}</p>}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><button className="p-2 text-slate-200 hover:text-slate-600"><MoreVertical size={20}/></button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 bg-white min-w-[140px]">
                                <DropdownMenuItem onClick={() => handleEditClick(tx)} className="flex items-center gap-2 font-bold p-3 cursor-pointer rounded-xl focus:bg-emerald-50 focus:text-emerald-600"><Edit2 size={16}/> এডিট</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => confirm("মুছবেন?") && deleteTransaction(tx.id)} className="flex items-center gap-2 font-bold p-3 cursor-pointer rounded-xl text-rose-500 focus:bg-rose-50 focus:text-rose-600"><Trash2 size={16}/> মুছুন</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!editingTx} onOpenChange={() => setEditingTx(null)}>
        <DialogContent className="rounded-[2.5rem] border-none p-8 bg-white max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black">হিসাব <span className="text-primary">সংশোধন</span></DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
               <button onClick={() => setEditData({...editData, type: 'income'})} className={`py-2 rounded-lg font-bold text-xs ${editData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>বিক্রি</button>
               <button onClick={() => setEditData({...editData, type: 'expense'})} className={`py-2 rounded-lg font-bold text-xs ${editData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>খরচ</button>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl">
               <div className="space-y-1"><Label className="text-[9px] font-black text-slate-400 uppercase ml-1">বিক্রি (গজ)</Label><Input type="number" step="any" value={editData.pricePerYard} onChange={(e) => handleUpdateInput('pricePerYard', parseFloat(e.target.value) || 0)} className="h-10 border-none bg-white font-bold" /></div>
               <div className="space-y-1"><Label className="text-[9px] font-black text-slate-400 uppercase ml-1">কেনা (গজ)</Label><Input type="number" step="any" value={editData.costPricePerYard} onChange={(e) => handleUpdateInput('costPricePerYard', parseFloat(e.target.value) || 0)} className="h-10 border-none bg-white font-bold" /></div>
               <div className="space-y-1"><Label className="text-[9px] font-black text-slate-400 uppercase ml-1">মোট গজ</Label><Input type="number" step="any" value={editData.yardsSold} onChange={(e) => handleUpdateInput('yardsSold', parseFloat(e.target.value) || 0)} className="h-10 border-none bg-white font-bold" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1"><Label className="text-[10px] font-black text-slate-400 uppercase ml-1">মোট বিক্রি</Label><Input type="number" value={editData.amount} onChange={(e) => setEditData({...editData, amount: parseInt(e.target.value)||0})} className="h-12 border-none bg-slate-100 font-black text-lg" /></div>
               <div className="space-y-1"><Label className="text-[10px] font-black text-slate-400 uppercase ml-1">মোট খরচ</Label><Input type="number" value={editData.costPrice} onChange={(e) => setEditData({...editData, costPrice: parseInt(e.target.value)||0})} className="h-12 border-none bg-slate-100 font-black text-lg" /></div>
            </div>
            <select value={editData.paymentMethod} onChange={(e) => setEditData({...editData, paymentMethod: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold outline-none"><option value="cash">নগদ</option><option value="mobile">মোবাইল ব্যাংকিং</option><option value="bank">ব্যাংক</option></select>
            <div className="grid grid-cols-2 gap-3">
               <select value={editData.category} onChange={(e) => setEditData({...editData, category: e.target.value})} className="h-12 px-4 rounded-xl bg-slate-50 border-none font-bold outline-none">{popularCategories[editData.type as 'income'|'expense'].map(c => <option key={c} value={c}>{c}</option>)}</select>
               <Input type="date" value={editData.date} onChange={(e) => setEditData({...editData, date: e.target.value})} className="h-12 border-none bg-slate-50 font-bold" />
            </div>
            <Button onClick={() => updateTransaction(editingTx!, editData).then(() => setEditingTx(null))} className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-xl">আপডেট করুন</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}