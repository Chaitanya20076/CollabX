import {
  useContext,
  useEffect,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  LocateFixed,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";

import { AuthContext } from "../../context/AuthContext";
import {
  clearStoredLocation,
  getLocationPermissionState,
  getStoredLocation,
  requestBrowserLocation,
} from "../../utils/location";

const Signup = () => {
  const navigate = useNavigate();

  const {
    signup,
    googleLogin,
  } = useContext(AuthContext);

  const [formData, setFormData] =
    useState({
      username: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(false);
  const [locationLoading, setLocationLoading] =
    useState(false);
  const [userLocation, setUserLocation] =
    useState(null);
  const [locationPermission, setLocationPermission] =
    useState("prompt");

  useEffect(() => {
    let isMounted = true;

    getLocationPermissionState().then((permission) => {
      if (!isMounted) return;

      setLocationPermission(permission);

      if (permission === "granted") {
        setUserLocation(getStoredLocation());
      } else {
        clearStoredLocation();
        setUserLocation(null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const locationEnabled =
    locationPermission === "granted" &&
    Boolean(userLocation);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const ensureLocation = async () => {
    if (locationEnabled) return userLocation;

    setLocationLoading(true);
    const location = await requestBrowserLocation();
    const permission = await getLocationPermissionState();
    setLocationPermission(permission);
    setLocationLoading(false);

    if (!location) {
      clearStoredLocation();
      setUserLocation(null);
      toast.error("Location access is required to create a CollabX account");
      return null;
    }

    setUserLocation(location);
    toast.success("Location access enabled");
    return location;
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const {
      username,
      phone,
      email,
      password,
      confirmPassword,
    } = formData;

    if (
      !username ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return toast.error(
        "Please fill all fields"
      );
    }

    if (password !== confirmPassword) {
      return toast.error(
        "Passwords do not match"
      );
    }

    try {
      setLoading(true);
      const location = await ensureLocation();
      if (!location) return;

      await signup(
        username,
        phone,
        email,
        password,
        location
      );

      toast.success(
        "Verification email sent successfully"
      );

      navigate("/verify-email");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup =
    async () => {
      try {
        const location = await ensureLocation();
        if (!location) return;

        await googleLogin(location);

        toast.success(
          "Google signup successful"
        );

        navigate("/dashboard");
      } catch (error) {
        toast.error(error.message);
      }
    };

  return (
    <section className="min-h-screen flex items-center justify-center py-20 relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent"></div>

      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-gray-800 rounded-[40px] p-10 md:p-14 relative z-10">

        <div className="text-center mb-10">

          <h1 className="text-5xl font-bold gradient-text mb-5">
            Create Account
          </h1>

          <p className="text-gray-400 text-lg">
            Join the CollabX ecosystem
          </p>

          <div className={`mt-6 rounded-2xl border p-4 text-left ${
            locationEnabled
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}>
            <div className="flex items-start gap-3">
              <LocateFixed
                size={20}
                className={locationEnabled ? "text-emerald-300" : "text-red-300"}
              />
              <div>
                <p className="font-semibold text-white">
                  Location access is mandatory
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  CollabX needs it for nearby movie, hotel, event, and concert ticketing. Travel bookings still use your source and destination.
                </p>
                {userLocation?.label && (
                  <p className="mt-2 text-sm text-emerald-200">
                    Detected: {userLocation.label}
                  </p>
                )}
                {locationPermission === "denied" && !userLocation && (
                  <p className="mt-2 text-sm text-red-200">
                    Browser location is blocked. Click the site/location icon near the address bar, allow location, then press Enable Location.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        <form
          onSubmit={handleSignup}
          className="space-y-7"
        >

          {/* USERNAME */}

          <div>

            <label className="block mb-3 text-gray-300">
              Username
            </label>

            <div className="relative">

              <User
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={
                  formData.username
                }
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* PHONE */}

          <div>

            <label className="block mb-3 text-gray-300">
              Phone Number
            </label>

            <div className="relative">

              <Phone
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* EMAIL */}

          <div>

            <label className="block mb-3 text-gray-300">
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div>

            <label className="block mb-3 text-gray-300">
              Password
            </label>

            <div className="relative">

              <Lock
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={
                  formData.password
                }
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* CONFIRM PASSWORD */}

          <div>

            <label className="block mb-3 text-gray-300">
              Confirm Password
            </label>

            <div className="relative">

              <Lock
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={
                  formData.confirmPassword
                }
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="block text-gray-200 font-semibold">
                  Location Access
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Required for nearby movie, hotel, event, and concert searches.
                </p>
              </div>

              <button
                type="button"
                onClick={ensureLocation}
                disabled={locationLoading}
                className="shrink-0 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-200 hover:bg-blue-500/20 disabled:opacity-60"
              >
                <span className="flex items-center gap-2">
                  <LocateFixed size={16} />
                  {locationEnabled
                    ? "Enabled"
                    : locationLoading
                      ? "Requesting..."
                      : "Enable Location"}
                </span>
              </button>
            </div>
          </div>

          <button
            disabled={loading || !locationEnabled}
            className="primary-btn w-full flex items-center justify-center gap-3 py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

            <ArrowRight size={20} />

          </button>

        </form>

        {/* DIVIDER */}

        <div className="flex items-center gap-5 my-10">

          <div className="flex-1 h-[1px] bg-gray-800"></div>

          <span className="text-gray-500">
            OR
          </span>

          <div className="flex-1 h-[1px] bg-gray-800"></div>

        </div>

        {/* GOOGLE */}

        <button
          onClick={handleGoogleSignup}
          disabled={loading || !locationEnabled}
          className="w-full border border-gray-700 hover:border-blue-500 transition rounded-2xl py-4 text-lg font-medium flex items-center justify-center gap-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >

          <FcGoogle size={24} />

          Continue With Google

        </button>

        {/* LOGIN */}

        <p className="text-center text-gray-400 mt-10 text-lg">

          Already have an account?{" "}

          <Link
            to="/login"
            className="text-blue-500"
          >
            Login
          </Link>

        </p>

      </div>

    </section>
  );
};

export default Signup;
