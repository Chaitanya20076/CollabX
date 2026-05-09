import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Bot,
  ShieldCheck,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";

const messages = [
  "Preparing your personalized workspace...",
  "Configuring intelligent ticket workflows...",
  "Setting up AI powered dashboard systems...",
  "Optimizing realtime chatbot experience...",
  "Finalizing your CollabX environment...",
];

const SetupLoader = () => {
  const navigate = useNavigate();

  const [currentMessage, setCurrentMessage] =
    useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) =>
        prev < messages.length - 1
          ? prev + 1
          : prev
      );
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
    <section className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent"></div>

      <div className="relative z-10 text-center max-w-3xl px-6">

        <div className="flex justify-center mb-10">

          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center animate-pulse shadow-2xl shadow-blue-500/30">

            <Bot size={58} />

          </div>

        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-8">

          Welcome To{" "}

          <span className="gradient-text">
            CollabX
          </span>

        </h1>

        <p className="text-gray-400 text-xl leading-9 mb-14">

          We’re preparing your intelligent workspace and configuring
          your personalized AI powered ecosystem.

        </p>

        {/* LOADING MESSAGE */}

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 mb-12">

          <div className="flex items-center justify-center gap-4 mb-6">

            <Sparkles className="text-blue-500 animate-pulse" />

            <h2 className="text-2xl font-semibold">
              {messages[currentMessage]}
            </h2>

          </div>

          <div className="w-full h-3 bg-[#1a1a1a] rounded-full overflow-hidden">

            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-700 animate-[loading_10s_linear_forwards]"></div>

          </div>

        </div>

        {/* FEATURES */}

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6">

            <ShieldCheck
              className="text-green-500 mx-auto mb-5"
              size={34}
            />

            <h3 className="text-xl font-semibold mb-3">
              Secure Access
            </h3>

            <p className="text-gray-400 leading-7">
              Protected authentication and secure user workflows.
            </p>

          </div>

          <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6">

            <Bot
              className="text-blue-500 mx-auto mb-5"
              size={34}
            />

            <h3 className="text-xl font-semibold mb-3">
              AI Automation
            </h3>

            <p className="text-gray-400 leading-7">
              Intelligent chatbot systems and automated ticketing.
            </p>

          </div>

          <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6">

            <LayoutDashboard
              className="text-purple-500 mx-auto mb-5"
              size={34}
            />

            <h3 className="text-xl font-semibold mb-3">
              Smart Dashboard
            </h3>

            <p className="text-gray-400 leading-7">
              Personalized realtime monitoring and analytics.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default SetupLoader;