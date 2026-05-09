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
} from "lucide-react";

const Workflow = () => {
  const workflowSteps = [
    {
      icon: <MessageSquare size={42} />,
      title: "User Interaction",
      desc: "Users communicate with the AI chatbot by describing issues, requesting bookings or initiating support workflows.",
    },
    {
      icon: <BrainCircuit size={42} />,
      title: "AI Intent Detection",
      desc: "The AI system analyzes messages and detects intents such as support requests, ticket creation or booking workflows.",
    },
    {
      icon: <Ticket size={42} />,
      title: "Ticket Generation",
      desc: "Based on detected intent, the platform automatically creates and categorizes support tickets.",
    },
    {
      icon: <LayoutDashboard size={42} />,
      title: "Realtime Dashboard",
      desc: "Generated tickets instantly appear on the admin dashboard for monitoring and management.",
    },
    {
      icon: <CreditCard size={42} />,
      title: "Payment Workflow",
      desc: "For booking related requests, integrated payment workflows can process secure transactions.",
    },
    {
      icon: <CheckCircle2 size={42} />,
      title: "Issue Resolution",
      desc: "Support teams resolve issues while users receive realtime ticket status updates and confirmations.",
    },
  ];

  const chatbotFlow = [
    {
      user: "Book 2 tickets for tomorrow",
      bot: "Booking request detected successfully.",
    },
    {
      user: "Proceed with payment",
      bot: "Payment workflow initialized.",
    },
    {
      user: "Generate ticket",
      bot: "Ticket generated successfully. ID: CX-2045",
    },
  ];

  const advantages = [
    "AI powered ticket automation",
    "Realtime workflow monitoring",
    "Reduced manual workload",
    "Faster issue resolution",
    "Scalable cloud architecture",
    "Secure payment integrations",
  ];

  return (
    <>
      {/* HERO SECTION */}

      <section className="relative overflow-hidden py-28">

        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent"></div>

        <div className="container-custom relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 70 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl"
          >

            <div className="inline-flex items-center gap-3 border border-blue-500/30 bg-blue-500/10 px-5 py-2 rounded-full text-blue-400 mb-8">
              <Bot size={18} />
              Intelligent Workflow Automation
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-10">
              Platform{" "}
              <span className="gradient-text">
                Workflow
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-9 max-w-4xl">
              CollabX combines AI chatbot intelligence, automated
              ticketing systems, realtime dashboards and scalable
              workflows to streamline customer support and booking
              experiences.
            </p>

          </motion.div>

        </div>

      </section>

      {/* WORKFLOW STEPS */}

      <section className="py-28">

        <div className="container-custom">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Step By Step Workflow
            </h2>

            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-8">
              Intelligent automation pipeline designed for modern
              customer support ecosystems.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {workflowSteps.map((step, index) => (
              <div
                key={index}
                className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 hover:border-blue-500 transition duration-300"
              >

                <div className="flex items-center justify-between mb-8">

                  <div className="text-blue-500">
                    {step.icon}
                  </div>

                  <span className="text-5xl font-bold text-blue-500/20">
                    0{index + 1}
                  </span>

                </div>

                <h3 className="text-3xl font-bold mb-5">
                  {step.title}
                </h3>

                <p className="text-gray-400 leading-8">
                  {step.desc}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* FLOW VISUAL SECTION */}

      <section className="py-28 bg-[#050505]">

        <div className="container-custom">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Intelligent Automation Flow
            </h2>

            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-8">
              Complete lifecycle from chatbot interaction to issue resolution.
            </p>

          </div>

          <div className="grid lg:grid-cols-6 gap-6 items-center">

            {[
              "User",
              "AI Chatbot",
              "Intent Detection",
              "Ticket System",
              "Dashboard",
              "Resolution",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4"
              >

                <div className="bg-black border border-gray-800 rounded-3xl p-6 text-center flex-1">

                  <h3 className="text-xl font-semibold">
                    {item}
                  </h3>

                </div>

                {index !== 5 && (
                  <ArrowRight className="text-blue-500 hidden lg:block" />
                )}

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* CHATBOT DEMO */}

      <section className="py-28">

        <div className="container-custom grid lg:grid-cols-2 gap-20 items-center">

          <div>

            <h2 className="text-5xl font-bold mb-8 gradient-text">
              Chatbot Workflow Preview
            </h2>

            <p className="text-gray-400 text-lg leading-9 mb-10">
              The AI chatbot acts as the first layer of interaction,
              intelligently understanding user requests and automating
              workflow processes.
            </p>

            <div className="space-y-6">

              {advantages.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-5"
                >

                  <CheckCircle2 className="text-green-500" />

                  <p className="text-lg text-gray-300">
                    {item}
                  </p>

                </div>
              ))}

            </div>

          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[40px] p-[1px]">

            <div className="bg-black rounded-[40px] p-8">

              <div className="flex items-center justify-between mb-8">

                <div>
                  <h3 className="text-3xl font-bold">
                    AI Assistant
                  </h3>

                  <p className="text-gray-400 mt-1">
                    Live Conversation Flow
                  </p>
                </div>

                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>

              </div>

              <div className="space-y-6">

                {chatbotFlow.map((chat, index) => (
                  <div key={index}>

                    <div className="bg-[#111111] rounded-2xl p-4 mb-3">
                      👤 {chat.user}
                    </div>

                    <div className="bg-blue-600 rounded-2xl p-4">
                      🤖 {chat.bot}
                    </div>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FINAL SECTION */}

      <section className="py-28 bg-[#050505]">

        <div className="container-custom text-center max-w-5xl">

          <h2 className="text-5xl font-bold mb-8 gradient-text">
            Scalable Workflow Architecture
          </h2>

          <p className="text-gray-400 text-lg leading-9 mb-14">
            CollabX is designed using scalable frontend and backend
            architecture capable of supporting modern AI automation,
            realtime workflows and future enterprise integrations.
          </p>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-black border border-gray-800 rounded-3xl p-8">

              <h3 className="text-3xl font-bold mb-5 text-blue-500">
                Frontend
              </h3>

              <p className="text-gray-400 leading-8">
                React based responsive user interface with modern
                dashboard systems and chatbot integration.
              </p>

            </div>

            <div className="bg-black border border-gray-800 rounded-3xl p-8">

              <h3 className="text-3xl font-bold mb-5 text-purple-500">
                Backend
              </h3>

              <p className="text-gray-400 leading-8">
                Node.js powered APIs, ticket management systems and
                workflow processing engines.
              </p>

            </div>

            <div className="bg-black border border-gray-800 rounded-3xl p-8">

              <h3 className="text-3xl font-bold mb-5 text-green-500">
                Database
              </h3>

              <p className="text-gray-400 leading-8">
                Cloud database architecture for storing tickets,
                workflows, payments and chatbot interactions.
              </p>

            </div>

          </div>

        </div>

      </section>
    </>
  );
};

export default Workflow;