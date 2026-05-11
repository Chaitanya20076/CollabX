import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Ticket,
  AlertTriangle,
  CheckCircle,
  Bot,
  Bell,
  LogOut,
  Mail,
  MessageCircle,
  ArrowRight,
  Clock,
  TrendingUp,
  ShieldCheck,
  CalendarDays,
  IndianRupee,
  XCircle,
  RotateCcw,
  CreditCard,
} from "lucide-react";

import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const {
    user,
    logout,
    resendVerification,
    refreshUser,
  } =
    useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [chatSessions, setChatSessions] =
    useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] =
    useState([]);
  const [userActivities, setUserActivities] =
    useState([]);
  const [ticketLoading, setTicketLoading] =
    useState(false);
  const [bookingLoading, setBookingLoading] =
    useState(false);
  const [notificationOpen, setNotificationOpen] =
    useState(false);

  useEffect(() => {
    const loadTickets = async () => {
      if (!user?.uid) return;

      try {
        setTicketLoading(true);

        const response = await API.get(
          `/tickets?userId=${user.uid}`
        );

        setTickets(response.data.tickets || []);
      } catch (error) {
        console.log(error);
      } finally {
        setTicketLoading(false);
      }
    };

    loadTickets();
  }, [user?.uid]);

  useEffect(() => {
    const loadActivities = async () => {
      if (!user?.uid) return;

      try {
        const response = await API.get(
          `/activities?userId=${user.uid}`
        );

        setUserActivities(
          response.data.activities || []
        );
      } catch (error) {
        console.log(error);
      }
    };

    loadActivities();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const socket = io(
      import.meta.env.VITE_API_ORIGIN ||
        "https://collabx-9sf9.onrender.com",
      {
        auth: {
          userId: user.uid,
        },
      }
    );

    socket.on("user:event", (activity) => {
      setUserActivities((prev) => [
        activity,
        ...prev.filter((item) => item.id !== activity.id),
      ]);
    });

    return () => socket.disconnect();
  }, [user?.uid]);

  const refreshTransactions = async () => {
    if (!user?.uid) return;

    const response = await API.get(
      `/payments/transactions?userId=${user.uid}`
    );

    setTransactions(response.data.transactions || []);
  };

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        await refreshTransactions();
      } catch (error) {
        console.log(error);
      }
    };

    loadTransactions();
  }, [user?.uid]);

  useEffect(() => {
    const loadChatSessions = async () => {
      if (!user?.uid) return;

      try {
        const response = await API.get(
          `/chat/sessions?userId=${user.uid}`
        );

        setChatSessions(response.data.sessions || []);
      } catch (error) {
        console.log(error);
      }
    };

    loadChatSessions();
  }, [user?.uid]);

  const refreshBookings = async () => {
    if (!user?.uid) return;

    const response = await API.get(
      `/bookings?userId=${user.uid}`
    );

    setBookings(response.data.bookings || []);
  };

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.uid) return;

      try {
        setBookingLoading(true);
        await refreshBookings();
      } catch (error) {
        console.log(error);
      } finally {
        setBookingLoading(false);
      }
    };

    loadBookings();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();

      toast.success(
        "Logged out successfully"
      );

      navigate("/login");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openTickets = tickets.filter(
    (ticket) => ticket.status !== "resolved"
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  );

  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "high"
  );

  const resolutionRate = tickets.length
    ? Math.round(
        (resolvedTickets.length / tickets.length) * 100
      )
    : 0;

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  );

  const bookingRevenue = bookings.reduce(
    (total, booking) =>
      total + Number(booking.pricing?.total || 0),
    0
  );

  const paidTransactions = transactions.filter(
    (transaction) => transaction.status === "paid"
  );

  const paymentTotal = paidTransactions.reduce(
    (total, transaction) =>
      total + Number(transaction.amount || 0),
    0
  );

  const stats = [
    {
      title: "Total Tickets",
      value: String(tickets.length),
      icon: <Ticket size={30} />,
      color: "text-blue-500",
    },
    {
      title: "Pending Issues",
      value: String(openTickets.length),
      icon: <AlertTriangle size={30} />,
      color: "text-orange-500",
    },
    {
      title: "Resolved",
      value: String(resolvedTickets.length),
      icon: <CheckCircle size={30} />,
      color: "text-green-500",
    },
    {
      title: "AI Responses",
      value: String(
        chatSessions.reduce(
          (total, chat) =>
            total +
            (chat.messages || []).filter(
              (message) =>
                message.role === "assistant"
            ).length,
          0
        )
      ),
      icon: <Bot size={30} />,
      color: "text-purple-500",
    },
    {
      title: "Bookings",
      value: String(upcomingBookings.length),
      icon: <CalendarDays size={30} />,
      color: "text-pink-500",
    },
  ];

  const activities = useMemo(
    () =>
      userActivities.length
        ? userActivities
            .slice(0, 6)
            .map((activity) => activity.description || activity.title)
        : tickets.length
          ? tickets
              .slice(0, 4)
              .map(
                (ticket) =>
                  `${ticket.title} is ${ticket.status}`
              )
        : [
            "No tickets yet",
            "Start a chat to create your first support ticket",
          ],
    [tickets, userActivities]
  );

  const notifications = useMemo(
    () => [
      ...userActivities.slice(0, 4).map((activity) => ({
        title: activity.title || "Workspace update",
        body: activity.description || "New activity received",
        tone:
          activity.type?.includes("refund") ||
          activity.type?.includes("cancel")
            ? "text-amber-300"
            : "text-blue-300",
      })),
      ...(user?.emailVerified
        ? []
        : [
            {
              title: "Verify your email",
              body: "Email verification keeps account recovery and ticket alerts secure.",
              tone: "text-orange-400",
            },
          ]),
      ...(highPriorityTickets.length
        ? [
            {
              title: "High priority tickets",
              body: `${highPriorityTickets.length} ticket needs faster attention.`,
              tone: "text-red-400",
            },
          ]
        : []),
      {
        title: "AI workspace ready",
        body: "Use CollabX AI to create tickets, refunds, complaints, and booking workflows.",
        tone: "text-blue-400",
      },
      ...(upcomingBookings.length
        ? [
            {
              title: "Upcoming bookings",
              body: `${upcomingBookings.length} confirmed booking workflow is active.`,
              tone: "text-green-400",
            },
          ]
        : []),
    ],
    [
      userActivities,
      user?.emailVerified,
      highPriorityTickets.length,
      upcomingBookings.length,
    ]
  );

  const statusOverview = [
    {
      label: "Open",
      value: openTickets.length,
      color: "bg-blue-500",
    },
    {
      label: "Resolved",
      value: resolvedTickets.length,
      color: "bg-green-500",
    },
    {
      label: "High Priority",
      value: highPriorityTickets.length,
      color: "bg-red-500",
    },
  ];

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      toast.success("Verification email sent");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRefreshVerification = async () => {
    try {
      await refreshUser();
      toast.success("Account status refreshed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateDemoBooking = async (type) => {
    try {
      const response = await API.post("/bookings", {
        userId: user?.uid,
        userEmail: user?.email,
        type,
        quantity: 1,
        title: `${type} booking`,
        travelDate: new Date().toISOString(),
      });

      toast.success(
        `Booking confirmed: ${response.data.booking.confirmationCode}`
      );

      await refreshBookings();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Booking failed"
      );
    }
  };

  const handleCancelBooking = async (id) => {
    navigate(`/refund/${id}`);
  };

  const handleRefundBooking = async (id) => {
    navigate(`/refund/${id}`);
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);

      const script = document.createElement("script");
      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleCheckout = async (booking) => {
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      return toast.error(
        "Unable to load Razorpay checkout"
      );
    }

    try {
      const response = await API.post("/payments/order", {
        bookingId: booking.id,
        userId: user?.uid,
        userEmail: user?.email,
      });

      const options = {
        key: response.data.keyId,
        amount: response.data.order.amount,
        currency: response.data.order.currency,
        name: "CollabX",
        description: booking.title,
        order_id: response.data.order.id,
        prefill: {
          email: user?.email,
          name:
            user?.displayName ||
            user?.email?.split("@")[0],
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (paymentResponse) => {
          const verifyResponse = await API.post(
            "/payments/verify",
            paymentResponse
          );

          if (verifyResponse.data.success) {
            toast.success("Payment confirmed");
            await refreshTransactions();
            await refreshBookings();
          } else {
            toast.error("Payment verification failed");
          }
        },
        modal: {
          ondismiss: async () => {
            await API.post("/payments/failure", {
              orderId: response.data.order.id,
              reason: "Checkout dismissed",
            });

            await refreshTransactions();
          },
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", async (failure) => {
        await API.post("/payments/failure", {
          orderId: response.data.order.id,
          reason:
            failure.error?.description ||
            "Payment failed",
        });

        toast.error("Payment failed");
        await refreshTransactions();
      });

      checkout.open();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Checkout failed"
      );
    }
  };

  const handleTransactionRefund = async (transaction) => {
    if (transaction.bookingId) {
      navigate(`/refund/${transaction.bookingId}`);
      return;
    }

    toast.error("This transaction is not linked to a booking");
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.09),transparent_28%),#020617] text-white">

      {/* TOP BAR */}

      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="border-b border-white/10 bg-black/55 backdrop-blur-xl sticky top-0 z-40"
      >

        <div className="container-custom py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>

            <h1 className="text-4xl md:text-5xl font-bold">

              Welcome Back,{" "}

              <span className="gradient-text">
                {user?.displayName ||
                  user?.email?.split("@")[0]}
              </span>

            </h1>

            <p className="text-gray-400 mt-3 text-lg">
              Live ticketing, payments, refunds, and AI support in one command center.
            </p>

          </div>

          <div className="flex items-center gap-5 flex-wrap">

            {/* MAIN CHAT BUTTON */}

            <Link
  to="/ai-chat"
  className="bg-gradient-to-r from-blue-600 to-purple-700 min-w-[320px] px-8 py-4 rounded-2xl flex items-center justify-center gap-4 text-lg font-semibold shadow-2xl shadow-blue-500/20 hover:scale-105 transition whitespace-nowrap"
