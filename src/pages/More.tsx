import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InstallPWA from "@/components/InstallPWA";
import {
  Info,
  Smartphone,
  RefreshCcw,
  ExternalLink,
  Heart,
  // LogOut,
  Cloud,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function More() {
  const handleReset = () => {
    if (
      confirm(
        "আপনি কি নিশ্চিত যে সব ডেটা মুছে ফেলবেন? এটি আর ফিরে পাওয়া যাবে না।",
      )
    ) {
      localStorage.removeItem("khata-storage-v1");
      window.location.reload();
    }
  };
  const handleLogout = async () => {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      await signOut(auth);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fcfdfe] transition-colors duration-300">
      <div className="max-w-full mx-auto p-5 md:p-12 pb-32">
        <div className="mb-12 text-center md:text-left space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            আরও <span className="text-emerald-600">অপশন</span>
          </h1>
          <p className="text-slate-500 font-semibold text-lg">
            অ্যাপ সেটিংস এবং তথ্য
          </p>
        </div>

        <div className="space-y-8">
          {/* App Info Card */}
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-8 md:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center text-emerald-600 shadow-inner">
                    <Info size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl text-slate-900 leading-tight">
                      আমার<span className="text-emerald-600">হিসাব</span>
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 font-mono">
                      Version 2.0 • Stable
                    </p>
                  </div>
                </div>
                {/* Optional: Add a subtle badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-600 tracking-wide">
                    সিস্টেম সচল আছে
                  </span>
                </div>
              </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
  {/* Cloud Sync Information */}
  <div className="group flex gap-4 p-6 bg-slate-50 hover:bg-blue-50/50 transition-colors rounded-[2rem] border border-slate-100/50">
    <Cloud
      size={24}
      className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform"
    />
    <p className="text-sm font-medium text-slate-600 leading-relaxed">
      আপনার সব ডেটা আপনার <strong>অ্যাকাউন্টের</strong> সাথে ক্লাউডে সুরক্ষিতভাবে সিঙ্ক থাকে।
    </p>
  </div>

  {/* Offline Persistence Information */}
  <div className="group flex gap-4 p-6 bg-slate-50 hover:bg-emerald-50/50 transition-colors rounded-[2rem] border border-slate-100/50">
    <RefreshCcw
      size={24}
      className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform"
    />
    <p className="text-sm font-medium text-slate-600 leading-relaxed">
      <strong>অফলাইনেও</strong> নিশ্চিন্তে ব্যবহার করুন, অনলাইন হওয়া মাত্রই ডেটা স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।
    </p>
  </div>
</div>
            </CardContent>
          </Card>

          <div className="p-[2px] bg-gradient-to-r from-emerald-100 via-emerald-600 to-emerald-100 rounded-[2.6rem] shadow-xl shadow-emerald-100/50">
            <div className="bg-white rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Smartphone className="text-emerald-600" size={20} />
                  </div>
                  <span className="font-bold text-slate-900 uppercase tracking-tighter text-lg">
                    সিস্টেম ইন্সটলেশন
                  </span>
                </div>
                <ExternalLink size={16} className="text-slate-300" />
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-4 mb-4 border border-slate-100">
                <p className="text-sm font-medium text-slate-500 text-center">
                  সহজেই অ্যাপের মতো হোমস্ক্রিনে শর্টকাট যোগ করুন
                </p>
              </div>
              <InstallPWA />
            </div>
          </div>

          <div className="pt-10">
            <div className="flex items-center gap-3 mb-5 ml-4">
              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-[0.3em]">
                Danger Zone
              </span>
              <div className="h-px flex-1 bg-rose-100"></div>
            </div>

            <Card className="border-2 border-dashed border-rose-200 bg-rose-50/20 rounded-[2.5rem] transition-all hover:bg-rose-50/40">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left space-y-2">
                  <p className="font-bold text-xl text-slate-900">
                    ডেটা ফ্যাক্টরি রিসেট
                  </p>
                  <p className="text-sm text-slate-500 font-semibold max-w-[250px]">
                    রিসেট করার সাথে সাথে আপনার সব এন্ট্রি চিরতরে মুছে যাবে।
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full md:w-auto px-10 h-14 rounded-2xl font-bold text-base shadow-xl shadow-rose-200 hover:shadow-rose-300 active:scale-95 transition-all flex items-center justify-center gap-3 "
                  onClick={handleReset}
                >
                  <RefreshCcw size={20} />
                  রিসেট করুন
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* New Modern Footer */}
          <footer className="text-center pt-12 space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-300">
              <div className="h-px w-8 bg-slate-200"></div>
              <Heart size={14} className="fill-slate-200" />
              <div className="h-px w-8 bg-slate-200"></div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">
              Developed By{" "}
              <a
                className="text-emerald-500 font-black"
                href="https://github.com/meheraj786"
              >
                Meheraj
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
