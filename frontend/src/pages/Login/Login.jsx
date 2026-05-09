import {
  useContext,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";

import { AuthContext } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const {
    login,
    googleLogin,
    resetPassword,
  } = useContext(AuthContext);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error(
        "Please fill all fields"
      );
    }

    try {
      setLoading(true);

      await login(
        email,
        password
      );

      toast.success(
        "Login successful"
      );

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin =
    async () => {
      try {
        await googleLogin();

        toast.success(
          "Google login successful"
        );

        navigate("/dashboard");
      } catch (error) {
        toast.error(error.message);
      }
    };

  const handleForgotPassword =
    async () => {
      if (!email) {
        return toast.error(
          "Enter your email first"
        );
      }

      try {
        await resetPassword(email);

        toast.success(
          "Password reset email sent"
        );
      } catch (error) {
        toast.error(error.message);
      }
    };

  return (
    <section className="min-h-screen flex items-center justify-center py-20 relative overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent"></div>

      <div className="w-full max-w-xl bg-[#0a0a0a] border border-gray-800 rounded-[40px] p-10 md:p-14 relative z-10">

        <div className="text-center mb-10">

          <h1 className="text-5xl font-bold gradient-text mb-5">
            Login
          </h1>

          <p className="text-gray-400 text-lg">
            Access your CollabX account
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-7"
        >

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
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
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
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="w-full bg-black border border-gray-700 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-blue-500"
              />

            </div>

          </div>

          {/* FORGOT PASSWORD */}

          <div className="flex justify-end">

            <button
              type="button"
              onClick={
                handleForgotPassword
              }
              className="text-blue-500 hover:text-blue-400 transition"
            >
              Forgot Password?
            </button>

          </div>

          {/* LOGIN */}

          <button className="primary-btn w-full flex items-center justify-center gap-3 py-4 text-lg">

            {loading
              ? "Logging In..."
              : "Login"}

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
          onClick={handleGoogleLogin}
          className="w-full border border-gray-700 hover:border-blue-500 transition rounded-2xl py-4 text-lg font-medium flex items-center justify-center gap-4"
        >

          <FcGoogle size={24} />

          Continue With Google

        </button>

        {/* SIGNUP */}

        <p className="text-center text-gray-400 mt-10 text-lg">

          Don’t have an account?{" "}

          <Link
            to="/signup"
            className="text-blue-500"
          >
            Create Account
          </Link>

        </p>

      </div>

    </section>
  );
};

export default Login;
