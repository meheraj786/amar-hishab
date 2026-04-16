import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, Trash2, Printer, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: number;
}

const InvoiceGenerator = () => {
  
  const componentRef = useRef<HTMLDivElement>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('বিক্রিত পণ্য ফেরত নেওয়া হয় না।');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: '', quantity: 1, price: 0 }
  ]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const subTotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const total = subTotal - discount;
  const due = total - paidAmount;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  return (
    <div className="min-h-screen bg-[#F4F2EE] p-4 md:p-10 pb-32">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-900 mb-2">ইনভয়েস তথ্য</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">কোম্পানি লোগো</Label>
                  <Input type="file" onChange={handleLogoChange} className="rounded-xl bg-slate-50 border-none h-12 pt-2 cursor-pointer" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="প্রতিষ্ঠানের নাম" className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                  <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="ইনভয়েস নম্বর #001" className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="কাস্টমারের নাম" className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                  <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="মোবাইল নম্বর" className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-slate-400 ml-1">তারিখ</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-slate-400 ml-1">শেষ তারিখ (Due)</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                  </div>
                </div>

                <Separator />

                <h3 className="font-black text-xs uppercase text-slate-400 pt-2">পণ্য বা সেবার তালিকা</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl">
                      <Input placeholder="বিবরণ" className="flex-1 bg-white border-none rounded-lg font-bold h-10 text-sm" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                      <Input type="number" placeholder="qty" className="w-16 bg-white border-none rounded-lg font-bold h-10 text-sm" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                      <Input type="number" placeholder="price" className="w-20 bg-white border-none rounded-lg font-bold h-10 text-sm" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)} />
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-rose-500 hover:bg-rose-100 rounded-lg h-10 w-10"><Trash2 size={16}/></Button>
                    </div>
                  ))}
                  <Button onClick={addItem} variant="outline" className="w-full border-dashed border-2 h-10 text-xs font-bold hover:text-primary">
                    <Plus size={14} className="mr-1"/> আইটেম যোগ করুন
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} placeholder="ডিসকাউন্ট ৳" className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                  <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(Number(e.target.value))} placeholder="জমা ৳" className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="বিশেষ নোট (ঐচ্ছিক)" className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                  <Input value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="শর্তাবলী" className="rounded-xl bg-slate-50 border-none h-12 font-bold" />
                </div>
              </div>

              <Button onClick={() => handlePrint()} className="w-full h-16 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                <Printer size={20} className="mr-2"/> ইনভয়েস প্রিন্ট করুন
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: A4 Preview */}
        <div className="lg:col-span-7 sticky top-10 hidden lg:block overflow-auto max-h-[85vh] p-6 bg-slate-200 rounded-[2.5rem] shadow-inner">
          {/* A4 Paper Container */}
          <div ref={componentRef} className="bg-white mx-auto text-slate-900 font-sans shadow-2xl flex flex-col" style={{ width: '210mm', height: '297mm', padding: '15mm' }}>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                {logo ? <img src={logo} alt="Logo" className="h-16 object-contain" /> : <div className="h-14 w-14 bg-primary text-white rounded-xl flex items-center justify-center font-black text-2xl uppercase">{companyName ? companyName.charAt(0) : 'A'}</div>}
                <div>
                  <h1 className="text-2xl font-black text-primary uppercase leading-tight">{companyName || 'আপনার প্রতিষ্ঠানের নাম'}</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">অফিসিয়াল ইনভয়েস</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-black text-slate-100 uppercase leading-none mb-2">INVOICE</h2>
                <div className="text-xs font-bold space-y-0.5">
                  <p className="text-slate-400">রসিদ নম্বর: <span className="text-slate-900">#{invoiceNo || '000'}</span></p>
                  <p className="text-slate-400">তারিখ: <span className="text-slate-900">{date}</span></p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">বিল টু (ক্রেতা):</p>
                <h3 className="text-base font-black text-slate-900">{clientName || 'কাস্টমারের নাম'}</h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5 flex items-center gap-1.5"><Phone size={10} className="text-primary"/> {clientPhone || 'মোবাইল নম্বর নেই'}</p>
              </div>
              <div className="flex flex-col justify-center items-end pr-4">
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">মোট বকেয়া পরিমাণ</p>
                <h3 className="text-3xl font-black text-slate-900">৳{due.toLocaleString()}</h3>
                {dueDate && <p className="text-[10px] font-bold text-rose-500 mt-1 uppercase italic">Due Date: {dueDate}</p>}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary border-none">
                    <TableHead className="text-white font-black uppercase text-[10px] h-10 rounded-l-lg pl-4">বিবরণ</TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] h-10 text-center">পরিমাণ</TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] h-10 text-right">একক মূল্য</TableHead>
                    <TableHead className="text-white font-black uppercase text-[10px] h-10 text-right rounded-r-lg pr-4">মোট</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-100">
                      <TableCell className="font-bold py-3 pl-4 text-sm">{item.description || 'পণ্যের বিবরণ...'}</TableCell>
                      <TableCell className="text-center font-bold text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-right font-bold text-sm">৳{item.price.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-black text-sm pr-4">৳{(item.quantity * item.price).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {/* Fill empty space to maintain design structure if items are few */}
                  {items.length < 5 && [1, 2, 3].map((_, i) => (
                    <TableRow key={i} className="border-none opacity-0"><TableCell colSpan={4} className="py-3">&nbsp;</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary & Footer */}
            <div className="mt-6 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="max-w-[50%] space-y-3">
                  {notes && (
                    <div>
                      <h4 className="text-[9px] font-black text-slate-400 uppercase mb-1">নোট:</h4>
                      <p className="text-xs font-bold text-slate-600 italic leading-snug">{notes}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-[9px] font-black text-slate-400 uppercase mb-1">শর্তাবলী:</h4>
                    <p className="text-[9px] font-bold text-slate-400 leading-tight">{terms}</p>
                  </div>
                </div>

                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>সাবটোটাল:</span>
                    <span>৳{subTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-emerald-600">
                      <span>ডিসকাউন্ট:</span>
                      <span>- ৳{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator className="bg-slate-100" />
                  <div className="flex justify-between text-sm font-black text-slate-900">
                    <span>সর্বমোট:</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>পরিশোধিত:</span>
                    <span>৳{paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-900 text-white rounded-xl mt-1">
                    <span className="text-xs font-black uppercase">বকেয়া পরিমাণ:</span>
                    <span className="text-sm font-black">৳{due.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end pt-8 mt-4">
                <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                  Amar Hisab Invoice System
                </div>
                <div className="text-center w-40">
                  <div className="border-t border-slate-900 pt-1.5">
                    <p className="text-[10px] font-black uppercase text-slate-900">অথোরাইজড সিগনেচার</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-50 text-center">
              <p className="text-[8px] font-black text-slate-300 tracking-[0.3em] uppercase">
                Generated via amar-hishab.vercel.app
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceGenerator;