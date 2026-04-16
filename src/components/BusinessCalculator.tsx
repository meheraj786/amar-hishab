import { useState } from "react";
import { Calculator, X, Minus, Plus, Equal, Delete, Percent, Copy, Check } from "lucide-react";

export default function BusinessCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInput = (val: string) => {
    setResult(null);
    setDisplay((prev) => prev + val);
  };

  const handlePercent = () => {
    if (!display || result) return;

    try {
      const match = display.match(/(.*?)([\+\-\*\/÷×])?([0-9.]+)$/);
      
      if (match) {
        const [_, before, operator, lastNum] = match;
        const last = parseFloat(lastNum);

        if (!operator) {
          setDisplay((last / 100).toString());
        } else if (operator === "+" || operator === "-") {
          const baseValue = eval(before.replace(/×/g, "*").replace(/÷/g, "/"));
          const percentAmount = (baseValue * last) / 100;
          setDisplay(before + operator + percentAmount);
        } else {
          setDisplay(before + operator + (last / 100).toString());
        }
      }
    } catch (e) {
      setResult("Error");
    }
  };

  const calculate = () => {
    try {
      if (!display) return;
      const sanitized = display.replace(/×/g, "*").replace(/÷/g, "/");
      const calc = eval(sanitized);
      setResult(Number.isInteger(calc) ? calc.toString() : calc.toFixed(2));
    } catch (e) {
      setResult("Error");
    }
  };

  const copyResult = () => {
    const textToCopy = result || display;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clear = () => {
    setDisplay("");
    setResult(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[999] w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:bottom-10 md:right-10 border-4 border-white"
      >
        <Calculator size={28} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none md:inset-auto md:bottom-28 md:right-10 md:w-80 animate-in fade-in duration-200">
      <div className="w-full max-w-[320px] bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="bg-primary p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator size={18} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">বিজনেস ক্যালকুলেটর</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="bg-white/20 p-2 rounded-xl hover:bg-white/30 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 bg-slate-50 text-right min-h-[140px] flex flex-col justify-end relative">
          {(result || display) && (
            <button 
              onClick={copyResult}
              className="absolute top-4 left-4 p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-primary transition-all active:scale-90"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          )}
          
          <div className="text-slate-400 font-bold text-sm overflow-hidden whitespace-nowrap mb-1">
            {display || "0"}
          </div>
          <div className="text-5xl font-black text-primary tracking-tighter truncate">
            {result ? result : display.split(/[\+\-\*\/×÷]/).pop() || "0"}
          </div>
        </div>

        <div className="p-4 grid grid-cols-4 gap-2 bg-white">
          <button onClick={clear} className="py-4 rounded-2xl bg-rose-50 text-rose-500 font-black text-xs hover:bg-rose-100 transition-colors">AC</button>
          <button onClick={() => setDisplay(display.slice(0, -1))} className="py-4 rounded-2xl bg-slate-100 text-slate-600 font-black flex items-center justify-center hover:bg-slate-200"><Delete size={18} /></button>
          <button onClick={handlePercent} className="py-4 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center hover:bg-primary/20"><Percent size={18} /></button>
          <button onClick={() => handleInput("÷")} className="py-4 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center hover:bg-primary/20 text-xl">÷</button>

          {["7", "8", "9"].map((num) => (
            <button key={num} onClick={() => handleInput(num)} className="py-4 rounded-2xl bg-slate-50 text-slate-800 font-black text-xl hover:bg-slate-100 transition-colors">{num}</button>
          ))}
          <button onClick={() => handleInput("×")} className="py-4 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center hover:bg-primary/20 text-xl">×</button>

          {["4", "5", "6"].map((num) => (
            <button key={num} onClick={() => handleInput(num)} className="py-4 rounded-2xl bg-slate-50 text-slate-800 font-black text-xl hover:bg-slate-100 transition-colors">{num}</button>
          ))}
          <button onClick={() => handleInput("-")} className="py-4 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center hover:bg-primary/20"><Minus size={20}/></button>

          {["1", "2", "3"].map((num) => (
            <button key={num} onClick={() => handleInput(num)} className="py-4 rounded-2xl bg-slate-50 text-slate-800 font-black text-xl hover:bg-slate-100 transition-colors">{num}</button>
          ))}
          <button onClick={() => handleInput("+")} className="py-4 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center hover:bg-primary/20"><Plus size={20}/></button>

          <button onClick={() => handleInput(".")} className="py-4 rounded-2xl bg-slate-50 text-slate-800 font-black text-xl">.</button>
          <button onClick={() => handleInput("0")} className="py-4 rounded-2xl bg-slate-50 text-slate-800 font-black text-xl">0</button>
          <button onClick={calculate} className="col-span-2 py-4 rounded-2xl bg-primary text-white font-black text-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center">
            <Equal size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}