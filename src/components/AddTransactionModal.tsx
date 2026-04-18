import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKhataStore } from "../store/useKhataStore";
import { popularCategories } from "../types";
import { Banknote, Plus, Trash2, Ruler } from "lucide-react";

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
    z.number().min(1, "পরিমাণ লিখুন"),
  ),
  costPrice: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().nullable().optional(),
  ),
  pricePerYard: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().nullable().optional(),
  ),
  yardsSold: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().nullable().optional(),
  ),
  paymentMethod: z.enum(["cash", "bank", "mobile"]).default("cash"),
  category: z.string().min(1),
  notes: z.string().max(30).optional(),
  date: z.string(),
  isDue: z.boolean().default(false),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

const bulkSchema = z.object({ transactions: z.array(itemSchema).min(1) });

export default function AddTransactionModal({
  open,
  onOpenChange,
  editingTransaction = null,
}: any) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const { addTransaction, updateTransaction, addDue } = useKhataStore();

  const { register, handleSubmit, setValue, reset, watch, control } =
    useForm<any>({
      resolver: zodResolver(mode === "single" ? itemSchema : bulkSchema),
      defaultValues: {
        type: "income",
        date: getLocalDate(),
        amount: "",
        isDue: false,
        paymentMethod: "cash",
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });
  const type = watch("type");
  const isDueSingle = watch("isDue");
  const pricePerYard = watch("pricePerYard");
  const yardsSold = watch("yardsSold");

  useEffect(() => {
    if (pricePerYard && yardsSold) {
      setValue("amount", pricePerYard * yardsSold);
    }
  }, [pricePerYard, yardsSold, setValue]);

  useEffect(() => {
    if (editingTransaction) {
      setMode("single");
      reset(editingTransaction);
    } else
      reset({
        type: "income",
        date: getLocalDate(),
        amount: "",
        isDue: false,
        paymentMethod: "cash",
        transactions: [
          {
            type: "income",
            date: getLocalDate(),
            amount: "",
            costPrice: "",
            category: "পণ্য বিক্রয়",
            notes: "",
            isDue: false,
            paymentMethod: "cash",
          },
        ],
      });
  }, [editingTransaction, open, reset]);

  const onSubmit = async (data: any) => {
    if (mode === "single") {
      if (data.isDue && data.type === "income") {
        addDue({
          customerName: data.customerName || "অজানা",
          customerPhone: data.customerPhone || "",
          totalAmount: data.amount,
          dueAmount: data.amount,
          costPrice: data.costPrice || 0,
          date: data.date,
          notes: data.notes,
          paymentMethod: data.paymentMethod,
          yardsSold: data.yardsSold,
          pricePerYard: data.pricePerYard,
        });
      } else {
        if (editingTransaction) updateTransaction(editingTransaction.id, data);
        else addTransaction(data);
      }
    } else {
      data.transactions.forEach((tx: any) => {
        if (tx.isDue && tx.type === "income") {
          addDue({
            customerName: tx.customerName || "অজানা",
            customerPhone: tx.customerPhone || "",
            totalAmount: tx.amount,
            dueAmount: tx.amount,
            costPrice: tx.costPrice || 0,
            date: tx.date,
            notes: tx.notes,
            paymentMethod: tx.paymentMethod,
            yardsSold: tx.yardsSold,
            pricePerYard: tx.pricePerYard,
          });
        } else addTransaction(tx);
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-6 md:p-8 bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <DialogTitle className="text-2xl font-black">
            দোকান <span className="text-primary">এন্ট্রি</span>
          </DialogTitle>
          {!editingTransaction && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === "single" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
              >
                SINGLE
              </button>
              <button
                type="button"
                onClick={() => setMode("bulk")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === "bulk" ? "bg-white shadow-sm text-primary" : "text-slate-400"}`}
              >
                BULK
              </button>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {mode === "single" ? (
            <div className="space-y-4">
              <Tabs
                value={type}
                onValueChange={(v: any) => setValue("type", v)}
              >
                <TabsList className="grid w-full grid-cols-2 p-1.5 bg-slate-100 rounded-2xl h-14">
                  <TabsTrigger value="income" className="font-black">
                    বিক্রয়
                  </TabsTrigger>
                  <TabsTrigger value="expense" className="font-black">
                    খরচ
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {type === "income" && (
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-400">
                      গজ প্রতি দাম
                    </Label>
                    <div className="relative">
                      <Ruler
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                        size={16}
                      />
                      <Input
                        type="number"
                        {...register("pricePerYard")}
                        placeholder="0.00"
                        className="pl-10 h-12 bg-white border-none rounded-xl font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-400">
                      মোট গজ
                    </Label>
                    <Input
                      type="number"
                      {...register("yardsSold")}
                      placeholder="0.00"
                      className="h-12 bg-white border-none rounded-xl font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="relative group">
                <Banknote
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                  size={24}
                />
                <Input
                  type="number"
                  {...register("amount")}
                  placeholder="মোট টাকার পরিমাণ"
                  className="h-20 pl-14 text-4xl font-black bg-slate-50 border-none rounded-3xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    পেমেন্ট মেথড
                  </Label>
                  <select
                    {...register("paymentMethod")}
                    className="w-full h-12 px-4 font-bold bg-slate-50 rounded-xl border-none outline-none"
                  >
                    <option value="cash">নগদ (Cash)</option>
                    <option value="mobile">মোবাইল ব্যাংকিং</option>
                    <option value="bank">ব্যাংক (Bank)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                    কেনা দাম (ঐচ্ছিক)
                  </Label>
                  <Input
                    type="number"
                    {...register("costPrice")}
                    placeholder="০.০০"
                    className="h-12 bg-slate-50 border-none rounded-xl font-bold outline-none"
                  />
                </div>
              </div>

              {type === "income" && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                  <input
                    type="checkbox"
                    {...register("isDue")}
                    id="due-check"
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <Label
                    htmlFor="due-check"
                    className="font-bold text-primary cursor-pointer"
                  >
                    এটি কি বাকি বিক্রয়?
                  </Label>
                </div>
              )}

              {isDueSingle && type === "income" && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  <Input
                    {...register("customerName")}
                    placeholder="কাস্টমার নাম"
                    className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                  />
                  <Input
                    {...register("customerPhone")}
                    placeholder="মোবাইল নম্বর"
                    className="h-12 bg-slate-50 border-none rounded-xl font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <select
                  {...register("category")}
                  className="h-14 px-4 font-bold bg-slate-50 rounded-2xl border-none outline-none"
                >
                  {popularCategories[type].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Input
                  type="date"
                  {...register("date")}
                  className="h-14 font-bold bg-slate-50 border-none rounded-2xl outline-none"
                />
              </div>
              <Input
                {...register("notes")}
                placeholder="নোট..."
                className="h-14 px-6 font-bold bg-slate-50 border-none rounded-2xl outline-none"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const rowType = watch(`transactions.${index}.type`);
                const rowIsDue = watch(`transactions.${index}.isDue`);
                return (
                  <div
                    key={field.id}
                    className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        {...register(`transactions.${index}.amount`)}
                        placeholder="মোট টাকা"
                        className="h-12 font-black rounded-xl border-none bg-white shadow-sm"
                      />
                      <select
                        {...register(`transactions.${index}.paymentMethod`)}
                        className="h-12 px-2 font-bold bg-white rounded-xl border-none shadow-sm text-xs"
                      >
                        <option value="cash">নগদ</option>
                        <option value="mobile">মোবাইল</option>
                        <option value="bank">ব্যাংক</option>
                      </select>
                    </div>
                    {rowType === "income" && (
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                        <input
                          type="checkbox"
                          {...register(`transactions.${index}.isDue`)}
                          className="w-4 h-4 accent-primary rounded"
                        />
                        <span className="text-xs font-black text-primary">
                          বাকি?
                        </span>
                        {rowIsDue && (
                          <Input
                            {...register(`transactions.${index}.customerName`)}
                            placeholder="নাম"
                            className="h-8 text-xs border-none bg-slate-50"
                          />
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <select
                        {...register(`transactions.${index}.type`)}
                        className="text-[10px] font-black p-1 rounded bg-white shadow-sm"
                      >
                        <option value="income">বিক্রয়</option>
                        <option value="expense">খরচ</option>
                      </select>
                      <Input
                        type="date"
                        {...register(`transactions.${index}.date`)}
                        className="h-8 text-[10px] border-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="ml-auto text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    type: "income",
                    date: getLocalDate(),
                    amount: "",
                    isDue: false,
                    paymentMethod: "cash",
                  })
                }
                className="w-full border-dashed border-2 rounded-2xl h-14 text-slate-400 font-bold hover:text-primary transition-all flex items-center justify-center"
              >
                <Plus size={16} className="mr-2" /> আরও যোগ করুন
              </Button>
            </div>
          )}
          <Button
            type="submit"
            className="w-full h-16 text-lg font-black rounded-3xl bg-primary text-white shadow-xl active:scale-95 transition-all"
          >
            সব দোকান সেভ করুন
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
