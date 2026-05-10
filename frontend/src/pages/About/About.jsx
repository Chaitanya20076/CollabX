import { motion } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Ticket,
  BrainCircuit,
  ShieldCheck,
  Workflow,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Bot size={32} />,
      title: "AI Chatbot Assistance",
      desc: "CollabX integrates intelligent chatbot systems capable of understanding user intent and automating ticket workflows.",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: <Ticket size={32} />,
      title: "Automated Ticketing",
      desc: "Support requests, complaints and booking workflows are converted into trackable tickets automatically.",
      color: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: <BrainCircuit size={32} />,
      title: "AI Intent Detection",
      desc: "The platform identifies user requests such as support issues, bookings and payment workflows using smart logic.",
      color: "from-orange-500/20 to-red-500/20",
    },
    {
      icon: <Workflow size={32} />,
      title: "Workflow Automation",
      desc: "Entire support lifecycles are streamlined from chatbot interaction to ticket resolution.",
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: <LayoutDashboard size={32} />,
      title: "Realtime Dashboard",
      desc: "Track ticket statuses, chatbot activity and support performance using modern dashboards.",
      color: "from-blue-600/20 to-indigo-600/20",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Secure Infrastructure",
      desc: "Authentication and protected workflows ensure secure interactions across the platform.",
      color: "from-gray-500/20 to-slate-800/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="bg-[#030303] text-white selection:bg-blue-500/30 font-sans">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="container px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-blue-400 mb-8 hover:bg-white/10 transition-colors cursor-default">
              <Sparkles size={14} className="animate-pulse" />
              <span>AI-Powered Support Ecosystem</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
              Redefining <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent italic">
                CollabX
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
              An intelligent infrastructure designed to modernize 
              customer support through seamless automation and neural intent detection.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-px h-24 bg-gradient-to-b from-blue-500 to-transparent" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-32 relative">
        <div className="container px-6 mx-auto">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            viewport={{ once: true }}
            className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-2xl p-12 md:p-20"
          >
            <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-blue-500/10 transition-colors duration-700">
              <Bot size={200} strokeWidth={0.5} />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
                  Our <span className="text-blue-500">Mission</span>
                </h2>
                <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                  <p>
                    We bridge the chasm between legacy support and autonomous intelligence. 
                    CollabX isn't just a tool; it's a living ecosystem that evolves with your users.
                  </p>
                  <p>
                    By merging high-fidelity UI with deep-learning intent detection, 
                    we reduce manual friction by up to 80%.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-3xl p-8 border border-white/5 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-8 text-white/90">Execution Pillars</h3>
                <div className="space-y-6">
                  {[
                    { title: "Smart Automation", color: "text-green-400" },
                    { title: "Immersive UX", color: "text-blue-400" },
                    { title: "Elastic Scaling", color: "text-purple-400" },
                  ].map((pill, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className={`p-2 rounded-lg bg-white/5 ${pill.color} group-hover/item:scale-110 transition-transform`}>
                        <CheckCircle2 size={20} />
                      </div>
                      <span className="text-lg font-medium text-gray-300">{pill.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-32">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Core Protocol</h2>
            <p className="text-gray-500 text-lg">Hyper-optimized features for elite support teams.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="relative group p-8 rounded-[2rem] border border-white/5 bg-[#0a0a0a] overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:text-white transition-all duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* EVOLUTION SECTION */}
      <section className="py-32 bg-[#050505]">
        <div className="container px-6 mx-auto">
          <h2 className="text-4xl font-bold mb-20 text-center">The Evolution</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              "Problem Identification",
              "AI Driven Solution",
              "Modern SaaS Architecture",
              "Future Scalability",
            ].map((step, i) => (
              <motion.div
                key={i}
                whileInView={{ x: 0, opacity: 1 }}
                initial={{ x: i % 2 === 0 ? -50 : 50, opacity: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-8 p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors"
              >
                <span className="text-5xl font-black text-white/5">{i + 1}</span>
                <div>
                  <h3 className="text-xl font-bold text-blue-400">{step}</h3>
                  <p className="text-gray-500 mt-1">Deploying advanced neural logic to solve legacy bottlenecks.</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[150px] rounded-full" />
        
        <div className="container px-6 relative z-10 text-center mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-12 tracking-tighter">
            READY TO <span className="text-blue-500">SCALE?</span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
            className="px-12 py-5 bg-white text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all cursor-pointer flex items-center gap-3 mx-auto"
          >
            Launch CollabX <ArrowUpRight size={20} />
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default About;