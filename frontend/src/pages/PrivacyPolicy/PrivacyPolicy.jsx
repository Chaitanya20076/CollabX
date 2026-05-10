import React from "react";
import { ShieldCheck, Database, Eye, Lock, HardDrive, Cpu, ShieldAlert } from "lucide-react";

const PrivacyPolicy = () => {
  const dataPoints = [
    {
      icon: <Database className="text-blue-500" />,
      title: "Collection",
      desc: "Metadata, chat logs, and authentication credentials.",
    },
    {
      icon: <Cpu className="text-purple-500" />,
      title: "Processing",
      desc: "Real-time neural analysis for workflow automation.",
    },
    {
      icon: <Lock className="text-emerald-500" />,
      title: "Protection",
      desc: "End-to-end encryption for all session telemetry.",
    },
  ];

  return (
    <div className="bg-[#020203] text-white min-h-screen pt-32 pb-24">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        {/* HEADER SECTION */}
        <div className="mb-20 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <ShieldCheck size={14} /> Data Integrity Protocol Verified
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-8">
            PRIVACY <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-600">POLICY</span>
          </h1>
          
          <p className="text-gray-400 text-xl leading-relaxed max-w-3xl">
            CollabX is engineered with a privacy-first architecture. This document outlines our commitment to safeguarding your neural and transactional data.
          </p>
        </div>

        {/* DATA VISUALIZATION GRID */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {dataPoints.map((item, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all group">
              <div className="mb-6 transform group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* POLICY CONTENT */}
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-20">
            
            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-4">
                <Eye className="text-emerald-500" />
                Information Collection
              </h2>
              <p className="text-gray-400 text-lg leading-9 font-light">
                We collect information essential for the execution of automated workflows. This includes name, email address, login credentials, and ticket metadata. All chat interactions are processed to optimize chatbot accuracy and system responsiveness.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-4">
                <HardDrive className="text-blue-500" />
                Data Usage & Analytics
              </h2>
              <p className="text-gray-400 text-lg leading-9 font-light">
                Your data powers the CollabX engine. We utilize collected information for authentication, multi-modal chatbot processing, and real-time support telemetry. Performance data is anonymized to improve our underlying neural models.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-4">
                <Lock className="text-purple-500" />
                Security Infrastructure
              </h2>
              <p className="text-gray-400 text-lg leading-9 font-light">
                We implement enterprise-grade encryption for all data at rest and in transit. Our security protocols include secure token-based authentication and isolated communication channels to ensure that your transactions remain confidential.
              </p>
            </section>

          </div>

          {/* SIDEBAR SECURITY CARD */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 p-8 rounded-[2.5rem] bg-[#0a0a0c] border border-white/5 shadow-2xl shadow-emerald-500/5">
              <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] uppercase tracking-widest mb-6">
                <ShieldAlert size={14} /> Security Advisory
              </div>
              <h4 className="text-xl font-bold mb-4 italic">User Data Rights</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                As a user of the CollabX ecosystem, you retain the right to request a complete purge of your interaction history or data logs at any time.
              </p>
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-600">
                  <span>ENCRYPTION</span>
                  <span className="text-emerald-500">AES-256-GCM</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-600">
                  <span>PROTOCOL</span>
                  <span className="text-emerald-500">TLS 1.3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="mt-32 pt-12 border-t border-white/5 text-center">
          <p className="text-gray-600 text-xs font-mono uppercase tracking-[0.4em]">
            © 2026 CollabX // Secure Data Transmission Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;