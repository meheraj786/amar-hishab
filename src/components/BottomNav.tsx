import {
  Home,
  List,
  BarChart3,
  MoreHorizontal,
  ScrollText,
  User,
} from "lucide-react";
import { NavLink } from "react-router";

const navItems = [
  { to: "/", icon: Home, label: "হোম" },
  { to: "/transactions", icon: List, label: "খাতা" },
  { to: "/dues", icon: ScrollText, label: "বাকি" },
  { to: "/reports", icon: BarChart3, label: "রিপোর্ট" },
  { to: "/profile", icon: User, label: "প্রোফাইল" },
  { to: "/more", icon: MoreHorizontal, label: "আরও" },
];

export default function BottomNav() {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-around px-2 pb-safe pt-1 max-w-md mx-auto">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                    <span className="text-[11px] font-semibold tracking-wide">
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <nav className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col z-50 bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800">
        <div className="px-5 py-6 mb-2">
          <span className="text-xl font-bold text-black tracking-tight uppercase">
            কাপড় <span className="text-primary">দোকান</span>
          </span>
        </div>
        <div className="flex flex-col gap-1 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-sm">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
