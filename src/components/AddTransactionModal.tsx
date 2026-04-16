import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKhataStore } from "../store/useKhataStore";
import { popularCategories } from "../types";
import {
  CheckCircle2,
  ShoppingBag,
  Banknote,
  Layers,
  User,
  Plus,
  Trash2,
  Phone,
  Wallet,
} from "lucide-react";

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

const itemSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "সঠিক পরিমাণ লিখুন"),
  ),
  costPrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional(),
  ),
  category: z.string().min(1),
  notes: z.string().max(30).optional(),
  date: z.string(),
  isDue: z.boolean().default(false),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

const bulkSchema = z.object({
  transactions: z.array(itemSchema).min(1),
});

export default function AddTransactionModal({ open, onOpenChange, editingTransaction = null }: any) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const { addTransaction, updateTransaction, addDue } = useKhataStore();

  const { register, handleSubmit, setValue, reset, watch, control, formState: { errors } } = useForm<any>({
    resolver: zodResolver(mode === "single" ? itemSchema : bulkSchema),
    defaultValues: {
      type: "income",
      date: getLocalDate(),
      amount: "",
      costPrice: "",
      category: "পণ্য বিক্রয়",
      isDue: false,
      customerName: "",
      customerPhone: "",
      transactions: [
        { type: "income", date: getLocalDate(), amount: "", costPrice: "", category: "পণ্য বিক্রয়", notes: "", isDue: false, customerName: "", customerPhone: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "transactions" });

  const currentType = watch("type");
  const isDueSingle = watch("isDue");
  const sellPrice = watch("amount") || 0;
  const buyPrice = watch("costPrice") || 0;

  useEffect(() => {
    if (editingTransaction) {
      setMode("single");
      reset(editingTransaction);
    } else {
      reset({
        type: "income",
        date: getLocalDate(),
        amount: "",
        costPrice: "",
        category: "পণ্য বিক্রয়",
        isDue: false,
        transactions: [
          { type: "income", date: getLocalDate(), amount: "", costPrice: "", category: "পণ্য বিক্রয়", notes: "", isDue: false },
        ],
      });
    }
  }, [editingTransaction, open, reset]);

  const onSubmit = async (data: any) => {
    if (mode === "single") {
      if (data.isDue && data.type === 'income') {
        await addDue({
          customerName: data.customerName || "অজানা",
          customerPhone: data.customerPhone || "",
          totalAmount: data.amount,
          dueAmount: data.amount,
          costPrice: data.costPrice || 0,
          date: data.date,
          notes: data.notes
        });
      } else {
        editingTransaction ? await updateTransaction(editingTransaction.id, data) : await addTransaction(data);
      }
    } else {
      for (const tx of data.transactions) {
        if (tx.isDue && tx.type === 'income') {
          await addDue({
            customerName: tx.customerName || "অজানা",
            customerPhone: tx.customerPhone || "",
            totalAmount: tx.amount,
            dueAmount: tx.amount,
            costPrice: tx.costPrice || 0,
            date: tx.date,
            notes: tx.notes
          });
        } else {
          await addTransaction(tx);
        }
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-6 md:p-8 bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <div>
            <DialogTitle className="text-2xl font-black">হিসাব <span className="text-primary">{editingTransaction ? "সংশোধন" : "এন্ট্রি"}</span></DialogTitle>
            <DialogDescription className="sr-only">লেনদেনের তথ্য এখানে ইনপুট দিন</DialogDescription>
          </div>
          {!editingTransaction && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button type="button" onClick={() => setMode("single")} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === "single" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}>
                <User size={12} className="inline mr-1" /> SINGLE
              </button>
              <button type="button" onClick={() => setMode("bulk")} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === "bulk" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}>
                <Layers size={12} className="inline mr-1" /> BULK
              </button>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {mode === "single" ? (
            <div className="space-y-6">
              <Tabs value={currentType} onValueChange={(v: any) => { setValue("type", v); setValue("category", popularCategories[v as "income" | "expense"][0]); }}>
                <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100 rounded-2xl h-14">
                  <TabsTrigger value="income" className="rounded-xl font-black data-[state=active]:text-emerald-600">বিক্রয় / আয়</TabsTrigger>
                  <TabsTrigger value="expense" className="rounded-xl font-black data-[state=active]:text-rose-600">খরচ / ক্রয়</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">টাকার পরিমাণ {currentType === "income" ? "(বেচা দাম)" : ""}</Label>
                  <div className="relative group">
                    <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary" size={24} />
                    <Input type="number" {...register("amount")} placeholder="পরিমাণ লিখুন" className="h-20 pl-14 text-4xl font-black bg-slate-50 border-none rounded-3xl outline-none" />
                  </div>
                  {errors.amount && <p className="text-rose-500 text-xs font-bold ml-2">{errors.amount.message as string}</p>}
                </div>

                {currentType === "income" && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <input type="checkbox" {...register("isDue")} id="due-check" className="w-5 h-5 accent-primary rounded cursor-pointer" />
                    <Label htmlFor="due-check" className="font-bold text-primary cursor-pointer">এটি কি বাকি বিক্রয়?</Label>
                  </div>
                )}

                {isDueSingle && currentType === "income" && (
                  <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">কাস্টমার নাম</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <Input {...register("customerName")} placeholder="নাম লিখুন" className="pl-10 h-12 bg-slate-50 border-none rounded-xl font-bold" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase">মোবাইল</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <Input {...register("customerPhone")} placeholder="নম্বর" className="pl-10 h-12 bg-slate-50 border-none rounded-xl font-bold" />
                      </div>
                    </div>
                  </div>
                )}

                {currentType === "income" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">কেনা দাম / খরচ (ঐচ্ছিক)</Label>
                    <div className="relative group">
                      <ShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <Input type="number" {...register("costPrice")} placeholder="০.০০" className="h-14 pl-14 text-xl font-bold bg-slate-50 border-none rounded-2xl outline-none" />
                    </div>
                    {Number(sellPrice) > 0 && Number(buyPrice) > 0 && (
                      <p className="text-xs font-bold text-emerald-600 ml-2">লাভ হবে: ৳{(Number(sellPrice) - Number(buyPrice)).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ক্যাটাগরি</Label>
                  <select {...register("category")} className="w-full h-14 px-4 font-bold bg-slate-50 rounded-2xl border-none outline-none">
                    {(popularCategories as any)[currentType].map((c: string) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">তারিখ</Label>
                  <Input type="date" {...register("date")} className="h-14 font-bold bg-slate-50 border-none rounded-2xl outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">নোট</Label>
                <Input {...register("notes")} placeholder="অতিরিক্ত তথ্য..." className="h-14 px-6 font-bold bg-slate-50 border-none rounded-2xl outline-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const rowType = watch(`transactions.${index}.type`);
                const rowIsDue = watch(`transactions.${index}.isDue`);
                const rowSell = watch(`transactions.${index}.amount`) || 0;
                const rowBuy = watch(`transactions.${index}.costPrice`) || 0;

                return (
                  <div key={field.id} className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative group">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">পরিমাণ (বেচা দাম)</Label>
                        <Input type="number" {...register(`transactions.${index}.amount`)} placeholder="টাকা" className="h-12 font-black rounded-xl border-none bg-white shadow-sm" />
                      </div>
                      {rowType === "income" && (
                        <div className="space-y-1">
                          <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">কেনা দাম (ঐচ্ছিক)</Label>
                          <Input type="number" {...register(`transactions.${index}.costPrice`)} placeholder="খরচ" className="h-12 font-bold rounded-xl border-none bg-white shadow-sm" />
                        </div>
                      )}
                    </div>

                    {rowType === "income" && (
                      <div className="flex flex-col gap-3 p-3 bg-white rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" {...register(`transactions.${index}.isDue`)} className="w-4 h-4 accent-primary rounded" />
                          <span className="text-xs font-black text-primary uppercase">বাকি বিক্রয়?</span>
                        </div>
                        {rowIsDue && (
                          <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95">
                            <Input {...register(`transactions.${index}.customerName`)} placeholder="কাস্টমার নাম" className="h-9 text-xs border-none bg-slate-50 rounded-lg font-bold" />
                            <Input {...register(`transactions.${index}.customerPhone`)} placeholder="মোবাইল" className="h-9 text-xs border-none bg-slate-50 rounded-lg font-bold" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <select {...register(`transactions.${index}.category`)} className="h-12 px-3 font-bold rounded-xl border-none bg-white shadow-sm text-xs outline-none">
                        {(popularCategories as any)[rowType].map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <Input placeholder="নোট..." {...register(`transactions.${index}.notes`)} className="h-12 font-semibold rounded-xl border-none bg-white shadow-sm text-xs outline-none" />
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <div className="flex gap-2">
                        <select {...register(`transactions.${index}.type`)} className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border-none outline-none ${rowType === "income" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                          <option value="income">বিক্রয়</option>
                          <option value="expense">খরচ</option>
                        </select>
                        <Input type="date" {...register(`transactions.${index}.date`)} className="h-7 text-[10px] font-bold border-none bg-transparent w-28 outline-none" />
                      </div>
                      <div className="flex items-center gap-3">
                        {rowType === "income" && Number(rowSell) > 0 && Number(rowBuy) > 0 && (
                          <span className="text-[10px] font-black text-emerald-600">লাভ: ৳{Number(rowSell) - Number(rowBuy)}</span>
                        )}
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(index)} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button type="button" onClick={() => append({ type: "income", date: getLocalDate(), amount: "", costPrice: "", category: "পণ্য বিক্রয়", notes: "", isDue: false })} className="w-full border-dashed border-2 border-slate-200 rounded-2xl h-14 text-slate-400 font-bold hover:bg-slate-50 hover:text-primary transition-all flex items-center justify-center">
                <Plus size={16} className="mr-2" /> আরও হিসাব যোগ করুন
              </button>
            </div>
          )}

          <Button type="submit" className="w-full h-16 text-lg font-black rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 flex gap-3 transition-all active:scale-95">
            <CheckCircle2 size={20} /> {editingTransaction ? "আপডেট করুন" : "সব হিসাব সেভ করুন"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}