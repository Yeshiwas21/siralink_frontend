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

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow border">
        {/* TITLE */}
        <h1 className="text-xl font-bold text-center mb-6">
          Join EthioWorks Hub
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Choose how you want to use the platform
        </p>

        {/* OPTIONS */}
        <div className="space-y-4">
          {/* CLIENT */}
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition">
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === "client"}
              onChange={(e) => setRole(e.target.value)}
            />
            <div>
              <p className="font-medium">Join as Client</p>
              <p className="text-xs text-gray-500">
                Hire workers and post jobs
              </p>
            </div>
          </label>

          {/* WORKER */}
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500 transition">
            <input
              type="radio"
              name="role"
              value="worker"
              checked={role === "worker"}
              onChange={(e) => setRole(e.target.value)}
            />
            <div>
              <p className="font-medium">Join as Worker</p>
              <p className="text-xs text-gray-500">
                Find jobs and offer services
              </p>
            </div>
          </label>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleContinue}
          disabled={!role}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Continue
        </button>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SelectUserType;
