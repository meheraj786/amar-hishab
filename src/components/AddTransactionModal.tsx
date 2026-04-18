import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKhataStore } from "../store/useKhataStore";
import { popularCategories } from "../types";
import { CheckCircle2, ShoppingBag, Banknote, Layers, User, Plus, Trash2, Phone, Ruler } from "lucide-react";

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

const itemSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(1, "পরিমাণ লিখুন")),
  costPrice: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable().optional()),
  costPricePerYard: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable().optional()),
  pricePerYard: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable().optional()),
  yardsSold: z.preprocess((val) => (val === "" ? null : Number(val)), z.number().nullable().optional()),
  paymentMethod: z.enum(["cash", "bank", "mobile"]).default("cash"),
  category: z.string().min(1),
  notes: z.string().max(30).optional(),
  date: z.string(),
  isDue: z.boolean().default(false),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

const bulkSchema = z.object({ transactions: z.array(itemSchema).min(1) });

export default function AddTransactionModal({ open, onOpenChange, editingTransaction = null }: any) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const { addTransaction, updateTransaction, addDue } = useKhataStore();

  const { register, handleSubmit, setValue, reset, watch, control, formState: { errors } } = useForm<any>({
    resolver: zodResolver(mode === "single" ? itemSchema : bulkSchema),
    defaultValues: { 
      type: "income", date: getLocalDate(), amount: "", isDue: false, paymentMethod: "cash",
      transactions: [{ type: "income", date: getLocalDate(), amount: "", costPrice: "", category: "পণ্য বিক্রয়", notes: "", isDue: false, paymentMethod: "cash" }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "transactions" });

  // Single Mode calculation
  const pricePerYard = watch("pricePerYard");
  const costPricePerYard = watch("costPricePerYard");
  const yardsSold = watch("yardsSold");

  useEffect(() => {
    if (yardsSold > 0) {
      if (pricePerYard > 0) setValue("amount", Math.round(yardsSold * pricePerYard));
      if (costPricePerYard > 0) setValue("costPrice", Math.round(yardsSold * costPricePerYard));
    }
  }, [pricePerYard, yardsSold, costPricePerYard, setValue]);

  // Bulk Mode calculation logic (Fixing the Hook Error)
  const watchedTransactions = useWatch({ control, name: "transactions" });

  useEffect(() => {
    if (mode === "bulk" && watchedTransactions) {
      watchedTransactions.forEach((item: any, index: number) => {
        const y = Number(item.yardsSold);
        const p = Number(item.pricePerYard);
        const c = Number(item.costPricePerYard);
        
        if (y > 0) {
          if (p > 0) {
            const calculatedAmount = Math.round(y * p);
            if (item.amount !== calculatedAmount) setValue(`transactions.${index}.amount`, calculatedAmount);
          }
          if (c > 0) {
            const calculatedCost = Math.round(y * c);
            if (item.costPrice !== calculatedCost) setValue(`transactions.${index}.costPrice`, calculatedCost);
          }
        }
      });
    }
  }, [watchedTransactions, mode, setValue]);

  useEffect(() => {
    if (editingTransaction) { setMode("single"); reset(editingTransaction); }
    else reset({ type: "income", date: getLocalDate(), amount: "", isDue: false, paymentMethod: "cash", transactions: [{ type: "income", date: getLocalDate(), amount: "", costPrice: "", category: "পণ্য বিক্রয়", notes: "", isDue: false, paymentMethod: "cash" }] });
  }, [editingTransaction, open, reset]);

  const onSubmit = async (data: any) => {
    if (mode === "single") {
      if (data.isDue && data.type === 'income') {
        addDue({ ...data, customerName: data.customerName || "অজানা", customerPhone: data.customerPhone || "", totalAmount: data.amount, dueAmount: data.amount });
      } else {
        if (editingTransaction) updateTransaction(editingTransaction.id, data);
        else addTransaction(data);
      }
    } else {
      data.transactions.forEach((tx: any) => {
        if (tx.isDue && tx.type === 'income') addDue({ ...tx, customerName: tx.customerName || "অজানা", customerPhone: tx.customerPhone || "", totalAmount: tx.amount, dueAmount: tx.amount });
        else addTransaction(tx);
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-6 md:p-8 bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <div>
            <DialogTitle className="text-2xl font-black text-primary">দোকান এন্ট্রি</DialogTitle>
            <DialogDescription className="sr-only">লেনদেনের তথ্য দিন</DialogDescription>
          </div>
          {!editingTransaction && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button type="button" onClick={() => setMode("single")} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === "single" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}>SINGLE</button>
              <button type="button" onClick={() => setMode("bulk")} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === "bulk" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}>BULK</button>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {mode === "single" ? (
            <div className="space-y-4">
              <Tabs value={watch("type")} onValueChange={(v: any) => setValue("type", v)}>
                <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100 rounded-2xl h-14">
                  <TabsTrigger value="income" className="font-black">বিক্রয়</TabsTrigger>
                  <TabsTrigger value="expense" className="font-black">খরচ</TabsTrigger>
                </TabsList>
              </Tabs>

              {watch("type") === 'income' && (
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-400">গজ প্রতি দাম</Label>
                    <Input type="number" step="any" {...register("pricePerYard")} placeholder="0" className="h-12 bg-white border-none rounded-xl font-bold" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-400">কেনা দাম (গজ)</Label>
                    <Input type="number" step="any" {...register("costPricePerYard")} placeholder="0" className="h-12 bg-white border-none rounded-xl font-bold" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-400">মোট গজ</Label>
                    <Input type="number" step="any" {...register("yardsSold")} placeholder="0" className="h-12 bg-white border-none rounded-xl font-bold" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">বেচা দাম</Label>
                  <div className="relative"><Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><Input type="number" {...register("amount")} className="pl-10 h-14 text-2xl font-black bg-slate-100 border-none rounded-2xl outline-none" /></div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400">কেনা দাম</Label>
                  <div className="relative"><ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><Input type="number" {...register("costPrice")} className="pl-10 h-14 text-2xl font-black bg-slate-100 border-none rounded-2xl outline-none" /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select {...register("paymentMethod")} className="h-12 px-4 font-bold bg-slate-50 rounded-xl border-none outline-none">
                  <option value="cash">নগদ (Cash)</option>
                  <option value="mobile">মোবাইল ব্যাংকিং</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                </select>
                <select {...register("category")} className="h-12 px-4 font-bold bg-slate-50 rounded-xl border-none outline-none">
                  {popularCategories[watch("type") as "income" | "expense"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {watch("type") === 'income' && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                  <input type="checkbox" {...register("isDue")} id="due-check" className="w-5 h-5 accent-primary rounded cursor-pointer" />
                  <Label htmlFor="due-check" className="font-bold text-primary cursor-pointer">এটি কি বাকি বিক্রয়?</Label>
                </div>
              )}

              {watch("isDue") && watch("type") === 'income' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input {...register("customerName")} placeholder="কাস্টমার নাম" className="h-12 bg-slate-50 border-none rounded-xl font-bold" />
                  <Input {...register("customerPhone")} placeholder="মোবাইল নম্বর" className="h-12 bg-slate-50 border-none rounded-xl font-bold" />
                </div>
              )}

              <Input type="date" {...register("date")} className="h-12 bg-slate-50 border-none rounded-xl font-bold w-full" />
              <Input {...register("notes")} placeholder="নোট..." className="h-12 px-6 font-bold bg-slate-50 border-none rounded-xl" />
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const rowType = watch(`transactions.${index}.type`);
                const rowIsDue = watch(`transactions.${index}.isDue`);
                return (
                  <div key={field.id} className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative">
                    <div className="grid grid-cols-3 gap-2">
                       <Input type="number" step="any" {...register(`transactions.${index}.pricePerYard`)} placeholder="বেচা (গজ)" className="h-10 text-xs font-bold rounded-lg border-none bg-white shadow-sm" />
                       <Input type="number" step="any" {...register(`transactions.${index}.costPricePerYard`)} placeholder="কেনা (গজ)" className="h-10 text-xs font-bold rounded-lg border-none bg-white shadow-sm" />
                       <Input type="number" step="any" {...register(`transactions.${index}.yardsSold`)} placeholder="গজ" className="h-10 text-xs font-bold rounded-lg border-none bg-white shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <Input type="number" {...register(`transactions.${index}.amount`)} placeholder="মোট টাকা" className="h-10 text-sm font-black rounded-lg border-none bg-white shadow-sm" />
                       <Input type="number" {...register(`transactions.${index}.costPrice`)} placeholder="খরচ" className="h-10 text-sm font-bold rounded-lg border-none bg-white shadow-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <select {...register(`transactions.${index}.paymentMethod`)} className="h-10 px-2 font-bold bg-white rounded-lg border-none shadow-sm text-xs">
                          <option value="cash">নগদ</option>
                          <option value="mobile">মোবাইল</option>
                          <option value="bank">ব্যাংক</option>
                       </select>
                       <select {...register(`transactions.${index}.category`)} className="h-10 px-2 font-bold bg-white rounded-lg border-none shadow-sm text-xs">
                          {popularCategories[rowType as "income" | "expense"].map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    {rowType === 'income' && (
                      <div className="flex flex-col gap-2 p-2 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" {...register(`transactions.${index}.isDue`)} className="w-4 h-4 accent-primary rounded" />
                          <span className="text-xs font-black text-primary">বাকি?</span>
                        </div>
                        {rowIsDue && (
                          <div className="grid grid-cols-2 gap-2">
                            <Input {...register(`transactions.${index}.customerName`)} placeholder="নাম" className="h-8 text-[10px] border-none bg-slate-50" />
                            <Input {...register(`transactions.${index}.customerPhone`)} placeholder="ফোন" className="h-8 text-[10px] border-none bg-slate-50" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                       <select {...register(`transactions.${index}.type`)} className="text-[10px] font-black p-1 rounded bg-white shadow-sm">
                          <option value="income">বিক্রয়</option>
                          <option value="expense">খরচ</option>
                       </select>
                       <Input type="date" {...register(`transactions.${index}.date`)} className="h-8 text-[10px] border-none bg-transparent" />
                       <button type="button" onClick={() => remove(index)} className="ml-auto text-rose-400"><Trash2 size={14}/></button>
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="outline" onClick={() => append({ type: "income", date: getLocalDate(), amount: "", costPrice: "", category: "পণ্য বিক্রয়", notes: "", isDue: false, paymentMethod: "cash" })} className="w-full border-dashed border-2 rounded-2xl h-14 text-slate-400 font-bold hover:text-primary transition-all flex items-center justify-center"><Plus size={16} className="mr-2" /> আরও যোগ করুন</Button>
            </div>
          )}
          <Button type="submit" className="w-full h-16 text-lg font-black rounded-3xl bg-primary text-white shadow-xl active:scale-95 transition-all">সব হিসাব সেভ করুন</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}