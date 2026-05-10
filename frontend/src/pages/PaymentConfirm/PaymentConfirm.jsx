import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import API from "../../services/api";

const PaymentConfirm = () => {
  const { token } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await API.get(`/payments/collabx-session/${token}`);
        setSession(response.data.session);
      } catch (error) {
        toast.error("Session Verification Failed");
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [token]);

  const handleConfirm = async () => {
    if (confirming || session?.status === "paid") return;
    setConfirming(true);
    try {
      const response = await API.post(`/payments/collabx-session/${token}/confirm`, { method: "upi" });
      setSession(response.data.session);
      toast.success("Transaction Authorized");
    } catch (error) {
      toast.error("Handshake Failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020203] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* CARD CONTAINER */}
        <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
          
          {/* HEADER SECTION */}
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 pt-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] text-blue-100">
                  <Zap size={10} fill="currentColor" /> Live Transaction
                </div>
                <h1 className="mt-4 text-3xl font-black italic tracking-tighter text-white">
                  CONFIRM <br/> APPROVAL
                </h1>
              </div>
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
                <Smartphone size={28} className="text-white" />
              </div>
            </div>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loader"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 gap-4"
                >
                  <Loader2 className="animate-spin text-blue-500" size={40} />
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Verifying Node...</p>
                </motion.div>
              ) : session ? (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* AMOUNT CARD */}
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 relative group transition-all hover:bg-white/[0.04]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1">Authorization Value</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-blue-500">₹</span>
                      <span className="text-5xl font-black tracking-tighter">{session.amount}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-700 truncate max-w-[200px]">{session.id}</span>
                      <ShieldCheck size={14} className="text-emerald-500/50" />
                    </div>
                  </div>

                  {/* STATUS AREA */}
                  {session.status === "paid" ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"
                    >
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                        <CheckCircle2 className="relative text-emerald-400" size={56} strokeWidth={2.5} />
                      </div>
                      <h2 className="mt-6 text-2xl font-black italic tracking-tighter">SUCCESSFUL</h2>
                      <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                        Authorization complete. Your ticket is being generated in the main terminal.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <ShieldCheck className="text-blue-400 shrink-0" size={20} />
                        <p className="text-[11px] leading-relaxed text-blue-200/60 font-medium">
                          You are authorizing a secure payment on the <span className="text-blue-400">CollabX Layer</span>. This action is encrypted and irreversible once confirmed.
                        </p>
                      </div>

                      <button
                        onClick={handleConfirm}
                        disabled={confirming}
                        className="group relative w-full h-16 overflow-hidden rounded-2xl transition-all active:scale-[0.97] disabled:opacity-50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:to-blue-500 transition-all"></div>
                        <div className="relative h-full flex items-center justify-center gap-3">
                          <span className="text-sm font-black uppercase tracking-[0.2em]">
                            {confirming ? "AUTHORIZING..." : "COMPLETE PAYMENT"}
                          </span>
                          {!confirming && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </div>
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-10 text-center"
                >
                  <AlertCircle size={48} className="mx-auto text-red-500/50 mb-4" />
                  <p className="text-sm font-bold text-red-400">SESSION EXPIRED</p>
                  <p className="text-xs text-gray-600 mt-2">The payment link is invalid or has timed out.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER METADATA */}
        <div className="mt-8 flex flex-col items-center gap-2 opacity-30">
          <p className="text-[9px] font-mono tracking-[0.3em] uppercase">CollabX Payment Protocol v4.0</p>
          <div className="flex gap-1">
            <div className="h-1 w-1 bg-white rounded-full"></div>
            <div className="h-1 w-8 bg-white rounded-full"></div>
            <div className="h-1 w-1 bg-white rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default PaymentConfirm;
