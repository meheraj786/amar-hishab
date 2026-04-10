import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  EyeOff,
  Eye,
} from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("নাম কমপক্ষে ৩ অক্ষরের হতে হবে।");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError(
        "অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস প্রদান করুন (উদাঃ example@mail.com)।",
      );
      return;
    }

    if (password.length < 6) {
      setError("নিরাপত্তার জন্য পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, { displayName: name });
      navigate("/");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("এই ইমেইলটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।");
      } else if (err.code === "auth/weak-password") {
        setError("পাসওয়ার্ডটি অনেক দুর্বল, আরও কঠিন পাসওয়ার্ড দিন।");
      } else {
        setError("অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            নতুন <span className="text-emerald-600">অ্যাকাউন্ট</span>
          </h1>
          <p className="text-slate-500 font-semibold mt-2">
            আপনার তথ্য দিয়ে শুরু করুন
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <UserIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                type="text"
                placeholder="আপনার নাম"
                className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                type="email"
                placeholder="ইমেইল অ্যাড্রেস"
                className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-semibold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
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
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-rose-500 text-sm font-bold text-center">
              {error}
            </p>
          )}

          <Button className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg shadow-lg shadow-emerald-100 mt-4">
            <UserPlus className="mr-2" size={20} /> সাইন আপ করুন
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-semibold text-sm">
            ইতিমধ্যেই অ্যাকাউন্ট আছে?{" "}
            <Link
              to="/login"
              className="text-emerald-600 font-bold hover:underline"
            >
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
