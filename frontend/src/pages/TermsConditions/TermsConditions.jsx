import React from "react";
import { ShieldAlert, Scale, Globe, Terminal, FileText, Clock } from "lucide-react";

const TermsConditions = () => {
  const sections = [
    {
      icon: <Globe size={20} />,
      title: "General Terms",
      content: "By accessing and using CollabX, users agree to comply with all platform policies, security guidelines, and operational procedures. Continued use of the platform constitutes acceptance of any future modifications to these terms.",
    },
    {
      icon: <Terminal size={20} />,
      title: "User Responsibilities",
      content: "Users must provide accurate information and avoid misuse of chatbot systems, ticket workflows, or payment features. Any attempt to reverse-engineer or exploit the neural logic of the platform is strictly prohibited.",
    },
    {
      icon: <ShieldAlert size={20} />,
      title: "Platform Availability",
      content: "CollabX reserves the right to modify or discontinue services temporarily for maintenance, security patches, and neural model upgrades. We strive for 99.9% uptime but do not guarantee it during beta phases.",
    },
    {
      icon: <Scale size={20} />,
      title: "Limitation of Liability",
      content: "The platform is provided as a prototype/demo system and does not guarantee uninterrupted or error-free operation. CollabX is not liable for data loss or financial discrepancies resulting from system-level bugs.",
    },
  ];

  return (
    <div className="bg-[#020203] text-white min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* HEADER SECTION */}
        <div className="mb-20">
          <div className="flex items-center gap-3 text-blue-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">
            <FileText size={16} />
            Compliance Protocol
          </div>
          <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter mb-6">
            TERMS OF <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">SERVICE</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm font-mono">
            <Clock size={14} />
            LAST UPDATED: MAY 10, 2026
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          
          {/* SIDEBAR NAVIGATION - VISUAL ONLY */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-32 space-y-4">
              {sections.map((section, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group">
                  <div className="text-gray-500 group-hover:text-blue-400 transition-colors">
                    {section.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-400 group-hover:text-white">
                    {section.title}
                  </span>
                </div>
              ))}
              <div className="p-6 mt-8 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20">
                <p className="text-xs text-blue-300 leading-relaxed font-mono">
                  NOTICE: You are currently viewing the Beta-Protocol v1.0 terms. These apply to all regional deployments.
                </p>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-8 space-y-12">
            {sections.map((section, index) => (
              <div key={index} className="group overflow-hidden">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-mono text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                    SECTION 0{index + 1}
                  </span>
                  <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
                </div>
                
                <h2 className="text-3xl font-bold mb-6 group-hover:text-blue-400 transition-colors">
                  {section.title}
                </h2>
                
                <p className="text-gray-400 text-lg leading-9 font-light">
                  {section.content}
                </p>
                
                {/* INTERACTIVE GLOW DIVIDER */}
                <div className="mt-12 h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              </div>
            ))}

            {/* FINAL ACKNOWLEDGMENT */}
            <div className="mt-20 p-10 rounded-[2rem] bg-[#0a0a0c] border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Scale size={120} />
              </div>
              <h3 className="text-xl font-bold mb-4 italic">Acceptance of Terms</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                By interacting with the CollabX API or Frontend deployment, you acknowledge that you have read, understood, and agreed to be bound by these functional protocols. For enterprise-level inquiries regarding custom SLAs, please contact our legal engineering department.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsConditions;