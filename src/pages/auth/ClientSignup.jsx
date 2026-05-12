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
    company_name: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* =========================
     HANDLE INPUT CHANGE
  ========================== */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // clear field error while typing
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
      form: "",
    }));
  };

  /* =========================
     HANDLE SUBMIT
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // FRONTEND VALIDATION
    // PHONE VALIDATION
    const phone = form.phone?.trim();

    if (/^\+2519\d{8}$/.test(phone)) {
      delete newErrors.phone; // valid international format
    } else if (/^\d{10}$/.test(phone)) {
      delete newErrors.phone; // valid local format
    } else {
      newErrors.phone =
        "Phone must be +2519XXXXXXXX (14 chars) or 10 digit local number";
    }
    if (!form.password || form.password.length < 8) {
      // PASSWORDS VALIDATION
      newErrors.password = "Minimum 8 characters required";
    } else {
      delete newErrors.password;
    }

    if (form.password !== form.password_2) {
      newErrors.password_2 = "Passwords do not match";
    } else {
      delete newErrors.password_2;
    }

    // REUSABLE TEXT VALIDATOR
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

    // COMPANY NAME VALIDATION
    const companyError = validateTextField(form.company_name);
    if (companyError) {
      newErrors.company_name = companyError;
    } else {
      delete newErrors.company_name;
    }

    // LOCATION VALIDATION
    const locationError = validateTextField(form.location);
    if (locationError) {
      newErrors.location = locationError;
    } else {
      delete newErrors.location;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    /*  API CALL */
    try {
      setLoading(true);

      await signupClient(form);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      const backendErrors = err.response?.data;

      let formattedErrors = {};

      if (backendErrors) {
        // Handle nested client errors
        if (backendErrors.client) {
          Object.entries(backendErrors.client).forEach(([key, value]) => {
            formattedErrors[key] = value[0]; // take first error message
          });
        }

        // Handle top-level errors
        Object.entries(backendErrors).forEach(([key, value]) => {
          if (key !== "client") {
            formattedErrors[key] = Array.isArray(value) ? value[0] : value;
          }
        });
      }

      // fallback
      if (Object.keys(formattedErrors).length === 0) {
        formattedErrors.form = "Signup failed";
      }

      setErrors(formattedErrors);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     INPUT STYLE HELPER
  ========================== */
  const inputClass = (field) =>
    `w-full border p-2 rounded ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-5 text-center">Join as Client</h2>

      {/* GLOBAL ERROR */}
      {errors.form && (
        <p className="text-red-500 text-sm mb-3 text-center">{errors.form}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* COMPANY NAME */}
        <input
          name="company_name"
          placeholder="Company Name"
          autoComplete="off"
          required
          className={inputClass("company_name")}
          onChange={handleChange}
        />
        {errors.company_name && (
          <p className="text-red-500 text-sm">{errors.company_name}</p>
        )}

        {/* LOCATION */}
        <input
          name="location"
          placeholder="Location"
          autoComplete="off"
          required
          className={inputClass("location")}
          onChange={handleChange}
        />
        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location}</p>
        )}

        {/* EMAIL */}
        <input
          name="email"
          placeholder="Email"
          autoComplete="off"
          required
          className={inputClass("email")}
          onChange={handleChange}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        {/* PHONE */}
        <input
          name="phone"
          placeholder="Phone (+2519XXXXXXXX or 09XXXXXXXX)"
          autoComplete="off"
          required
          className={inputClass("phone")}
          onChange={handleChange}
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

        {/* PASSWORD */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="off"
          required
          className={inputClass("password")}
          onChange={handleChange}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          name="password_2"
          required
          placeholder="Confirm Password"
          autoComplete="off"
          className={inputClass("password_2")}
          onChange={handleChange}
        />
        {errors.password_2 && (
          <p className="text-red-500 text-sm">{errors.password_2}</p>
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </div>
  );
}

export default ClientSignup;
