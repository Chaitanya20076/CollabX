import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Mail,
  ShieldAlert,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Link,
  useParams,
} from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";
import API from "../../services/api";

const RefundRequest = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [demoLink, setDemoLink] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const response = await API.get(`/bookings/${id}`);
        setBooking(response.data.booking);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Could not load booking"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id]);

  const refundAmount = useMemo(
    () =>
      Math.round(
        Number(booking?.pricing?.total || 0) * 0.5
      ),
    [booking?.pricing?.total]
  );

  const handleConfirm = async () => {
    setSending(true);
    setDemoLink("");

    try {
      const response = await API.post(
        `/bookings/${id}/cancel-request`,
        {
          reason: "Customer confirmed cancellation from refund page",
          frontendOrigin: window.location.origin,
        }
      );

      setBooking(response.data.booking);
      setDemoLink(response.data.confirmationUrl || "");
      toast.success(
        response.data.email?.sent
          ? "Confirmation link sent to your registered email"
          : "Email is not configured, demo link is ready"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not start cancellation"
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-black text-white grid place-items-center">
        <p className="text-gray-400">Loading refund details...</p>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="min-h-screen bg-black text-white grid place-items-center px-6">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl font-bold">Booking not found</h1>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 text-blue-400"
          >
            <ArrowLeft size={18} />
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),#030712] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </Link>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="border border-white/10 bg-white/[0.04] rounded-3xl p-8">
            <div className="flex items-start justify-between gap-6 mb-8">
              <div>
                <p className="text-blue-300 text-sm font-semibold uppercase tracking-[0.18em]">
                  Cancellation Review
                </p>
                <h1 className="text-4xl font-bold mt-3">
                  {booking.title}
                </h1>
                <p className="text-gray-400 mt-3">
                  Review all details before cancelling this ticket.
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Ticket size={26} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                ["Confirmation", booking.confirmationCode],
                ["Service", booking.type],
                ["Status", booking.status],
                ["Payment", booking.paymentStatus || "unpaid"],
                ["Seats", booking.selectedSeats?.join(", ") || booking.availability?.requestedQuantity || "1"],
                ["Registered email", booking.userEmail || user?.email],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-black/40 border border-white/10 rounded-2xl p-5"
                >
                  <p className="text-gray-500 text-sm">{label}</p>
                  <p className="font-semibold mt-2 capitalize break-words">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-amber-500/10 border border-amber-400/30 rounded-2xl p-5 flex gap-4">
              <ShieldAlert className="text-amber-300 shrink-0" />
              <div>
                <h2 className="font-semibold text-amber-100">
                  Are you sure you want to cancel?
                </h2>
                <p className="text-amber-100/75 mt-2 leading-7">
                  Only 50% is refundable for this cancellation.
                  The refund starts after you confirm the link sent
                  to your registered email.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-white/10 bg-black/50 rounded-3xl p-8 h-fit">
            <h2 className="text-2xl font-bold mb-6">
              Refund Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-gray-400">Paid amount</span>
                <span className="font-semibold">
                  INR {booking.pricing?.total || 0}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-gray-400">Refundable</span>
                <span className="font-semibold text-green-300">
                  INR {booking.refundAmount || refundAmount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timeline</span>
                <span className="font-semibold">24 hrs</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={sending || booking.status === "cancelled"}
              className="mt-8 w-full rounded-2xl bg-red-500 hover:bg-red-400 disabled:opacity-50 disabled:hover:bg-red-500 px-5 py-4 font-semibold flex items-center justify-center gap-3"
            >
              <Mail size={18} />
              {sending
                ? "Sending confirmation..."
                : "Yes, send email confirmation"}
            </button>

            {booking.refundStatus ===
              "email_verification_pending" && (
              <div className="mt-5 bg-blue-500/10 border border-blue-400/25 rounded-2xl p-4 text-blue-100">
                <div className="flex items-center gap-3 font-semibold">
                  <CheckCircle size={18} />
                  Email confirmation pending
                </div>
                <p className="text-sm text-blue-100/75 mt-2 leading-6">
                  Click the link sent to your registered email to
                  complete cancellation.
                </p>
              </div>
            )}

            {demoLink && (
              <Link
                to={demoLink.replace(window.location.origin, "")}
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-blue-400/40 text-blue-200 px-5 py-3"
              >
                <CalendarDays size={18} />
                Open demo verification link
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RefundRequest;
