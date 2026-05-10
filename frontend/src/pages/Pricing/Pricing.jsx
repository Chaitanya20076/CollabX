import React from "react";
import {
  Film,
  Plane,
  Car,
  Bus,
  Hotel,
  Music,
  CheckCircle2,
  Percent,
  TrendingUp,
} from "lucide-react";

const Pricing = () => {
  const services = [
    {
      icon: <Film size={42} />,
      title: "Movie Ticketing",
      fee: "2%",
      desc: "Low platform fee for cinema and entertainment ticket bookings.",
      color: "text-red-500",
      glow: "group-hover:shadow-red-500/20",
    },
    {
      icon: <Plane size={42} />,
      title: "Flight Booking",
      fee: "5%",
      desc: "Advanced workflow fee for airline and travel reservation systems.",
      color: "text-blue-500",
      glow: "group-hover:shadow-blue-500/20",
    },
    {
      icon: <Car size={42} />,
      title: "Car Rentals",
      fee: "4%",
      desc: "Vehicle rental workflow automation and booking management.",
      color: "text-green-500",
      glow: "group-hover:shadow-green-500/20",
    },
    {
      icon: <Bus size={42} />,
      title: "Bus Ticketing",
      fee: "3%",
      desc: "Affordable platform fee for public transport and bus ticket systems.",
      color: "text-yellow-500",
      glow: "group-hover:shadow-yellow-500/20",
    },
    {
      icon: <Hotel size={42} />,
      title: "Hotel Booking",
      fee: "6%",
      desc: "Hotel and accommodation management with secure payment workflows.",
      color: "text-purple-500",
      glow: "group-hover:shadow-purple-500/20",
    },
    {
      icon: <Music size={42} />,
      title: "Concert & Events",
      fee: "7%",
      desc: "Event ticketing workflows with realtime booking automation.",
      color: "text-pink-500",
      glow: "group-hover:shadow-pink-500/20",
    },
  ];

  const benefits = [
    "Transparent service-based pricing",
    "Scalable transaction workflows",
    "Realtime AI automation support",
    "Secure payment integrations",
    "Cloud scalable infrastructure",
    "Custom enterprise onboarding",
  ];

  return (
    <div className="bg-[#020203] text-white min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          <div className="inline-flex items-center gap-3 border border-blue-500/30 bg-blue-500/10 px-6 py-2 rounded-full text-blue-400 mb-10 animate-pulse">
            <Percent size={18} />
            <span className="text-sm font-bold tracking-widest uppercase">Service Based Platform Pricing</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-tight mb-10 tracking-tighter italic">
            FLEXIBLE <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">FEE</span> MODEL
          </h1>

          <p className="text-gray-400 text-xl leading-relaxed max-w-3xl mx-auto">
            CollabX utilizes a dynamic fee structure. Costs are calculated based on operational complexity and the specific ticketing ecosystem integrated.
          </p>
        </div>
      </section>

      {/* SERVICE PRICING GRID */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group relative bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl ${service.glow}`}
              >
                <div className={`${service.color} mb-8 transform transition-transform group-hover:scale-110 duration-500`}>
                  {service.icon}
                </div>

                <h3 className="text-3xl font-bold mb-4 tracking-tight">
                  {service.title}
                </h3>

                <div className="flex items-baseline gap-2 mb-6">
                  <h2 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500">
                    {service.fee}
                  </h2>
                  <span className="text-gray-500 text-sm font-mono tracking-tighter">/ TRANSACTION</span>
                </div>

                <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS & BENEFITS */}
      <section className="py-32 bg-[#050507] border-y border-white/5">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl font-black mb-8 tracking-tighter italic">HOW IT <span className="text-blue-500">WORKS</span></h2>
            
            <div className="space-y-12">
              {[
                { step: "01", title: "Service Selection", desc: "User triggers a specific booking workflow (Cinema, Flight, etc).", color: "bg-blue-600" },
                { step: "02", title: "Neural Tier Detection", desc: "The AI engine identifies the corresponding platform fee tier instantly.", color: "bg-purple-600" },
                { step: "03", title: "Automated Calculation", desc: "Final transaction totals are generated with transparent fee breakdowns.", color: "bg-emerald-600" }
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center font-black text-xl shadow-lg`}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-[1px] rounded-[3rem] bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/10">
            <div className="bg-[#0a0a0c] rounded-[2.9rem] p-12">
              <h3 className="text-3xl font-black mb-10 flex items-center gap-3">
                <TrendingUp className="text-blue-400" />
                SYSTEM BENEFITS
              </h3>
              <div className="grid gap-6">
                {benefits.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <CheckCircle2 size={18} className="text-green-500" />
                    </div>
                    <p className="text-lg text-gray-400 group-hover:text-white transition-colors">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS PREVIEW SECTION */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 tracking-tighter italic">TRANSACTION <span className="text-purple-500">LEDGER</span></h2>
            <p className="text-gray-500 text-lg">Live simulation of fee distribution across different sectors.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { type: "Movie", amount: "₹500", fee: "₹10", pct: "2%", color: "border-red-500/20" },
              { type: "Flight", amount: "₹10,000", fee: "₹500", pct: "5%", color: "border-blue-500/20" },
              { type: "Hotel", amount: "₹20,000", fee: "₹1,200", pct: "6%", color: "border-purple-500/20" }
            ].map((item, i) => (
              <div key={i} className={`bg-[#0a0a0c] border ${item.color} p-8 rounded-3xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Percent size={60} />
                </div>
                <h4 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-6">{item.type} TRANSACTION</h4>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400">Principal</span>
                    <span className="text-2xl font-bold">{item.amount}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 pt-4">
                    <span className="text-gray-400">Fee ({item.pct})</span>
                    <span className="text-2xl font-black text-green-400">+{item.fee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;