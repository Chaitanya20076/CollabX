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
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <Bot size={42} />,
      title: "AI Chatbot",
      desc: "Smart AI chatbot capable of understanding user queries and generating automated support workflows.",
    },
    {
      icon: <Ticket size={42} />,
      title: "Ticket Automation",
      desc: "Automatically create and manage support tickets using intelligent issue detection systems.",
    },
    {
      icon: <ShieldCheck size={42} />,
      title: "Secure Platform",
      desc: "Enterprise level authentication, protected workflows and secure ticket lifecycle management.",
    },
    {
      icon: <CreditCard size={42} />,
      title: "Payment Ready",
      desc: "Supports payment gateway integrations for future real-world booking and transaction workflows.",
    },
    {
      icon: <LayoutDashboard size={42} />,
      title: "Realtime Dashboard",
      desc: "Track tickets, users, chatbot activities and issue statuses using modern dashboards.",
    },
    {
      icon: <BrainCircuit size={42} />,
      title: "AI Intelligence",
      desc: "Intent detection, smart responses and workflow automation using AI powered systems.",
    },
  ];

  const workflow = [
    "User interacts with chatbot",
    "AI analyzes request and detects intent",
    "System creates or processes ticket",
    "Dashboard receives realtime updates",
    "Admin/support team manages request",
    "Issue resolved successfully",
  ];

  const stats = [
    {
      number: "10K+",
      label: "Tickets Processed",
    },
    {
      number: "99%",
      label: "System Accuracy",
    },
    {
      number: "24/7",
      label: "AI Availability",
    },
    {
      number: "500+",
      label: "Organizations",
    },
  ];

  return (
    <>
      {/* HERO SECTION */}

      <section className="min-h-screen flex items-center relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent"></div>

        <div className="container-custom grid md:grid-cols-2 gap-20 items-center py-24 relative z-10">

          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 border border-blue-500/30 bg-blue-500/10 px-5 py-2 rounded-full text-blue-400 mb-8">
              <MessageSquare size={18} />
              AI Powered Ticketing Ecosystem
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
              Next Generation{" "}
              <span className="gradient-text">
                AI Ticketing
              </span>{" "}
              Platform
            </h1>

            <p className="text-gray-400 text-lg leading-9 mb-10 max-w-2xl">
              CollabX is an intelligent AI powered chatbot based
              ticketing platform designed for customer support,
              workflow automation, issue management and smart booking
              experiences.
            </p>

            <div className="flex flex-wrap gap-5">

              <Link to="/signup" className="primary-btn flex items-center gap-3">
                Get Started
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/workflow"
                className="border border-gray-700 px-6 py-3 rounded-xl hover:border-blue-500 transition"
              >
                Explore Workflow
              </Link>

            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >

            <div className="w-full max-w-[540px] rounded-[40px] bg-gradient-to-br from-blue-600 to-purple-700 shadow-2xl shadow-blue-500/20 p-[1px]">

              <div className="bg-[#050505] rounded-[40px] p-8">

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">
                      AI Chatbot
                    </h2>

                    <p className="text-gray-400 mt-1">
                      Live Workflow Preview
                    </p>
                  </div>

                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-5">

                  <div className="bg-[#111111] p-4 rounded-2xl">
                    👤 User: Book 2 tickets for tomorrow
                  </div>

                  <div className="bg-blue-600 p-4 rounded-2xl">
                    🤖 AI: Booking request detected successfully.
                  </div>

                  <div className="bg-[#111111] p-4 rounded-2xl">
                    👤 User: Proceed with payment
                  </div>

                  <div className="bg-blue-600 p-4 rounded-2xl">
                    🤖 AI: Payment workflow initialized.
                  </div>

                  <div className="bg-[#111111] p-4 rounded-2xl">
                    👤 User: Ticket generated?
                  </div>

                  <div className="bg-green-600 p-4 rounded-2xl">
                    ✅ Booking successful. Ticket ID: CX-2045
                  </div>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* STATS SECTION */}

      <section className="py-20 border-y border-gray-800 bg-[#050505]">

        <div className="container-custom grid md:grid-cols-4 gap-10">

          {stats.map((item, index) => (
            <div
              key={index}
              className="text-center"
            >
              <h2 className="text-5xl font-bold gradient-text mb-4">
                {item.number}
              </h2>

              <p className="text-gray-400 text-lg">
                {item.label}
              </p>
            </div>
          ))}

        </div>

      </section>

      {/* FEATURES SECTION */}

      <section className="py-28">

        <div className="container-custom">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Platform Features
            </h2>

            <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-8">
              Built with modern technologies and scalable architecture
              for intelligent automation and enterprise workflows.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 hover:border-blue-500 transition duration-300"
              >

                <div className="text-blue-500 mb-6">
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-semibold mb-5">
                  {feature.title}
                </h3>

                <p className="text-gray-400 leading-8">
                  {feature.desc}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* WORKFLOW SECTION */}

      <section className="py-28 bg-[#050505]">

        <div className="container-custom">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Smart Workflow
            </h2>

            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-8">
              Fully automated support lifecycle powered by AI
              chatbot intelligence and realtime dashboards.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {workflow.map((step, index) => (
              <div
                key={index}
                className="border border-gray-800 rounded-3xl p-8 bg-black"
              >

                <div className="text-6xl font-bold text-blue-500/30 mb-6">
                  0{index + 1}
                </div>

                <h3 className="text-2xl font-semibold leading-10">
                  {step}
                </h3>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* WHY CHOOSE US */}

      <section className="py-28">

        <div className="container-custom grid lg:grid-cols-2 gap-20 items-center">

          <div>

            <h2 className="text-5xl font-bold mb-8 gradient-text">
              Why Choose CollabX?
            </h2>

            <p className="text-gray-400 text-lg leading-9 mb-10">
              Designed with scalability, automation and modern AI
              infrastructure in mind, CollabX delivers intelligent
              ticketing experiences for organizations and users.
            </p>

            <div className="space-y-6">

              <div className="flex items-start gap-5">
                <CheckCircle2 className="text-green-500 mt-1" />

                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Intelligent Automation
                  </h3>

                  <p className="text-gray-400 leading-7">
                    AI powered workflows reduce manual support load.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <Clock3 className="text-blue-500 mt-1" />

                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Faster Resolution
                  </h3>

                  <p className="text-gray-400 leading-7">
                    Smart routing and ticket tracking accelerate issue handling.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <ShieldCheck className="text-purple-500 mt-1" />

                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    Secure Infrastructure
                  </h3>

                  <p className="text-gray-400 leading-7">
                    Secure architecture with protected workflows and authentication.
                  </p>
                </div>
              </div>

            </div>

          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[40px] p-[1px]">

            <div className="bg-[#050505] rounded-[40px] p-10 h-full">

              <h3 className="text-4xl font-bold mb-10">
                Platform Overview
              </h3>

              <div className="space-y-8">

                <div className="flex items-center justify-between border-b border-gray-800 pb-5">
                  <span className="text-gray-400">
                    AI Chatbot Accuracy
                  </span>

                  <span className="text-2xl font-bold text-blue-500">
                    98%
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-800 pb-5">
                  <span className="text-gray-400">
                    Ticket Automation
                  </span>

                  <span className="text-2xl font-bold text-green-500">
                    Enabled
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-800 pb-5">
                  <span className="text-gray-400">
                    Payment Integration
                  </span>

                  <span className="text-2xl font-bold text-purple-500">
                    Ready
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    Cloud Architecture
                  </span>

                  <span className="text-2xl font-bold text-orange-500">
                    Scalable
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
    </>
  );
};

export default Home;