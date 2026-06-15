import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function SelectUserType() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!role) return;

    if (role === "client") {
      navigate("/signup/client");
    } else if (role === "worker") {
      navigate("/signup/worker");
    }
  };

  const cardClass =
    "w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 " +
    "rounded-2xl shadow-sm p-6 sm:p-8 transition-colors";

  const optionClass =
    "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition " +
    "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 " +
    "bg-white dark:bg-gray-900";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className={cardClass}>
        {/* TITLE */}
        <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-900 dark:text-white">
          Join SiraLink
        </h1>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 mb-6">
          Choose how you want to use the platform
        </p>

        {/* OPTIONS */}
        <div className="space-y-4">
          {/* CLIENT */}
          <label
            className={`${optionClass} ${
              role === "client"
                ? "border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10"
                : ""
            }`}
          >
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === "client"}
              onChange={(e) => setRole(e.target.value)}
              className="accent-black dark:accent-white"
            />

            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Join as Client
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hire workers and post jobs
              </p>
            </div>
          </label>

          {/* WORKER */}
          <label
            className={`${optionClass} ${
              role === "worker"
                ? "border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10"
                : ""
            }`}
          >
            <input
              type="radio"
              name="role"
              value="worker"
              checked={role === "worker"}
              onChange={(e) => setRole(e.target.value)}
              className="accent-black dark:accent-white"
            />

            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Join as Worker
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Find jobs and offer services
              </p>
            </div>
          </label>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleContinue}
          disabled={!role}
          className="w-full mt-6 h-11 rounded-xl font-medium
          bg-black dark:bg-white text-white dark:text-black
          hover:opacity-90 active:scale-[0.99] cursor-pointer
          transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>

        {/* LOGIN */}
        <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SelectUserType;
