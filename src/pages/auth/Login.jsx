import React, { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getHomeRoute } from "../../utils/getHomeRoute";
import { Turnstile } from "@marsidev/react-turnstile";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "", // for either email or phone
    password: "",
    remember: false,
  });

  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.identifier || !form.password) {
      setError("Please fill both email/phone and password");
      return;
    }
    const payload = {
      identifier: form.identifier,
      password: form.password,
      remember: form.remember,
      turnstile_token: turnstileToken, // from Turnstile
    };

    try {
      setLoginLoading(true);
      const loggedInUser = await login(payload);
      navigate(getHomeRoute(loggedInUser), { replace: true });
    } catch (err) {
      const data = err?.response?.data || {};

      const message = Array.isArray(data.message)
        ? data.message[0]
        : data.message;

      setError(message || data?.detail || "Invalid email/phone or password");

      setForm((prev) => ({ ...prev, password: "" }));

      // RESET TURNSTILE
      setTurnstileToken("");
      setTurnstileKey((prev) => prev + 1); // forces reload
    } finally {
      setLoginLoading(false);
    }
  };

  if (user?.isAuthenticated) {
    return <Navigate to={getHomeRoute(user)} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* CARD */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 transition">
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Login to SiraLink
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your credentials to continue
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL/PHONE */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

            <input
              type="text"
              name="identifier"
              value={form.identifier}
              placeholder="Email or Phone"
              autoComplete="off"
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              placeholder="Password"
              autoComplete="off"
              onChange={handleChange}
              className="w-full pl-10 pr-10 p-3 rounded-lg border border-gray-300 dark:border-gray-700
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 cursor-pointer"
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* OPTIONS */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="cursor-pointer"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* TURNSTILE */}
          <div className="flex justify-center">
            <Turnstile
              key={turnstileKey} // for reloading
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken("")}
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={
              loginLoading || !form.identifier || !form.password || !turnstileToken
            }
            className="w-full py-3 rounded-lg font-medium
            bg-black text-white dark:bg-white dark:text-black
            hover:opacity-90 active:scale-[0.99]
            transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