>

  <MessageCircle size={24} />

  <span>
    Chat With CollabX AI
  </span>

  <ArrowRight size={20} />

</Link>

            <div className="relative">
              <button
                onClick={() =>
                  setNotificationOpen((prev) => !prev)
                }
                className="relative w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center hover:border-blue-400 transition"
                aria-label="Open notifications"
              >
                <Bell />
                {!!notifications.length && (
                  <span className="absolute -top-1 -right-1 min-w-6 h-6 rounded-full bg-blue-500 text-xs font-bold grid place-items-center px-1">
                    {notifications.length}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-[min(360px,calc(100vw-2rem))] rounded-3xl border border-white/10 bg-[#05070c] shadow-2xl shadow-black/50 p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">
                      Notifications
                    </h3>
                    <span className="text-xs text-gray-500">
                      Realtime
                    </span>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notifications.map((item, index) => (
                      <div
                        key={`${item.title}-${item.body}-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                      >
                        <p className={`font-semibold ${item.tone}`}>
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-400 mt-1 leading-6">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition px-6 py-4 rounded-2xl text-red-400"
            >

              <LogOut size={20} />

              Logout

            </button>

          </div>

        </div>

      </motion.div>

      <div className="container-custom py-14">

        {/* USER PROFILE */}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="bg-[#0a0a0a] border border-gray-800 rounded-[40px] p-10 mb-14"
        >

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

            <div className="flex items-center gap-6">

              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="w-28 h-28 rounded-full border-4 border-blue-500"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center text-4xl font-bold">

                  {user?.email?.charAt(0).toUpperCase()}

                </div>
              )}

              <div>

                <h2 className="text-4xl font-bold mb-4">

                  {user?.displayName ||
                    user?.email?.split("@")[0]}

                </h2>

                <div className="flex items-center gap-3 text-gray-400 text-lg">

                  <Mail size={18} />

                  {user?.email}

                </div>

                <div className="mt-4 inline-flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-2 rounded-full">

                  <CheckCircle size={18} />

                  {user?.emailVerified
                    ? "Email Verified"
                    : "Email Not Verified"}

                </div>

                {!user?.emailVerified && (
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <button
                      onClick={handleResendVerification}
                      className="border border-blue-500/40 text-blue-400 px-4 py-2 rounded-xl"
                    >
                      Resend Verification
                    </button>
                    <button
                      onClick={handleRefreshVerification}
                      className="border border-gray-700 px-4 py-2 rounded-xl"
                    >
                      Refresh Status
                    </button>
                  </div>
                )}

              </div>

            </div>

            <div className="grid grid-cols-2 gap-6">

              <div className="bg-black border border-gray-800 rounded-3xl p-6 text-center">

                <h3 className="text-4xl font-bold text-blue-500 mb-3">
                  {tickets.length}
                </h3>

                <p className="text-gray-400">
                  Tickets
                </p>

              </div>

              <div className="bg-black border border-gray-800 rounded-3xl p-6 text-center">

                <h3 className="text-4xl font-bold text-green-500 mb-3">
                  {resolutionRate}%
                </h3>

                <p className="text-gray-400">
                  Resolution Rate
                </p>

              </div>

            </div>

          </div>

        </motion.div>

        {/* STATS */}

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5 mb-14">

          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.08 * index,
              }}
              className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 hover:border-blue-400/40 transition"
            >

              <div className="flex items-center justify-between mb-6">

                <div className={stat.color}>
                  {stat.icon}
                </div>

                <span className="text-gray-500 text-sm">
                  Updated
                </span>

              </div>

              <h2 className="text-5xl font-bold mb-4">
                {stat.value}
              </h2>

              <p className="text-gray-400 text-lg">
                {stat.title}
              </p>

            </motion.div>
          ))}

        </div>

        {/* SMART ANALYTICS */}

        <div className="grid lg:grid-cols-3 gap-8 mb-14">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8"
          >

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-2xl font-bold">
                Ticket Status
              </h2>

              <Clock className="text-blue-500" />

            </div>

            <div className="space-y-6">

              {statusOverview.map((item) => (
                <div key={item.label}>

                  <div className="flex items-center justify-between mb-2">

                    <span className="text-gray-400">
                      {item.label}
                    </span>

                    <span className="font-semibold">
                      {item.value}
                    </span>

                  </div>

                  <div className="h-2 bg-black rounded-full overflow-hidden">

                    <div
                      className={`${item.color} h-full rounded-full`}
                      style={{
                        width: `${
                          tickets.length
                            ? Math.max(
                                (item.value /
                                  tickets.length) *
                                  100,
                                item.value ? 8 : 0
                              )
                            : 0
                        }%`,
                      }}
                    ></div>

                  </div>

                </div>
              ))}

            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16 }}
            className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8"
          >

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-2xl font-bold">
                AI Analytics
              </h2>

              <TrendingUp className="text-purple-500" />

            </div>

            <div className="grid grid-cols-2 gap-5">

              <div className="bg-black border border-gray-800 rounded-2xl p-5">

                <p className="text-gray-400 mb-2">
                  Chats
                </p>

                <h3 className="text-3xl font-bold">
                  {chatSessions.length}
                </h3>

              </div>

              <div className="bg-black border border-gray-800 rounded-2xl p-5">

                <p className="text-gray-400 mb-2">
                  Resolution
                </p>

                <h3 className="text-3xl font-bold text-green-500">
                  {resolutionRate}%
                </h3>

              </div>

            </div>

            <p className="text-gray-400 leading-7 mt-6">
              CollabX AI has generated support context from your recent chats and ticket activity.
            </p>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.22 }}
            className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8"
          >

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-2xl font-bold">
                Notifications
              </h2>

              <Bell className="text-blue-500" />

            </div>

            <div className="space-y-5">

              {notifications.map((item, index) => (
                <div
                  key={`${item.title}-${item.body}-${index}`}
                  className="bg-black border border-gray-800 rounded-2xl p-5"
                >

                  <p className={`font-semibold ${item.tone}`}>
                    {item.title}
                  </p>

                  <p className="text-gray-400 text-sm leading-6 mt-2">
                    {item.body}
                  </p>

                </div>
              ))}

            </div>

          </motion.div>

        </div>

        {/* BOOKING WORKFLOWS */}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
          className="bg-[#0a0a0a] border border-gray-800 rounded-[40px] p-8 mb-14"
        >

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Booking & Ticketing
              </h2>

              <p className="text-gray-400 mt-2">
                Movies, flights, hotels, events, and concerts with confirmation, dynamic pricing, availability, cancellation, and refund workflows.
              </p>

            </div>

            <div className="flex items-center gap-3 text-green-400 bg-green-500/10 border border-green-500/20 px-5 py-3 rounded-2xl">

              <IndianRupee size={18} />

              Total Value: INR {bookingRevenue}

            </div>

          </div>

          <div className="grid md:grid-cols-5 gap-3 mb-8">

            {[
              "movie",
              "flight",
              "hotel",
              "event",
              "concert",
            ].map((type) => (
              <button
                key={type}
                onClick={() => handleCreateDemoBooking(type)}
                className="bg-black border border-gray-800 hover:border-blue-500 rounded-2xl p-4 capitalize transition"
              >
                {type}
              </button>
            ))}

          </div>

          <div className="grid xl:grid-cols-2 gap-8">

            <div className="bg-black border border-gray-800 rounded-3xl overflow-hidden">

              <div className="p-6 border-b border-gray-800 flex items-center justify-between">

                <h3 className="text-2xl font-bold">
                  Upcoming Bookings
                </h3>

                <CalendarDays className="text-blue-500" />

              </div>

              <div className="divide-y divide-gray-800">

                {bookingLoading && (
                  <p className="p-6 text-gray-400">
                    Loading bookings...
                  </p>
                )}

                {!bookingLoading &&
                  upcomingBookings.length === 0 && (
                    <p className="p-6 text-gray-400">
                      No upcoming bookings yet.
                    </p>
                  )}

                {!bookingLoading &&
                  upcomingBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-6"
                    >

                      <div className="flex items-start justify-between gap-5">

                        <div>

                          <p className="text-lg font-semibold capitalize">
                            {booking.title}
                          </p>

                          <p className="text-gray-400 mt-2">
                            Confirmation: {booking.confirmationCode}
                          </p>

                          <p className="text-gray-500 text-sm mt-2">
                            Seats: {booking.availability?.requestedQuantity} / Available: {booking.availability?.seatsAvailable}
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="font-bold text-green-400">
                            INR {booking.pricing?.total}
                          </p>

                          <p className="text-gray-500 text-sm mt-1">
                            Fee INR {booking.pricing?.platformFee}
                          </p>

                          <p className="text-gray-500 text-sm mt-1">
                            Payment: {booking.paymentStatus || "unpaid"}
                          </p>

                        </div>

                      </div>

                      <div className="flex gap-3 mt-5 flex-wrap">

                        <button
                          onClick={() =>
                            handleCheckout(booking)
                          }
                          className="border border-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center gap-2"
                        >
                          <IndianRupee size={16} />
                          Pay
                        </button>

                        <button
                          onClick={() =>
                            handleCancelBooking(booking.id)
                          }
                          className="border border-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Cancel safely
                        </button>

                        <button
                          onClick={() =>
                            handleRefundBooking(booking.id)
                          }
                          className="border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2"
                        >
                          <RotateCcw size={16} />
                          Refund details
                        </button>

                      </div>

                    </div>
                  ))}

              </div>

            </div>

            <div className="bg-black border border-gray-800 rounded-3xl overflow-hidden">

              <div className="p-6 border-b border-gray-800">

                <h3 className="text-2xl font-bold">
                  Ticket History
                </h3>

              </div>

              <div className="divide-y divide-gray-800">

                {bookings.length === 0 && (
                  <p className="p-6 text-gray-400">
                    Booking history will appear here.
                  </p>
                )}

                {bookings.slice(0, 6).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-6 flex items-center justify-between gap-5"
                  >

                    <div>

                      <p className="font-semibold capitalize">
                        {booking.type} ticket
                      </p>

                      <p className="text-gray-400 text-sm mt-1">
                        {booking.confirmationCode} / {booking.status} / Refund: {booking.refundStatus}
                      </p>

                    </div>

                    <span className="text-gray-400">
                      INR {booking.pricing?.total}
                    </span>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </motion.div>

        {/* PAYMENTS */}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          className="bg-[#0a0a0a] border border-gray-800 rounded-[40px] p-8 mb-14"
        >

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Payments
              </h2>

              <p className="text-gray-400 mt-2">
                Razorpay checkout, payment confirmations, service-wise platform fees, transaction logs, failures, and refund requests.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="bg-black border border-gray-800 rounded-2xl px-5 py-4">

                <p className="text-gray-400 text-sm">
                  Paid Value
                </p>

                <p className="text-2xl font-bold text-green-400">
                  INR {paymentTotal}
                </p>

              </div>

              <div className="bg-black border border-gray-800 rounded-2xl px-5 py-4">

                <p className="text-gray-400 text-sm">
                  Transactions
                </p>

                <p className="text-2xl font-bold">
                  {transactions.length}
                </p>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto bg-black border border-gray-800 rounded-3xl">

            <table className="w-full min-w-[760px]">

              <thead className="bg-[#111111]">

                <tr>

                  <th className="text-left px-6 py-4">
                    Transaction
                  </th>

                  <th className="text-left px-6 py-4">
                    Service
                  </th>

                  <th className="text-left px-6 py-4">
                    Amount
                  </th>

                  <th className="text-left px-6 py-4">
                    Fee
                  </th>

                  <th className="text-left px-6 py-4">
                    Status
                  </th>

                  <th className="text-left px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {transactions.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-6 text-gray-400"
                    >
                      No transactions yet. Use Pay on an upcoming booking.
                    </td>
                  </tr>
                )}

                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-t border-gray-800"
                  >

                    <td className="px-6 py-5">
                      {transaction.razorpayOrderId || transaction.id}
                    </td>

                    <td className="px-6 py-5 capitalize">
                      {transaction.serviceType}
                    </td>

                    <td className="px-6 py-5">
                      INR {transaction.amount}
                    </td>

                    <td className="px-6 py-5">
                      INR {transaction.platformFee}
                    </td>

                    <td className="px-6 py-5">
                      <span className="bg-blue-600/20 text-blue-400 px-3 py-2 rounded-full text-sm">
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <button
                        onClick={() =>
                          handleTransactionRefund(transaction)
                        }
                        className="border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl inline-flex items-center gap-2"
                      >
                        <CreditCard size={16} />
                        Refund details
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </motion.div>

        {/* CHAT HISTORY PREVIEW */}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="bg-[#0a0a0a] border border-gray-800 rounded-[40px] p-8 mb-14"
        >

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

            <div>

              <h2 className="text-3xl font-bold">
                Chat History Preview
              </h2>

              <p className="text-gray-400 mt-2">
                Your latest AI conversations and support workflows.
              </p>

            </div>

            <Link
              to="/ai-chat"
              className="border border-blue-500/40 text-blue-400 px-5 py-3 rounded-2xl flex items-center gap-3 w-fit"
            >

              <MessageCircle size={18} />

              Open AI Chat

            </Link>

          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {chatSessions.slice(0, 3).map((chat) => {
              const lastMessage =
                [...(chat.messages || [])]
                  .reverse()
                  .find((message) => message.text)
                  ?.text || "No messages yet";

              return (
                <div
                  key={chat.id}
                  className="bg-black border border-gray-800 rounded-3xl p-6"
                >

                  <div className="flex items-center gap-3 mb-4">

                    <Bot className="text-purple-500" />

                    <h3 className="font-semibold truncate">
                      {chat.title}
                    </h3>

                  </div>

                  <p className="text-gray-400 leading-7 line-clamp-2">
                    {lastMessage}
                  </p>

                  <p className="text-gray-500 text-sm mt-4">
                    {(chat.messages || []).length} messages
                  </p>

                </div>
              );
            })}

            {chatSessions.length === 0 && (
              <div className="bg-black border border-gray-800 rounded-3xl p-6">

                <div className="flex items-center gap-3 mb-4">

                  <ShieldCheck className="text-green-500" />

                  <h3 className="font-semibold">
                    No chats yet
                  </h3>

                </div>

                <p className="text-gray-400 leading-7">
                  Start a CollabX AI chat to generate ticket drafts, booking help, refunds, and support workflows.
                </p>

              </div>
            )}

          </div>

        </motion.div>

        {/* MAIN GRID */}

        <div className="grid lg:grid-cols-3 gap-10">

          {/* RECENT TICKETS */}

          <div className="lg:col-span-2 bg-[#0a0a0a] border border-gray-800 rounded-[40px] overflow-hidden">

            <div className="p-8 border-b border-gray-800">

              <h2 className="text-3xl font-bold">
                Recent Tickets
              </h2>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead className="bg-[#111111]">

                  <tr>

                    <th className="text-left px-8 py-5">
                      Ticket ID
                    </th>

                    <th className="text-left px-8 py-5">
                      Issue
                    </th>

                    <th className="text-left px-8 py-5">
                      Status
                    </th>

                    <th className="text-left px-8 py-5">
                      Priority
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {ticketLoading && (
                    <tr>
                      <td
                        className="px-8 py-6 text-gray-400"
                        colSpan="4"
                      >
                        Loading tickets...
                      </td>
                    </tr>
                  )}

                  {!ticketLoading &&
                    tickets.length === 0 && (
                      <tr>
                        <td
                          className="px-8 py-6 text-gray-400"
                          colSpan="4"
                        >
                          No tickets created yet.
                        </td>
                      </tr>
                    )}

                  {!ticketLoading && tickets.map(
                    (ticket, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-800"
                      >

                        <td className="px-8 py-6">
                          {ticket.id}
                        </td>

                        <td className="px-8 py-6">
                          {ticket.summary ||
                            ticket.title}
                        </td>

                        <td className="px-8 py-6">

                          <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm">

                            {ticket.status}

                          </span>

                        </td>

                        <td className="px-8 py-6">
                          {ticket.priority}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* ACTIVITY */}

          <div className="bg-[#0a0a0a] border border-gray-800 rounded-[40px] p-8">

            <h2 className="text-3xl font-bold mb-10">
              Recent Activity
            </h2>

            <div className="space-y-8">

              {activities.map(
                (activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-5"
                  >

                    <div className="w-4 h-4 rounded-full bg-blue-500 mt-2"></div>

                    <div>

                      <p className="text-gray-300 leading-7">
                        {activity}
                      </p>

                      <span className="text-gray-500 text-sm">
                        Just now
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Dashboard;
