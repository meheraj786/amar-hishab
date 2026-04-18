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
  MoreVertical,
  // ShoppingBag,
  Ruler,
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
import { Label } from "@/components/ui/label";

export default function Transactions() {
  const { transactions, deleteTransaction, updateTransaction } =
    useKhataStore();
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
    pricePerYard: 0,
    yardsSold: 0,
    category: "",
    notes: "",
  });

  const availableYears = [
    "all",
    ...Array.from(
      new Set(transactions.map((tx) => new Date(tx.date).getFullYear())),
    ).sort((a, b) => b - a),
  ];

  const filteredTx = transactions
    .filter((tx) => {
      if (selectedDate) return tx.date === selectedDate;
      const txDate = new Date(tx.date);
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
    .sort((a, b) => b.createdAt - a.createdAt);

  const totalIncome = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalProfit = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.profit || 0), 0);
  const totalYards = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.yardsSold || 0), 0);
  // const balance = totalIncome - totalExpense;

  const handleEditClick = (tx: any) => {
    setEditingTx(tx.id);
    setEditData({
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      costPrice: tx.costPrice || 0,
      pricePerYard: tx.pricePerYard || 0,
      yardsSold: tx.yardsSold || 0,
      category: tx.category,
      notes: tx.notes || "",
    });
  };

  const handleSaveEdit = () => {
    if (editingTx && editData.category && editData.amount > 0) {
      updateTransaction(editingTx, { ...editData });
      setEditingTx(null);
    }
  };

  const groupedTx = filteredTx.reduce(
    (groups, tx) => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
      return groups;
    },
    {} as Record<string, typeof filteredTx>,
  );

  return (
    <div className="min-h-screen bg-[#F4F2EE] transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-12 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              সব <span className="text-primary">লেনদেন</span>
            </h1>
            <p className="text-slate-500 font-bold flex items-center justify-center md:justify-start gap-2 italic">
              <Filter size={18} className="text-primary" /> জমানো সব দোকানের
              তালিকা
            </p>
          </div>
          {(selectedYear !== "all" ||
            selectedMonth !== "all" ||
            selectedDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedYear("all");
                setSelectedMonth("all");
                setSelectedDate("");
              }}
              className="rounded-full px-6 border-rose-200 text-rose-500 font-bold bg-rose-50 hover:bg-rose-100"
            >
              <X size={14} className="mr-2" /> ফিল্টার রিসেট
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
            <div className="bg-white border-none shadow-sm p-8 rounded-[2.5rem] space-y-6">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> ফিল্টার
              </h3>
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-primary/20 outline-none"
                  >
                    <option value="all">সব বছর</option>
                    {availableYears.slice(1).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 ring-primary/20 outline-none"
                  >
                    <option value="all">সব মাস</option>
                    {[
                      "জানুয়ারি",
                      "ফেব্রুয়ারি",
                      "মার্চ",
                      "এপ্রিল",
                      "মে",
                      "জুন",
                      "জুলাই",
                      "আগস্ট",
                      "সেপ্টেম্বর",
                      "অক্টোবর",
                      "নভেম্বর",
                      "ডিসেম্বর",
                    ].map((m, i) => (
                      <option key={i} value={String(i + 1).padStart(2, "0")}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-2xl bg-slate-50 border-none h-14 font-bold px-4 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-5 shadow-2xl">
              <div className="flex justify-between items-center opacity-60">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  সামারি
                </span>
                <Wallet size={18} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">
                    বিক্রি
                  </span>
                  <span className="text-emerald-400 font-black">
                    ৳{totalIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">গজ</span>
                  <span className="text-blue-400 font-black">
                    {totalYards.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">খরচ</span>
                  <span className="text-rose-400 font-black">
                    ৳{totalExpense.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                  <span className="text-xs font-bold text-slate-400">
                    মোট লাভ
                  </span>
                  <span className="text-primary font-black text-lg">
                    ৳{totalProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-10">
            {Object.keys(groupedTx).length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
                <AlertCircle
                  className="mx-auto text-slate-200 mb-6"
                  size={40}
                />
                <p className="text-slate-900 font-black text-xl">
                  কোনো লেনদেন পাওয়া যায়নি
                </p>
              </div>
            ) : (
              Object.entries(groupedTx)
                .sort(
                  ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
                )
                .map(([date, txs]) => {
                  const dSales = txs
                    .filter((t) => t.type === "income")
                    .reduce((s, t) => s + t.amount, 0);
                  const dProfit = txs
                    .filter((t) => t.type === "income")
                    .reduce((s, t) => s + (t.profit || 0), 0);
                  const dExpense = txs
                    .filter((t) => t.type === "expense")
                    .reduce((s, t) => s + t.amount, 0);
                  const dYards = txs
                    .filter((t) => t.type === "income")
                    .reduce((s, t) => s + (t.yardsSold || 0), 0);
                  return (
                    <div key={date} className="space-y-4">
                      <div className="sticky top-6 z-10 flex flex-col md:flex-row md:items-center justify-between bg-white/95 backdrop-blur-xl p-4 md:px-6 rounded-3xl border border-slate-50 shadow-sm gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                            <span className="text-[10px] font-black">
                              {new Date(date).toLocaleDateString("bn-BD", {
                                month: "short",
                              })}
                            </span>
                            <span className="text-xl font-black">
                              {new Date(date).toLocaleDateString("bn-BD", {
                                day: "2-digit",
                              })}
                            </span>
                          </div>
                          <h3 className="font-black text-slate-900 text-lg uppercase">
                            {new Date(date).toLocaleDateString("bn-BD", {
                              weekday: "long",
                            })}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 md:gap-8 justify-between  flex-1 md:justify-end md:border-l md:pl-6 border-slate-100">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-emerald-500 uppercase leading-none mb-1">
                              বিক্রি
                            </p>
                            <p className="text-xs font-black">
                              ৳{dSales.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-blue-500 uppercase leading-none mb-1">
                              গজ
                            </p>
                            <p className="text-xs font-black">
                              {dYards.toFixed(1)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-primary uppercase leading-none mb-1">
                              লাভ
                            </p>
                            <p className="text-xs font-black text-primary">
                              ৳{dProfit.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-red-500 uppercase leading-none mb-1">
                              খরচ
                            </p>
                            <p className="text-xs font-black text-red-400">
                              ৳{dExpense.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {txs.map((tx) => (
                          <div
                            key={tx.id}
                            className="group bg-white p-5 rounded-[2rem] border border-transparent hover:border-primary/10 flex items-center justify-between shadow-sm transition-all hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                              >
                                {tx.type === "income" ? (
                                  <TrendingUp size={22} />
                                ) : (
                                  <TrendingDown size={22} />
                                )}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 leading-tight">
                                  {tx.category}
                                </p>
                                <div className="flex flex-col gap-1 mt-1">
                                  {tx.yardsSold && (
                                    <p className="text-[10px] font-black text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md self-start flex items-center gap-1">
                                      <Ruler size={10} /> {tx.yardsSold} গজ @ ৳
                                      {tx.pricePerYard}
                                    </p>
                                  )}
                                  <p className="text-[10px] font-bold text-slate-400 italic truncate max-w-[150px]">
                                    {tx.notes || "কোনো নোট নেই"}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p
                                  className={`text-xl font-black ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {tx.type === "income" ? "+" : "-"} ৳
                                  {tx.amount.toLocaleString()}
                                </p>
                                {tx.type === "income" && tx.profit! > 0 && (
                                  <p className="text-[10px] font-black text-emerald-500">
                                    লাভ ৳{tx.profit?.toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 text-slate-200 hover:text-slate-600">
                                    <MoreVertical size={20} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="rounded-2xl border-none shadow-2xl p-2 bg-white min-w-[140px]"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEditClick(tx)}
                                    className="flex items-center gap-3 font-bold p-3 rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer"
                                  >
                                    <Edit2 size={16} /> এডিট
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setDeleteTxId(tx.id)}
                                    className="flex items-center gap-3 font-bold p-3 rounded-xl text-rose-500 focus:bg-rose-50 cursor-pointer"
                                  >
                                    <Trash2 size={16} /> মুছুন
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
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              দোকান <span className="text-primary">সংশোধন</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setEditData({ ...editData, type: "income" })}
                className={`py-3 rounded-xl font-black transition-all ${editData.type === "income" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"}`}
              >
                বিক্রি
              </button>
              <button
                onClick={() => setEditData({ ...editData, type: "expense" })}
                className={`py-3 rounded-xl font-black transition-all ${editData.type === "expense" ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"}`}
              >
                খরচ
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  পরিমাণ
                </Label>
                <Input
                  type="number"
                  value={editData.amount}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      amount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-12 rounded-xl bg-slate-50 border-none font-black outline-none"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  কেনা দাম
                </Label>
                <Input
                  type="number"
                  value={editData.costPrice}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      costPrice: parseInt(e.target.value) || 0,
                    })
                  }
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold outline-none"
                />
              </div>
            </div>
            {editData.type === "income" && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    গজ প্রতি দাম
                  </Label>
                  <Input
                    type="number"
                    value={editData.pricePerYard}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        pricePerYard: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-10 rounded-xl border-none font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    মোট গজ
                  </Label>
                  <Input
                    type="number"
                    value={editData.yardsSold}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        yardsSold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-10 rounded-xl border-none font-bold outline-none"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  ক্যাটাগরি
                </Label>
                <select
                  value={editData.category}
                  onChange={(e) =>
                    setEditData({ ...editData, category: e.target.value })
                  }
                  className="w-full h-12 px-3 bg-slate-50 rounded-xl border-none font-bold outline-none"
                >
                  {popularCategories[editData.type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                  তারিখ
                </Label>
                <Input
                  type="date"
                  value={editData.date}
                  onChange={(e) =>
                    setEditData({ ...editData, date: e.target.value })
                  }
                  className="h-12 rounded-xl bg-slate-50 border-none font-bold outline-none"
                />
              </div>
            </div>
            <Input
              value={editData.notes}
              placeholder="নোট..."
              onChange={(e) =>
                setEditData({ ...editData, notes: e.target.value })
              }
              className="h-12 rounded-xl bg-slate-50 border-none font-bold outline-none"
            />
            <Button
              className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-lg"
              onClick={handleSaveEdit}
            >
              পরিবর্তন সেভ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTxId} onOpenChange={() => setDeleteTxId(null)}>
        <DialogContent className="rounded-[3rem] max-w-sm border-none p-10 bg-white shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 shadow-inner">
              <Trash2 size={36} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black">
                মুছে ফেলবেন?
              </DialogTitle>
            </DialogHeader>
          </div>
          <DialogFooter className="flex-row gap-4 mt-10">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl h-14 font-black"
              onClick={() => setDeleteTxId(null)}
            >
              না
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-2xl h-14 font-black shadow-lg shadow-rose-100"
              onClick={() => {
                if (deleteTxId) {
                  deleteTransaction(deleteTxId);
                  setDeleteTxId(null);
                }
              }}
            >
              হ্যাঁ, মুছুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
