import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { signupWorker } from "../../services/userServices";

function WorkerSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    password_2: "",
    first_name: "",
    last_name: "",
    national_id: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateTextField = (value) => {
    const val = value?.trim();
    if (!val || val.length < 2) return "Minimum 2 characters required";
    if (!/^[A-Za-z]/.test(val)) return "Must start with a letter";
    if (!/^[A-Za-z\s]+$/.test(val)) return "Only letters are allowed";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    const phone = form.phone?.trim();
    if (!phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone must be +2519XXXXXXXX or 10 digit local number";
    }

    if (!form.password || form.password.length < 8) {
      newErrors.password = "Minimum 8 characters required";
    }

    if (!form.password_2) {
      newErrors.password_2 = "Please confirm password";
    } else if (form.password !== form.password_2) {
      newErrors.password_2 = "Passwords do not match";
    }

    const firstNameError = validateTextField(form.first_name);
    if (firstNameError) newErrors.first_name = firstNameError;

    const lastNameError = validateTextField(form.last_name);
    if (lastNameError) newErrors.last_name = lastNameError;

    const locationError = validateTextField(form.location);
    if (locationError) newErrors.location = locationError;

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.national_id || form.national_id.trim().length < 12) {
      newErrors.national_id = "Enter exactly 12 digit FIN number";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      await signupWorker(form);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      const backend = err?.response?.data || {};
      let formatted = {};

      // user-level errors
      Object.entries(backend).forEach(([key, value]) => {
        if (key === "worker") return;
        formatted[key] = Array.isArray(value) ? value[0] : value;
      });

      // nested worker errors
      if (backend.worker) {
        Object.entries(backend.worker).forEach(([key, value]) => {
          formatted[key] = Array.isArray(value) ? value[0] : value;
        });
      }

      setErrors(formatted);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-lg text-sm sm:text-base
    bg-white dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
    focus:border-gray-400 dark:focus:border-gray-500
    transition
    ${errors[field] ? "border-red-400 focus:ring-red-200" : ""}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div className="w-full max-w-xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Join as Worker
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Find jobs and offer services
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Looking for hiring?{" "}
              <Link
                to="/signup/client/"
                className="font-medium text-black dark:text-white hover:opacity-70"
              >
                Join as client →
              </Link>
            </p>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
          {errors.form && (
            <div className="mb-4 text-sm text-red-500 text-center">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  First name
                </label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className={inputClass("first_name")}
                  autoComplete="off"
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Last name
                </label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className={inputClass("last_name")}
                  autoComplete="off"
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* NATIONAL ID */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                National ID
              </label>
              <input
                name="national_id"
                value={form.national_id}
                onChange={handleChange}
                className={inputClass("national_id")}
                autoComplete="off"
              />
              {errors.national_id && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {errors.national_id}
                </p>
              )}
            </div>

            {/* LOCATION */}
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClass("location")}
                autoComplete="off"
              />
              {errors.location && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {errors.location}
                </p>
              )}
            </div>

            {/* CONTACT */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Email
                </label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass("email")}
                  autoComplete="off"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass("phone")}
                  autoComplete="off"
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputClass("password")}
                  autoComplete="off"
                />
                {errors.password && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Confirm
                </label>
                <input
                  type="password"
                  name="password_2"
                  value={form.password_2}
                  onChange={handleChange}
                  className={inputClass("password_2")}
                  autoComplete="off"
                />
                {errors.password_2 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.password_2}
                  </p>
                )}
              </div>
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full h-11 rounded-xl bg-black dark:bg-white dark:text-black text-white font-medium
              hover:opacity-90 active:scale-[0.99] transition shadow-sm cursor-pointer"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className="text-sm text-center mt-6 text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline underline-offset-4 cursor-pointer transition"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default WorkerSignup;
