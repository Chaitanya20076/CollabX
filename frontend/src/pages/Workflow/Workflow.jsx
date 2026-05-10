import React from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  BrainCircuit,
  Ticket,
  LayoutDashboard,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Bot,
  Layers,
  Cpu,
  Globe
} from "lucide-react";

const Workflow = () => {
  const workflowSteps = [
    {
      icon: <MessageSquare size={32} />,
      title: "User Interaction",
      desc: "Users communicate with the AI chatbot by describing issues or initiating complex support workflows via natural language.",
      color: "from-blue-600 to-cyan-500"
    },
    {
      icon: <BrainCircuit size={32} />,
      title: "Neural Intent Mapping",
      desc: "The AI engine performs real-time semantic analysis to detect high-level intent and priority levels.",
      color: "from-purple-600 to-indigo-500"
    },
    {
      icon: <Ticket size={32} />,
      title: "Ticket Synthesis",
      desc: "The platform instantly generates categorized tickets, populating metadata based on the chat context.",
      color: "from-pink-600 to-rose-500"
    },
    {
      icon: <LayoutDashboard size={32} />,
      title: "Realtime Telemetry",
      desc: "Tickets are streamed into the admin command center with sub-second latency for immediate oversight.",
      color: "from-orange-600 to-amber-500"
    },
    {
      icon: <CreditCard size={32} />,
      title: "Financial Rails",
      desc: "Integrated payment gateways process booking transactions with enterprise-grade security protocols.",
      color: "from-emerald-600 to-green-500"
    },
    {
      icon: <CheckCircle2 size={32} />,
      title: "Auto-Resolution",
      desc: "System closes the loop by notifying users and archiving data once the workflow reaches 'Resolved' status.",
      color: "from-blue-500 to-blue-700"
    },
  ];

  const chatbotFlow = [
    { user: "Book 2 tickets for tomorrow", bot: "Booking request detected successfully.", status: "Intent Found" },
    { user: "Proceed with payment", bot: "Payment workflow initialized.", status: "Processing" },
    { user: "Generate ticket", bot: "Ticket generated successfully. ID: CX-2045", status: "Complete" },
  ];

  return (
    <div className="bg-[#020203] text-white min-h-screen selection:bg-purple-500/30">
      
      {/* HERO SECTION - ARCHITECTURAL STYLE */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Cpu size={14} /> System Architecture v4.0
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 italic">
              THE <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">ENGINE</span>
            </h1>
            
            <p className="text-gray-400 text-xl leading-relaxed max-w-2xl">
              CollabX isn't just a chatbot. It's a multi-layered automation pipeline that transforms raw user input into actionable enterprise data.
            </p>
          </motion.div>
        </div>
      </section>

      {/* STEP BY STEP - CONNECTED NODES */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent"
              >
                <div className="bg-[#0a0a0c] rounded-[2.4rem] p-10 h-full transition-all group-hover:bg-[#0f0f12]">
                  <div className="flex justify-between items-start mb-10">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg shadow-blue-500/10`}>
                      {step.icon}
                    </div>
                    <span className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                      0{index + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO - CODE TERMINAL STYLE */}
      <section className="py-32 bg-[#050505] border-y border-white/5">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          
          <div>
            <h2 className="text-5xl font-black mb-8 tracking-tight">INTELLIGENT<br/>HANDSHAKE</h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Our proprietary NLP engine performs a seamless handshake between the User Persona and the System Logic.
            </p>
            
            <div className="space-y-4">
              {["Low Latency Response", "Multi-Modal Logic", "AES-256 Encryption"].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-mono text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-full"></div>
            <div className="relative bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-white/5 p-4 border-b border-white/10 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
              </div>
              
              <div className="p-8 space-y-6">
                {chatbotFlow.map((chat, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    key={i} 
                    className="space-y-3"
                  >
                    <div className="flex justify-end">
                      <div className="bg-white/5 px-5 py-3 rounded-2xl rounded-tr-none border border-white/10 text-sm max-w-[80%]">
                        <span className="text-blue-400 text-[10px] block mb-1 uppercase font-bold">User</span>
                        {chat.user}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-blue-600 px-5 py-3 rounded-2xl rounded-tl-none text-sm max-w-[80%] shadow-xl shadow-blue-600/20">
                        <span className="text-blue-200 text-[10px] block mb-1 uppercase font-bold">AI Node</span>
                        {chat.bot}
                        <div className="mt-2 pt-2 border-t border-white/20 text-[10px] font-mono opacity-70">
                          STATUS: {chat.status}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE CARDS */}
      <section className="py-32">
        <div className="container mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-bold italic tracking-tighter">THE STACK</h2>
        </div>
        
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
          {[
            { title: "Frontend", icon: <Layers className="text-blue-500" />, desc: "React + Framer Motion for cinematic interaction." },
            { title: "Engine", icon: <Cpu className="text-purple-500" />, desc: "Node.js High-Concurrency API Layer." },
            { title: "Storage", icon: <Globe className="text-emerald-500" />, desc: "Global Edge Database for zero-lag data sync." }
          ].map((item, i) => (
            <div key={i} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 text-center hover:border-blue-500/30 transition-colors">
              <div className="flex justify-center mb-6">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Workflow;