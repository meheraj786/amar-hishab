import { Plus, ShoppingCart, Wallet, Calendar, History, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import { useKhataStore } from "../store/useKhataStore";

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home({ onAddClick }: any) {
  const navigate = useNavigate();
  const { getBalance, transactions, getTotalProfit } = useKhataStore();
  
  const localToday = getLocalDateString();
  const todayTx = transactions.filter(t => t.date === localToday);
  const recentTransactions = transactions.slice(0, 10);
  
  const totalProfit = getTotalProfit();
  const todaySales = todayTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const todayExpense = todayTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const todayProfit = todayTx.filter(t => t.type === "income").reduce((s, t) => s + (t.profit || 0), 0);

  return (
    <div className="min-h-screen bg-[#F4F2EE] p-4 md:p-8 lg:p-12 pb-28">
      <header className="flex justify-between items-center mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">আমার<span className="text-primary">হিসাব</span></h1>
          <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
            <Calendar size={16} className="text-primary"/> আজ {new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button onClick={onAddClick} className="bg-primary text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex gap-2">
          <Plus size={20} strokeWidth={3}/> নতুন এন্ট্রি
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          <div className="relative overflow-hidden bg-[#F0F5FF] from-primary via-primary to-green-900 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/5">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 space-y-6">
              <p className="text-sm font-black  text-primary/80">মোট ক্যাশ ব্যালেন্স</p>
              <h2 className="text-5xl font-black text-primary! tracking-tighter">৳ {getBalance().toLocaleString("bn-BD")}</h2>
              <div className="pt-6 border-t border-primary/50 flex justify-between items-center">
                <div>
                  <p className="text-[12px] font-black text-primary/80 uppercase">সর্বমোট লাভ</p>
                  <p className="text-xl font-black text-primary">৳{totalProfit.toLocaleString("bn-BD")}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Wallet className="text-primary" size={24}/>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <ShoppingCart size={20}/>
              </div>
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">আজকের বিক্রি</p>
              <p className="text-2xl font-black text-slate-900 mt-1">৳{todaySales.toLocaleString("bn-BD")}</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <ArrowDownLeft size={20}/>
              </div>
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">আজকের খরচ</p>
              <p className="text-2xl font-black text-slate-900 mt-1">৳{todayExpense.toLocaleString("bn-BD")}</p>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-md ring-2 ring-emerald-500/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp size={20}/>
              </div>
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">আজকের লাভ</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">৳{todayProfit.toLocaleString("bn-BD")}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2"><History className="text-primary" size={20}/><h2 className="text-xl font-black">সাম্প্রতিক লেনদেন</h2></div>
            <button onClick={() => navigate("/transactions")} className="text-sm font-black text-primary hover:underline">সবগুলো</button>
          </div>

          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center">
                <p className="text-slate-400 font-bold">এখনো কোনো এন্ট্রি নেই</p>
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="bg-white p-5 rounded-[2rem] border border-transparent hover:border-primary/10 shadow-sm flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {tx.type === "income" ? <ArrowUpRight size={20}/> : <ArrowDownLeft size={20}/>}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{tx.category}</h4>
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {tx.date} {tx.type === "income" && tx.profit! > 0 && <span className="text-emerald-500 ml-1">• লাভ ৳{tx.profit}</span>}
                      </p>
                    </div>
                  </div>
                  <p className={`text-xl font-black ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.type === "income" ? "+" : "-"} ৳{tx.amount.toLocaleString("bn-BD")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}