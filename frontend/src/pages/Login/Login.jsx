import { useContext, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion"; // Add this for cinematic feel
import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, resetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Login successful");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      toast.success("Google login successful");
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Enter your email first");
    try {
      await resetPassword(email);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-20 relative overflow-hidden bg-[#020203]">
      {/* CINEMATIC BACKGROUND ELEMENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      
      {/* GRID OVERLAY */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:18px_18px] opacity-20 brightness-50 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[540px] relative"
      >
        {/* OUTER GLOW RING */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[45px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div className="relative bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 md:p-14 shadow-2xl overflow-hidden">
          
          {/* TOP DECORATIVE BAR */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <ShieldCheck size={12} /> Secure Auth Protocol
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter gradient-text mb-4">
              LOGIN
            </h1>
            <p className="text-gray-500 font-medium">
              Initialize session for <span className="text-white">CollabX</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* EMAIL FIELD */}
            <div className="group">
              <label className="block mb-2 ml-2 text-xs font-bold text-gray-500 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">
                Identity / Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="group">
              <div className="flex justify-between items-center mb-2 ml-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest group-focus-within:text-purple-500 transition-colors">
                  Access Key
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-bold text-gray-600 hover:text-white transition uppercase tracking-tighter"
                >
                  Lost Access?
                </button>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button 
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-white p-[1px] transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="relative flex items-center justify-center gap-3 bg-[#0a0a0c] group-hover:bg-transparent py-4 transition-all duration-300 rounded-[15px]">
                <span className={`text-lg font-bold tracking-tight ${loading ? 'text-gray-500' : 'text-white group-hover:text-black transition-colors'}`}>
                  {loading ? "AUTHENTICATING..." : "AUTHORIZE SESSION"}
                </span>
                {!loading && <Zap size={18} className="text-blue-500 group-hover:text-black transition-colors" />}
              </div>
            </button>
          </form>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-10">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">External OAuth</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          {/* GOOGLE LOGIN */}
          <button
            onClick={handleGoogleLogin}
            className="w-full group bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all rounded-2xl py-4 flex items-center justify-center gap-4 text-sm font-bold uppercase tracking-widest"
          >
            <FcGoogle size={22} className="group-hover:scale-110 transition-transform" />
            Sign in with Google
          </button>

          {/* FOOTER */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              New to the ecosystem?{" "}
              <Link to="/signup" className="text-blue-500 font-bold hover:text-blue-400 hover:underline underline-offset-4 transition-all">
                Generate Account
              </Link>
            </p>
          </div>
        </div>
        
        {/* SUBTLE FOOTER DECOR */}
        <div className="mt-6 flex justify-center gap-8 opacity-20">
          <div className="h-1 w-12 bg-white rounded-full"></div>
          <div className="h-1 w-1 bg-white rounded-full"></div>
          <div className="h-1 w-1 bg-white rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
