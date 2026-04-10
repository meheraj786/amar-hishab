import { useState } from "react";
import { auth } from "../lib/firebase";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { useKhataStore } from "../store/useKhataStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Mail, 
  Calendar, 
  Hash, 
  CheckCircle, 
  AlertCircle, 
  LogOut,
  Key
} from "lucide-react";
import { signOut } from "firebase/auth";

export default function Profile() {
  const user = auth.currentUser;
  const { transactions } = useKhataStore();
  
  const [name, setName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const totalTransactions = transactions.length;
  // const balance = getBalance();

  const handleUpdateName = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      setMessage({ text: "নাম সফলভাবে আপডেট হয়েছে!", type: "success" });
      setIsEditing(false);
    } catch (err) {
      setMessage({ text: "নাম আপডেট করতে সমস্যা হয়েছে।", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage({ text: "পাসওয়ার্ড রিসেট লিঙ্ক ইমেইলে পাঠানো হয়েছে।", type: "success" });
    } catch (err) {
      setMessage({ text: "সমস্যা হয়েছে, আবার চেষ্টা করুন।", type: "error" });
    }
  };

  const handleLogout = () => {
    if (confirm("আপনি কি লগআউট করতে চান?")) {
      signOut(auth);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2EE] p-4 md:p-12 pb-32">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            আমার <span className="text-primary">প্রোফাইল</span>
          </h1>
          <p className="text-slate-500 font-semibold mt-2">আপনার ব্যক্তিগত তথ্য এবং হিসাবের তথ্য</p>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] -z-0 opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center md:items-start gap-8">
            {/* Avatar Initials */}
            <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-teal-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary">
                {user?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            <div className="w-full space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">পূর্ণ নাম</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      disabled={!isEditing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-bold text-slate-900 disabled:opacity-100"
                    />
                  </div>
                  {isEditing ? (
                    <Button onClick={handleUpdateName} disabled={loading} className="h-14 rounded-2xl bg-emerald-600 px-6 font-bold shadow-lg shadow-emerald-100">
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="h-14 rounded-2xl border-emerald-100 text-emerald-600 font-bold px-6">
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Email Field (Disabled) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ইমেইল অ্যাড্রেস</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    disabled
                    value={user?.email || ""}
                    className="pl-12 h-14 rounded-2xl bg-slate-50/50 border-none font-bold text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Hash size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">মোট এন্ট্রি</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{totalTransactions}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <Calendar size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">জয়েনিং তারিখ</span>
            </div>
            <p className="text-sm font-black text-slate-900">
              {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('bn-BD') : "N/A"}
            </p>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">অ্যাকাউন্ট সেটিংস</h3>
          
          <button 
            onClick={handleResetPassword}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors text-slate-600 font-bold"
          >
            <div className="flex items-center gap-3">
              <Key size={18} className="text-blue-500" />
              <span>পাসওয়ার্ড পরিবর্তন করুন</span>
            </div>
            <AlertCircle size={16} className="text-slate-300" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-rose-50 rounded-2xl transition-colors text-rose-600 font-bold"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span>লগআউট</span>
            </div>
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

      </div>
    </div>
  );
}