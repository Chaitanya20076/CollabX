import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  ShieldCheck,
  CreditCard,
  LayoutDashboard,
  Ticket,
  BrainCircuit,
  MessageSquare,
  Clock3,
  CheckCircle2,
  ArrowRight,
  User,
  Zap,
  Sparkles
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <Bot size={32} />,
      title: "Neural Chatbot",
      desc: "Context-aware AI capable of handling complex multi-turn support workflows with human-like precision.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: <Ticket size={32} />,
      title: "Auto-Ticketing",
      desc: "Zero-latency issue detection that categorizes and assigns tickets before the user even finishes typing.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Quantum Security",
      desc: "Enterprise-grade encryption and biometric-ready authentication protocols for every transaction.",
      color: "from-green-500 to-emerald-400"
    },
    {
      icon: <CreditCard size={32} />,
      title: "Global Payments",
      desc: "Seamlessly integrated financial rails supporting multi-currency and automated billing cycles.",
      color: "from-orange-500 to-yellow-400"
    },
    {
      icon: <LayoutDashboard size={32} />,
      title: "Cortex Control",
      desc: "A high-fidelity command center providing real-time telemetry on every system interaction.",
      color: "from-red-500 to-rose-400"
    },
    {
      icon: <BrainCircuit size={32} />,
      title: "Core Intelligence",
      desc: "Deep-learning models that evolve with your data, optimizing support response times by 400%.",
      color: "from-indigo-500 to-blue-500"
    },
  ];

  const stats = [
    { number: "10K+", label: "Tickets Processed" },
    { number: "99.9%", label: "Uptime SLA" },
    { number: "24/7", label: "AI Availability" },
    { number: "500+", label: "Global Partners" },
  ];

  // Animation Variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-[#030303] text-white selection:bg-blue-500/30">
      
      {/* HERO SECTION - CINEMATIC INTRO */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-6 backdrop-blur-md">
              <Sparkles size={14} className="animate-spin-slow" />
              <span>v4.0 Protocol Active</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
              REDEFINE <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                INTELLIGENCE
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              CollabX is a high-performance AI ecosystem. We’ve merged neural automation with cinematic UX to build the world's most intuitive ticketing platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="group relative px-8 py-4 bg-blue-600 rounded-2xl font-bold overflow-hidden transition-all hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center gap-2">
                  Initialize System <ArrowRight size={20} />
                </span>
              </Link>
              <Link to="/workflow" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold backdrop-blur-md hover:bg-white/10 transition-colors">
                View Protocol
              </Link>
            </div>
          </motion.div>

          {/* MOCKUP UI - GLASSMORPHISM CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="perspective-1000"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-[#0a0a0c]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 uppercase tracking-widest font-bold">
                    Terminal Alpha
                  </div>
                </div>

                <div className="space-y-4 font-mono text-sm">
                  <div className="flex gap-3 text-blue-400">
                    <span className="opacity-50">01</span>
                    <p>System: Initializing neural routing...</p>
                  </div>
                  <div className="flex gap-3 text-white/80 pl-4 bg-white/5 py-3 rounded-xl border-l-2 border-blue-500">
                    <User size={16} className="text-blue-400" />
                    <p>User: "Fix server latency issue in Node-B"</p>
                  </div>
                  <div className="flex gap-3 text-purple-400">
                    <span className="opacity-50">02</span>
                    <p>AI: Intent detected: Infrastructure / Urgent</p>
                  </div>
                  <div className="flex gap-3 text-green-400">
                    <span className="opacity-50">03</span>
                    <p>Ticket #8829 generated and assigned to DevOps.</p>
                  </div>
                  <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS - MINIMALIST DASHBOARD STYLE */}
      <section className="py-24 relative border-y border-white/5 bg-[#050505]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                {...fadeInUp}
                className="text-center"
              >
                <h3 className="text-4xl md:text-6xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                  {stat.number}
                </h3>
                <p className="text-blue-500 font-mono text-xs uppercase tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - BENTO GRID */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 italic tracking-tighter">ENGINEERED FOR SCALE</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Every component is optimized for low-latency performance and enterprise-grade reliability.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group relative p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden transition-all hover:bg-white/[0.05]"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-5 blur-[150px]"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div {...fadeInUp}>
            <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter">READY TO UPGRADE?</h2>
            <Link to="/signup" className="inline-flex items-center gap-4 px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:scale-105 transition-transform">
              Deploy CollabX <Zap fill="black" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;