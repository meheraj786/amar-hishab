import { useState } from "react";
import { useKhataStore } from "../store/useKhataStore";
import { Search, Phone, User, Banknote, Trash2, Calendar, Ruler, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dues() {
  const { dues, payDue, deleteDue } = useKhataStore();
  const [search, setSearch] = useState("");
  const [payTarget, setPayTarget] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'mobile' | 'bank'>('cash');

  const filteredDues = dues.filter(d => 
    d.customerName.toLowerCase().includes(search.toLowerCase()) || 
    d.customerPhone.includes(search)
  );

  const totalDueAmount = dues.reduce((s, d) => s + d.dueAmount, 0);

  const handleConfirmPayment = async () => {
    if (!payTarget || payAmount <= 0) return;
    await payDue(payTarget.id, payAmount, payMethod);
    setPayTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F2EE] p-4 md:p-8 lg:p-12 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900 leading-tight">বাকির <span className="text-primary">খাতা</span></h1>
          <div className="bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100 shadow-sm">
             <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">মোট পাওনা</p>
             <p className="text-2xl font-black text-rose-600">৳{totalDueAmount.toLocaleString("bn-BD")}</p>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" placeholder="কাস্টমারের নাম বা মোবাইল দিয়ে খুঁজুন..." 
            className="w-full h-16 pl-14 pr-6 rounded-[2rem] bg-white border-none shadow-sm font-bold outline-none focus:ring-2 ring-primary/10"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filteredDues.map((due) => (
            <Card key={due.id} className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><User size={28}/></div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 leading-tight">{due.customerName}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Phone size={12}/> {due.customerPhone || 'নম্বর নেই'}</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1"><Calendar size={10}/> {due.date}</p>
                    </div>
                    {due.yardsSold && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="bg-primary/5 text-primary text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <Ruler size={12}/> {due.yardsSold} গজ
                        </span>
                        <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1.5">
                          <Tag size={12}/> ৳{due.pricePerYard} (গজ প্রতি)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-left md:text-right shrink-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">বাকি আছে</p>
                    <p className="text-2xl font-black text-rose-600">৳{due.dueAmount.toLocaleString("bn-BD")}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">মোট বিক্রয়: ৳{due.totalAmount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => { setPayTarget(due); setPayAmount(due.dueAmount); }} className="bg-emerald-600 hover:bg-emerald-700 font-black rounded-xl h-12 px-6 shadow-lg shadow-emerald-100">টাকা জমা</Button>
                    <button onClick={() => confirm("এই বাকির হিসাবটি কি মুছে ফেলবেন?") && deleteDue(due.id)} className="p-3 text-slate-200 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl"><Trash2 size={20}/></button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDues.length === 0 && (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
               <p className="text-slate-300 font-black text-lg italic uppercase tracking-widest opacity-50">কোনো বাকি পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!payTarget} onOpenChange={() => setPayTarget(null)}>
        <DialogContent className="rounded-[2.5rem] border-none p-8 bg-white max-w-sm shadow-2xl overflow-hidden">
          <DialogHeader><DialogTitle className="text-2xl font-black">টাকা জমা <span className="text-emerald-600">গ্রহণ</span></DialogTitle></DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payTarget?.customerName}</p>
               <p className="text-xl font-black text-slate-800">বাকি: ৳{payTarget?.dueAmount.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">জমার পরিমাণ</Label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                  <Input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} className="pl-12 h-16 rounded-2xl bg-slate-50 border-none font-black text-2xl outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">পেমেন্ট মেথড</Label>
                <select 
                  value={payMethod} 
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold text-sm outline-none cursor-pointer"
                >
                  <option value="cash">নগদ (Cash)</option>
                  <option value="mobile">মোবাইল ব্যাংকিং</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                </select>
              </div>
            </div>

            <Button onClick={handleConfirmPayment} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg shadow-xl shadow-emerald-100 transition-all active:scale-95">পরিশোধ নিশ্চিত করুন</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}