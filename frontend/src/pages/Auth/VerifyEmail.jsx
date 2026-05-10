import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, RefreshCw, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user, resendVerification, refreshUser, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.emailVerified) {
      navigate("/setup-loader");
    }
  }, [user, navigate]);

  const handleCheckVerification = async () => {
    try {
      setLoading(true);
      const updatedUser = await refreshUser();
      
      if (updatedUser?.emailVerified) {
        toast.success("Email verified successfully!");
        navigate("/setup-loader");
      } else {
        toast.error("Email not verified yet. Please check your inbox.");
      }
    } catch (error) {
      toast.error(error.message || "Failed to check verification status.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await resendVerification();
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-24 relative overflow-hidden bg-[#020203]">
      {/* AMBIENT LIGHTING */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-600/10 blur-[120px] rounded-full" />
      
      {/* TEXTURE OVERLAY */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:18px_18px] opacity-20 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-xl relative mx-4"
      >
        {/* GLOW BORDER EFFECT */}
        <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500 via-transparent to-emerald-500 rounded-[40px] opacity-30"></div>

        <div className="relative bg-[#0a0a0c]/90 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-14 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] text-center">
          
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
              <Mail size={32} className="text-blue-400" />
            </div>
          </div>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <ShieldCheck size={14} /> Security Checkpoint
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter gradient-text mb-4">
              VERIFY <span className="text-white">ACCESS</span>
            </h1>
            <p className="text-gray-400 font-medium tracking-tight mb-2">
              We've sent a secure initialization link to:
            </p>
            <p className="text-emerald-400 font-bold text-lg mb-6">
              {user?.email || "your email address"}
            </p>
            <p className="text-gray-500 text-sm">
              Please click the link in the email to activate your Node.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleCheckVerification}
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-white p-[1px] transition-all active:scale-[0.98]"
            >
              <div className="relative flex items-center justify-center gap-3 bg-[#0a0a0c] group-hover:bg-transparent py-4 transition-all duration-500 rounded-[15px]">
                <span className="text-lg font-black tracking-tighter text-white group-hover:text-black transition-colors uppercase">
                  {loading ? "CHECKING..." : "I HAVE VERIFIED MY EMAIL"}
                </span>
                {!loading && <ArrowRight size={18} className="text-emerald-400 group-hover:text-black transition-colors" />}
              </div>
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all rounded-2xl py-4 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white"
            >
              <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
              {resending ? "RESENDING..." : "RESEND VERIFICATION LINK"}
            </button>
          </div>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancel & Return to Login
            </button>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

export default VerifyEmail;
