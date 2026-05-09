import { useContext, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";

import { AuthContext } from "../../context/AuthContext";

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
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

      await signup(
        username,
        phone,
        email,
        password
      );

      toast.success(
        "Verification email sent successfully"
      );

      navigate("/setup-loader");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup =
    async () => {
      try {
        await googleLogin();

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

          <button className="primary-btn w-full flex items-center justify-center gap-3 py-4 text-lg">

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
          className="w-full border border-gray-700 hover:border-blue-500 transition rounded-2xl py-4 text-lg font-medium flex items-center justify-center gap-4"
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