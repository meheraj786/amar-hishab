import { useState, useMemo } from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
} from "date-fns";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useKhataStore } from "../store/useKhataStore";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  BarChart3,
  Ruler,
  CreditCard,
} from "lucide-react";

export default function Reports() {
  const { transactions } = useKhataStore();
  const [filterType, setFilterType] = useState<any>("month");
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6366f1", "#f43f5e"];

  const filteredData = useMemo(() => {
    const today = new Date();
    let start: Date, end: Date;
    if (filterType === "today") {
      start = startOfDay(today);
      end = endOfDay(today);
    } else if (filterType === "week") {
      start = startOfWeek(today);
      end = endOfWeek(today);
    } else if (filterType === "month") {
      start = startOfMonth(today);
      end = endOfMonth(today);
    } else {
      start = startOfYear(today);
      end = endOfYear(today);
    }

    return transactions.filter((tx) =>
      isWithinInterval(new Date(tx.date), { start, end }),
    );
  }, [transactions, filterType]);

  const stats = useMemo(() => {
    const sales = filteredData
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = filteredData
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    const yards = filteredData
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + (t.yardsSold || 0), 0);

    const methods = {
      cash: filteredData
        .filter((t) => t.type === "income" && t.paymentMethod === "cash")
        .reduce((s, t) => s + t.amount, 0),
      mobile: filteredData
        .filter((t) => t.type === "income" && t.paymentMethod === "mobile")
        .reduce((s, t) => s + t.amount, 0),
      bank: filteredData
        .filter((t) => t.type === "income" && t.paymentMethod === "bank")
        .reduce((s, t) => s + t.amount, 0),
    };

    return { sales, expense, yards, methods };
  }, [filteredData]);

  const methodChartData = [
    { name: "নগদ", value: stats.methods.cash },
    { name: "মোবাইল", value: stats.methods.mobile },
    { name: "ব্যাংক", value: stats.methods.bank },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-[#F4F2EE] p-4 md:p-8 lg:p-12 pb-32">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              ব্যবসায়িক <span className="text-primary">রিপোর্ট</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm">
              বিস্তারিত বেচাকেনা ও পেমেন্ট বিশ্লেষণ
            </p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
            {["today", "week", "month", "year"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterType === t ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
              >
                {t === "today"
                  ? "আজ"
                  : t === "week"
                    ? "সপ্তাহ"
                    : t === "month"
                      ? "মাস"
                      : "বছর"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowUpRight />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  মোট বিক্রি
                </p>
                <p className="text-lg font-black">
                  ৳{stats.sales.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowDownLeft />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  মোট খরচ
                </p>
                <p className="text-lg font-black">
                  ৳{stats.expense.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-[#F0F5FF]">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <Ruler />
              </div>
              <div>
                <p className="text-[9px] font-black text-primary/80 uppercase">
                  বিক্রিত গজ
                </p>
                <p className="text-lg font-black text-primary">
                  {stats.yards.toFixed(1)} গজ
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-3xl bg-slate-900 text-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  নিট ক্যাশ
                </p>
                <p className="text-lg font-black">
                  ৳{(stats.sales - stats.expense).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-8 border-none shadow-md rounded-[2.5rem] p-8 bg-white">
            <div className="flex items-center gap-2 mb-8">
              <BarChart3 className="text-primary" size={20} />
              <h3 className="font-black text-lg">বেচাকেনা বিশ্লেষণ</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData.slice(0, 10)}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "15px", border: "none" }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--brand)"
                    radius={[4, 4, 0, 0]}
                    name="বিক্রি"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="lg:col-span-4 border-none shadow-md rounded-[2.5rem] p-8 bg-white">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="text-primary" size={20} />
              <h3 className="font-black text-lg">পেমেন্ট মেথড</h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={methodChartData}
                    innerRadius={55}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {methodChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {methodChartData.map((d, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 rounded-xl bg-slate-50 text-xs font-bold"
                >
                  <span className="text-slate-500">{d.name}</span>
                  <span className="text-slate-900">
                    ৳{d.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
