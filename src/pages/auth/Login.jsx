import React, { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHomeRoute } from "../../utils/getHomeRoute";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please fill  both email and password");
      return;
    }
    try {
      setLoading(true);

      const data = await login(form);

      const userType = data.user.user_type;
      if (userType === "admin") {
        navigate("/admin/overview");
      } else if (userType === "client") {
        navigate("/client/overview");
      } else if (userType === "worker") {
        navigate("/worker/overview");
      }
    } catch (err) {
      const data = err?.response?.data;

      if (data?.error_code === "USER_DISABLED") {
        setError(
          "Your account has been disabled. Please contact EthioWorks support to reactivate your account.",
        );
      } else if (data?.error_code === "PROFILE_MISSING") {
        setError("Your account setup is incomplete. Please contact support.");
      } else {
        setError(
          data?.message ||
            data?.error ||
            data?.detail ||
            "Invalid email or password",
        );
      }

      setForm((prev) => ({
        ...prev,
        password: "",
      }));
    } finally {
      setLoading(false);
    }
  };
  // if logged in → redirect to dashboard
  if (user?.isAuthenticated) {
    return <Navigate to={getHomeRoute(user)} replace />;
  }
  return (
    <div className="flex items-center justify-center py-16 px-4">
      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border">
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Login to EthioWorks
          </h1>{" "}
          <p className="text-sm text-gray-500 mt-1">
            Enter your credentials to continue
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            {/* Icon */}
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

            {/* Input */}
            <input
              type="email"
              name="email"
              autoComplete="off"
              value={form.email}
              placeholder="Email address"
              className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            {/* Lock Icon */}
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

            {/* Input */}
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              placeholder="Password"
              autoComplete="off"
              className="w-full border border-gray-300 p-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onChange={handleChange}
            />

            {/* Show/Hide Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={(e) =>
                  setForm({ ...form, remember: e.target.checked })
                }
              />
              Remember me
            </label>

            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
