import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ShieldCheck, Sparkles, LayoutDashboard, Zap, Orbit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Initializing CollabX Node...",
  "Synchronizing Secure Workflows...",
  "Deploying Intelligent Dashboards...",
  "Optimizing Real-time Handshakes...",
  "Finalizing Environment Setup...",
];

const SetupLoader = () => {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 2000);

    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <section className="min-h-screen bg-[#020203] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* RADIANT BACKGROUND FLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-6 py-20">
        
        {/* CENTRAL LOGO ANIMATION */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative group">
            {/* Outer Rotating Rings */}
            <div className="absolute inset-0 scale-150 rotate-45 border-t border-indigo-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
            <div className="absolute inset-0 scale-125 -rotate-45 border-b border-violet-500/30 rounded-full animate-[spin_6s_linear_infinite]" />
            
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: ["0 0 20px rgba(79, 70, 229, 0.2)", "0 0 50px rgba(79, 70, 229, 0.5)", "0 0 20px rgba(79, 70, 229, 0.2)"]
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center relative z-10"
            >
              <Orbit size={58} className="text-white animate-pulse" />
            </motion.div>
          </div>
        </div>

        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black italic tracking-tighter mb-6"
          >
            WELCOME TO <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">COLLABX</span>
          </motion.h1>
          <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed italic">
            Preparing your high-velocity workspace and synchronizing your <span className="text-indigo-400">Sync-Node</span> ecosystem.
          </p>
        </div>

        {/* LOADING BOX */}
        <div className="max-w-2xl mx-auto mb-20 relative">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent blur-sm"></div>
          <div className="relative bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-10 overflow-hidden">
            
            <div className="flex items-center justify-center gap-4 mb-8 h-8">
              <Sparkles className="text-indigo-400 animate-bounce" size={20} />
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={currentMessage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-xl font-black uppercase tracking-widest italic text-white"
                >
                  {messages[currentMessage]}
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* PROGRESS BAR */}
            <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              />
            </div>
          </div>
        </div>

        {/* FEATURE PREVIEW TILES */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, color: "text-indigo-400", title: "Encrypted Auth", desc: "Military-grade synchronization for every workspace session." },
            { icon: Zap, color: "text-amber-400", title: "Sync-Speed", desc: "Sub-millisecond latency for real-time collaborative streams." },
            { icon: LayoutDashboard, color: "text-violet-400", title: "Smart-Node", desc: "Automated ticketing and dashboard visualization engine." }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (idx * 0.1) }}
              className="bg-[#0a0a0c]/40 border border-white/5 rounded-3xl p-8 hover:bg-white/[0.03] transition-all group"
            >
              <feature.icon className={`${feature.color} mb-6 group-hover:scale-110 transition-transform`} size={32} />
              <h3 className="text-xl font-black italic tracking-tight mb-3 uppercase">{feature.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SetupLoader;