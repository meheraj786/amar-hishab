import { useState } from "react";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Filter,
  AlertCircle,
  X,
  Calendar,
  Edit2,
  // Tag,
  MoreVertical,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useKhataStore } from "../store/useKhataStore";
import { popularCategories } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Transactions() {
  const { transactions, deleteTransaction, updateTransaction } = useKhataStore();
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    date: "",
    type: "expense" as "income" | "expense",
    amount: 0,
    costPrice: 0,
    category: "",
    notes: "",
  });

  const availableYears = [
    "all",
    ...Array.from(
      new Set(transactions.map((tx) => new Date(tx.date).getFullYear()))
    ).sort((a, b) => b - a),
  ];

  const filteredTx = transactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      if (selectedDate) return tx.date === selectedDate;
      if (selectedMonth !== "all" && selectedYear !== "all") {
        return (
          txDate.getFullYear() === parseInt(selectedYear) &&
          txDate.getMonth() + 1 === parseInt(selectedMonth)
        );
      }
      if (selectedYear !== "all")
        return txDate.getFullYear() === parseInt(selectedYear);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalProfit = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.profit || 0), 0);
  const balance = totalIncome - totalExpense;

  const handleEditClick = (tx: any) => {
    setEditingTx(tx.id);
    setEditData({
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      costPrice: tx.costPrice || 0,
      category: tx.category,
      notes: tx.notes || "",
    });
  };

  const handleSaveEdit = () => {
    if (editingTx && editData.category && editData.amount > 0) {
      updateTransaction(editingTx, {
        date: editData.date,
        type: editData.type,
        amount: editData.amount,
        costPrice: editData.costPrice,
        category: editData.category,
        notes: editData.notes,
      });
      setEditingTx(null);
    }
  };

  const groupedTx = filteredTx.reduce((groups, tx) => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
    return groups;
  }, {} as Record<string, typeof filteredTx>);

  return (
    <div className="min-h-screen bg-[#fcfdfe] transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-12 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              সব <span className="text-primary">লেনদেন</span>
            </h1>
            <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 italic">
              <Filter size={18} className="text-primary" />
              আপনার জমানো সব হিসাবের তালিকা
            </p>
          </div>

          {(selectedYear !== "all" || selectedMonth !== "all" || selectedDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
                setSelectedDate("");
              }}
              className="rounded-full px-6 border-rose-200 text-rose-500 font-bold bg-rose-50/50 hover:bg-rose-50"
            >
              ফিল্টার রিসেট <X size={14} className="ml-2" />
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
            <div className="bg-white border-none shadow-sm p-8 rounded-[2.5rem] space-y-6">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                ফিল্টার করুন
              </h3>

              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">বছর</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-primary/20 cursor-pointer appearance-none outline-none"
                    >
                      <option value="all">সব বছর</option>
                      {availableYears.slice(1).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">মাস</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-primary/20 cursor-pointer appearance-none outline-none"
                    >
                      <option value="all">সব মাস</option>
                      {[
                        "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
                        "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
                      ].map((m, i) => (
                        <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">নির্দিষ্ট তারিখ</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="rounded-2xl bg-slate-50 border-none h-14 font-bold px-4"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] font-black uppercase tracking-widest">ফিল্টার সামারি</span>
                <Wallet size={18} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-400">মোট বিক্রি</span>
                  <span className="text-emerald-400 font-black text-lg">৳{totalIncome.toLocaleString("bn-BD")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-400">মোট খরচ</span>
                  <span className="text-rose-400 font-black text-lg">৳{totalExpense.toLocaleString("bn-BD")}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-sm font-bold text-slate-400">মোট লাভ</span>
                  <span className="text-primary font-black text-xl">৳{totalProfit.toLocaleString("bn-BD")}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-sm font-bold text-slate-400">ক্যাশ ব্যালেন্স</span>
                  <span className={`font-black text-2xl ${balance >= 0 ? "text-white" : "text-rose-400"}`}>৳{balance.toLocaleString("bn-BD")}</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-10">
            {Object.keys(groupedTx).length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="text-slate-200" size={40} />
                </div>
                <p className="text-slate-900 font-black text-xl">কোনো লেনদেন পাওয়া যায়নি</p>
              </div>
            ) : (
              Object.entries(groupedTx)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, txs]) => {
                  const dailySales = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                  const dailyExpense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                  const dailyProfit = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.profit || 0), 0);

                  return (
                    <div key={date} className="space-y-5">
                      <div className="sticky top-6 z-10 flex flex-col md:flex-row md:items-center justify-between bg-white/90 backdrop-blur-xl p-4 md:px-6 md:py-4 rounded-3xl border border-slate-50 shadow-sm gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shrink-0">
                            <span className="text-[10px] font-black uppercase">{new Date(date).toLocaleDateString("bn-BD", { month: "short" })}</span>
                            <span className="text-xl font-black">{new Date(date).toLocaleDateString("bn-BD", { day: "2-digit" })}</span>
                          </div>
                          <div>
                             <h3 className="font-black text-slate-900 text-lg leading-none uppercase tracking-tight">{new Date(date).toLocaleDateString("bn-BD", { weekday: "long" })}</h3>
                             <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date(date).getFullYear()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-6 self-end md:self-auto border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-between">
                            <div className="text-right">
                              <p className="text-[12px] font-black text-emerald-500 uppercase leading-none mb-1">বিক্রি</p>
                              <p className="text-sm font-black text-slate-900">৳{dailySales.toLocaleString("bn-BD")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[12px] font-black text-rose-500 uppercase leading-none mb-1">খরচ</p>
                              <p className="text-sm font-black text-slate-900">৳{dailyExpense.toLocaleString("bn-BD")}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[12px] font-black text-primary uppercase leading-none mb-1">লাভ</p>
                              <p className="text-sm font-black text-primary">৳{dailyProfit.toLocaleString("bn-BD")}</p>
                            </div>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {txs.map((tx) => (
                          <div key={tx.id} className="group bg-white p-5 rounded-[2rem] border border-transparent hover:border-primary/10 flex items-center justify-between shadow-sm transition-all">
                            <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                                {tx.type === "income" ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-lg leading-tight">{tx.category}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs font-bold text-slate-400 italic">{tx.notes || "কোনো নোট নেই"}</p>
                                  {tx.type === "income" && tx.profit! > 0 && (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[12px] font-black rounded-full shadow-sm">লাভ: ৳{tx.profit}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className={`text-xl font-black ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                                  {tx.type === "income" ? "+" : "-"} ৳{tx.amount.toLocaleString("bn-BD")}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 text-slate-200 hover:text-slate-600 transition-all rounded-xl">
                                    <MoreVertical size={20} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 bg-white min-w-[140px]">
                                  <DropdownMenuItem onClick={() => handleEditClick(tx)} className="flex items-center gap-3 font-bold text-slate-600 p-3 rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer">
                                    <Edit2 size={16} /> <span>এডিট</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setDeleteTxId(tx.id)} className="flex items-center gap-3 font-bold text-rose-500 p-3 rounded-xl focus:bg-rose-50 cursor-pointer">
                                    <Trash2 size={16} /> <span>মুছুন</span>
                                  </DropdownMenuItem>
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
        <DialogContent className="rounded-[2.5rem] max-w-md border-none p-8 bg-white shadow-2xl">
          <DialogHeader><DialogTitle className="text-3xl font-black tracking-tight">হিসাব <span className="text-primary">সংশোধন</span></DialogTitle></DialogHeader>
          <div className="space-y-5 py-6">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setEditData({ ...editData, type: "income" })} className={`p-4 rounded-2xl font-black transition-all ${editData.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-400"}`}>বিক্রি / আয়</button>
              <button onClick={() => setEditData({ ...editData, type: "expense" })} className={`p-4 rounded-2xl font-black transition-all ${editData.type === "expense" ? "bg-rose-100 text-rose-700" : "bg-slate-50 text-slate-400"}`}>খরচ / ক্রয়</button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">টাকার পরিমাণ (বেচা দাম)</label>
              <Input type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: parseInt(e.target.value) || 0 })} className="h-14 rounded-2xl bg-slate-50 border-none font-black text-xl" />
            </div>

            {editData.type === "income" && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">কেনা দাম / খরচ (ঐচ্ছিক)</label>
                <div className="relative">
                  <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input type="number" value={editData.costPrice} onChange={(e) => setEditData({ ...editData, costPrice: parseInt(e.target.value) || 0 })} className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-bold outline-none" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ক্যাটাগরি</label>
                <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="w-full h-14 px-4 font-bold rounded-2xl bg-slate-50 border-none outline-none">
                  {popularCategories[editData.type].map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">তারিখ</label>
                <Input type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">নোট</label>
              <Input value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
            </div>
          </div>
          <DialogFooter className="flex-row gap-4">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black" onClick={() => setEditingTx(null)}>বাতিল</Button>
            <Button className="flex-1 rounded-2xl h-14 font-black bg-primary text-white shadow-lg shadow-primary/10" onClick={handleSaveEdit}>সংরক্ষণ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <DialogContent className="rounded-[3rem] max-w-sm border-none p-10 bg-white shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 shadow-inner"><Trash2 size={36} /></div>
            <DialogHeader><DialogTitle className="text-3xl font-black tracking-tight text-slate-900">মুছে ফেলবেন?</DialogTitle></DialogHeader>
            <p className="text-slate-500 text-sm font-bold">লেনদেনটি মুছে ফেললে আপনার ব্যালেন্স ও লাভ স্থায়ীভাবে আপডেট হয়ে যাবে।</p>
          </div>
          <DialogFooter className="flex-row gap-4 mt-10">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black" onClick={() => setDeleteTxId(null)}>না</Button>
            <Button variant="destructive" className="flex-1 rounded-2xl h-14 font-black shadow-lg shadow-rose-100" onClick={() => { if (deleteTxId) { deleteTransaction(deleteTxId); setDeleteTxId(null); } }}>হ্যাঁ, মুছুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}