import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Mail, Lock, Loader2, EyeOff, Eye } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("অনুগ্রহ করে আপনার ইমেইলটি আগে লিখুন।");
      return;
    }
    setError("");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে। স্প্যাম ফোল্ডারটিও চেক করুন।",
      );
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।");
      } else {
        setError("পাসওয়ার্ড রিসেট লিঙ্ক পাঠাতে সমস্যা হয়েছে।");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            স্বাগতম <span className="text-emerald-600">খাতায়</span>
          </h1>
          <p className="text-slate-500 font-semibold mt-2">
            আপনার হিসেবে প্রবেশ করুন
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              type="email"
              placeholder="ইমেইল"
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-semibold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />

            <Input
              type={showPassword ? "text" : "password"} 
              placeholder="পাসওয়ার্ড"
              className="pl-12 pr-12 h-14 rounded-2xl bg-slate-50 border-none font-semibold transition-all focus:ring-2 focus:ring-emerald-500/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!loading}
            />

            {/* Eye Icon Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end px-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </div>

          {error && (
            <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 p-3 rounded-xl">
              {error}
            </p>
          )}
          {message && (
            <p className="text-emerald-600 text-xs font-bold text-center bg-emerald-50 p-3 rounded-xl">
              {message}
            </p>
          )}

          <Button
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="mr-2 animate-spin" size={20} />
            ) : (
              <LogIn className="mr-2" size={20} />
            )}
            {loading ? "লোডিং..." : "লগইন করুন"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-semibold text-sm">
            নতুন ইউজার?{" "}
            <Link
              to="/signup"
              className="text-emerald-600 font-bold hover:underline"
            >
              অ্যাকাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
