import { useState, useRef, useEffect } from "react";

import {
  MessageCircle,
  X,
  Send,
  Bot,
} from "lucide-react";

import API from "../../services/api";

import { MCQWidget, SeatSelectionWidget, SummaryWidget } from "./BookingWidgets";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi. I am CollabX AI. Tell me your issue, booking, payment, or ticket question.",
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText) => {
    const textToSend = typeof customText === "string" ? customText : input;
    if (!textToSend.trim() || loading) return;

    const currentMessage = textToSend.trim();
    const userMessage = {
      sender: "user",
      text: currentMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (typeof customText !== "string") setInput("");
    setLoading(true);

    try {
      const response = await API.post("/chat", {
        message: currentMessage,
        history: messages
          .filter(
            (item, index) =>
              index !== 0 ||
              item.sender !== "bot"
          )
          .slice(-8)
          .map((item) => ({
            role:
              item.sender === "bot"
                ? "assistant"
                : "user",
            content: item.text,
          })),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            typeof response.data.reply === "string" && response.data.reply.trim() !== ""
              ? response.data.reply
              : response.data.widget
              ? ""
              : "I could not generate a response right now.",
          widget: response.data.widget,
        },
      ]);
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I cannot reach the AI backend right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center shadow-2xl"
      >
        {open ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {open && (
        <div className="fixed bottom-28 right-6 z-50 w-[360px] h-[520px] bg-[#0a0a0a] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-5 flex items-center gap-3">
            <Bot />

            <div>
              <h2 className="text-xl font-bold">
                CollabX AI
              </h2>

              <p className="text-sm text-gray-200">
                Smart Ticket Assistant
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-6 whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-blue-600 ml-auto"
                    : "bg-[#1a1a1a]"
                }`}
              >
                {msg.text}
                {msg.widget && msg.widget.type === "mcq" && (
                  <MCQWidget
                    options={msg.widget.options}
                    onSelect={(opt) => handleSend(`I select ${opt}`)}
                  />
                )}
                {msg.widget && msg.widget.type === "seat_selection" && (
                  <SeatSelectionWidget
                    mode={msg.widget.mode}
                    onConfirm={(seats, price) => handleSend(`I selected seats: ${seats.join(', ')} for ₹${price}. Please provide the summary.`)}
                  />
                )}
                {msg.widget && msg.widget.type === "summary" && (
                  <SummaryWidget
                    details={msg.widget.details}
                    onContinue={() => handleSend(`Proceed to payment`)}
                  />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />

            {loading && (
              <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-6 bg-[#1a1a1a]">
                Thinking...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-800 flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask about a ticket..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
 