import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles, Minimize2 } from "lucide-react";
import API from "../../services/api";
import {
  buildClientContext,
  getStoredLocation,
  needsLocationForTicketing,
  requestBrowserLocation,
} from "../../utils/location";
import {
  InputWidget,
  MCQWidget,
  SeatSelectionWidget,
  SummaryWidget,
  TicketDraftWidget,
} from "./BookingWidgets";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(getStoredLocation);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi, I am CollabX AI. I can help with bookings, refunds, ticket status, and support issues.",
    },
  ]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!open || userLocation) return;

    requestBrowserLocation().then((location) => {
      if (location) setUserLocation(location);
    });
  }, [open, userLocation]);

  const handleSend = async (customText) => {
    const textToSend = typeof customText === "string" ? customText : input;
    if (!textToSend.trim() || loading) return;

    const currentMessage = textToSend.trim();
    let activeLocation = userLocation || getStoredLocation();

    if (!activeLocation && needsLocationForTicketing(currentMessage)) {
      activeLocation = await requestBrowserLocation();
      if (activeLocation) {
        setUserLocation(activeLocation);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Please allow location access so I can search nearby theatres, hotels, events, or concerts accurately.",
          },
        ]);
        return;
      }
    }

    setMessages((prev) => [...prev, { sender: "user", text: currentMessage }]);
    if (typeof customText !== "string") setInput("");
    setLoading(true);

    try {
      const response = await API.post("/chat", {
        message: currentMessage,
        clientContext: buildClientContext(activeLocation),
        history: messages.slice(-8).map((msg) => ({
          role: msg.sender === "bot" ? "assistant" : "user",
          content: msg.text,
        })),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.data.reply || (response.data.widget ? "" : "I need one more detail to continue."),
          widget: response.data.widget,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I cannot reach the backend right now. Try the full AI chat page if you want the complete workflow." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close CollabX assistant" : "Open CollabX assistant"}
        className="fixed bottom-5 right-5 z-50 w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-[0_16px_40px_rgba(14,165,233,0.28)] text-white border border-white/20"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}>
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Main Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 w-auto sm:w-[420px] h-[min(640px,calc(100vh-120px))] bg-[#030712]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex flex-col"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-br from-sky-500/15 to-emerald-500/10 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-500 blur-lg opacity-40 animate-pulse" />
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center border border-white/20">
                    <Bot size={24} className="text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    CollabX AI <Sparkles size={14} className="text-emerald-300" />
                  </h2>
                  <p className="text-xs text-sky-200/80 font-medium tracking-wide uppercase">Online ticketing copilot</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Minimize assistant"
                  className="ml-auto w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center"
                >
                  <Minimize2 size={18} />
                </button>
              </div>
              <div className="flex gap-2 mt-5 overflow-x-auto">
                {["Book movie", "Refund help", "Ticket status"].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 text-xs text-sky-100 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full px-3 py-2"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide custom-scrollbar">
              {messages.map((msg, index) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-lg ${
                      msg.sender === "user"
                        ? "bg-sky-500 text-white rounded-br-none shadow-sky-950/20"
                        : "bg-white/5 text-gray-200 border border-white/10 rounded-bl-none backdrop-blur-md"
                    }`}
                  >
                    {msg.text}
                    {/* Dynamic Widgets */}
                    <div className="mt-3">
                      {msg.widget?.type === "mcq" && (
                        <MCQWidget
                          options={msg.widget.options}
                          onSelect={(opt) => handleSend(`I select ${opt}`)}
                          onBack={() => handleSend("Back")}
                        />
                      )}
                      {msg.widget?.type === "input" && (
                        <InputWidget onSubmit={(value) => handleSend(value)} disabled={loading} />
                      )}
                      {msg.widget?.type === "seat_selection" && (
                        <SeatSelectionWidget
                          mode={msg.widget.mode}
                          maxSeats={msg.widget.maxSeats}
                          onBack={() => handleSend("Back to options")}
                          onConfirm={(seats, price) => handleSend(`Selected: ${seats.join(", ")} (INR ${price})`)}
                        />
                      )}
                      {msg.widget?.type === "summary" && (
                        <SummaryWidget details={msg.widget.details} onContinue={() => handleSend(`Proceed to payment`)} />
                      )}
                      {msg.widget?.type === "ticket_draft" && (
                        <TicketDraftWidget
                          draft={msg.widget.draft}
                          onConfirm={() => handleSend("Submit this support ticket")}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 p-4 bg-white/5 rounded-2xl w-20">
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-6 bg-white/5 backdrop-blur-2xl border-t border-white/5">
              <div className="relative flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 outline-none focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/50 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-14 h-14 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-600/25 disabled:opacity-30 disabled:grayscale transition-all"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
