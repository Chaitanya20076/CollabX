import { motion } from "framer-motion";

import {
  Bot,
  Ticket,
  BrainCircuit,
  ShieldCheck,
  Workflow,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Bot size={38} />,
      title: "AI Chatbot Assistance",
      desc: "CollabX integrates intelligent chatbot systems capable of understanding user intent and automating ticket workflows.",
    },
    {
      icon: <Ticket size={38} />,
      title: "Automated Ticketing",
      desc: "Support requests, complaints and booking workflows are converted into trackable tickets automatically.",
    },
    {
      icon: <BrainCircuit size={38} />,
      title: "AI Intent Detection",
      desc: "The platform identifies user requests such as support issues, bookings and payment workflows using smart logic.",
    },
    {
      icon: <Workflow size={38} />,
      title: "Workflow Automation",
      desc: "Entire support lifecycles are streamlined from chatbot interaction to ticket resolution.",
    },
    {
      icon: <LayoutDashboard size={38} />,
      title: "Realtime Dashboard",
      desc: "Track ticket statuses, chatbot activity and support performance using modern dashboards.",
    },
    {
      icon: <ShieldCheck size={38} />,
      title: "Secure Infrastructure",
      desc: "Authentication and protected workflows ensure secure interactions across the platform.",
    },
  ];

  const timeline = [
    {
      title: "Problem Identification",
      desc: "Traditional support systems often suffer from delayed responses, inefficient workflows and poor automation.",
    },
    {
      title: "AI Driven Solution",
      desc: "CollabX was conceptualized to combine chatbot intelligence with automated ticketing and workflow management.",
    },
    {
      title: "Modern SaaS Architecture",
      desc: "The system uses scalable frontend and backend technologies suitable for modern cloud deployments.",
    },
    {
      title: "Future Scalability",
      desc: "The architecture supports future integrations including payment gateways, real-time analytics and advanced AI models.",
    },
  ];

  return (
    <>
      {/* HERO SECTION */}

      <section className="relative overflow-hidden py-28">

        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent"></div>

        <div className="container-custom relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl"
          >

            <div className="inline-flex items-center gap-3 border border-blue-500/30 bg-blue-500/10 px-5 py-2 rounded-full text-blue-400 mb-8">
              AI Powered Support Ecosystem
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-10">
              About{" "}
              <span className="gradient-text">
                CollabX
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-9 max-w-4xl">
              CollabX is an intelligent AI powered chatbot based
              ticketing platform designed to modernize customer
              support systems, automate workflows and improve issue
              resolution efficiency using smart automation and
              scalable cloud architecture.
            </p>

          </motion.div>

        </div>

      </section>

      {/* MISSION SECTION */}

      <section className="py-24 bg-[#050505]">

        <div className="container-custom grid lg:grid-cols-2 gap-20 items-center">

          <div>

            <h2 className="text-5xl font-bold mb-8 gradient-text">
              Our Mission
            </h2>

            <p className="text-gray-400 text-lg leading-9 mb-8">
              Our mission is to bridge the gap between traditional
              customer support systems and intelligent AI powered
              automation by creating scalable chatbot driven support
              ecosystems.
            </p>

            <p className="text-gray-400 text-lg leading-9">
              CollabX focuses on improving response efficiency,
              reducing manual workloads and enhancing user experience
              through realtime workflows and intelligent ticketing
              infrastructure.
            </p>

          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[40px] p-[1px]">

            <div className="bg-black rounded-[40px] p-10 h-full">

              <h3 className="text-4xl font-bold mb-10">
                Core Objectives
              </h3>

              <div className="space-y-8">

                <div className="flex items-start gap-5">
                  <CheckCircle2 className="text-green-500 mt-1" />

                  <div>
                    <h4 className="text-2xl font-semibold mb-2">
                      Smart Automation
                    </h4>

                    <p className="text-gray-400 leading-7">
                      Reduce manual intervention using AI driven workflows.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <CheckCircle2 className="text-blue-500 mt-1" />

                  <div>
                    <h4 className="text-2xl font-semibold mb-2">
                      Better User Experience
                    </h4>

                    <p className="text-gray-400 leading-7">
                      Provide seamless chatbot interactions and faster resolutions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <CheckCircle2 className="text-purple-500 mt-1" />

                  <div>
                    <h4 className="text-2xl font-semibold mb-2">
                      Scalable Architecture
                    </h4>

                    <p className="text-gray-400 leading-7">
                      Build future-ready systems capable of enterprise scaling.
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURES SECTION */}

      <section className="py-28">

        <div className="container-custom">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Platform Capabilities
            </h2>

            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-8">
              Built using modern technologies and intelligent
              architecture for scalable support ecosystems.
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

      {/* TIMELINE SECTION */}

      <section className="py-28 bg-[#050505]">

        <div className="container-custom">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Project Evolution
            </h2>

            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-8">
              From identifying support inefficiencies to building an
              AI powered automation platform.
            </p>

          </div>

          <div className="space-y-10 max-w-5xl mx-auto">

            {timeline.map((item, index) => (
              <div
                key={index}
                className="bg-black border border-gray-800 rounded-3xl p-10"
              >

                <div className="text-blue-500 text-6xl font-bold mb-6">
                  0{index + 1}
                </div>

                <h3 className="text-3xl font-bold mb-5">
                  {item.title}
                </h3>

                <p className="text-gray-400 text-lg leading-8">
                  {item.desc}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* FINAL SECTION */}

      <section className="py-28">

        <div className="container-custom text-center max-w-5xl">

          <h2 className="text-5xl font-bold mb-8 gradient-text">
            Building The Future Of Smart Support
          </h2>

          <p className="text-gray-400 text-lg leading-9 mb-12">
            CollabX represents the future of intelligent ticketing
            ecosystems by combining AI chatbot systems, realtime
            dashboards, workflow automation and scalable cloud
            architecture into a single modern support platform.
          </p>

          <div className="flex flex-wrap justify-center gap-6">

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl px-8 py-5">
              AI Powered
            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl px-8 py-5">
              Cloud Scalable
            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl px-8 py-5">
              Secure Workflow
            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl px-8 py-5">
              Modern SaaS Architecture
            </div>

          </div>

        </div>

      </section>
    </>
  );
};

export default About;