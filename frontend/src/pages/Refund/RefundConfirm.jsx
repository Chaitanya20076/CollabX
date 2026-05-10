import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MailCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Link,
  useParams,
} from "react-router-dom";

import API from "../../services/api";

const RefundConfirm = () => {
  const { token } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const response = await API.get(
          `/bookings/cancellation/${token}`
        );
        setBooking(response.data.booking);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Cancellation link is invalid"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [token]);

  const handleConfirm = async () => {
    setConfirming(true);

    try {
      const response = await API.post(
        `/bookings/cancellation/${token}/confirm`
      );
      setBooking(response.data.booking);
      toast.success("Ticket successfully cancelled");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not confirm cancellation"
      );
    } finally {
      setConfirming(false);
    }
  };

  const isSuccessful =
    booking?.refundStatus === "successful";
  const isInitiated =
    booking?.refundStatus === "initiated" ||
    booking?.status === "cancelled";

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.16),transparent_35%),#020617] text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </Link>

        <div className="border border-white/10 bg-white/[0.04] rounded-3xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-400/30 flex items-center justify-center text-green-300 mb-6">
            {isSuccessful ? (
              <CheckCircle size={32} />
            ) : (
              <MailCheck size={32} />
            )}
          </div>

          <h1 className="text-4xl font-bold">
            {isSuccessful
              ? "Refund successful"
              : isInitiated
                ? "Ticket successfully cancelled"
                : "Confirm registered email"}
          </h1>

          <p className="text-gray-400 mt-4 leading-7">
            {isSuccessful
              ? "Your 24 hr refund window is complete and the refund has been marked successful."
              : isInitiated
                ? "Refund initiated and will take 24 hrs. This status will become refund successful after 24 hrs."
                : "Click confirm to verify your registered email link and proceed with cancellation."}
          </p>

          {loading && (
            <p className="mt-8 text-gray-400">
              Loading cancellation request...
            </p>
          )}

          {booking && (
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {[
                ["Booking", booking.confirmationCode],
                ["Service", booking.title],
                ["Registered email", booking.userEmail],
                ["Refund amount", `INR ${booking.refundAmount || Math.round(Number(booking.pricing?.total || 0) * 0.5)}`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="bg-black/40 border border-white/10 rounded-2xl p-5"
                >
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-semibold mt-2 break-words">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {booking &&
            !isInitiated &&
            !isSuccessful && (
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="mt-8 rounded-2xl bg-green-500 hover:bg-green-400 disabled:opacity-50 px-6 py-4 font-semibold flex items-center gap-3"
              >
                <CheckCircle size={20} />
                {confirming
                  ? "Confirming..."
                  : "Confirm email and cancel ticket"}
              </button>
            )}

          {isInitiated && !isSuccessful && (
            <div className="mt-8 bg-blue-500/10 border border-blue-400/25 rounded-2xl p-5 flex gap-4 text-blue-100">
              <Clock className="shrink-0" />
              <p>
                Refund initiated. It will take 24 hrs to
                complete.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RefundConfirm;
