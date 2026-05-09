import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Bot,
  Image,
  Menu,
  Mic,
  Paperclip,
  Plus,
  Search,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { Link } from "react-router-dom";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import toast from "react-hot-toast";

import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";
import { storage } from "../../config/firebase";
import { MCQWidget, SeatSelectionWidget, SummaryWidget } from "../../components/Chatbot/BookingWidgets";

const welcomeMessage = {
  role: "assistant",
  text: "Hello. Welcome to CollabX AI. Tell me what happened, and I will help you book, create, track, refund, or resolve a ticket.",
};

const defaultSuggestions = [
  "Book movie tickets for today",
  "Find flights from Delhi to Mumbai",
  "Help me get a refund",
  "Create a complaint ticket",
  "Suggest hotels for this weekend",
  "Find concerts nearby",
];

const createSession = () => ({
  id: `chat-${Date.now()}`,
  title: "New support chat",
  messages: [welcomeMessage],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const loadSessions = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("collabx-ai-chats") || "[]"
    );

    return Array.isArray(saved) && saved.length
      ? saved
      : [createSession()];
  } catch {
    return [createSession()];
  }
};

const buildTitle = (message) =>
  message.length > 36
    ? `${message.slice(0, 33)}...`
    : message || "New support chat";

const AIChat = () => {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState(loadSessions);
  const [activeId, setActiveId] = useState(
    () => sessions[0]?.id
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [latestMeta, setLatestMeta] = useState(null);
  const [listening, setListening] = useState(false);
  const [showTools, setShowTools] = useState(true);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const activeSession =
    sessions.find((session) => session.id === activeId) ||
    sessions[0];

  const messages = activeSession?.messages || [welcomeMessage];

  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        const haystack = [
          session.title,
          ...session.messages.map((item) => item.text),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchTerm.toLowerCase());
      }),
    [sessions, searchTerm]
  );

  const activeSuggestions =
    latestMeta?.suggestions?.length
      ? latestMeta.suggestions
      : defaultSuggestions;

  useEffect(() => {
    localStorage.setItem(
      "collabx-ai-chats",
      JSON.stringify(sessions)
    );
  }, [sessions]);

  useEffect(() => {
    const loadFirestoreSessions = async () => {
      try {
        const response = await API.get(
          `/chat/sessions?userId=${user?.uid || "anonymous"}`
        );
        const cloudSessions =
          response.data.sessions || [];

        if (cloudSessions.length) {
          setSessions(cloudSessions);
          setActiveId(cloudSessions[0].id);
        }
      } catch (error) {
        console.log(
          "Using local chat history fallback",
          error
        );
      }
    };

    loadFirestoreSessions();
  }, [user?.uid]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const updateActiveSession = (updater) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeId
          ? {
              ...updater(session),
              updatedAt: new Date().toISOString(),
            }
          : session
      )
    );
  };

  const saveSessionToBackend = async (session) => {
    try {
      await API.post("/chat/sessions", session);
    } catch (error) {
      console.log("Chat session backup skipped", error);
    }
  };

  const addAssistantWithTyping = (text, widget = null) => {
    const id = `assistant-${Date.now()}`;

    updateActiveSession((session) => ({
      ...session,
      messages: [
        ...session.messages,
        {
          id,
          role: "assistant",
          text: "",
          widget,
        },
      ],
    }));

    let index = 0;
    const timer = window.setInterval(() => {
      index += 12;

      updateActiveSession((session) => ({
        ...session,
        messages: session.messages.map((item) =>
          item.id === id
            ? {
                ...item,
                text: text.slice(0, index),
              }
            : item
        ),
      }));

      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, 18);
  };

  const handleNewChat = () => {
    const session = createSession();

    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
    setInput("");
    setAttachments([]);
    setLatestMeta(null);
  };

  const handleFiles = (files) => {
    const mapped = Array.from(files || []).map((file) => ({
      name: file.name,
      type: file.type || "unknown",
      size: file.size,
      file,
    }));

    setAttachments((prev) => [...prev, ...mapped].slice(0, 5));
  };

  const uploadAttachments = async () => {
    const uploaded = [];

    for (const item of attachments) {
      if (!item.file) {
        uploaded.push(item);
        continue;
      }

      const storageRef = ref(
        storage,
        `chat-uploads/${user?.uid || "anonymous"}/${Date.now()}-${item.name}`
      );

      const result = await uploadBytes(storageRef, item.file);
      const url = await getDownloadURL(result.ref);

      uploaded.push({
        name: item.name,
        type: item.type,
        size: item.size,
        url,
      });
    }

    return uploaded;
  };

  const handleCreateTicket = async () => {
    if (!latestMeta?.ticketDraft) {
      return toast.error("Send a message first so AI can draft a ticket");
    }

    try {
      const latestUserAttachments =
        [...messages]
          .reverse()
          .find((item) => item.role === "user")
          ?.attachments || [];

      const response = await API.post("/tickets", {
        ...latestMeta.ticketDraft,
        userId: user?.uid,
        userEmail: user?.email,
        attachments: latestUserAttachments,
      });

      toast.success(`Ticket created: ${response.data.ticket.id}`);
    } catch (error) {
      console.log(error);
      toast.error("Ticket creation failed");
    }
  };

  const handleCreateBooking = async () => {
    const intent = latestMeta?.intent?.intent || "";
    const type = intent.replace("_booking", "");

    if (
      ![
        "movie",
        "flight",
        "hotel",
        "event",
        "concert",
      ].includes(type)
    ) {
      return toast.error("Ask for a booking first");
    }

    try {
      const response = await API.post("/bookings", {
        userId: user?.uid,
        userEmail: user?.email,
        type,
        quantity: 1,
        title: latestMeta.intent.label,
        travelDate: new Date().toISOString(),
      });

      toast.success(
        `Booking confirmed: ${response.data.booking.confirmationCode}`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Booking creation failed"
      );
    }
  };

  const handleVoiceInput = () => {
    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      setInput(
        "Voice input is not supported in this browser. I can still help through text."
      );
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript || "";
      setInput((prev) =>
        prev ? `${prev} ${transcript}` : transcript
      );
    };

    recognition.start();
  };

  const handleSend = async (messageOverride) => {
    const currentMessage =
      (messageOverride || input).trim();

    if (!currentMessage || loading) return;

    setLoading(true);

    let uploadedAttachments = [];

    try {
      uploadedAttachments = await uploadAttachments();
    } catch (error) {
      console.log(error);
      toast.error("Attachment upload failed");
      setLoading(false);
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: currentMessage,
      attachments: uploadedAttachments,
    };

    const nextMessages = [...messages, userMessage];

    updateActiveSession((session) => ({
      ...session,
      title:
        session.title === "New support chat"
          ? buildTitle(currentMessage)
          : session.title,
      messages: nextMessages,
    }));

    setInput("");
    setAttachments([]);

    try {
      const response = await API.post("/chat", {
        message: currentMessage,
        attachments: uploadedAttachments,
        history: messages
          .filter(
            (item, index) =>
              index !== 0 || item.role !== "assistant"
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            content: item.text,
          })),
      });

      setLatestMeta({
        intent: response.data.intent,
        ticketDraft: response.data.ticketDraft,
        suggestions: response.data.suggestions,
        usedWebSearch: response.data.usedWebSearch,
      });

      addAssistantWithTyping(
        typeof response.data.reply === "string" && response.data.reply.trim() !== ""
          ? response.data.reply
          : response.data.widget
          ? ""
          : "I could not generate a response right now.",
        response.data.widget
      );

      const sessionForBackup = {
        ...activeSession,
        userId: user?.uid || "anonymous",
        messages: [
          ...nextMessages,
          {
            role: "assistant",
            text: response.data.reply || "",
            widget: response.data.widget || null,
          },
        ],
      };

      saveSessionToBackend(sessionForBackup);
    } catch (error) {
      console.log(error);

      addAssistantWithTyping(
        "I cannot reach the AI backend right now. Your chat is still saved locally. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-black text-white flex">
      <div className="hidden lg:flex w-[340px] border-r border-gray-800 bg-[#050505] flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold gradient-text">
              CollabX AI
            </h2>

            <Menu />
          </div>

          <button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl py-3 flex items-center justify-center gap-3 font-semibold"
          >
            <Plus size={18} />
            New Chat
          </button>

          <div className="mt-4 flex items-center gap-2 bg-black border border-gray-800 rounded-2xl px-3">
            <Search size={17} className="text-gray-500" />
            <input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search chats"
              className="w-full bg-transparent outline-none py-3 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSessions.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveId(chat.id)}
              className={`w-full text-left border rounded-2xl p-4 transition ${
                chat.id === activeId
                  ? "bg-[#111111] border-blue-500"
                  : "bg-[#0a0a0a] hover:bg-[#111111] border-gray-800"
              }`}
            >
              <p className="font-semibold truncate">
                {chat.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {chat.messages.length} messages
              </p>
            </button>
          ))}
        </div>

        <div className="p-5 border-t border-gray-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-4 bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4 hover:border-blue-500 transition"
          >
            <ArrowLeft size={20} />
            Back To Dashboard
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-800 bg-[#050505] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
              <Bot size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                CollabX AI Assistant
              </h2>

              <p className="text-gray-400">
                SARVAM AI with Tavily web intelligence
              </p>
            </div>
          </div>

          {latestMeta?.intent && (
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-400">
                Intent
              </p>
              <p className="font-semibold">
                {latestMeta.intent.label}
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {showTools && (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4">
                  <p className="text-sm text-gray-400">
                    Smart intent
                  </p>
                  <p className="font-semibold mt-1">
                    {latestMeta?.intent?.label ||
                      "Ready to detect"}
                  </p>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4">
                  <p className="text-sm text-gray-400">
                    Ticket draft
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <p className="font-semibold truncate">
                      {latestMeta?.ticketDraft?.title ||
                        "Generated after your message"}
                    </p>
                    {latestMeta?.ticketDraft && (
                      <button
                        onClick={handleCreateTicket}
                        className="text-xs bg-blue-600 px-3 py-2 rounded-xl"
                      >
                        Create
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-4">
                  <p className="text-sm text-gray-400">
                    Booking action
                  </p>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <p className="font-semibold">
                      {latestMeta?.usedWebSearch
                        ? "Live data used"
                        : "Safe fallback"}
                    </p>
                    {latestMeta?.intent?.intent?.includes(
                      "_booking"
                    ) && (
                      <button
                        onClick={handleCreateBooking}
                        className="text-xs bg-green-600 px-3 py-2 rounded-xl"
                      >
                        Book
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex gap-5 ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={22} />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-[26px] p-5 text-base leading-8 whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-blue-600"
                      : "bg-[#0a0a0a] border border-gray-800"
                  }`}
                >
                  {message.text}

                  {message.widget && message.widget.type === "mcq" && (
                    <MCQWidget
                      options={message.widget.options}
                      onSelect={(opt) => handleSend(`I select ${opt}`)}
                    />
                  )}
                  {message.widget && message.widget.type === "seat_selection" && (
                    <SeatSelectionWidget
                      mode={message.widget.mode}
                      onConfirm={(seats, price) => handleSend(`I selected seats: ${seats.join(', ')} for ₹${price}. Please provide the summary.`)}
                    />
                  )}
                  {message.widget && message.widget.type === "summary" && (
                    <SummaryWidget
                      details={message.widget.details}
                      onContinue={() => handleSend(`Proceed to payment`)}
                    />
                  )}

                  {!!message.attachments?.length && (
                    <div className="mt-3 space-y-2 text-sm opacity-90">
                      {message.attachments.map((file) => (
                        <div key={file.name}>
                          Attached: {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-12 h-12 rounded-2xl bg-[#111111] border border-gray-800 flex items-center justify-center flex-shrink-0">
                    <User size={22} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center">
                  <Bot size={22} />
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-[26px] p-5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"></div>
                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce delay-100"></div>
                    <div className="w-3 h-3 rounded-full bg-pink-500 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-800 bg-[#050505] p-5">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-4">
              {activeSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="shrink-0 border border-gray-700 hover:border-blue-500 transition px-4 py-2 rounded-2xl text-sm bg-[#0a0a0a]"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {!!attachments.length && (
              <div className="flex gap-2 flex-wrap mb-4">
                {attachments.map((file) => (
                  <span
                    key={file.name}
                    className="text-sm bg-[#111111] border border-gray-800 rounded-xl px-3 py-2"
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-gray-700 hover:border-blue-500 transition px-4 py-3 rounded-2xl flex items-center gap-2"
              >
                <Paperclip size={18} />
                Attach
              </button>

              <button
                onClick={() => imageInputRef.current?.click()}
                className="border border-gray-700 hover:border-blue-500 transition px-4 py-3 rounded-2xl flex items-center gap-2"
              >
                <Image size={18} />
                Image
              </button>

              <button
                onClick={handleVoiceInput}
                className={`border transition px-4 py-3 rounded-2xl flex items-center gap-2 ${
                  listening
                    ? "border-blue-500 bg-blue-600"
                    : "border-gray-700 hover:border-blue-500"
                }`}
              >
                <Mic size={18} />
                Voice
              </button>

              <button
                onClick={() => setShowTools((prev) => !prev)}
                className="border border-gray-700 hover:border-blue-500 transition px-4 py-3 rounded-2xl flex items-center gap-2"
              >
                <Sparkles size={18} />
                AI Tools
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) =>
                handleFiles(event.target.files)
              }
            />

            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(event) =>
                handleFiles(event.target.files)
              }
            />

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-[26px] p-4 flex items-end gap-4">
              <textarea
                rows="1"
                placeholder="Message CollabX AI..."
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 bg-transparent outline-none resize-none text-lg px-3 py-3"
              ></textarea>

              <button
                onClick={() => handleSend()}
                disabled={loading}
                className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center hover:scale-105 transition disabled:opacity-50"
              >
                <Send size={24} />
              </button>
            </div>

            <p className="text-center text-gray-500 mt-4 text-sm">
              Chat history saves locally, responses are cleaned automatically, and web fallback protects against hallucinated availability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIChat;
