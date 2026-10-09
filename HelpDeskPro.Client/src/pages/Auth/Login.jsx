import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Headphones,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);

      console.log("Login successful:", data);

      // Navigate based on user role
      if (data.role === "Admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (data.role === "Agent") {
        navigate("/agent/dashboard", { replace: true });
      } else if (data.role === "Employee") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login Error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your email and password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg mb-4">
            <Headphones size={28} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            HelpDeskPro
          </h1>

          <p className="text-slate-500 mt-2">
            IT Help Desk & Issue Tracking System
          </p>

        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

          <div className="mb-6">

            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome back
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Sign in to access your account
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 text-slate-600">

                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300"
                />

                Remember me

              </label>

              <button
                type="button"
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Forgot password?
              </button>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition shadow-sm"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-400 mt-6">
          HelpDeskPro © 2026
        </p>

      </div>

    </div>
  );
}

export default Login;