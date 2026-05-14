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
  Trash2,
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
import {
  buildClientContext,
  getStoredLocation,
  needsLocationForTicketing,
  requestBrowserLocation,
} from "../../utils/location";
import { storage } from "../../config/firebase";
import {
  CollabXPaymentWidget,
  DatePickerWidget,
  InputWidget,
  MCQWidget,
  SeatSelectionWidget,
  SummaryWidget,
  TicketDraftWidget,
} from "../../components/Chatbot/BookingWidgets";

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

const normalizeSession = (session, index = 0) => ({
  id: session?.id || `chat-${Date.now()}-${index}`,
  title: session?.title || "New support chat",
  messages:
    Array.isArray(session?.messages) &&
    session.messages.length
      ? session.messages.map((message, messageIndex) => ({
          id:
            message.id ||
            `${session?.id || "chat"}-${messageIndex}`,
          role:
            message.role ||
            (message.sender === "bot" ? "assistant" : "user"),
          text:
            typeof message.text === "string"
              ? message.text
              : "",
          attachments: Array.isArray(message.attachments)
            ? message.attachments
            : [],
          widget: message.widget || null,
        }))
      : [welcomeMessage],
  createdAt:
    session?.createdAt || new Date().toISOString(),
  updatedAt:
    session?.updatedAt || new Date().toISOString(),
});

const loadSessions = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("collabx-ai-chats") || "[]"
    );

    return Array.isArray(saved) && saved.length
      ? saved.map(normalizeSession)
      : [createSession()];
  } catch {
    return [createSession()];
  }
};

const buildTitle = (message) =>
  message.length > 36
    ? `${message.slice(0, 33)}...`
    : message || "New support chat";

const apiBaseUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const extractSelectedDate = (message = "") => {
  const match = String(message).match(
    /\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/
  );

  if (!match) return "";

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const dateToIso = (dateValue) =>
  dateValue
    ? new Date(`${dateValue}T12:00:00`).toISOString()
    : new Date().toISOString();

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
  const [bookingDraft, setBookingDraft] = useState(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [showTools, setShowTools] = useState(true);
  const [userLocation, setUserLocation] = useState(getStoredLocation);

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
          ...(session.messages || []).map(
            (item) => item.text || ""
          ),
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
    if (userLocation) return;

    requestBrowserLocation().then((location) => {
      if (location) setUserLocation(location);
    });
  }, [userLocation]);

  useEffect(() => {
    const loadFirestoreSessions = async () => {
      try {
        const response = await API.get(
          `/chat/sessions?userId=${user?.uid || "anonymous"}`
        );
        const cloudSessions =
          response.data.sessions || [];

        if (cloudSessions.length) {
          const normalizedSessions =
            cloudSessions.map(normalizeSession);

          setSessions(normalizedSessions);
          setActiveId(normalizedSessions[0].id);
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
    setBookingDraft(null);
    setSelectedBookingDate("");
  };

  const handleDeleteChat = async (chatId) => {
    const remaining = sessions.filter((session) => session.id !== chatId);
    const nextSessions = remaining.length ? remaining : [createSession()];

    setSessions(nextSessions);
    if (activeId === chatId) {
      setActiveId(nextSessions[0].id);
      setLatestMeta(null);
      setBookingDraft(null);
      setSelectedBookingDate("");
    }

    try {
      await API.delete(`/chat/sessions/${chatId}`);
    } catch (error) {
      console.log("Cloud chat delete skipped", error);
    }

    toast.success("Chat deleted");
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

      const createdTicket = response.data.ticket;
      toast.success(
        `Ticket created: ${createdTicket.trackingCode || createdTicket.id}`
      );
      return createdTicket;
    } catch (error) {
      console.log(error);
      toast.error("Ticket creation failed");
      return null;
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
        travelDate: dateToIso(selectedBookingDate),
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

  const appendAssistantMessage = (text, widget = null) => {
    updateActiveSession((session) => ({
      ...session,
      messages: [
        ...session.messages,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text,
          widget,
        },
      ],
    }));
  };

  const completePaidTicket = (
    booking,
    paymentResponse,
    details = [],
    method = "upi"
  ) => {
    toast.success("Payment confirmed. Ticket generated.");
    appendAssistantMessage(
      "Payment successful. Your official CollabX e-ticket has been generated.",
      {
        type: "summary",
        paid: true,
        payment: {
          orderId: paymentResponse.orderId,
          paymentId: paymentResponse.paymentId,
          bookingId: booking.id,
          confirmationCode: booking.confirmationCode,
        },
        details: [
          ...(details.length
            ? details
            : [`${booking.title}: ${bookingDraft?.seats?.join(", ") || ""}`]),
          `Date: ${bookingDraft?.date || selectedBookingDate || "Selected date"}`,
          `Seats: ${bookingDraft?.seats?.join(", ") || "Selected seats"}`,
          `Amount Paid: INR ${bookingDraft?.price || booking.pricing?.total || 0}`,
          `Booking ID: ${booking.id}`,
          `Tracking Code: ${booking.trackingCode || booking.confirmationCode}`,
          `Confirmation: ${booking.confirmationCode}`,
          `Payment Mode: CollabX ${method.toUpperCase()}`,
        ],
      }
    );
  };

  const handleStartPayment = async (details = []) => {
    if (!bookingDraft?.seats?.length || !bookingDraft?.price) {
      toast.error("Select seats first so I can create the payment");
      return;
    }

    setPaymentLoading(true);

    try {
      const type =
        bookingDraft.mode === "train" ||
        bookingDraft.mode === "bus" ||
        bookingDraft.mode === "flight" ||
        bookingDraft.mode === "movie"
          ? bookingDraft.mode
          : "event";

      const bookingResponse = await API.post("/bookings", {
        userId: user?.uid,
        userEmail: user?.email,
        type,
        quantity: bookingDraft.seats.length,
        selectedSeats: bookingDraft.seats,
        totalAmount: bookingDraft.price,
        title: latestMeta?.intent?.label || `${type} booking`,
        travelDate: dateToIso(bookingDraft.date || selectedBookingDate),
      });

      const booking = bookingResponse.data.booking;
      const paymentResponse = await API.post("/payments/collabx-session", {
        bookingId: booking.id,
        userId: user?.uid,
        userEmail: user?.email,
        amount: bookingDraft.price,
        frontendOrigin: window.location.origin,
      });

      appendAssistantMessage(
        "CollabX Payments is ready. Scan the QR code or use the Payment Done control to confirm the checkout.",
        {
          type: "collabx_payment",
          session: paymentResponse.data.session,
          booking,
          details,
        },
      );
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Payment could not start"
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSend = async (messageOverride) => {
    const currentMessage =
      (messageOverride || input).trim();

    if (!currentMessage || loading) return;

    const dateFromMessage = extractSelectedDate(currentMessage);
    if (dateFromMessage) {
      setSelectedBookingDate(dateFromMessage);
    }

    let activeLocation = userLocation || getStoredLocation();

    if (!activeLocation && needsLocationForTicketing(currentMessage)) {
      activeLocation = await requestBrowserLocation();
      if (activeLocation) {
        setUserLocation(activeLocation);
      } else {
        toast.error("Location access is required for nearby ticket searches");
        appendAssistantMessage(
          "Please allow location access so I can search nearby theatres, hotels, events, or concerts accurately."
        );
        return;
      }
    }

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

    let streamingAssistantId = null;

    try {
      const assistantId = `assistant-${Date.now()}`;
      streamingAssistantId = assistantId;

      updateActiveSession((session) => ({
        ...session,
        messages: [
          ...session.messages,
          {
            id: assistantId,
            role: "assistant",
            text: "",
            widget: null,
          },
        ],
      }));

      const response = await fetch(`${apiBaseUrl}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          attachments: uploadedAttachments,
          clientContext: buildClientContext(activeLocation),
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
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Streaming chat failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffered = "";
      let streamedText = "";
      let finalResponse = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffered += decoder.decode(value, { stream: true });
        const lines = buffered.split("\n");
        buffered = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const event = JSON.parse(line);

          if (event.type === "chunk") {
            streamedText += event.value;
            updateActiveSession((session) => ({
              ...session,
              messages: session.messages.map((item) =>
                item.id === assistantId
                  ? {
                      ...item,
                      text: streamedText,
                    }
                  : item
              ),
            }));
          }

          if (event.type === "done") {
            finalResponse = event.response;
          }

          if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }

      if (!finalResponse) {
        throw new Error("No response received");
      }

      setLatestMeta({
        intent: finalResponse.intent,
        ticketDraft: finalResponse.ticketDraft,
        suggestions: finalResponse.suggestions,
        usedWebSearch: finalResponse.usedWebSearch,
      });

      updateActiveSession((session) => ({
        ...session,
        messages: session.messages.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                text:
                  typeof finalResponse.reply === "string" &&
                  finalResponse.reply.trim() !== ""
                    ? finalResponse.reply
                    : finalResponse.widget
                    ? ""
                    : "I could not generate a response right now.",
                widget: finalResponse.widget || null,
              }
            : item
        ),
      }));

      const sessionForBackup = {
        ...activeSession,
        userId: user?.uid || "anonymous",
        messages: [
          ...nextMessages,
          {
            id: assistantId,
            role: "assistant",
            text: finalResponse.reply || "",
            widget: finalResponse.widget || null,
          },
        ],
      };

      saveSessionToBackend(sessionForBackup);
    } catch (error) {
      console.log(error);

      if (streamingAssistantId) {
        updateActiveSession((session) => ({
          ...session,
          messages: session.messages.filter(
            (item) => item.id !== streamingAssistantId
          ),
        }));
      }

      try {
        const response = await API.post("/chat", {
        message: currentMessage,
        attachments: uploadedAttachments,
        clientContext: buildClientContext(activeLocation),
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
          typeof response.data.reply === "string" &&
            response.data.reply.trim() !== ""
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
      } catch (fallbackError) {
        console.log(fallbackError);

        addAssistantWithTyping(
          "I cannot reach the AI backend right now. Your chat is still saved locally. Please try again in a moment."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(14,165,233,0.16),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(16,185,129,0.10),transparent_28%),#020617] text-white flex">
      <div className="hidden lg:flex w-[340px] border-r border-white/10 bg-black/50 backdrop-blur-xl flex-col">
        <div className="p-5 border-b border-white/10">
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
            <div
              key={chat.id}
              className={`group flex items-center gap-2 border rounded-2xl p-3 transition ${
                chat.id === activeId
                  ? "bg-sky-500/10 border-sky-400/60"
                  : "bg-white/[0.03] hover:bg-white/[0.06] border-white/10"
              }`}
            >
              <button
                onClick={() => setActiveId(chat.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="font-semibold truncate">
                  {chat.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {chat.messages.length} messages
                </p>
              </button>
              <button
                onClick={() => handleDeleteChat(chat.id)}
                title="Delete chat"
                aria-label={`Delete ${chat.title}`}
                className="w-9 h-9 rounded-xl border border-gray-800 text-gray-500 hover:text-red-300 hover:border-red-500/60 hover:bg-red-500/10 flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-gray-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-4 bg-white/[0.04] border border-white/10 rounded-2xl p-4 hover:border-sky-400 transition"
          >
            <ArrowLeft size={20} />
            Back To Dashboard
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b border-white/10 bg-black/45 backdrop-blur-xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Bot size={28} />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                CollabX AI Assistant
              </h2>

              <p className="text-gray-400">
                Booking, refund, complaint, and ticket workflows
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
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
                  <p className="text-sm text-gray-400">
                    Smart intent
                  </p>
                  <p className="font-semibold mt-1">
                    {latestMeta?.intent?.label ||
                      "Ready to detect"}
                  </p>
                </div>

                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
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

                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
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
                  className={`max-w-3xl rounded-3xl p-5 text-base leading-8 whitespace-pre-wrap shadow-lg ${
                    message.role === "user"
                      ? "bg-sky-500 text-white shadow-sky-950/30"
                      : "bg-white/[0.05] border border-white/10 shadow-black/20"
                  }`}
                >
                  {message.text}

                  {message.widget && message.widget.type === "input" && (
                    <InputWidget
                      onSubmit={(val) => handleSend(val)}
                      disabled={index !== messages.length - 1 || loading}
                    />
                  )}
                  {message.widget && message.widget.type === "date_picker" && (
                    <DatePickerWidget
                      mode={message.widget.mode}
                      includeNights={message.widget.includeNights}
                      disabled={index !== messages.length - 1 || loading}
                      onSelect={({ date, message: dateMessage }) => {
                        setSelectedBookingDate(date);
                        handleSend(dateMessage);
                      }}
                    />
                  )}
                  {message.widget && message.widget.type === "mcq" && (
                    <MCQWidget
                      options={message.widget.options}
                      onSelect={(opt) => handleSend(`I select ${opt}`)}
                      onBack={() => handleSend("Back")}
                    />
                  )}
                  {message.widget && message.widget.type === "seat_selection" && (
                    <SeatSelectionWidget
                      mode={message.widget.mode}
                      maxSeats={message.widget.maxSeats}
                      onBack={() => handleSend("Back to options")}
                      onConfirm={(seats, price) => {
                        setBookingDraft({
                          mode: message.widget.mode,
                          seats,
                          price,
                          date: selectedBookingDate,
                        });
                        handleSend(
                          `I selected seats: ${seats.join(", ")} for INR ${price}. Please provide the summary.`
                        );
                      }}
                    />
                  )}
                  {message.widget && message.widget.type === "summary" && (
                    <SummaryWidget
                      details={message.widget.details}
                      paid={message.widget.paid}
                      payment={message.widget.payment}
                      paymentLoading={paymentLoading}
                      userName={user?.displayName || "Guest Passenger"}
                      onContinue={() =>
                        handleStartPayment(message.widget.details)
                      }
                    />
                  )}
                  {message.widget &&
                    message.widget.type === "collabx_payment" && (
                      <CollabXPaymentWidget
                        session={message.widget.session}
                        booking={message.widget.booking}
                        details={message.widget.details}
                        onSuccess={(paymentResponse) =>
                          completePaidTicket(
                            message.widget.booking,
                            paymentResponse,
                            message.widget.details,
                            paymentResponse.method
                          )
                        }
                      />
                    )}
                  {message.widget && message.widget.type === "ticket_draft" && (
                    <TicketDraftWidget
                      draft={message.widget.draft}
                      onConfirm={async () => {
                        const createdTicket = await handleCreateTicket();
                        if (!createdTicket) return;

                        appendAssistantMessage(
                          `Your ticket has been submitted to the dashboard. Tracking code: ${createdTicket.trackingCode || createdTicket.id}`
                        );
                      }}
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

        <div className="border-t border-white/10 bg-black/55 backdrop-blur-xl p-5">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-4">
              {activeSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="shrink-0 border border-white/10 hover:border-sky-400 transition px-4 py-2 rounded-2xl text-sm bg-white/[0.04]"
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

            <div className="bg-white/[0.05] border border-white/10 rounded-3xl p-4 flex items-end gap-4 shadow-2xl shadow-sky-950/20">
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
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center hover:scale-105 transition disabled:opacity-50"
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
