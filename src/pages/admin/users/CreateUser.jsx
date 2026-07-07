import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../../../services/userServices";
import { Link } from "lucide-react";

function CreateUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_2: "",
    user_type: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};

    if (!form.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!form.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    const phone = form.phone?.trim();
    if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      newErrors.phone = "Use +2519XXXXXXXX or 10 digit local number";
    }

    if (!form.password || form.password.length < 8) {
      newErrors.password = "Min 8 characters required";
    }

    if (!form.password_2) {
      newErrors.password_2 = "Please confirm password";
    } else if (form.password !== form.password_2) {
      newErrors.password_2 = "Passwords do not match";
    }

    if (!form.user_type) {
      newErrors.user_type = "Select user type";
    }

    return newErrors;
  };

  const parseErrors = (errData) => {
    const newErrors = {};

    if (!errData || typeof errData !== "object") {
      return { general: "Something went wrong" };
    }

    if (errData.detail) {
      newErrors.general = errData.detail;
      return newErrors;
    }

    Object.entries(errData).forEach(([key, value]) => {
      if (key === "non_field_errors") {
        newErrors.general = Array.isArray(value) ? value.join(", ") : value;
        return;
      }

      newErrors[key] = Array.isArray(value) ? value.join(", ") : value;
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await registerUser(form);

      toast.success("New user created");
      navigate("/admin/users");
    } catch (err) {
      const backendErrors = parseErrors(err?.response?.data);

      setErrors(backendErrors);

      toast.error(
        backendErrors.general ||
          Object.values(backendErrors)[0] ||
          "Failed to create user",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gray-100 dark:bg-gray-900 transition-all">
      {/* CARD WRAPPER */}
      <div className="max-w-xl mx-auto rounded-2xl shadow-xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* HEADER  */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
            Create New User
          </h2>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">
            Add a new account to the system
          </p>
        </div>
        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FIRST NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <input
                name="first_name"
                placeholder="John"
                value={form.first_name}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
              )}
            </div>

            {/* LAST NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <input
                name="last_name"
                placeholder="Doe"
                value={form.last_name}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              name="phone"
              placeholder="+2519XXXXXXXX or 09XXXXXXXX"
              value={form.phone}
              onChange={handleChange}
              autoComplete="off"
              className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* USER TYPE */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              User Type
            </label>
            <select
              name="user_type"
              value={form.user_type}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            >
              <option value="">Select user type</option>
              <option value="client">Client</option>
              <option value="worker">Worker</option>
              <option value="admin">Admin</option>
            </select>

            {errors.user_type && (
              <p className="text-red-500 text-sm mt-1">{errors.user_type}</p>
            )}
          </div>

          {/* PASSWORD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm
              </label>
              <input
                type="password"
                name="password_2"
                value={form.password_2}
                onChange={handleChange}
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              />
              {errors.password_2 && (
                <p className="text-red-500 text-sm mt-1">{errors.password_2}</p>
              )}
            </div>
          </div>

          {/* GENERAL ERROR */}
          {errors.general && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm text-center border border-red-200 dark:border-red-700">
              {errors.general}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold transition-all shadow-sm ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:opacity-90"
            }`}
          >
            {loading ? "Creating user..." : "Create User"}
          </button>
          {/* FOOTER NAVIGATION */}
          <div className="px-6 pb-6">
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
               bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              ← Back to Users List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;
