import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";

import { initAuthListener, useAuthStore } from "./store/useAuthStore";
import { useKhataStore } from "./store/useKhataStore";

import BottomNav from "./components/BottomNav";
import AddTransactionModal from "./components/AddTransactionModal";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import More from "./pages/More";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const { user, loading } = useAuthStore();
  const setTransactions = useKhataStore((state) => state.setTransactions);

  useEffect(() => {
    initAuthListener();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    if (user) {
      const q = query(
        collection(db, "users", user.uid, "transactions"),
        orderBy("createdAt", "desc"), 
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const txList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as any[];

          setTransactions(txList);
        },
        (error) => {
          console.error("Firestore sync error:", error);
        },
      );
    } else {
      setTransactions([]);
    }

    return () => unsubscribe();
  }, [user, setTransactions]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold text-slate-500 italic">
          আমার খাতা লোড হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <Router>
      <div
        className={
          user
            ? "min-h-screen md:max-w-[80%] bg-[#F4F2EE] pb-20 md:ml-55"
            : "min-h-screen w-full bg-[#F4F2EE]"
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Home onAddClick={() => setModalOpen(true)} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/transactions"
            element={user ? <Transactions /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports"
            element={user ? <Reports /> : <Navigate to="/login" />}
          />
          <Route
            path="/more"
            element={user ? <More /> : <Navigate to="/login" />}
          />

          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/" />}
          />
        </Routes>

        {user && (
          <>
            <AddTransactionModal open={modalOpen} onOpenChange={setModalOpen} />
            <BottomNav />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
