import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { signupClient } from "../../services/userServices";

function ClientSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    password_2: "",
    client_type: "individual",
    first_name: "",
    last_name: "",
    national_id: "",
    company_name: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isCompany = form.client_type === "company";
  const isIndividual = form.client_type === "individual";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      form: "",
    }));
  };

  const validate = () => {
    let e = {};

    // EMAIL
    if (!form.email) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email address";
    }

    // PHONE
    const phone = form.phone?.trim();
    if (!phone) {
      e.phone = "Phone is required";
    } else if (!/^\+2519\d{8}$/.test(phone) && !/^\d{10}$/.test(phone)) {
      e.phone = "Phone must be +2519XXXXXXXX or 10 digit local number";
    }

    // PASSWORD
    if (!form.password || form.password.length < 8) {
      e.password = "Minimum 8 characters required";
    }

    // CONFIRM PASSWORD
    if (form.password && !form.password_2) {
      e.password_2 = "Please confirm your password";
    } else if (form.password !== form.password_2) {
      e.password_2 = "Passwords do not match";
    }

    // NAME VALIDATION (same style as Worker)
    const validateTextField = (value) => {
      const val = value?.trim();

      if (!val || val.length < 2) {
        return "Minimum 2 characters required";
      } else if (!/^[A-Za-z]/.test(val)) {
        return "Must start with a letter";
      } else if (!/^[A-Za-z\s]+$/.test(val)) {
        return "Only letters are allowed";
      }

      return null;
    };

    const firstNameError = validateTextField(form.first_name);
    if (firstNameError) e.first_name = firstNameError;

    const lastNameError = validateTextField(form.last_name);
    if (lastNameError) e.last_name = lastNameError;

    const locationError = validateTextField(form.location);
    if (locationError) e.location = locationError;

    // CONDITIONAL FIELDS
    if (isIndividual) {
      if (!form.national_id || form.national_id.trim().length < 16) {
        e.national_id = "Minimum 16 characters required";
      }
    }

    if (isCompany) {
      const company = form.company_name?.trim();

      if (!company) {
        e.company_name = "Company name is required";
      } else if (company.length < 2) {
        e.company_name = "Minimum 2 characters required";
      }
    }

    return e;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const eObj = validate();
    setErrors(eObj);

    if (Object.keys(eObj).length > 0) return;

    try {
      setLoading(true);

      await signupClient(form);

      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      const backend = err?.response?.data || {};
      let formatted = {};

      // user-level errors
      Object.entries(backend).forEach(([key, value]) => {
        if (key === "client") return;
        formatted[key] = Array.isArray(value) ? value[0] : value;
      });

      // nested client errors
      if (backend.client) {
        Object.entries(backend.client).forEach(([key, value]) => {
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
   ${
     errors[field]
       ? "border-red-400 focus:ring-red-200 dark:focus:ring-red-900"
       : ""
   }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors">
      <div className="w-full max-w-xl">
        {/* HEADER (FIXED LAYOUT) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 text-center md:text-left">
          {/* LEFT TITLE */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Join as Client
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create your account to start hiring
            </p>
          </div>

          {/* RIGHT CTA */}
          <div className="md:text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Looking for work?{" "}
              <Link
                to="/signup/worker/"
                className="font-medium text-black dark:text-white  hover:opacity-70 transition"
              >
                Apply as a worker →
              </Link>
            </p>
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 transition-colors">
          {errors.form && (
            <div className="mb-4 text-sm text-red-500 text-center">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CLIENT TYPE */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Account Type
              </label>

              <select
                name="client_type"
                value={form.client_type}
                onChange={handleChange}
                className={inputClass("client_type")}
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>

            {/* NAME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {isCompany ? "Contact First Name" : "First Name"}
                </label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className={inputClass("first_name")}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  {isCompany ? "Contact Last Name" : "Last name"}
                </label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className={inputClass("last_name")}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* CONDITIONAL */}
            {isIndividual && (
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  National ID
                </label>
                <input
                  name="national_id"
                  value={form.national_id}
                  onChange={handleChange}
                  className={inputClass("national_id")}
                />
                {errors.national_id && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.national_id}
                  </p>
                )}
              </div>
            )}

            {isCompany && (
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Company name
                </label>
                <input
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  className={inputClass("company_name")}
                />
                {errors.company_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.company_name}
                  </p>
                )}
              </div>
            )}

            {/* CONTACT */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-300">
                  Location
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className={inputClass("location")}
                />
                {errors.location && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {errors.location}
                  </p>
                )}
              </div>

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
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECURITY */}
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

export default ClientSignup;
